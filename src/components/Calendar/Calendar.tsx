import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent } from '../../types/CalendarTypes';
import { fetchEvents, addEvent, updateEvent, deleteEvent } from '../../services/calendarService';
import { fetchProjects, Project } from '../../services/projectService';
import SidePanel from '../Calendar/SidePanel';
import './Calendar.css';

// Setup the date-fns localizer
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarViewProps {
  title?: string;
}

// Helper function to parse YYYY-MM-DD format dates
const parseYYYYMMDD = (dateString: string | null): Date => {
  if (!dateString) return new Date();
  
  // Check if the date is in YYYY-MM-DD format
  const isYYYYMMDD = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  
  if (isYYYYMMDD) {
    // Parse YYYY-MM-DD format and ensure timezone doesn't affect the date
    // Split the date string and create a date with local timezone
    const [year, month, day] = dateString.split('-').map(num => parseInt(num));
    const date = new Date(year, month - 1, day); // month is 0-indexed in JS Date
    return date;
  } else {
    // Fallback to standard Date constructor
    return new Date(dateString);
  }
};

// Format date as "Month (full name), day (two digits), year (four digits)"
const formatDateFull = (date: Date): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
};

const Calendar: React.FC<CalendarViewProps> = ({ title = 'Calendar' }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showProjects, setShowProjects] = useState<boolean>(true);

  // Fetch events and projects on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Fetch regular calendar events
        const eventData = await fetchEvents();
        setEvents(eventData);
        
        // Fetch projects to display as date ranges
        const projectData = await fetchProjects();
        setProjects(projectData);
        
        setError(null);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load calendar data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle slot selection (clicking on a time slot)
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setModalMode('add');
    setSelectedEvent({
      id: '',
      title: '',
      start,
      end,
      description: '',
      location: '',
      allDay: false
    });
    setIsModalOpen(true);
  };

  // Handle event selection (clicking on an existing event)
  const handleSelectEvent = (event: CalendarEvent) => {
    setModalMode('edit');
    
    // Check if this is a project event (start or end date)
    if (event.id.toString().startsWith('project-start-') || event.id.toString().startsWith('project-end-')) {
      // Get the project data from the event
      const project = event.project;
      
      if (project) {
        // Create a new event object that includes both start and end dates from the project
        const projectEvent: CalendarEvent = {
          ...event,
          // Use the actual project start and end dates
          start: parseYYYYMMDD(project.start_date as string),
          end: parseYYYYMMDD(project.end_date as string),
     };
        
        setSelectedEvent(projectEvent);
      } else {
        // Fallback to the original event if project data is missing
        setSelectedEvent(event);
      }
    } else {
      // For regular events, just use the event as is
      setSelectedEvent(event);
    }
    
    setIsModalOpen(true);
  };

  // Handle saving an event (add or edit)
  const handleSaveEvent = async (eventData: CalendarEvent) => {
    try {
      if (modalMode === 'add') {
        const newEvent = await addEvent(eventData);
        setEvents([...events, newEvent]);
      } else {
        const updatedEvent = await updateEvent(eventData.id, eventData);
        setEvents(events.map(event => event.id === updatedEvent.id ? updatedEvent : event));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Failed to save event. Please try again.');
    }
  };

  // Handle deleting an event
  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      setEvents(events.filter(event => event.id !== id));
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. Please try again.');
    }
  };

  // Close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Convert projects to calendar events for display - separate start and end dates
  const projectEvents = useMemo(() => {
    if (!showProjects) return [];
    
    const events: CalendarEvent[] = [];
    const sameDayProjects = new Map<string, Project[]>();
    
    projects
      .filter(project => project.start_date && project.end_date) // Only include projects with valid date ranges
      .forEach(project => {
        // Parse dates with explicit YYYY-MM-DD format handling
        const startDate = parseYYYYMMDD(project.start_date as string);
        const endDate = parseYYYYMMDD(project.end_date as string);
        
        // Check if start and end dates are the same day
        const isSameDay = startDate.getFullYear() === endDate.getFullYear() && 
                          startDate.getMonth() === endDate.getMonth() && 
                          startDate.getDate() === endDate.getDate();
        
        // Create start date event with green highlight
        events.push({
          id: `project-start-${project.id}`,
          title: project.name, // Just the project name without 'Start:' prefix
          start: startDate,
          end: startDate,
          description: '', // No description data
          location: project.address, // Place address in location field
          allDay: true,
          category: 'project-start',
          project: project, // Store the original project data for reference
          className: isSameDay ? 'same-day' : ''
        });
        
        // Create end date event with red highlight
        events.push({
          id: `project-end-${project.id}`,
          title: project.name, // Just the project name without 'End:' prefix
          start: endDate,
          end: endDate,
          description: '', // No description data
          location: project.address, // Place address in location field
          allDay: true,
          category: 'project-end',
          project: project, // Store the original project data for reference
          className: isSameDay ? 'same-day' : ''
        });
        
        // Track projects with same start/end date for potential UI adjustments
        if (isSameDay) {
          const dateKey = startDate.toISOString().split('T')[0];
          if (!sameDayProjects.has(dateKey)) {
            sameDayProjects.set(dateKey, []);
          }
          sameDayProjects.get(dateKey)?.push(project);
        }
      });
      
    return events;
  }, [projects, showProjects]);
  
  // Filter events by category
  const filteredEvents = useMemo(() => {
    // Combine regular events and project events
    const allEvents = [...events, ...projectEvents];
    
    if (filterCategory === 'all') return allEvents;
    return allEvents.filter(event => event.category === filterCategory);
  }, [events, projectEvents, filterCategory]);
  
  // Identify projects nearing their end date (within 7 days)
  const projectsNearingDeadline = useMemo(() => {
    const today = new Date();
    const warningDays = 7; // Projects ending within 7 days
    
    return projects
      .filter(project => {
        if (!project.end_date) return false;
        
        const endDate = parseYYYYMMDD(project.end_date as string);
        const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Return projects that end within the next 7 days and haven't passed yet
        return daysRemaining >= 0 && daysRemaining <= warningDays;
      })
      .sort((a, b) => {
        // Sort by closest end date first
        const endDateA = parseYYYYMMDD(a.end_date as string).getTime();
        const endDateB = parseYYYYMMDD(b.end_date as string).getTime();
        return endDateA - endDateB;
      });
  }, [projects]);

  // We don't need this anymore as we're using a fixed set of categories
  // Including 'project' category

  // Custom event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3b82f6';
    let borderStyle = 'none';
    let opacity = 1;
    let className = '';
    
    // Check if this is a project start or end event
    if (event.id.toString().startsWith('project-start-')) {
      backgroundColor = '#10b981'; // Green for project start dates
      borderStyle = '2px solid #10b981'; // Solid border for start dates
      opacity = 1;
      className = 'project-start-event'; // Add class for project start events
    } else if (event.id.toString().startsWith('project-end-')) {
      backgroundColor = '#ef4444'; // Red for project end dates
      borderStyle = '2px solid #ef4444'; // Solid border for end dates
      opacity = 1;
      className = 'project-end-event'; // Add class for project end events
    } else {
      // Regular event styling
      switch(event.category) {
        case 'meeting': backgroundColor = '#8b5cf6'; break;
        case 'appointment': backgroundColor = '#10b981'; break;
        case 'deadline': backgroundColor = '#ef4444'; break;
        case 'reminder': backgroundColor = '#f59e0b'; break;
        case 'project-start': backgroundColor = '#10b981'; break; // Green for project start
        case 'project-end': backgroundColor = '#ef4444'; break; // Red for project end
        default: backgroundColor = event.color || '#3b82f6';
      }
    }
    
    return { 
      style: { 
        backgroundColor, 
        borderRadius: '6px', 
        color: 'white', 
        fontWeight: 500,
        border: borderStyle,
        opacity: opacity
      },
      className: className
    };
  };

  // Handle view change
  const handleViewChange = (newView: any) => {
    setView(newView);
  };

  // Handle date change
  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
  };

  // We're using the inline onChange handler in the select element

  if (isLoading) {
    return <div className="calendar-loading">Loading calendar...</div>;
  }

  if (error) {
    return <div className="calendar-error">{error}</div>;
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2 className="calendar-title">{title}</h2>
        <div className="calendar-controls">
          <div className="calendar-filter">
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-dropdown"
            >
              <option value="all">All Categories</option>
              <option value="meeting">Meetings</option>
              <option value="appointment">Appointments</option>
              <option value="deadline">Deadlines</option>
              <option value="reminder">Reminders</option>
              <option value="project-start">Project Start Dates</option>
              <option value="project-end">Project End Dates</option>
            </select>
            
            <label className="project-toggle">
              <input 
                type="checkbox" 
                checked={showProjects} 
                onChange={() => setShowProjects(!showProjects)}
              />
              <span>Show Projects</span>
            </label>
          </div>
          <button 
            className="add-event-button" 
            onClick={() => {
              setModalMode('add');
              setSelectedEvent({
                id: '',
                title: '',
                start: new Date(),
                end: new Date(),
                description: '',
                location: '',
                allDay: false
              });
              setIsModalOpen(true);
            }}
          >
            <span className="button-icon">+</span>
            <span>Add Event</span>
          </button>
        </div>
      </div>
      <div className="calendar-layout">
        {/* Placed Section */}
        <div className="placed-section">
          <h3 className="placed-section-title">Deadlines</h3>
          <div className="placed-section-content">
            {projectsNearingDeadline.length > 0 ? (
              <ul className="deadline-list">
                {projectsNearingDeadline.map((project, index) => {
                  const endDate = parseYYYYMMDD(project.end_date as string);
                  const today = new Date();
                  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  // Determine urgency class based on days remaining
                  let urgencyClass = '';
                  if (daysRemaining <= 2) urgencyClass = 'high-urgency';
                  else if (daysRemaining <= 5) urgencyClass = 'medium-urgency';
                  else urgencyClass = 'low-urgency';
                  
                  return (
                    <li 
                      key={project.id} 
                      className={`deadline-item ${urgencyClass}`}
                      style={{ '--item-index': index } as React.CSSProperties}
                    >
                      <div className="deadline-project-name">{project.name}</div>
                      <div className="deadline-project-date">
                        {formatDateFull(endDate)}
                      </div>
                      <div className="deadline-days-remaining">
                        {daysRemaining === 0 ? 'Due today' : 
                         daysRemaining === 1 ? 'Due tomorrow' : 
                         `${daysRemaining} days remaining`}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="no-deadlines">No upcoming deadlines within 7 days</div>
            )}
          </div>
        </div>
        
        {/* Calendar */}
        <div className="calendar-wrapper">
          <BigCalendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700, width: '100%' }}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            view={view}
            date={date}
            onView={handleViewChange}
            onNavigate={handleDateChange}
            popup
            tooltipAccessor={(event) => event.description || ''}
          />
        </div>
      </div>

      {/* Side Panel for Event Details */}
      <SidePanel
        isOpen={isModalOpen}
        mode={modalMode}
        event={selectedEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        onClose={handleCloseModal}
      />
  
    </div>
  );
};

export default Calendar;
