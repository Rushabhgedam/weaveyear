import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { CalendarCustomizations } from '../services/calendarGenerator';
import { generateCalendar } from '../services/calendarGenerator';
import { createGoogleCalendarEvents } from '../services/googleCalendarService';
import './GoogleCalendarSync.css';

interface GoogleCalendarSyncProps {
  customizations: CalendarCustomizations;
}

const GoogleCalendarSync: React.FC<GoogleCalendarSyncProps> = ({ customizations }) => {
  const [user, setUser] = useState<User | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    if (!user) {
      setError('Please sign in to sync with Google Calendar');
      return;
    }

    setSyncing(true);
    setError(null);
    setSuccess(false);

    try {
      // Get access token from Firebase Auth
      // const token = await user.getIdToken();

      // Generate calendar data
      const currentYear = new Date().getFullYear();
      const calendarData = generateCalendar(customizations, currentYear);
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

      // Create events
      const events = createGoogleCalendarEvents(customizations, calendarData, timeZone);

      // Note: For full Google Calendar API integration, you need to:
      // 1. Enable Google Calendar API in Google Cloud Console
      // 2. Add the scope: 'https://www.googleapis.com/auth/calendar'
      // 3. Get proper OAuth token with calendar scope

      // For now, we'll show the events that would be created
      console.log('Events to be created:', events);

      // If you have proper OAuth token with calendar scope:
      // await syncToGoogleCalendar(events, accessToken);

      // For demonstration, we'll simulate success
      setSuccess(true);
      // alert(`Ready to sync ${events.length} events to Google Calendar!\n\nNote: Full integration requires Google Calendar API setup with proper OAuth scopes.`);

    } catch (err: any) {
      console.error('Error syncing to Google Calendar:', err);
      setError(err.message || 'Failed to sync with Google Calendar. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="google-calendar-sync">
      <div className="sync-info">
        <p>This will create recurring events in your Google Calendar for:</p>
        <ul>
          {customizations.dayPlanner && Object.values(customizations.dayPlanner).some(v => v?.trim()) && (
            <li>Day planner tasks (weekly recurring)</li>
          )}
          {customizations.weekPlanner && Object.values(customizations.weekPlanner).some(v => v?.trim()) && (
            <li>Week planner tasks (monthly on specific weeks)</li>
          )}
          {customizations.monthPlanner && customizations.monthPlanner.trim() && (
            <li>Monthly planner tasks (first day of each month)</li>
          )}
          {customizations.includeHolidays && (
            <li>Government holidays</li>
          )}
          {customizations.moonPhases && customizations.moonPhases.length > 0 && (
            <li>Moon phase dates</li>
          )}
        </ul>
        <p className="reminder-time-note">
          Reminder time: <strong>{customizations.reminderTime || '08:00 AM'}</strong>
        </p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          Calendar events prepared! Full sync requires Google Calendar API setup.
        </div>
      )}

      <button
        onClick={handleSync}
        className="sync-btn"
        disabled={syncing}
      >
        {syncing ? 'Syncing...' : 'Sync to Google Calendar'}
      </button>

      <div className="sync-note">
        <p><strong>Note:</strong> To enable full Google Calendar sync:</p>
        <ol>
          <li>Enable Google Calendar API in Google Cloud Console</li>
          <li>Add calendar scope to Firebase OAuth configuration</li>
          <li>Update the sync function with proper API credentials</li>
        </ol>
      </div>
    </div>
  );
};

export default GoogleCalendarSync;

