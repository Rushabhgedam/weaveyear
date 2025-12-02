import { getHolidays, isHoliday } from './holidayService';
import { getMoonPhasesForYear, MoonPhase } from './moonPhaseService';

export interface DayPlanner {
  sunday?: string;
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
}

export interface WeekPlanner {
  1?: string;
  2?: string;
  3?: string;
  4?: string;
  5?: string;
}

export interface CalendarCustomizations {
  weekStartsOn?: 0 | 1; // 0 = Sunday, 1 = Monday
  dayPlanner?: DayPlanner;
  weekPlanner?: WeekPlanner;
  monthPlanner?: string;
  cheatDayEnabled?: boolean;
  cheatDayDate?: number;
  cheatDayActionItems?: string;
  reminderTime?: string;
  includeHolidays?: boolean;
  countryCode?: string | null;
  moonPhases?: MoonPhase[];
}

export interface Task {
  type: 'day' | 'week' | 'month';
  text: string;
  weekNumber?: number;
}

export interface DayData {
  date: Date;
  dayOfMonth: number;
  dayOfWeek: number;
  dayName: string;
  isCurrentMonth: boolean;
  tasks: Task[];
  isHoliday: boolean;
  holidayName: string | null;
  moonPhase: MoonPhase | null;
}

export interface WeekData {
  [key: number]: DayData;
}

export interface MonthData {
  month: number;
  monthName: string;
  year: number;
  weeks: DayData[][];
  weeklyTasks: { weekIndex: number; weekNumber: number; text: string }[];
  monthlyTask: string | null;
}

export interface CalendarData {
  year: number;
  months: MonthData[];
}

/**
 * Generate calendar for a full year with all customizations
 */
export const generateCalendar = (
  customizations: CalendarCustomizations,
  year: number = new Date().getFullYear()
): CalendarData => {
  const {
    weekStartsOn = 0,
    dayPlanner = {},
    weekPlanner = {},
    monthPlanner = '',
    cheatDayEnabled = false,
    cheatDayDate = undefined,
    cheatDayActionItems = '🎉 Cheat Day',
    includeHolidays = false,
    countryCode = null,
    moonPhases = []
  } = customizations;

  const calendar: CalendarData = {
    year,
    months: []
  };

  // Get holidays for the year if enabled
  const holidays = includeHolidays && countryCode ? getHolidays(countryCode, year) : [];
  
  // Get moon phases for the year
  const moonPhaseDates = moonPhases.length > 0 ? getMoonPhasesForYear(year, moonPhases) : [];

  // Generate each month
  for (let month = 0; month < 12; month++) {
    const monthDate = new Date(year, month, 1);
    const firstDayOfWeek = monthDate.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Calculate starting position based on week start preference
    const startOffset = weekStartsOn === 0 
      ? firstDayOfWeek 
      : (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1);
    
    const monthData: MonthData = {
      month,
      monthName: monthDate.toLocaleString('default', { month: 'long' }),
      year,
      weeks: [],
      weeklyTasks: [],
      monthlyTask: monthPlanner && monthPlanner.trim() ? monthPlanner : null
    };

    // Track which weeks have tasks
    const weekTasksMap = new Map<number, string>();
    
    // Build calendar grid
    let currentWeek: DayData[] = [];
    let dayCounter = 1;
    let weekIndex = 0;
    
    // Calculate total cells needed
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    
    for (let i = 0; i < totalCells; i++) {
      if (i < startOffset || dayCounter > daysInMonth) {
        // Empty cell (for monthly reminders or empty)
        const emptyDay: DayData = {
          date: new Date(year, month, 1), // Placeholder date
          dayOfMonth: 0, // 0 indicates empty cell
          dayOfWeek: i % 7,
          dayName: '',
          isCurrentMonth: false,
          tasks: [],
          isHoliday: false,
          holidayName: null,
          moonPhase: null
        };
        currentWeek.push(emptyDay);
      } else {
        // Actual day in current month
        const day = new Date(year, month, dayCounter);
        const dayOfWeek = day.getDay();
        const weekInMonth = Math.floor((dayCounter + startOffset - 1) / 7) + 1;
        
        const dayData: DayData = {
          date: new Date(day),
          dayOfMonth: dayCounter,
          dayOfWeek: dayOfWeek,
          dayName: day.toLocaleString('default', { weekday: 'short' }),
          isCurrentMonth: true,
          tasks: [],
          isHoliday: false,
          holidayName: null,
          moonPhase: null
        };

        // Add day planner tasks
        const dayNames: (keyof DayPlanner)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[dayOfWeek];
        if (dayPlanner[dayName] && dayPlanner[dayName]?.trim()) {
          dayData.tasks.push({
            type: 'day',
            text: dayPlanner[dayName]!
          });
        }

        // Add cheat day task if enabled and matches selected date
        if (cheatDayEnabled && cheatDayDate && dayCounter === cheatDayDate) {
          dayData.tasks.push({
            type: 'day',
            text: cheatDayActionItems || '🎉 Cheat Day'
          });
        }

        // Track weekly tasks (don't add to individual days)
        if (weekPlanner[weekInMonth as keyof WeekPlanner] && weekPlanner[weekInMonth as keyof WeekPlanner]?.trim()) {
          if (!weekTasksMap.has(weekIndex)) {
            weekTasksMap.set(weekIndex, weekPlanner[weekInMonth as keyof WeekPlanner]!);
          }
        }

        // Check for holidays
        if (includeHolidays && countryCode) {
          const holiday = isHoliday(day, countryCode);
          if (holiday) {
            dayData.isHoliday = true;
            dayData.holidayName = holiday.name;
          }
        }

        // Check for moon phases
        if (moonPhases.length > 0) {
          const moonPhaseData = getMoonPhasesForYear(year, moonPhases);
          const moonPhase = moonPhaseData.find(mp => 
            mp.date.getFullYear() === day.getFullYear() &&
            mp.date.getMonth() === day.getMonth() &&
            mp.date.getDate() === day.getDate()
          );
          if (moonPhase) {
            dayData.moonPhase = moonPhase.phase;
          }
        }

        currentWeek.push(dayData);
        dayCounter++;
      }

      // Complete week
      if (currentWeek.length === 7) {
        monthData.weeks.push([...currentWeek]);
        weekIndex++;
        currentWeek = [];
      }
    }
    
    // If month has 6 weeks, repeat week 1 task for week 6
    if (monthData.weeks.length === 6) {
      const week1Task = weekPlanner[1];
      if (week1Task && week1Task.trim()) {
        weekTasksMap.set(5, week1Task);
      }
    }

    // Add weekly tasks to monthData
    weekTasksMap.forEach((text, index) => {
      const weekNumber = index + 1;
      monthData.weeklyTasks.push({ weekIndex: index, weekNumber, text });
    });

    calendar.months.push(monthData);
  }

  return calendar;
};

