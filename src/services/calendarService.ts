import { supabase } from '../lib/supabase';
import { CalendarEvent, CalendarEventFormData } from '../types/CalendarTypes';
import { v4 as uuidv4 } from 'uuid';

/**
 * Check if calendar_events table exists and create it if it doesn't
 */
export const ensureCalendarTableExists = async (): Promise<boolean> => {
  try {
    // Try to query the table to see if it exists
    const { error } = await supabase
      .from('calendar_events')
      .select('count')
      .limit(1);

    // If there's a 404 error, the table doesn't exist
    if (error && error.code === '42P01') { // PostgreSQL code for undefined_table
      console.log('Calendar events table does not exist. Using local storage instead.');
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error checking calendar table:', err);
    return false;
  }
};

/**
 * Get events from local storage
 */
const getLocalEvents = (): CalendarEvent[] => {
  try {
    const eventsJson = localStorage.getItem('calendar_events');
    if (!eventsJson) return [];
    
    const events = JSON.parse(eventsJson);
    return events.map((event: any) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    }));
  } catch (err) {
    console.error('Error reading from local storage:', err);
    return [];
  }
};

/**
 * Save events to local storage
 */
const saveLocalEvents = (events: CalendarEvent[]): void => {
  try {
    localStorage.setItem('calendar_events', JSON.stringify(events));
  } catch (err) {
    console.error('Error saving to local storage:', err);
  }
};

/**
 * Fetch all calendar events from the database for the current user
 * Falls back to local storage if the table doesn't exist or user is not authenticated
 */
export const fetchEvents = async (): Promise<CalendarEvent[]> => {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // If user is not authenticated, use local storage without throwing an error
  if (!user) {
    console.log('User not authenticated, using local storage for calendar events');
    return getLocalEvents();
  }

  // Check if the table exists
  const tableExists = await ensureCalendarTableExists();
  
  if (!tableExists) {
    // Use local storage instead
    return getLocalEvents().filter(event => {
      // Only return events created by this user if they have a user_id
      return !event.user_id || event.user_id === user.id;
    });
  }

  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching events:', error);
      // Fall back to local storage
      return getLocalEvents().filter(event => !event.user_id || event.user_id === user.id);
    }

    // Convert string dates to Date objects
    return (data || []).map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
      allDay: event.all_day
    }));
  } catch (err) {
    console.error('Error in fetchEvents:', err);
    // Fall back to local storage
    return getLocalEvents().filter(event => !event.user_id || event.user_id === user.id);
  }
};

/**
 * Add a new calendar event to the database or local storage if not authenticated
 */
export const addEvent = async (eventData: CalendarEventFormData): Promise<CalendarEvent> => {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Generate a valid UUID for the new event
  const eventId = uuidv4();
  
  // If user is not authenticated, use local storage
  if (!user) {
    console.log('User not authenticated, using local storage for calendar events');
    const newEvent: CalendarEvent = {
      id: eventId,
      ...eventData,
      user_id: 'anonymous-user',
      allDay: eventData.allDay || false
    };
    
    const events = getLocalEvents();
    events.push(newEvent);
    saveLocalEvents(events);
    return newEvent;
  }
  
  const newEvent: CalendarEvent = {
    id: eventId,
    ...eventData,
    user_id: user.id,
    allDay: eventData.allDay || false
  };

  // Check if the table exists
  const tableExists = await ensureCalendarTableExists();
  
  if (!tableExists) {
    // Use local storage instead
    const events = getLocalEvents();
    events.push(newEvent);
    saveLocalEvents(events);
    return newEvent;
  }

  try {
    // Ensure we have valid data for all required fields
    const eventData = {
      id: eventId, // Use the pre-generated UUID
      title: newEvent.title,
      description: newEvent.description || null,
      location: newEvent.location || null,
      start: newEvent.start.toISOString(),
      end: newEvent.end.toISOString(),
      all_day: newEvent.allDay || false,
      color: newEvent.color || '#3174ad',
      user_id: user.id || null
    };
    
    console.log('Sending event data to Supabase:', eventData);
    
    const { error } = await supabase
      .from('calendar_events')
      .insert(eventData);

    if (error) {
      console.error('Error adding event:', error);
      // Fall back to local storage
      const events = getLocalEvents();
      events.push(newEvent);
      saveLocalEvents(events);
    }

    return newEvent;
  } catch (err) {
    console.error('Error in addEvent:', err);
    // Fall back to local storage
    const events = getLocalEvents();
    events.push(newEvent);
    saveLocalEvents(events);
    return newEvent;
  }
};

/**
 * Update an existing calendar event
 */
export const updateEvent = async (id: string, eventData: CalendarEventFormData): Promise<CalendarEvent> => {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // If user is not authenticated, use local storage
  if (!user) {
    console.log('User not authenticated, using local storage for calendar events');
    const events = getLocalEvents();
    const eventIndex = events.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    const updatedEvent: CalendarEvent = {
      id,
      ...eventData,
      user_id: 'anonymous-user'
    };
    
    events[eventIndex] = updatedEvent;
    saveLocalEvents(events);
    return updatedEvent;
  }

  const updatedEvent: CalendarEvent = {
    id,
    ...eventData,
    user_id: user.id
  };

  // Check if the table exists
  const tableExists = await ensureCalendarTableExists();
  
  if (!tableExists) {
    // Use local storage instead
    const events = getLocalEvents();
    const eventIndex = events.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    // Make sure this is the user's event
    if (events[eventIndex].user_id && events[eventIndex].user_id !== user.id) {
      throw new Error('Not authorized to update this event');
    }
    
    events[eventIndex] = updatedEvent;
    saveLocalEvents(events);
    return updatedEvent;
  }

  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .update({
        title: eventData.title,
        description: eventData.description || '',
        location: eventData.location || '',
        start: eventData.start.toISOString(),
        end: eventData.end.toISOString(),
        all_day: eventData.allDay || false,
        color: eventData.color || '#3174ad',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      // Fall back to local storage
      const events = getLocalEvents();
      const eventIndex = events.findIndex(e => e.id === id);
      
      if (eventIndex !== -1) {
        events[eventIndex] = updatedEvent;
        saveLocalEvents(events);
      }
      
      return updatedEvent;
    }

    // Convert back to our CalendarEvent format
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      location: data.location,
      start: new Date(data.start),
      end: new Date(data.end),
      allDay: data.all_day,
      color: data.color,
      user_id: data.user_id
    };
  } catch (err) {
    console.error('Error in updateEvent:', err);
    // Fall back to local storage
    const events = getLocalEvents();
    const eventIndex = events.findIndex(e => e.id === id);
    
    if (eventIndex !== -1) {
      events[eventIndex] = updatedEvent;
      saveLocalEvents(events);
    }
    
    return updatedEvent;
  }
};

/**
 * Delete a calendar event
 */
export const deleteEvent = async (id: string): Promise<void> => {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // If user is not authenticated, use local storage
  if (!user) {
    console.log('User not authenticated, using local storage for calendar events');
    const events = getLocalEvents();
    const filteredEvents = events.filter(e => e.id !== id);
    saveLocalEvents(filteredEvents);
    return;
  }

  // Check if the table exists
  const tableExists = await ensureCalendarTableExists();
  
  if (!tableExists) {
    // Use local storage instead
    const events = getLocalEvents();
    const eventIndex = events.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    // Make sure this is the user's event
    if (events[eventIndex].user_id && events[eventIndex].user_id !== user.id) {
      throw new Error('Not authorized to delete this event');
    }
    
    events.splice(eventIndex, 1);
    saveLocalEvents(events);
    return;
  }

  try {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting event:', error);
      // Try to delete from local storage as fallback
      const events = getLocalEvents();
      const filteredEvents = events.filter(e => e.id !== id);
      if (filteredEvents.length !== events.length) {
        saveLocalEvents(filteredEvents);
      }
    }
  } catch (err) {
    console.error('Error in deleteEvent:', err);
    // Try to delete from local storage as fallback
    const events = getLocalEvents();
    const filteredEvents = events.filter(e => e.id !== id);
    if (filteredEvents.length !== events.length) {
      saveLocalEvents(filteredEvents);
    }
  }
};
