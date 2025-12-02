import { CalendarCustomizations, CalendarData } from './calendarGenerator';

interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  end: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  recurrence?: string[];
  reminders?: {
    useDefault: boolean;
  };
}

interface ReminderTimeParts {
  hour24: number;
  minute: number;
}

const formatDateOnly = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseReminderTime = (reminderTime?: string): ReminderTimeParts | null => {
  if (!reminderTime) {
    return null;
  }
  const match = reminderTime.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) {
    return null;
  }
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (hour === 12) {
    hour = 0;
  }
  if (period === 'PM') {
    hour += 12;
  }

  return {
    hour24: hour,
    minute
  };
};

const buildEventTiming = (
  date: Date,
  reminderParts: ReminderTimeParts | null,
  timeZone: string
): {
  start: { date?: string; dateTime?: string; timeZone?: string };
  end: { date?: string; dateTime?: string; timeZone?: string };
} => {
  if (!reminderParts) {
    const dateOnly = formatDateOnly(date);
    return {
      start: { date: dateOnly, timeZone },
      end: { date: dateOnly, timeZone }
    };
  }

  const startDate = new Date(date);
  startDate.setHours(reminderParts.hour24, reminderParts.minute, 0, 0);

  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

  const formatDateTime = (value: Date) => {
    const dateOnly = formatDateOnly(value);
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    return `${dateOnly}T${hours}:${minutes}:00`;
  };

  return {
    start: { dateTime: formatDateTime(startDate), timeZone },
    end: { dateTime: formatDateTime(endDate), timeZone }
  };
};

/**
 * Create Google Calendar events from calendar customizations
 * This function prepares events that will be synced to Google Calendar
 */
export const createGoogleCalendarEvents = (
  customizations: CalendarCustomizations,
  calendarData: CalendarData,
  timeZone: string = 'UTC'
): GoogleCalendarEvent[] => {
  const events: GoogleCalendarEvent[] = [];
  const { dayPlanner, weekPlanner, monthPlanner, moonPhases, includeHolidays, reminderTime } = customizations;
  const reminderParts = parseReminderTime(reminderTime);

  // Create recurring events for day planner tasks
  if (dayPlanner) {
    const dayMapping: { [key: string]: string } = {
      'sunday': 'SU',
      'monday': 'MO',
      'tuesday': 'TU',
      'wednesday': 'WE',
      'thursday': 'TH',
      'friday': 'FR',
      'saturday': 'SA'
    };

    Object.entries(dayPlanner).forEach(([day, task]) => {
      if (task && task.trim()) {
        const dayAbbr = dayMapping[day.toLowerCase()];
        if (dayAbbr) {
          const referenceDate = new Date(calendarData.year, 0, 1);
          const timing = buildEventTiming(referenceDate, reminderParts, timeZone);

          events.push({
            summary: task,
            description: `Day Planner: ${day}`,
            start: timing.start,
            end: timing.end,
            recurrence: [`RRULE:FREQ=WEEKLY;BYDAY=${dayAbbr};UNTIL=${calendarData.year}1231T235959Z`],
            reminders: {
              useDefault: true
            }
          });
        }
      }
    });
  }

  // Create events for week planner tasks
  if (weekPlanner) {
    Object.entries(weekPlanner).forEach(([weekNum, task]) => {
      if (task && task.trim()) {
        // Create events for the first occurrence of each week in each month
        for (let month = 0; month < 12; month++) {
          const monthData = calendarData.months[month];
          const weekNumber = parseInt(weekNum);
          
          // Find first day of the specified week in the month
          const weekDays = monthData.weeks[weekNumber - 1];
          if (weekDays && weekDays.length > 0) {
            const firstDay = weekDays[0];
            if (firstDay.isCurrentMonth) {
              const timing = buildEventTiming(firstDay.date, reminderParts, timeZone);

              events.push({
                summary: task,
                description: `Week Planner: Week ${weekNum} of ${monthData.monthName}`,
                start: timing.start,
                end: timing.end,
                reminders: {
                  useDefault: true
                }
              });
            }
          }
        }
      }
    });
  }

  // Create recurring monthly events
  if (monthPlanner && monthPlanner.trim()) {
    const referenceDate = new Date(calendarData.year, 0, 1);
    const timing = buildEventTiming(referenceDate, reminderParts, timeZone);

    events.push({
      summary: monthPlanner,
      description: 'Monthly Planner Task',
      start: timing.start,
      end: timing.end,
      recurrence: [`RRULE:FREQ=MONTHLY;BYMONTHDAY=1;UNTIL=${calendarData.year}1231T235959Z`],
      reminders: {
        useDefault: true
      }
    });
  }

  // Create events for moon phases
  if (moonPhases && moonPhases.length > 0) {
    calendarData.months.forEach(monthData => {
      monthData.weeks.forEach(week => {
        week.forEach(day => {
          if (day.moonPhase && moonPhases.includes(day.moonPhase)) {
            events.push({
              summary: `${day.moonPhase} - Moon Phase`,
              description: `Moon phase: ${day.moonPhase}`,
              start: {
                date: formatDateOnly(day.date),
                timeZone
              },
              end: {
                date: formatDateOnly(day.date),
                timeZone
              },
              reminders: {
                useDefault: false
              }
            });
          }
        });
      });
    });
  }

  // Create events for holidays (if enabled)
  if (includeHolidays) {
    calendarData.months.forEach(monthData => {
      monthData.weeks.forEach(week => {
        week.forEach(day => {
          if (day.isHoliday && day.holidayName) {
            events.push({
              summary: day.holidayName,
              description: 'Government Holiday',
              start: {
                date: formatDateOnly(day.date),
                timeZone
              },
              end: {
                date: formatDateOnly(day.date),
                timeZone
              },
              reminders: {
                useDefault: false
              }
            });
          }
        });
      });
    });
  }

  return events;
};

/**
 * Sync events to Google Calendar using Google Calendar API
 * Note: This requires proper OAuth setup with Google Calendar scope
 */
export const syncToGoogleCalendar = async (
  events: GoogleCalendarEvent[],
  accessToken: string
): Promise<void> => {
  try {
    // This would use the Google Calendar API
    // For now, we'll prepare the structure
    // Actual implementation requires Google Calendar API setup
    
    for (const event of events) {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
      console.log('response received:', response);

      if (!response.ok) {
        throw new Error(`Failed to create event: ${response.statusText}`);
      }
    }
  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
    throw error;
  }
};

