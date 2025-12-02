import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { CalendarCustomizations } from './calendarGenerator';

export interface SavedCalendar {
  userId: string;
  customizations: CalendarCustomizations;
  createdAt: any;
  updatedAt: any;
}

/**
 * Save user's calendar customizations to Firestore
 * @param userId The ID of the user saving the calendar
 * @param customizations The calendar customizations to save
 */
export const saveUserCalendar = async (userId: string, customizations: CalendarCustomizations): Promise<void> => {
  try {
    // We'll store the calendar in a 'calendars' subcollection under the user
    // or a top-level 'calendars' collection with userId. 
    // Let's use a subcollection for better organization if users can have multiple,
    // but for now, let's assume one main calendar per user or just overwrite for simplicity 
    // as per the requirement "save all events of the logged in user".
    
    // Strategy: Save to users/{userId}/calendar/current (or similar)
    // Or just update the user document with calendar data?
    // A subcollection is safer for data size.
    
    const calendarRef = doc(db, 'users', userId, 'calendars', 'default');
    console.log("Calendarref", customizations)
    await setDoc(calendarRef, {
      userId,
      customizations,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(), // This will be overwritten on update, which is fine for "save" semantics usually, or we can use merge: true
    }, { merge: true });

    console.log('Calendar saved successfully');
  } catch (error) {
    console.error('Error saving calendar:', error);
    throw error;
  }
};
