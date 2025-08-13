# Healthcare Shift Tracker

A comprehensive web application for healthcare organizations to manage staff shift tracking with location-based clock in/out functionality.

## 🎯 Quick Start Guide

### New to the app? Follow these steps:

1. **🔐 Sign Up** → Create your account through Auth0 authentication
2. **👨‍💼 Request Manager Access** → Contact admin to upgrade your role (if needed)
3. **🏥 Create Organization** → Set up your healthcare facility (Managers only)
4. **📍 Add Locations** → Define clock-in zones with GPS coordinates
5. **👥 Assign Staff** → Add team members to your organization
6. **⏰ Start Tracking** → Care workers can now clock in/out with location verification

> **💡 Pro Tip**: Start with the Setup page to configure your organization and locations before staff begins using the system.

## Features

### For Care Workers

- ✅ Location-based clock in/out
- ✅ Optional notes for shifts
- ✅ Personal shift history
- ✅ Real-time status tracking

### For Managers

- ✅ Real-time staff monitoring
- ✅ Location perimeter management
- ✅ Staff productivity analytics
- ✅ Location usage analytics
- ✅ Staff shift reports

### Technical Features

- 🔐 Secure Auth0 authentication
- 📱 Mobile-responsive design
- 🗺️ GPS location verification

## 🚀 Application Workflow

### 📝 Step-by-Step Usage Guide

#### 1. **Initial Setup & Authentication**

> 🔐 **First-time users start here**

- **Sign Up/Login**: Navigate to the application and authenticate using Auth0
- **Profile Creation**: Your profile is automatically created with basic user role
- **Permission Setup**: Initially, all users start as "Care Workers"

#### 2. **Manager Access Request**

> 👨‍💼 **Upgrade to Manager Role**

- **Role Upgrade**: Contact your system administrator to upgrade your role to "Manager"
- **Manager Privileges**: Only managers can create organizations and manage locations
- **Access Control**: Care workers can only clock in/out and view their own shifts

#### 3. **Organization Management** (Manager Only)

> 🏥 **Setting up your healthcare facility**

- **Create Organization**:
  - Navigate to **Setup** page
  - Fill in organization details (name, center location, allowed radius)
  - Set the geographical center point for your facility
- **Location Management**:
  - Add specific clock-in locations within your facility
  - Define check-in radius for each location (e.g., 100 meters)
  - Set latitude/longitude coordinates for precise location tracking

#### 4. **Staff Assignment** (Manager Only)

> 👥 **Adding your team members**

- **User Assignment**:
  - Go to **Setup** page → "Assign Users to Organization"
  - Select registered users and assign them to your organization
  - Users must first register individually before being assigned
- **Role Management**: Update user roles (Care Worker ↔ Manager) as needed

#### 5. **Daily Operations** (Care Workers)

> ⏰ **Regular shift tracking workflow**

- **Clock In Process**:

  1. Navigate to **Clock In** page
  2. Allow location permissions when prompted
  3. Ensure you're within the allowed radius of your assigned location
  4. Add optional notes about your shift
  5. Confirm clock-in ✅

- **Clock Out Process**:
  1. Navigate to **Clock Out** page
  2. Location is automatically verified
  3. Add shift summary notes (optional)
  4. View total shift duration
  5. Confirm clock-out ✅

#### 6. **Monitoring & Analytics** (Manager)

> 📊 **Real-time oversight and reporting**

- **Dashboard Overview**:
  - View currently active shifts
  - Monitor staff locations and status
  - Check daily/weekly statistics

#### 7. **Individual Tracking** (All Users)

> 📱 **Personal shift management**

- **Personal Dashboard**: View your current shift status and recent activity
- **Shift History**: Access complete history of all your shifts
- **Location Status**: Check your current location and permission status

### 🎯 Key Highlights

| Feature                 | Care Worker | Manager |
| ----------------------- | ----------- | ------- |
| **Clock In/Out**        | ✅          | ✅      |
| **View Own Shifts**     | ✅          | ✅      |
| **Create Organization** | ❌          | ✅      |
| **Manage Locations**    | ❌          | ✅      |
| **Assign Users**        | ❌          | ✅      |
| **View All Staff Data** | ❌          | ✅      |

### 🌟 Smart Features

- **🎯 Geofencing**: Automatic location verification prevents remote clock-ins
- **⚡ Real-time Updates**: Live dashboard showing current shift statuses

#### Location Problems

- **"Location permission denied"**:
  - Enable location access in browser settings
  - Click "Refresh Location" button to retry
  - Ensure GPS is enabled on your device

#### Clock In/Out Issues

- **"Unable to get location"**:
  - Check if you're within the allowed radius
  - Ensure GPS signal is strong (try moving outdoors)
  - Refresh the location manually

#### Manager Access

- **Can't create organizations**:
  - Verify you have Manager role assigned
  - Contact your system administrator for role upgrade

## Tech Stack

- **Frontend**: Next.js, React, Ant Design UI
- **Backend**: GraphQL, Apollo Server
- **Database**: Supabase PostgreSQL with Prisma ORM
- **Authentication**: Auth0

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Auth0 account

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd healthcare-shift-tracker
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
```

4. Configure your `.env.local` file with:

```env
# Auth0
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/healthcare_shifts"

# GraphQL
GRAPHQL_ENDPOINT=http://localhost:3000/api/graphql
```

5. Set up the database

```bash
npm run db:push
npm run db:generate
```

6. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🚀 Deployment Guide

### Deploying to Vercel

#### Prerequisites

1. Production PostgreSQL database (Supabase)
2. Auth0 production application configured
3. Vercel account

#### Step-by-Step Deployment

1. **Prepare Environment Variables**

   Set up these environment variables in Vercel dashboard:

   ```env
   # Database (Production)
   DATABASE_URL="your-production-postgresql-url"

   # Auth0 (Production)
   AUTH0_SECRET="your-production-auth0-secret"
   AUTH0_BASE_URL="https://your-app.vercel.app"
   AUTH0_ISSUER_BASE_URL="https://your-domain.auth0.com"
   AUTH0_CLIENT_ID="your-production-client-id"
   AUTH0_CLIENT_SECRET="your-production-client-secret"

   # GraphQL
   GRAPHQL_ENDPOINT="https://your-app.vercel.app/api/graphql"
   ```

2. **Deploy to Vercel**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Deploy
   vercel --prod
   ```

   Or connect your GitHub repository to Vercel for automatic deployments.

3. **Database Setup on Vercel**

   The build process automatically:

   - Runs `prisma generate` during build
   - Generates the Prisma client
   - No manual database migrations needed (using `db:push` approach)

4. **Post-Deployment Setup**

   - Configure Auth0 callback URLs:
     - `https://your-app.vercel.app/api/auth/callback`
     - `https://your-app.vercel.app/api/auth/logout`
   - Test all functionality in production
   - Set up your first manager user

#### Vercel-Specific Configuration

- **Prisma Client Generation**: Handled automatically via `postinstall` script
- **Build Command**: `prisma generate && next build`
- **API Routes**: Optimized for serverless functions
- **Regional Deployment**: Configured for Singapore region (can be changed in `vercel.json`)

## Project Structure

```
healthcare-shift-tracker/
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts for state management
│   ├── lib/            # Utility functions and configurations
│   ├── pages/          # Next.js pages and API routes
│   │   ├── api/        # API endpoints
│   │   └── ...         # Application pages
│   ├── styles/         # Global styles
│   └── types/          # TypeScript type definitions
├── .env.example        # Environment variables template
├── next.config.js      # Next.js configuration
└── package.json        # Dependencies and scripts
```

## API Endpoints

- `POST /api/graphql` - GraphQL API endpoint

## Database Schema

The application uses the following main models:

- **User**: Store user information and roles
- **Organization**: Healthcare organizations
- **Location**: Allowed clock-in locations with perimeters
- **Shift**: Individual shift records with clock in/out times
