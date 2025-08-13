export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  organizationId?: string | null;
  auth0Id: string;
  createdAt: Date;
  updatedAt: Date;
  organization?: Organization | null;
  shifts?: Shift[];
}

export interface Organization {
  id: string;
  name: string;
  allowedRadius: number;
  centerLatitude?: number | null;
  centerLongitude?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  users?: User[];
  locations?: Location[];
}

export interface Location {
  id: string;
  organizationId: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  organization: Organization;
}

export interface Shift {
  id: string;
  userId: string;
  status: ShiftStatus;
  clockInTime: Date;
  clockOutTime?: Date | null;
  clockInLatitude: number;
  clockInLongitude: number;
  clockInAddress?: string | null;
  clockInNote?: string | null;
  clockOutLatitude?: number | null;
  clockOutLongitude?: number | null;
  clockOutAddress?: string | null;
  clockOutNote?: string | null;
  duration?: number | null;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export enum UserRole {
  MANAGER = "MANAGER",
  CARE_WORKER = "CARE_WORKER",
}

export enum ShiftStatus {
  CLOCKED_IN = "CLOCKED_IN",
  CLOCKED_OUT = "CLOCKED_OUT",
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ClockInInput {
  latitude: number;
  longitude: number;
  address?: string;
  note?: string;
}

export interface ClockOutInput {
  latitude: number;
  longitude: number;
  address?: string;
  note?: string;
}

export interface DashboardStats {
  totalStaffClockedIn: number;
  averageHoursPerDay: number;
  totalClockedInToday: number;
  weeklyHoursByStaff: {
    userId: string;
    userName: string;
    totalHours: number;
  }[];
}

export interface LocationPermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export interface NotificationPermissionStatus {
  granted: boolean;
  denied: boolean;
  default: boolean;
}
