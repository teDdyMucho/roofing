import { Project } from '../services/projectService';

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
  category?: string;
  project?: Project; // Add project property for project-related events
  className?: string; // Add className property for custom CSS classes
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
