export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  allDay?: boolean;
  color?: string;
  user_id?: string;
}

export interface CalendarEventFormData {
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  allDay?: boolean;
  color?: string;
}
