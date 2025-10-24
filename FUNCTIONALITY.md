# Eye Break Reminder App - Functionality Documentation

## Overview

The Eye Break Reminder App is a web application designed to help users maintain healthy eye habits by taking regular breaks from screen time. The app combines a Pomodoro-style timer with health-conscious reminders to encourage users to rest their eyes periodically throughout the day.

## Core Features

### 1. User Authentication

- **Email/Password Authentication**: Users can sign up and log in using email and password credentials
- **Google OAuth Integration**: Single sign-on capability through Google accounts
- **Profile Management**: Automatic creation of user profiles upon first login
- **Secure Session Handling**: Token-based authentication with secure session management

### 2. Break Timer Functionality

- **Customizable Timer**: Adjustable break duration from 5 to 60 minutes in 5-minute increments
- **Visual Progress Indicator**: Circular progress bar showing remaining time
- **Start/Pause/Reset Controls**: Full control over timer operation
- **Manual Break Logging**: Option to log breaks manually regardless of timer state
- **Automatic Break Completion**: Timer automatically logs breaks when countdown completes

### 3. Notification System

- **Browser Notifications**: Desktop notifications for break reminders
- **Service Worker Integration**: Background notification capability even when app is not active
- **Progressive Web App Support**: Installable PWA with offline capabilities
- **Configurable Reminders**: Customizable break intervals stored locally

### 4. Data Persistence

- **IndexedDB Storage**: Client-side storage for timer state and settings
- **Cloud Database Integration**: Supabase backend for user data and break logs
- **Offline Support**: Local storage synchronization for offline usage
- **Automatic Sync**: Background synchronization of break logs when connectivity is restored

### 5. Analytics & History

- **Break History Tracking**: Detailed log of all completed breaks
- **Statistical Overview**: Dashboard showing break frequency and patterns
- **Weekly Data Visualization**: Break activity visualization by day of week

## Technical Architecture

### Frontend

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: Tailwind CSS with Radix UI components
- **State Management**: React hooks for local state management
- **Storage**: IndexedDB for client-side data persistence

### Backend

- **Platform**: Supabase (PostgreSQL database with built-in authentication)
- **API Routes**: Next.js API routes for server-side logic
- **Database Schema**:
  - `profiles`: User profile information
  - `break_logs`: Record of all completed breaks

### Key Components

#### Timer Component

The primary interface for managing break sessions:

- Visual countdown timer with large display
- Start, pause, and reset functionality
- Configurable break duration slider
- Manual break logging option
- Progress visualization

#### Dashboard

Main application interface after login:

- User authentication status display
- Access to timer functionality
- Navigation between statistics and history views
- Logout capability

#### Notification System

Handles all alert mechanisms:

- Browser notification requests and delivery
- Service worker integration for background notifications
- Progressive web app installation support

## User Flow

1. **Authentication**

   - User visits app and is redirected to login page
   - User can authenticate via email/password or Google OAuth
   - Upon successful authentication, user profile is created if needed
   - User is redirected to dashboard

2. **Break Management**

   - User sets desired break duration using slider
   - User starts timer to begin break session
   - Visual indicators show progress toward break completion
   - User receives desktop notification when break is complete
   - Break is automatically logged to user's history

3. **History & Analytics**
   - User can view recent break history
   - Statistical overview shows break patterns
   - Weekly data visualization displays break frequency

## Technical Implementation Details

### Data Synchronization

- Timer state is persisted in IndexedDB for continuity between sessions
- Break logs are stored in Supabase database for cross-device access
- Offline break logs are queued and synchronized when connectivity is restored

### Background Processing

- Service worker handles periodic background checks for break reminders
- Notifications can be delivered even when app tab is not active
- Progressive web app capabilities enable installation on devices

### Security Considerations

- Row Level Security (RLS) policies protect user data
- Authentication tokens are securely managed by Supabase
- API routes validate user authentication before data access

## API Endpoints

### Authentication

- `/api/auth/callback`: OAuth callback handler for Google authentication

### Break Management

- `/api/log-break`: Endpoint for recording break completions
- `/api/stats`: Provides statistical data about user's break patterns

## Future Enhancements

- Enhanced analytics with longer-term trend visualization
- Social features for sharing break achievements
- Integration with calendar applications for scheduling
- Mobile app development for native mobile experience
