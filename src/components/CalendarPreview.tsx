import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateCalendar, CalendarCustomizations, DayData } from '../services/calendarGenerator';
import { auth } from '../services/firebase';
import { saveUserCalendar } from '../services/firestoreService';
import { requestNotificationPermission, checkAndTriggerNotifications, CalendarEvent } from '../services/notificationService';
import './CalendarPreview.css';

interface CalendarPreviewProps {
  customizations: CalendarCustomizations;
  deferredPrompt?: any;
}

const CalendarPreview: React.FC<CalendarPreviewProps> = ({ customizations, deferredPrompt }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isViewOnly = location.state?.viewOnly;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const nextYear = currentYear + 1;
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [editingQuoteKey, setEditingQuoteKey] = useState<string | null>(null);
  const [quoteDraft, setQuoteDraft] = useState<string>('');
  const [savedQuotes, setSavedQuotes] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasSaved, setHasSaved] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(Notification.permission);
  const [showInstallButton, setShowInstallButton] = useState<boolean>(!!deferredPrompt);
  const QUOTE_STORAGE_KEY = 'calendarQuotes';

  useEffect(() => {
    setShowInstallButton(!!deferredPrompt);
  }, [deferredPrompt]);

  useEffect(() => {
    try {
      const storedQuotes = localStorage.getItem(QUOTE_STORAGE_KEY);
      if (storedQuotes) {
        setSavedQuotes(JSON.parse(storedQuotes));
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(savedQuotes));
  }, [savedQuotes]);

  const calendar = useMemo(
    () => generateCalendar(customizations, selectedYear),
    [customizations, selectedYear]
  );
  const monthData = calendar.months[selectedMonth];

  // Check for notifications periodically
  useEffect(() => {
    if (notificationPermission === 'granted') {
      const checkNotifications = () => {
        // Flatten all events from the calendar
        const allEvents: CalendarEvent[] = [];
        calendar.months.forEach(month => {
          month.weeks.forEach(week => {
            week.forEach(day => {
              day.tasks.forEach(task => {
                allEvents.push({
                  date: day.date,
                  text: task.text,
                  type: task.type
                });
              });
            });
          });
        });
        checkAndTriggerNotifications(allEvents);
      };

      checkNotifications(); // Check immediately
      const interval = setInterval(checkNotifications, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [calendar, notificationPermission]);

  const handleYearChange = (year: number) => {
    if (year === selectedYear) return;
    setSelectedYear(year);
    setSelectedMonth(year === currentYear ? currentMonth : 0);
    setEditingQuoteKey(null);
    setQuoteDraft('');
  };

  const getQuoteKey = (date: Date) => {
    const yearPart = date.getFullYear();
    const monthPart = String(date.getMonth() + 1).padStart(2, '0');
    const dayPart = String(date.getDate()).padStart(2, '0');
    return `${yearPart}-${monthPart}-${dayPart}`;
  };



  const getTaskTypeColor = (type: string): string => {
    switch (type) {
      case 'day': return '#4285f4';
      case 'week': return '#34a853';
      case 'month': return '#ea4335';
      default: return '#666';
    }
  };

  const getMoonPhaseEmoji = (phase: string | null): string => {
    switch (phase) {
      case 'Poornima': return '🌕';
      case 'Amavasya': return '🌑';
      case 'Ekadashi': return '🌓';
      default: return '';
    }
  };

  const handleSaveCalendar = async () => {
    const user = auth.currentUser;
    // alert("User" + user?.displayName);
    if (!user) {
      alert('Please sign in to save your calendar.');
      return;
    }
    setIsSaving(true);
    try {
      console.log("Before calendar saving");
      await saveUserCalendar(user.uid, customizations);
      setHasSaved(true);
      // alert('Calendar saved successfully!');
    } catch (error) {
      console.error('Failed to save calendar:', error);
      // alert('Failed to save calendar. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      // We've used the prompt, and can't use it again, throw it away
      // setDeferredPrompt(null); // This would need to be passed up or handled via context if we want to clear it
      setShowInstallButton(false);
    }
  };

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      alert('Notifications enabled! You will receive reminders for your events.');
    } else {
      alert('Notifications denied. Please enable them in your browser settings if you change your mind.');
    }
  };

  return (
    <div className="calendar-preview-container" id="calendar-preview">
      <div className="preview-header">
        <h1>Calendar Preview - {selectedYear}</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/customize')} className="edit-btn">
            Edit Customizations
          </button>

          {!isViewOnly && (
            <button
              onClick={handleSaveCalendar}
              className="export-btn"
              // disabled={!hasSaved}
              // title={!hasSaved ? "Please save your calendar first" : ""}
              style={{
                cursor: isSaving ? 'wait' : 'pointer'
              }}
            >
              {isSaving ? 'Saving...' : (hasSaved ? 'Saved' : 'Save')}
            </button>
          )}

          {showInstallButton && (
            <button onClick={handleInstallClick} className="export-btn primary-btn">
              Install App
            </button>
          )}

          {notificationPermission !== 'granted' && (
            <button onClick={handleEnableNotifications} className="export-btn">
              Enable Notifications
            </button>
          )}
        </div>
      </div>

      <div className="year-selector">
        <button
          className={`year-btn ${selectedYear === currentYear ? 'active' : ''}`}
          onClick={() => handleYearChange(currentYear)}
          aria-pressed={selectedYear === currentYear}
        >
          Current Year ({currentYear})
        </button>
        <button
          className={`year-btn ${selectedYear === nextYear ? 'active' : ''}`}
          onClick={() => handleYearChange(nextYear)}
          aria-pressed={selectedYear === nextYear}
        >
          Next Year ({nextYear})
        </button>
      </div>

      <div className="month-selector">
        <button
          onClick={() => setSelectedMonth(prev => Math.max(0, prev - 1))}
          disabled={selectedMonth === 0}
          className="nav-btn"
        >
          ← Previous
        </button>
        <h2 className="current-month">{monthData.monthName} {monthData.year}</h2>
        <button
          onClick={() => setSelectedMonth(prev => Math.min(11, prev + 1))}
          disabled={selectedMonth === 11}
          className="nav-btn"
        >
          Next →
        </button>
      </div>

      {/* Monthly Goal Display */}
      {monthData.monthlyTask && (
        <div className="monthly-goal-header">
          <div className="monthly-badge">Monthly Goal</div>
          <div className="monthly-text">{monthData.monthlyTask}</div>
        </div>
      )}

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday-header">{day}</div>
          ))}
        </div>

        {monthData.weeks.map((week, weekIndex) => {
          const weeklyTask = monthData.weeklyTasks.find(wt => wt.weekIndex === weekIndex);

          return (
            <React.Fragment key={weekIndex}>
              {/* Weekly Banner - if there's a weekly task for this week */}
              {weeklyTask && (
                <div className="weekly-banner">
                  <div className="weekly-banner-content">
                    <span className="weekly-badge">Week {weeklyTask.weekNumber}</span>
                    <span className="weekly-text">{weeklyTask.text}</span>
                  </div>
                </div>
              )}

              {/* Week Days */}
              <div className="calendar-week">
                {week.map((day: DayData, dayIndex: number) => {
                  // Empty cell
                  if (day.dayOfMonth === 0) {
                    return (
                      <div key={dayIndex} className="calendar-day empty-cell">
                      </div>
                    );
                  }

                  // Regular day cell
                  const quoteKey = getQuoteKey(day.date);
                  // const isEditingQuote = editingQuoteKey === quoteKey;
                  const savedQuoteText = savedQuotes[quoteKey];
                  // const hasQuoteText = Boolean(savedQuoteText && savedQuoteText.trim());

                  // Check if this is today
                  const isToday = day.date.getFullYear() === today.getFullYear() &&
                    day.date.getMonth() === today.getMonth() &&
                    day.date.getDate() === today.getDate();

                  return (
                    <div key={dayIndex} className={`calendar-day ${day.isHoliday ? 'holiday' : ''} ${isToday ? 'today' : ''}`}>
                      <div className="day-number">
                        {day.dayOfMonth}
                        {day.moonPhase && (
                          <span className="moon-phase-icon" title={day.moonPhase}>
                            {getMoonPhaseEmoji(day.moonPhase)}
                          </span>
                        )}
                      </div>

                      {day.isHoliday && (
                        <div className="holiday-label" title={day.holidayName || ''}>
                          🎉 {day.holidayName}
                        </div>
                      )}

                      <div className="day-tasks">
                        {day.tasks.map((task, taskIndex) => (
                          <div
                            key={taskIndex}
                            className="task-item"
                            style={{ borderLeftColor: getTaskTypeColor(task.type) }}
                            title={`${task.type} task: ${task.text}`}
                          >
                            <span className="task-type-badge">{task.type}</span>
                            <span className="task-text">{task.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#4285f4' }}></div>
          <span>Day Planner</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#34a853' }}></div>
          <span>Week Planner</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ea4335' }}></div>
          <span>Month Planner</span>
        </div>
        <div className="legend-item">
          <span>🌕 Poornima</span>
        </div>
        <div className="legend-item">
          <span>🌑 Amavasya</span>
        </div>
        <div className="legend-item">
          <span>🌓 Ekadashi</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarPreview;

