import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCustomizations } from '../services/calendarGenerator';
import GoogleCalendarSync from './GoogleCalendarSync';
import PaperbackOrder from './PaperbackOrder';
import './ExportOptions.css';

interface ExportOptionsProps {
  customizations: CalendarCustomizations;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ customizations }) => {
  const navigate = useNavigate();
  const [showSync, setShowSync] = useState<boolean>(false);
  const [showOrder, setShowOrder] = useState<boolean>(false);

  const handleSaveToFirebase = async () => {
    // This would save to Firestore
    // Implementation depends on Firebase setup
    // alert('Calendar saved! (Firebase integration pending)');
  };

  return (
    <div className="export-options-container">
      <div className="export-header">
        <h1>Sync & Order Options</h1>
        <button onClick={() => navigate('/preview')} className="back-btn">
          ← Back to Preview
        </button>
      </div>

      <div className="export-content">
        {/* Google Calendar Sync */}
        <div className="export-section">
          <div className="section-header">
            <h2>Sync with Google Calendar</h2>
            <p className="section-description">
              Sync your calendar tasks and events to Google Calendar for daily reminders
            </p>
          </div>
          {!showSync ? (
            <button onClick={() => setShowSync(true)} className="action-btn primary">
              Sync to Google Calendar
            </button>
          ) : (
            <GoogleCalendarSync customizations={customizations} />
          )}
        </div>

        {/* Paperback Order */}
        <div className="export-section">
          <div className="section-header">
            <h2>Order Paperback Calendar</h2>
            <p className="section-description">
              Order a physical calendar to hang on your wall
            </p>
          </div>
          {!showOrder ? (
            <button onClick={() => setShowOrder(true)} className="action-btn primary">
              Order Paperback Calendar
            </button>
          ) : (
            <PaperbackOrder customizations={customizations} />
          )}
        </div>

        {/* Save to Firebase */}
        <div className="export-section">
          <div className="section-header">
            <h2>Save Calendar</h2>
            <p className="section-description">
              Save your calendar customizations to access later
            </p>
          </div>
          <button onClick={handleSaveToFirebase} className="action-btn secondary">
            Save to My Calendars
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportOptions;

