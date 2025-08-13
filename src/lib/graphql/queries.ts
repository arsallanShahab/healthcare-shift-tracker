import { gql } from "@apollo/client";

// User Queries
export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      role
      organizationId
      auth0Id
      createdAt
      updatedAt
      organization {
        id
        name
        allowedRadius
        centerLatitude
        centerLongitude
        isActive
      }
      shifts {
        id
        status
        clockInTime
        clockOutTime
        duration
      }
    }
  }
`;

// Shift Queries
export const GET_MY_CURRENT_SHIFT = gql`
  query GetMyCurrentShift {
    myCurrentShift {
      id
      status
      clockInTime
      clockInLatitude
      clockInLongitude
      clockInAddress
      clockInNote
      user {
        id
        name
        email
      }
    }
  }
`;

export const GET_MY_SHIFTS = gql`
  query GetMyShifts($limit: Int, $offset: Int) {
    myShifts(limit: $limit, offset: $offset) {
      id
      status
      clockInTime
      clockOutTime
      clockInLatitude
      clockInLongitude
      clockInAddress
      clockInNote
      clockOutLatitude
      clockOutLongitude
      clockOutAddress
      clockOutNote
      duration
      user {
        id
        name
        email
      }
    }
  }
`;

// Shift Mutations
export const CLOCK_IN_MUTATION = gql`
  mutation ClockIn($input: ClockInInput!) {
    clockIn(input: $input) {
      id
      status
      clockInTime
      clockInLatitude
      clockInLongitude
      clockInAddress
      clockInNote
      user {
        id
        name
        email
      }
    }
  }
`;

export const CLOCK_OUT_MUTATION = gql`
  mutation ClockOut($input: ClockOutInput!) {
    clockOut(input: $input) {
      id
      status
      clockOutTime
      clockOutLatitude
      clockOutLongitude
      clockOutAddress
      clockOutNote
      duration
      user {
        id
        name
        email
      }
    }
  }
`;

// Organization Queries
export const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      id
      name
      allowedRadius
      centerLatitude
      centerLongitude
      isActive
      createdAt
      updatedAt
      users {
        id
        name
        email
        role
      }
      locations {
        id
        name
        latitude
        longitude
        radius
        isActive
      }
    }
  }
`;

export const GET_ORGANIZATION_STAFF = gql`
  query GetOrganizationStaff($organizationId: String!) {
    organizationStaff(organizationId: $organizationId) {
      id
      email
      name
      role
      createdAt
      organization {
        id
        name
      }
      shifts {
        id
        status
        clockInTime
        clockOutTime
        duration
      }
    }
  }
`;

export const GET_ORGANIZATION_SHIFTS = gql`
  query GetOrganizationShifts(
    $organizationId: String!
    $limit: Int
    $offset: Int
  ) {
    organizationShifts(
      organizationId: $organizationId
      limit: $limit
      offset: $offset
    ) {
      id
      status
      clockInTime
      clockOutTime
      clockInLatitude
      clockInLongitude
      clockInAddress
      clockInNote
      clockOutLatitude
      clockOutLongitude
      clockOutAddress
      clockOutNote
      duration
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const GET_CURRENTLY_CLOCKED_IN_STAFF = gql`
  query GetCurrentlyClockedInStaff($organizationId: String!) {
    currentlyClockedInStaff(organizationId: $organizationId) {
      id
      status
      clockInTime
      clockInLatitude
      clockInLongitude
      clockInAddress
      clockInNote
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats($organizationId: String!) {
    dashboardStats(organizationId: $organizationId) {
      totalStaffClockedIn
      averageHoursPerDay
      totalClockedInToday
      weeklyHoursByStaff {
        userId
        userName
        totalHours
      }
    }
  }
`;

export const GET_LOCATIONS = gql`
  query GetLocations($organizationId: String!) {
    locations(organizationId: $organizationId) {
      id
      name
      latitude
      longitude
      radius
      isActive
      createdAt
      organization {
        id
        name
      }
    }
  }
`;

// Organization Mutations
export const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
      id
      name
      allowedRadius
      centerLatitude
      centerLongitude
      isActive
      createdAt
    }
  }
`;

export const CREATE_LOCATION = gql`
  mutation CreateLocation($input: CreateLocationInput!) {
    createLocation(input: $input) {
      id
      name
      latitude
      longitude
      radius
      isActive
      organization {
        id
        name
      }
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: String!, $role: UserRole!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      email
      name
      role
      organization {
        id
        name
      }
    }
  }
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    allUsers {
      id
      email
      name
      role
      organizationId
      auth0Id
      createdAt
      updatedAt
      organization {
        id
        name
      }
    }
  }
`;

export const ASSIGN_USER_TO_ORGANIZATION = gql`
  mutation AssignUserToOrganization(
    $userId: String!
    $organizationId: String!
  ) {
    assignUserToOrganization(userId: $userId, organizationId: $organizationId) {
      id
      email
      name
      role
      organizationId
      organization {
        id
        name
      }
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      name
      role
      organizationId
      auth0Id
      createdAt
      updatedAt
      organization {
        id
        name
      }
    }
  }
`;
