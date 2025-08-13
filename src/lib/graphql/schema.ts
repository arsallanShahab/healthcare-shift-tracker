import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  enum UserRole {
    MANAGER
    CARE_WORKER
  }

  enum ShiftStatus {
    CLOCKED_IN
    CLOCKED_OUT
  }

  type User {
    id: ID!
    email: String!
    name: String
    role: UserRole!
    organizationId: String
    auth0Id: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    organization: Organization
    shifts: [Shift!]!
  }

  type Organization {
    id: ID!
    name: String!
    allowedRadius: Float!
    centerLatitude: Float
    centerLongitude: Float
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    users: [User!]!
    locations: [Location!]!
  }

  type Location {
    id: ID!
    organizationId: String!
    name: String!
    latitude: Float!
    longitude: Float!
    radius: Float!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    organization: Organization!
  }

  type Shift {
    id: ID!
    userId: String!
    status: ShiftStatus!
    clockInTime: DateTime!
    clockOutTime: DateTime
    clockInLatitude: Float!
    clockInLongitude: Float!
    clockInAddress: String
    clockInNote: String
    clockOutLatitude: Float
    clockOutLongitude: Float
    clockOutAddress: String
    clockOutNote: String
    duration: Int
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
  }

  type DashboardStats {
    totalStaffClockedIn: Int!
    averageHoursPerDay: Float!
    totalClockedInToday: Int!
    weeklyHoursByStaff: [WeeklyHours!]!
  }

  type WeeklyHours {
    userId: String!
    userName: String!
    totalHours: Float!
  }

  input ClockInInput {
    latitude: Float!
    longitude: Float!
    address: String
    note: String
    organizationId: String!
  }

  input ClockOutInput {
    shiftId: String!
    latitude: Float!
    longitude: Float!
    address: String
    note: String
  }

  input CreateOrganizationInput {
    name: String!
    centerLatitude: Float
    centerLongitude: Float
    allowedRadius: Float
  }

  input CreateLocationInput {
    organizationId: String!
    name: String!
    latitude: Float!
    longitude: Float!
    radius: Float
  }

  input CreateUserInput {
    email: String!
    name: String
    auth0Id: String!
    role: UserRole
    organizationId: String
  }

  type Query {
    me: User
    myShifts(limit: Int, offset: Int): [Shift!]!
    myCurrentShift: Shift
    organizations: [Organization!]!
    allUsers: [User!]!
    organizationStaff(organizationId: String!): [User!]!
    organizationShifts(
      organizationId: String!
      limit: Int
      offset: Int
    ): [Shift!]!
    currentlyClockedInStaff(organizationId: String!): [Shift!]!
    dashboardStats(organizationId: String!): DashboardStats!
    locations(organizationId: String!): [Location!]!
  }

  type Mutation {
    clockIn(input: ClockInInput!): Shift!
    clockOut(input: ClockOutInput!): Shift!
    createUser(input: CreateUserInput!): User!
    createOrganization(input: CreateOrganizationInput!): Organization!
    createLocation(input: CreateLocationInput!): Location!
    updateUserRole(userId: String!, role: UserRole!): User!
    assignUserToOrganization(userId: String!, organizationId: String!): User!
  }
`;

export default typeDefs;
