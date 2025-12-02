import Holidays from 'date-holidays';

interface Holiday {
  date: Date;
  name: string;
  type: string;
}

/**
 * Get government holidays for a country and year
 */
export const getHolidays = (countryCode: string, year: number): Holiday[] => {
  if (!countryCode) {
    return [];
  }

  try {
    const hd = new Holidays(countryCode);
    const holidays = hd.getHolidays(year);
    
    return holidays.map((holiday: any) => ({
      date: new Date(holiday.date),
      name: holiday.name,
      type: holiday.type
    }));
  } catch (error) {
    console.error(`Error fetching holidays for ${countryCode}:`, error);
    return [];
  }
};

/**
 * Check if a date is a holiday
 */
export const isHoliday = (date: Date, countryCode: string): Holiday | null => {
  if (!countryCode) {
    return null;
  }

  const year = date.getFullYear();
  const holidays = getHolidays(countryCode, year);
  
  return holidays.find(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate.getDate() === date.getDate() &&
           holidayDate.getMonth() === date.getMonth() &&
           holidayDate.getFullYear() === date.getFullYear();
  }) || null;
};

