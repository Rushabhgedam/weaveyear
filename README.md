# Custom Calendar Generator

A React TypeScript application for creating personalized calendars with day, week, and month planners, holiday integration, moon phase tracking, and Google Calendar sync.

## Features

- **Custom Week Start**: Choose Sunday or Monday as the first day of the week
- **Day Planner**: Set recurring tasks for specific days of the week
- **Week Planner**: Set tasks for specific weeks of each month (1st, 2nd, 3rd, 4th, 5th)
- **Month Planner**: Set recurring monthly tasks
- **Holiday Integration**: Automatically include government holidays based on country detection
- **Moon Phase Tracking**: Highlight Poornima, Amavasya, and Ekadashi dates
- **Google Calendar Sync**: Sync all tasks and events to Google Calendar
- **Export Options**: 
  - PDF export (print-friendly)
  - PNG/JPG export for wall posters
  - Paperback calendar ordering

## Technologies

- **Frontend**: React 18 with TypeScript
- **Backend**: Firebase (Authentication & Firestore)
- **Routing**: React Router DOM
- **Date Handling**: date-fns
- **Holidays**: date-holidays package
- **Export**: jsPDF & html2canvas

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Google provider
3. Create a Firestore database
4. Copy your Firebase config and update `src/services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Google Calendar API Setup (Optional)

To enable full Google Calendar sync:

1. Enable Google Calendar API in [Google Cloud Console](https://console.cloud.google.com/)
2. Add the calendar scope to Firebase OAuth:
   - Go to Firebase Console > Authentication > Sign-in method > Google
   - Add scope: `https://www.googleapis.com/auth/calendar`
3. Update `src/services/googleCalendarService.ts` with proper OAuth token handling

### 4. Run the Application

```bash
npm start
```

The app will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   └── Login.tsx          # Google OAuth login
│   ├── CustomizationForm.tsx  # Calendar customization form
│   ├── CalendarPreview.tsx    # Calendar preview component
│   ├── ExportOptions.tsx      # Export and sync options
│   ├── GoogleCalendarSync.tsx # Google Calendar sync component
│   └── PaperbackOrder.tsx     # Paperback order form
├── services/
│   ├── firebase.ts            # Firebase configuration
│   ├── calendarGenerator.ts   # Calendar generation logic
│   ├── holidayService.ts      # Government holidays service
│   ├── moonPhaseService.ts    # Moon phase calculations
│   ├── exportService.ts       # PDF/Image export
│   └── googleCalendarService.ts # Google Calendar API
└── utils/
    ├── dateHelpers.ts         # Date utility functions
    └── countryDetection.ts    # Country detection utilities
```

## User Flow

1. **Login**: User signs in with Google OAuth
2. **Customize**: User fills out customization form with:
   - Week start day
   - Day planner tasks
   - Week planner tasks
   - Month planner tasks
   - Holiday preferences
   - Moon phase selections
3. **Preview**: User previews the generated calendar
4. **Export/Sync**: User can:
   - Sync to Google Calendar
   - Export as PDF/PNG/JPG
   - Order paperback calendar
   - Save calendar to Firestore

## Firebase Collections

- `users/{userId}` - User profiles
- `calendars/{calendarId}` - Saved calendar customizations
- `paperbackOrders/{orderId}` - Paperback order requests

## Development Notes

- All components are written in TypeScript
- Uses React Router for navigation
- Customizations are auto-saved to localStorage
- Calendar generation happens client-side
- Export uses html2canvas to capture calendar preview

## Future Enhancements

- Calendar templates
- Multiple calendar support per user
- Calendar sharing
- Recurring event customization
- Custom holiday addition
- Calendar history and versioning
