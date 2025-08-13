import { isWithinRadius } from "@/lib/location";
import { prisma } from "@/lib/prisma";
import { ShiftStatus, UserRole } from "@prisma/client";

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      return await prisma.user.findUnique({
        where: { auth0Id: context.user.sub },
        include: { organization: true },
      });
    },

    myShifts: async (_: any, { limit = 50, offset = 0 }: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      const user = await prisma.user.findUnique({
        where: { auth0Id: context.user.sub },
      });

      if (!user) throw new Error("User not found");

      return await prisma.shift.findMany({
        where: { userId: user.id },
        include: { user: true },
        orderBy: { clockInTime: "desc" },
        take: limit,
        skip: offset,
      });
    },

    myCurrentShift: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      const user = await prisma.user.findUnique({
        where: { auth0Id: context.user.sub },
      });

      if (!user) throw new Error("User not found");

      return await prisma.shift.findFirst({
        where: {
          userId: user.id,
          status: ShiftStatus.CLOCKED_IN,
        },
        include: { user: true },
        orderBy: { clockInTime: "desc" },
      });
    },

    organizations: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      return await prisma.organization.findMany({
        include: {
          users: true,
          locations: true,
        },
      });
    },

    allUsers: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");
      return await prisma.user.findMany({
        include: { organization: true },
        orderBy: { createdAt: "desc" },
      });
    },

    organizationStaff: async (
      _: any,
      { organizationId }: any,
      context: any
    ) => {
      if (!context.user) throw new Error("Not authenticated");

      const user = await prisma.user.findUnique({
        where: { auth0Id: context.user.sub },
      });

      if (!user || user.role !== UserRole.MANAGER) {
        throw new Error("Unauthorized");
      }

      return await prisma.user.findMany({
        where: { organizationId },
        include: { organization: true },
      });
    },

    currentlyClockedInStaff: async (
      _: any,
      { organizationId }: any,
      context: any
    ) => {
      if (!context.user) throw new Error("Not authenticated");

      const user = await prisma.user.findUnique({
        where: { auth0Id: context.user.sub },
      });

      if (!user || user.role !== UserRole.MANAGER) {
        throw new Error("Unauthorized");
      }

      return await prisma.shift.findMany({
        where: {
          status: ShiftStatus.CLOCKED_IN,
          user: { organizationId },
        },
        include: { user: true },
        orderBy: { clockInTime: "desc" },
      });
    },

    dashboardStats: async (_: any, { organizationId }: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      const user = await prisma.user.findUnique({
        where: { auth0Id: context.user.sub },
      });

      if (!user || user.role !== UserRole.MANAGER) {
        throw new Error("Unauthorized");
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());

      const totalStaffClockedIn = await prisma.shift.count({
        where: {
          status: ShiftStatus.CLOCKED_IN,
          user: { organizationId },
        },
      });

      const totalClockedInToday = await prisma.shift.count({
        where: {
          clockInTime: { gte: today },
          user: { organizationId },
        },
      });

      const weeklyShifts = await prisma.shift.findMany({
        where: {
          clockInTime: { gte: weekStart },
          status: ShiftStatus.CLOCKED_OUT,
          user: { organizationId },
        },
        include: { user: true },
      });

      const weeklyHoursByStaff = weeklyShifts.reduce((acc: any, shift: any) => {
        const userId = shift.userId;
        const hours = shift.duration ? shift.duration / 60 : 0;

        if (!acc[userId]) {
          acc[userId] = {
            userId,
            userName: shift.user.name || shift.user.email,
            totalHours: 0,
          };
        }

        acc[userId].totalHours += hours;
        return acc;
      }, {});

      const totalHours = Object.values(weeklyHoursByStaff).reduce(
        (sum: number, staff: any) => sum + staff.totalHours,
        0
      );
      const averageHoursPerDay = totalHours / 7;

      return {
        totalStaffClockedIn,
        averageHoursPerDay,
        totalClockedInToday,
        weeklyHoursByStaff: Object.values(weeklyHoursByStaff),
      };
    },

    locations: async (_: any, { organizationId }: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      return await prisma.location.findMany({
        where: {
          organizationId,
          isActive: true,
        },
        orderBy: { name: "asc" },
      });
    },
  },

  Mutation: {
    clockIn: async (_: any, { input }: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      const user = await prisma.user.findUnique({
        where: { auth0Id: context.user.sub },
        include: { organization: true },
      });

      if (!user) throw new Error("User not found");
      if (!user.organization)
        throw new Error("User not assigned to organization");
      const existingShift = await prisma.shift.findFirst({
        where: {
          userId: user.id,
          status: ShiftStatus.CLOCKED_IN,
        },
      });

      if (existingShift) {
        throw new Error("Already clocked in");
      }

      if (
        user.organization.centerLatitude &&
        user.organization.centerLongitude
      ) {
        const isWithinAllowedArea = isWithinRadius(
          { latitude: input.latitude, longitude: input.longitude },
          {
            latitude: user.organization.centerLatitude,
            longitude: user.organization.centerLongitude,
          },
          user.organization.allowedRadius
        );

        if (!isWithinAllowedArea) {
          throw new Error("You are not within the allowed area to clock in");
        }
      }

      const shift = await prisma.shift.create({
        data: {
          userId: user.id,
          status: ShiftStatus.CLOCKED_IN,
          clockInTime: new Date(),
          clockInLatitude: input.latitude,
          clockInLongitude: input.longitude,
          clockInAddress: input.address,
          clockInNote: input.note,
        },
        include: { user: true },
      });

      return shift;
    },

    clockOut: async (_: any, { input }: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      const user = await prisma.user.findUnique({
        where: { auth0Id: context.user.sub },
      });

      if (!user) throw new Error("User not found");
      const activeShift = input.shiftId
        ? await prisma.shift.findFirst({
            where: {
              id: input.shiftId,
              userId: user.id,
              status: ShiftStatus.CLOCKED_IN,
            },
          })
        : await prisma.shift.findFirst({
            where: {
              userId: user.id,
              status: ShiftStatus.CLOCKED_IN,
            },
          });

      if (!activeShift) {
        throw new Error("No active shift found");
      }

      const clockOutTime = new Date();
      const duration = Math.floor(
        (clockOutTime.getTime() - activeShift.clockInTime.getTime()) /
          (1000 * 60)
      );

      const shift = await prisma.shift.update({
        where: { id: activeShift.id },
        data: {
          status: ShiftStatus.CLOCKED_OUT,
          clockOutTime,
          clockOutLatitude: input.latitude,
          clockOutLongitude: input.longitude,
          clockOutAddress: input.address,
          clockOutNote: input.note,
          duration,
        },
        include: { user: true },
      });

      return shift;
    },

    createUser: async (_: any, { input }: any, context: any) => {
      const existingUser = await prisma.user.findUnique({
        where: { auth0Id: input.auth0Id },
      });

      if (existingUser) {
        return existingUser;
      }

      const user = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          auth0Id: input.auth0Id,
          role: input.role || UserRole.CARE_WORKER,
          organizationId: input.organizationId,
        },
        include: { organization: true },
      });

      return user;
    },

    updateUserRole: async (_: any, { userId, role }: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: context.user.sub },
      });

      if (!currentUser || currentUser.role !== UserRole.MANAGER) {
        throw new Error("Unauthorized - Only managers can update user roles");
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
        include: { organization: true },
      });

      return updatedUser;
    },

    createOrganization: async (_: any, { input }: any, context: any) => {
      console.log("createOrganization - context.user:", context.user);
      if (!context.user) throw new Error("Not authenticated");
      console.log("Creating organization with input:", input);
      const organization = await prisma.organization.create({
        data: {
          name: input.name,
          centerLatitude: input.centerLatitude,
          centerLongitude: input.centerLongitude,
          allowedRadius: input.allowedRadius || 2000,
          isActive: true,
        },
        include: {
          users: true,
          locations: true,
        },
      });

      console.log("Organization created:", organization);
      return organization;
    },

    createLocation: async (_: any, { input }: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");
      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: context.user.sub },
      });

      if (
        !currentUser ||
        currentUser.role !== UserRole.MANAGER ||
        currentUser.organizationId !== input.organizationId
      ) {
        throw new Error(
          "Unauthorized - Only managers of this organization can create locations"
        );
      }

      const location = await prisma.location.create({
        data: {
          organizationId: input.organizationId,
          name: input.name,
          latitude: input.latitude,
          longitude: input.longitude,
          radius: input.radius || 500,
          isActive: true,
        },
        include: {
          organization: true,
        },
      });

      return location;
    },

    assignUserToOrganization: async (
      _: any,
      { userId, organizationId }: any,
      context: any
    ) => {
      if (!context.user) throw new Error("Not authenticated");

      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: context.user.sub },
      });

      if (!currentUser || currentUser.role !== UserRole.MANAGER) {
        throw new Error(
          "Unauthorized - Only managers can assign users to organizations"
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { organizationId },
        include: { organization: true },
      });

      return updatedUser;
    },
  },

  User: {
    shifts: async (parent: any) => {
      return await prisma.shift.findMany({
        where: { userId: parent.id },
        orderBy: { clockInTime: "desc" },
        include: {
          user: true,
        },
      });
    },
    organization: async (parent: any) => {
      if (!parent.organizationId) return null;
      return await prisma.organization.findUnique({
        where: { id: parent.organizationId },
      });
    },
  },

  Location: {
    organization: async (parent: any) => {
      return await prisma.organization.findUnique({
        where: { id: parent.organizationId },
      });
    },
  },

  Shift: {
    user: async (parent: any) => {
      return await prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },
  },

  Organization: {
    users: async (parent: any) => {
      return await prisma.user.findMany({
        where: { organizationId: parent.id },
      });
    },
    locations: async (parent: any) => {
      return await prisma.location.findMany({
        where: { organizationId: parent.id, isActive: true },
        orderBy: { name: "asc" },
      });
    },
  },
};

export default resolvers;
