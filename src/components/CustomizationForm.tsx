import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCustomizations, DayPlanner, WeekPlanner } from '../services/calendarGenerator';
import { getCountryCode } from '../utils/countryDetection';
import { MoonPhase } from '../services/moonPhaseService';
import './CustomizationForm.css';

interface CustomizationFormProps {
  customizations: CalendarCustomizations | null;
  onCustomizationsChange: (customizations: CalendarCustomizations) => void;
}

const DEFAULT_REMINDER_TIME = '08:00 AM';

const parseReminderTime = (
  reminderTime: string | undefined
): { hour: string; minute: string; period: 'AM' | 'PM' } => {
  const fallback = { hour: '08', minute: '00', period: 'AM' as const };
  if (!reminderTime) {
    return fallback;
  }
  const match = reminderTime.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) {
    return fallback;
  }
  const [, hour, minute, period] = match;
  const normalizedHour = hour.padStart(2, '0');
  return {
    hour: normalizedHour,
    minute,
    period: period.toUpperCase() === 'PM' ? 'PM' : 'AM'
  };
};

const formatReminderTime = (hour: string, minute: string, period: 'AM' | 'PM') =>
  `${hour}:${minute} ${period}`;

const CustomizationForm: React.FC<CustomizationFormProps> = ({
  customizations,
  onCustomizationsChange
}) => {
  const navigate = useNavigate();
  const [dayPlanner, setDayPlanner] = useState<DayPlanner>(customizations?.dayPlanner ?? {});
  const [weekPlanner, setWeekPlanner] = useState<WeekPlanner>(customizations?.weekPlanner ?? {});
  const [monthPlanner, setMonthPlanner] = useState<string>(customizations?.monthPlanner ?? '');
  const [cheatDayEnabled, setCheatDayEnabled] = useState<boolean>(customizations?.cheatDayEnabled ?? false);
  const [cheatDayDate, setCheatDayDate] = useState<number>(customizations?.cheatDayDate ?? 1);
  const [cheatDayActionItems, setCheatDayActionItems] = useState<string>(customizations?.cheatDayActionItems ?? '');
  const initialReminder = parseReminderTime(customizations?.reminderTime ?? DEFAULT_REMINDER_TIME);
  const [reminderHour, setReminderHour] = useState<string>(initialReminder.hour);
  const [reminderMinute, setReminderMinute] = useState<string>(initialReminder.minute);
  const [reminderPeriod, setReminderPeriod] = useState<'AM' | 'PM'>(initialReminder.period);
  const [includeHolidays, setIncludeHolidays] = useState<boolean>(customizations?.includeHolidays ?? false);
  const [countryCode, setCountryCode] = useState<string | null>(customizations?.countryCode ?? null);
  const [moonPhases, setMoonPhases] = useState<MoonPhase[]>(customizations?.moonPhases ?? []);
  const [detectingCountry, setDetectingCountry] = useState<boolean>(false);
  const [manualCountry, setManualCountry] = useState<string>('');

  const daysOfWeek = [
    { key: 'sunday', label: 'Sunday' },
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' }
  ] as const;

  const weeks = [1, 2, 3, 4, 5] as const;

  const moonPhaseOptions: MoonPhase[] = ['Poornima', 'Amavasya', 'Ekadashi'];

  // Auto-detect country on mount if holidays are enabled
  useEffect(() => {
    if (includeHolidays && !countryCode) {
      detectCountry();
    }
  }, [includeHolidays]);

  const detectCountry = async () => {
    setDetectingCountry(true);
    try {
      const code = await getCountryCode();
      if (code) {
        setCountryCode(code);
      }
    } catch (error) {
      console.error('Error detecting country:', error);
    } finally {
      setDetectingCountry(false);
    }
  };

  // Debounced save to localStorage
  const reminderTimeValue = formatReminderTime(reminderHour, reminderMinute, reminderPeriod);
  const saveCustomizations = useCallback(() => {
    const newCustomizations: CalendarCustomizations = {
      dayPlanner,
      weekPlanner,
      monthPlanner,
      cheatDayEnabled,
      cheatDayDate,
      cheatDayActionItems,
      reminderTime: reminderTimeValue,
      includeHolidays,
      countryCode: includeHolidays ? (manualCountry || countryCode) : null,
      moonPhases
    };
    onCustomizationsChange(newCustomizations);
  }, [dayPlanner, weekPlanner, monthPlanner, cheatDayEnabled, cheatDayDate, cheatDayActionItems, reminderTimeValue, includeHolidays, countryCode, manualCountry, moonPhases, onCustomizationsChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveCustomizations();
    }, 500);
    return () => clearTimeout(timer);
  }, [saveCustomizations]);

  const handleDayPlannerChange = (day: keyof DayPlanner, value: string) => {
    setDayPlanner(prev => ({ ...prev, [day]: value }));
  };

  const handleWeekPlannerChange = (week: number, value: string) => {
    setWeekPlanner(prev => ({ ...prev, [week]: value }));
  };

  const handleMoonPhaseToggle = (phase: MoonPhase) => {
    setMoonPhases(prev => 
      prev.includes(phase) 
        ? prev.filter(p => p !== phase)
        : [...prev, phase]
    );
  };

  const handlePreview = () => {
    saveCustomizations();
    navigate('/preview');
  };

  return (
    <div className="customization-form-container">
      <div className="form-header">
        <h1>Customize Your Calendar</h1>
        <p className="step-indicator">Step 1 of 3</p>
      </div>

      <div className="form-content">
        {/* Reminder Time */}
        <div className="form-section">
          <label className="section-label">Daily Reminder Time</label>
          <p className="section-description">
            Choose when you want your daily reminders and planner notifications to trigger.
          </p>
          <div className="time-picker">
            <div className="time-select-group">
              <label className="time-select-label" htmlFor="reminder-hour">Hour</label>
              <select
                id="reminder-hour"
                className="time-select"
                value={reminderHour}
                onChange={(e) => setReminderHour(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')).map(hour => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </select>
            </div>
            <div className="time-select-group">
              <label className="time-select-label" htmlFor="reminder-minute">Minutes</label>
              <select
                id="reminder-minute"
                className="time-select"
                value={reminderMinute}
                onChange={(e) => setReminderMinute(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0')).map(minute => (
                  <option key={minute} value={minute}>{minute}</option>
                ))}
              </select>
            </div>
            <div className="time-select-group">
              <label className="time-select-label" htmlFor="reminder-period">Period</label>
              <select
                id="reminder-period"
                className="time-select"
                value={reminderPeriod}
                onChange={(e) => setReminderPeriod(e.target.value as 'AM' | 'PM')}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Day Planner */}
        <div className="form-section">
          <label className="section-label">Day Planner</label>
          <p className="section-description">Set recurring tasks for specific days of the week</p>
          <div className="day-planner-grid">
            {daysOfWeek.map(day => (
              <div key={day.key} className="day-input-group">
                <label className="day-label">{day.label}</label>
                <input
                  type="text"
                  value={dayPlanner[day.key] || ''}
                  onChange={(e) => handleDayPlannerChange(day.key, e.target.value)}
                  placeholder={`Task for ${day.label}`}
                  className="task-input"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Week Planner */}
        <div className="form-section">
          <label className="section-label">Week Planner</label>
          <p className="section-description">Set tasks for specific weeks of each month (1st, 2nd, 3rd, 4th, 5th week)</p>
          <div className="week-planner-grid">
            {weeks.map(week => (
              <div key={week} className="week-input-group">
                <label className="week-label">{week === 1 ? '1st' : week === 2 ? '2nd' : week === 3 ? '3rd' : `${week}th`} Week</label>
                <input
                  type="text"
                  value={weekPlanner[week] || ''}
                  onChange={(e) => handleWeekPlannerChange(week, e.target.value)}
                  placeholder={`Task for ${week === 1 ? '1st' : week === 2 ? '2nd' : week === 3 ? '3rd' : `${week}th`} week`}
                  className="task-input"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Month Planner */}
        <div className="form-section">
          <label className="section-label">Month Planner</label>
          <p className="section-description">Set a recurring task for the first day of each month</p>
          <input
            type="text"
            value={monthPlanner}
            onChange={(e) => setMonthPlanner(e.target.value)}
            placeholder="Monthly recurring task"
            className="task-input full-width"
          />
        </div>

        {/* Cheat Day */}
        <div className="form-section">
          <label className="section-label">Cheat Day</label>
          <p className="section-description">Set a special reminder for your cheat day</p>
          
          <div className="checkbox-group checkbox-wrapper-cheat-day">
            <input
              type="checkbox"
              id="cheatDayEnabled"
              checked={cheatDayEnabled}
              onChange={(e) => setCheatDayEnabled(e.target.checked)}
              className="checkbox-input"
            />
            <label htmlFor="cheatDayEnabled">Enable Cheat Day</label>
          </div>

          {cheatDayEnabled && (
            <div className="cheat-day-config">
              <div className="warning-message">
                ⚠️ Are you sure you want to have cheat day along with your consistency? I would suggest to disable this checkbox.
              </div>
              
              <div className="input-group">
                <label>Select Date of Month:</label>
                <select
                  value={cheatDayDate}
                  onChange={(e) => setCheatDayDate(Number(e.target.value))}
                  className="select-input"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>I will</label>
                <input
                  type="text"
                  value={cheatDayActionItems}
                  onChange={(e) => setCheatDayActionItems(e.target.value)}
                  placeholder="e.g., Eat Pizza, Watch Movie"
                  className="task-input full-width"
                />
              </div>

              {[29, 30, 31].includes(cheatDayDate) && (
                <div className="date-warning">
                  ⚠️ This won't occur in the month of Feb
                  {cheatDayDate === 31 && " (and months with 30 days)"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Holidays */}
        <div className="form-section">
          <label className="section-label">Include Government Holidays</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeHolidays}
                onChange={(e) => {
                  setIncludeHolidays(e.target.checked);
                  if (e.target.checked && !countryCode) {
                    detectCountry();
                  }
                }}
              />
              Include holidays based on my country
            </label>
          </div>
          {includeHolidays && (
            <div className="country-selection">
              {detectingCountry && <p className="detecting">Detecting country...</p>}
              {countryCode && !detectingCountry && (
                <p className="detected-country">Detected: {countryCode}</p>
              )}
              <input
                type="text"
                value={manualCountry}
                onChange={(e) => setManualCountry(e.target.value.toUpperCase())}
                placeholder="Or enter country code (e.g., US, IN, GB)"
                className="country-input"
                maxLength={2}
              />
            </div>
          )}
        </div>

        {/* Moon Phases */}
        <div className="form-section">
          <label className="section-label">Moon Status</label>
          <p className="section-description">Select moon phases to highlight on your calendar</p>
          <div className="checkbox-group">
            {moonPhaseOptions.map(phase => (
              <label key={phase} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={moonPhases.includes(phase)}
                  onChange={() => handleMoonPhaseToggle(phase)}
                />
                {phase}
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button onClick={handlePreview} className="preview-btn">
            Preview Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizationForm;

