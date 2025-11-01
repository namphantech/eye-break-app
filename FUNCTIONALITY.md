# Fresh Eye Reminder App - Functionality Documentation

## Overview

Eylax is a web application designed to help users maintain healthy eye habits by taking regular breaks from screen time. The app combines a Pomodoro-style timer with health-conscious reminders to encourage users to rest their eyes periodically throughout the day. The application features an eye-friendly color palette and design to reduce strain during extended use.

## Core Features

### 1. User Authentication

- **Email/Password Authentication**: Users can sign up and log in using email and password credentials
- **Google OAuth Integration**: Single sign-on capability through Google accounts
- **Profile Management**: Automatic creation of user profiles upon first login
- **Secure Session Handling**: Token-based authentication with secure session management

### 2. Focus Timer Functionality

- **Customizable Timer**: Adjustable focus duration from 5 to 60 minutes in 5-minute increments
- **Visual Progress Indicator**: Circular progress bar showing remaining time with color-coded feedback
- **Start/Pause/Reset Controls**: Full control over timer operation
- **Manual Focus Logging**: Option to log focus sessions manually regardless of timer state
- **Automatic Focus Completion**: Timer automatically logs sessions when countdown completes

### 3. Notification System

- **Browser Notifications**: Desktop notifications for focus reminders
- **Service Worker Integration**: Background notification capability even when app is not active
- **Progressive Web App Support**: Installable PWA with offline capabilities
- **Configurable Reminders**: Customizable focus intervals stored locally

### 4. Data Persistence

- **IndexedDB Storage**: Client-side storage for timer state and settings
- **Cloud Database Integration**: Supabase backend for user data and focus logs
- **Offline Support**: Local storage synchronization for offline usage
- **Automatic Sync**: Background synchronization of focus logs when connectivity is restored

### 5. Analytics & History

- **Focus History Tracking**: Detailed log of all completed focus sessions
- **Statistical Overview**: Dashboard showing focus frequency and patterns
- **Weekly Data Visualization**: Focus activity visualization by day of week

### 6. Eye Comfort Features

- **Softer Color Palette**: Eye-friendly color scheme with reduced harsh whites
- **Reduced Visual Clutter**: Increased spacing and simplified layouts
- **Dark Mode Support**: Automatic dark mode based on system preferences
- **Eye Comfort Mode**: Optional sepia filter to reduce blue light exposure

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
  - `break_logs`: Record of all completed focus sessions

### Key Components

#### Timer Component

The primary interface for managing focus sessions:

- Visual countdown timer with large display
- Start, pause, and reset functionality
- Configurable focus duration slider
- Manual focus logging option
- Progress visualization with color feedback

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

2. **Focus Management**

   - User sets desired focus duration using slider
   - User starts timer to begin focus session
   - Visual indicators show progress toward focus completion
   - User receives desktop notification when focus session is complete
   - Focus session is automatically logged to user's history

3. **History & Analytics**
   - User can view recent focus history
   - Statistical overview shows focus patterns
   - Weekly data visualization displays focus frequency

## Technical Implementation Details

### Data Synchronization

- Timer state is persisted in IndexedDB for continuity between sessions
- Focus logs are stored in Supabase database for cross-device access
- Offline focus logs are queued and synchronized when connectivity is restored

### Background Processing

- Service worker handles periodic background checks for focus reminders
- Notifications can be delivered even when app tab is not active
- Progressive web app capabilities enable installation on devices

### Security Considerations

- Row Level Security (RLS) policies protect user data
- Authentication tokens are securely managed by Supabase
- API routes validate user authentication before data access

## API Endpoints

### Authentication

- `/api/auth/callback`: OAuth callback handler for Google authentication

### Focus Management

- `/api/log-break`: Endpoint for recording focus completions
- `/api/stats`: Provides statistical data about user's focus patterns

## Future Enhancements

- Enhanced analytics with longer-term trend visualization
- Social features for sharing focus achievements
- Integration with calendar applications for scheduling
- Mobile app development for native mobile experience
