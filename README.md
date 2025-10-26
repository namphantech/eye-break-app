# LucidEye - Smart Eye Relaxation App

## Project Overview

LucidEye is a web application designed to help users maintain healthy eye habits by taking regular breaks from screen time. The app combines a Pomodoro-style timer with health-conscious reminders to encourage users to rest their eyes periodically throughout the day.

## Core Features

### 1. Focus Timer

- Customizable focus sessions from 5 to 60 minutes
- Visual progress indicator with circular progress bar
- Start, pause, and reset controls
- Automatic tracking of focus sessions
- Manual session logging option

### 2. Exercise Guidance

- Guided eye exercises with animations
- Various exercise types (eye movements, neck rolls, breathing exercises)
- Audio cues for exercise timing
- Random exercise suggestions after completed focus sessions

### 3. User Authentication

- Email/password authentication
- Google OAuth integration
- Profile management
- Secure session handling

### 4. Notification System

- Browser notifications for session reminders
- Service Worker integration for background notifications
- Progressive Web App (PWA) support
- Configurable reminder intervals

### 5. Data Tracking & Analytics

- Focus session history tracking
- Statistical dashboard with session data
- Weekly visualization of focus patterns
- Cloud synchronization via Supabase

### 6. User Experience Features

- Eye comfort mode with blue light reduction
- Light/dark theme support
- Responsive design for all devices
- Offline functionality with data synchronization

## Technology Stack

- **Frontend**: Next.js 16 with React 19, TypeScript
- **Styling**: Tailwind CSS with custom color palette
- **UI Components**: Radix UI with class-variance-authority
- **Backend**: Supabase (authentication and database)
- **Database**: PostgreSQL with Row Level Security
- **State Management**: React hooks and IndexedDB
- **Additional Libraries**:
  - react-hook-form, zod (form validation)
  - sonner (notifications)
  - lottie-react (animations)
  - recharts (data visualization)

## Key Components

1. **Timer Component**: Main interface for managing focus sessions
2. **Exercise Pages**: Guided exercises with animations and instructions
3. **Dashboard**: Main application interface with statistics
4. **History Page**: Detailed log of completed focus sessions
5. **Statistics Page**: Data visualization of user's focus patterns
6. **Profile Management**: User information and settings
7. **Reminder Settings**: Notification configuration

## Color Palette

The app uses a "Fresh Focus" color palette designed to reduce eye strain:

- Primary: #3BAE8A (softer teal)
- Hover: #2E8C70
- Accent: #A3E4D7
- Backgrounds: #F2F8F5 (light, soft off-white) / #1C2E2A (dark, deep forest)
- Text: #1A1A1A (light) / #E6E6E6 (dark)

## Data Persistence

- IndexedDB for client-side storage of timer state
- Supabase PostgreSQL for user data and session logs
- Offline support with automatic synchronization

This application helps users develop healthy screen time habits while providing a pleasant, eye-friendly experience with its carefully designed color scheme and interface.
