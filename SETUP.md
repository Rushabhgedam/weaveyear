# Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing
   - Enable Authentication > Sign-in method > Google
   - Create Firestore database
   - Copy config to `src/services/firebase.ts`

3. **Run the app:**
   ```bash
   npm start
   ```

## Firebase Configuration

Update `src/services/firebase.ts` with your Firebase credentials:

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

## Firestore Collections

The app uses these collections:
- `users` - User profiles
- `calendars` - Saved calendar customizations (optional)
- `paperbackOrders` - Paperback order requests

## Google Calendar Sync Setup (Optional)

1. Enable Google Calendar API in Google Cloud Console
2. Add OAuth scope: `https://www.googleapis.com/auth/calendar`
3. Update `src/services/googleCalendarService.ts` with proper token handling

## Troubleshooting

- **TypeScript errors**: Run `npm install --legacy-peer-deps` if you encounter peer dependency issues
- **Firebase errors**: Make sure Firebase config is correct and Firestore is enabled
- **Export errors**: Make sure you're on the preview page when exporting

