export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
};

export const sendNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
};

export interface CalendarEvent {
  date: Date;
  text: string;
  type: string;
}

export const checkAndTriggerNotifications = (events: CalendarEvent[]) => {
  const now = new Date();
  // Simple logic: check if any event is today and hasn't been notified yet?
  // Or maybe just notify for all events today at a specific time?
  // For now, let's assume we want to notify for events happening "today".
  
  // In a real app, we might want to store which events we've already notified for in localStorage
  // to avoid spamming the user every time they open the app.
  
  const notifiedEventsKey = 'notifiedEvents';
  const notifiedEvents = JSON.parse(localStorage.getItem(notifiedEventsKey) || '{}');
  const todayStr = now.toISOString().split('T')[0];

  if (notifiedEvents[todayStr]) {
    // Already notified for today
    return;
  }

  const todaysEvents = events.filter(event => {
    const eventDateStr = event.date.toISOString().split('T')[0];
    return eventDateStr === todayStr;
  });

  if (todaysEvents.length > 0) {
    const title = `You have ${todaysEvents.length} event${todaysEvents.length > 1 ? 's' : ''} today!`;
    const body = todaysEvents.map(e => `• ${e.text}`).join('\n');
    
    sendNotification(title, {
      body: body,
      icon: '/logo192.png', // Assuming this exists
      tag: 'daily-reminder' // Prevents duplicate notifications
    });

    // Mark today as notified
    localStorage.setItem(notifiedEventsKey, JSON.stringify({ ...notifiedEvents, [todayStr]: true }));
  }
};
