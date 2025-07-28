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

// Helper function to parse date strings in various formats
const parseYYYYMMDD = (dateString: string | null): Date => {
  if (!dateString) return new Date();
  
  try {
    // Check if the date is in human-readable format like "May 28, 2025, at 9am"
    const humanReadablePattern = /([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})(,\s+at\s+[\d:]+[apm]+)?/;
    const humanReadableMatch = dateString.match(humanReadablePattern);
    
    if (humanReadableMatch) {
      // Extract month, day, year from the human-readable format
      const monthName = humanReadableMatch[1];
      const day = parseInt(humanReadableMatch[2]);
      const year = parseInt(humanReadableMatch[3]);
      
      // Convert month name to month number (0-indexed)
      const months: Record<string, number> = {
        'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
        'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
      };
      
      const monthLower = monthName.toLowerCase();
      const monthIndex = months[monthLower];
      if (monthIndex !== undefined) {
        return new Date(year, monthIndex, day);
      }
    }
    
    // Check if the date is in YYYY-MM-DD format
    const isYYYYMMDD = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
    
    if (isYYYYMMDD) {
      // Parse YYYY-MM-DD format and ensure timezone doesn't affect the date
      // Split the date string and create a date with local timezone
      const [year, month, day] = dateString.split('-').map(num => parseInt(num));
      const date = new Date(year, month - 1, day); // month is 0-indexed in JS Date
      return date;
    } else if (dateString.includes('T') || dateString.includes(' ')) {
      // Handle ISO format (YYYY-MM-DDTHH:MM:SS) or datetime with space separator
      // Extract just the date part for calendar display
      let datePart;
      
      if (dateString.includes('T')) {
        // ISO format: YYYY-MM-DDTHH:MM:SS
        datePart = dateString.split('T')[0];
      } else {
        // Space separator format: YYYY-MM-DD HH:MM:SS
        datePart = dateString.split(' ')[0];
      }
      
      // Now parse the date part
      const [year, month, day] = datePart.split('-').map(num => parseInt(num));
      return new Date(year, month - 1, day);
    } else {
      // Fallback to standard Date constructor
      return new Date(dateString);
    }
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return new Date(); // Return current date as fallback
  }
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
  const [filterCategory] = useState('all');
  const [showProjects, setShowProjects] = useState<boolean>(true);
  
  // Categories for filtering events
  const [selectedCategories, setSelectedCategories] = useState(() => {
    // Try to load saved state from localStorage
    const savedState = localStorage.getItem('calendarCategoryFilters');
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        console.error('Error parsing saved category filters:', e);
      }
    }
    
    // Default state if nothing is saved
    return {
      jobWalks: false,
      bidDueDate: false,
      rfiDeadlines: false,
      preConMeetings: false,
      projectSchedules: false,
      materialDelivery: false
    };
  });
  
  // Save category filter state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('calendarCategoryFilters', JSON.stringify(selectedCategories));
  }, [selectedCategories]);
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

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

  // Calculate project events
  const projectEvents = useMemo(() => {
    if (!showProjects) return [];
    
    const events: CalendarEvent[] = [];
    // Map to track events by date for merging
    const eventsByDate: Record<string, { 
      ids: string[], 
      title: string, 
      date: Date, 
      categories: string[],
      types: string[],
      projectName: string
    }> = {};
    
    projects.forEach(project => {
      // Regular project start/end dates
      if (project.start_date) {
        const date = parseYYYYMMDD(project.start_date);
        
        events.push({
          id: `project-start-${project.id}`,
          title: `${project.name} (Start)`,
          start: date,
          end: date,
          allDay: true,
          category: 'project-start'
        });
      }
      
      if (project.end_date) {
        const date = parseYYYYMMDD(project.end_date);
        
        events.push({
          id: `project-end-${project.id}`,
          title: `${project.name} (End)`,
          start: date,
          end: date,
          allDay: true,
          category: 'project-end'
        });
      }
      
      // Create temporary objects to track special date fields
      const specialDates = [];
      
      // Pre-Bid Conference Date
      if (project.preBidConferenceDt) {
        specialDates.push({
          id: `prebid-conference-${project.id}`,
          date: parseYYYYMMDD(project.preBidConferenceDt),
          type: 'Pre-Bid Conference',
          category: 'prebid-conference'
        });
      }
      
      // Bid Due Date
      if (project.bidDue) {
        specialDates.push({
          id: `bid-due-${project.id}`,
          date: parseYYYYMMDD(project.bidDue),
          type: 'Bid Due',
          category: 'bid-due'
        });
      }
      
      // RFI Due Date
      if (project.rfiDue) {
        specialDates.push({
          id: `rfi-due-${project.id}`,
          date: parseYYYYMMDD(project.rfiDue),
          type: 'RFI Due',
          category: 'rfi-due'
        });
      }
      
      // Process special dates and merge if they fall on the same day
      specialDates.forEach(specialDate => {
        const dateKey = specialDate.date.toISOString().split('T')[0];
        
        if (!eventsByDate[dateKey]) {
          eventsByDate[dateKey] = {
            ids: [specialDate.id],
            title: `${project.name} (${specialDate.type})`,
            date: specialDate.date,
            categories: [specialDate.category],
            types: [specialDate.type],
            projectName: project.name
          };
        } else {
          // If we already have an event on this date, merge them
          eventsByDate[dateKey].ids.push(specialDate.id);
          eventsByDate[dateKey].categories.push(specialDate.category);
          eventsByDate[dateKey].types.push(specialDate.type);
          
          // Only update project name if it's the same project
          if (eventsByDate[dateKey].projectName === project.name) {
            // Update title to show multiple types
            eventsByDate[dateKey].title = `${project.name} (${eventsByDate[dateKey].types.join(', ')})`;  
          } else {
            // If different projects, show 'Multiple Events'
            eventsByDate[dateKey].title = 'Multiple Events';  
          }
        }
      });
    });
    
    // Add merged events to the events array
    Object.values(eventsByDate).forEach(mergedEvent => {
      events.push({
        id: mergedEvent.ids.join('-'),
        title: mergedEvent.title,
        start: mergedEvent.date,
        end: mergedEvent.date,
        allDay: true,
        category: mergedEvent.categories.join(','),
        description: `Types: ${mergedEvent.types.join(', ')}`
      });
    });
    
    return events;
  }, [projects, showProjects]);

  // Filter events by category
  const filteredEvents = useMemo(() => {
    // Combine regular events and project events
    const allEvents = [...events, ...projectEvents];
    
    let filtered = [...allEvents];
    
    // Apply main category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(event => event.category === filterCategory);
    }
    
    // Apply category group filter
    if (categoryFilter !== 'All Categories') {
      if (categoryFilter === 'Admin') {
        filtered = filtered.filter(event => 
          ['admin', 'meeting', 'internal'].includes(String(event.category).toLowerCase()));
      } else if (categoryFilter === 'Projects') {
        filtered = filtered.filter(event => 
          ['project', 'client', 'site'].includes(String(event.category).toLowerCase()));
      } else if (categoryFilter === 'Example') {
        filtered = filtered.filter(event => 
          ['example', 'demo', 'sample'].includes(String(event.category).toLowerCase()));
      } else if (categoryFilter === 'Project StartDate') {
        filtered = filtered.filter(event => 
          String(event.category).toLowerCase() === 'project-start');
      } else if (categoryFilter === 'Project EndDate') {
        filtered = filtered.filter(event => 
          String(event.category).toLowerCase() === 'project-end');
      }
    }
    
    // Apply specific category filters
    filtered = filtered.filter(event => {
      const category = String(event.category).toLowerCase();
      
      // Filter job walks
      if (category.includes('job walk') && !selectedCategories.jobWalks) return false;
      
      // Filter bid due dates - both regular events and project bid due dates
      if ((category.includes('bid') || category === 'bid-due') && !selectedCategories.bidDueDate) return false;
      
      // Filter RFI deadlines - both regular events and project RFI due dates
      if ((category.includes('rfi') || category === 'rfi-due') && !selectedCategories.rfiDeadlines) return false;
      
      // Filter pre-con meetings and pre-bid conferences
      if ((category.includes('pre-con') || category.includes('precon') || category === 'prebid-conference') && !selectedCategories.preConMeetings) return false;
      
      // Filter project schedules
      if (category.includes('schedule') && !selectedCategories.projectSchedules) return false;
      
      // Filter material delivery
      if ((category.includes('material') || category.includes('delivery')) && !selectedCategories.materialDelivery) return false;
      
      return true;
    });
    
    return filtered;
  }, [events, projectEvents, filterCategory, categoryFilter, selectedCategories]);

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

  // Show loading state
  if (isLoading) {
    return <div className="calendar-loading">Loading calendar...</div>;
  }

  // Show error state
  if (error) {
    return <div className="calendar-error">{error}</div>;
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>{title}</h2>
        
        {/* Categories Filter Section - Horizontal Layout */}
        <div className="calendar-filters-row">
          <div className="calendar-categories">
            <label className={`category-checkbox ${selectedCategories.jobWalks ? 'active' : ''}`}>
              <input 
                type="checkbox" 
                checked={selectedCategories.jobWalks}
                onChange={() => setSelectedCategories({...selectedCategories, jobWalks: !selectedCategories.jobWalks})}
              />
              <span>Job Walks</span>
            </label>
            
            <label className={`category-checkbox ${selectedCategories.bidDueDate ? 'active' : ''}`}>
              <input 
                type="checkbox" 
                checked={selectedCategories.bidDueDate}
                onChange={() => setSelectedCategories({...selectedCategories, bidDueDate: !selectedCategories.bidDueDate})}
              />
              <span>Bid Due Date</span>
            </label>
            
            <label className={`category-checkbox ${selectedCategories.rfiDeadlines ? 'active' : ''}`}>
              <input 
                type="checkbox" 
                checked={selectedCategories.rfiDeadlines}
                onChange={() => setSelectedCategories({...selectedCategories, rfiDeadlines: !selectedCategories.rfiDeadlines})}
              />
              <span>RFI Deadlines</span>
            </label>
            
            <label className={`category-checkbox ${selectedCategories.preConMeetings ? 'active' : ''}`}>
              <input 
                type="checkbox" 
                checked={selectedCategories.preConMeetings}
                onChange={() => setSelectedCategories({...selectedCategories, preConMeetings: !selectedCategories.preConMeetings})}
              />
              <span>Pre-Con Meetings</span>
            </label>
            
            <label className={`category-checkbox ${selectedCategories.projectSchedules ? 'active' : ''}`}>
              <input 
                type="checkbox" 
                checked={selectedCategories.projectSchedules}
                onChange={() => setSelectedCategories({...selectedCategories, projectSchedules: !selectedCategories.projectSchedules})}
              />
              <span>Project Schedules</span>
            </label>
            
            <label className={`category-checkbox ${selectedCategories.materialDelivery ? 'active' : ''}`}>
              <input 
                type="checkbox" 
                checked={selectedCategories.materialDelivery}
                onChange={() => setSelectedCategories({...selectedCategories, materialDelivery: !selectedCategories.materialDelivery})}
              />
              <span>Material Delivery</span>
            </label>
          </div>
          
          <div className="filter-controls">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="category-select"
            >
              <option value="All Categories">All Categories</option>
              <option value="Admin">Admin</option>
              <option value="Projects">Projects</option>
              <option value="Example">Example</option>
              <option value="Project StartDate">Project Start Date</option>
              <option value="Project EndDate">Project End Date</option>
            </select>
            
            <label className="toggle-projects">
              <input 
                type="checkbox"
                checked={showProjects}
                onChange={() => setShowProjects(!showProjects)}
              />
              <span>Show Projects</span>
            </label>
          </div>
        </div>
      </div>

      <div className="calendar-layout">
        {/* Placed Section */}
        <div className="placed-section">
          <h3 className="placed-section-title">Project List</h3>
          <div className="placed-section-content">
            {/* Projects with deadlines */}
            <div className="deadlines-list">
              {projects && projects.length > 0 ? (
                projects.map(project => (
                  <div key={project.id} className="deadline-project-item">
                    <div className="deadline-project-header">
                      <div className="deadline-project-name">{project.name}</div>
                      <div className="deadline-project-status active">active</div>
                    </div>
                    {/* Display project deadlines if they exist */}
                    {(project.preBidConferenceDt || project.bidDue || project.rfiDue) && (
                      <div className="project-deadlines">
                        {project.bidDue && (
                          <div className="project-info-item">
                            <div className="project-info-label">Bid Due:</div>
                            <div className="project-info-value">
                              {new Date(project.bidDue).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                        {project.rfiDue && (
                          <div className="project-info-item">
                            <div className="project-info-label">RFI Due:</div>
                            <div className="project-info-value">
                              {new Date(project.rfiDue).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                        {project.preBidConferenceDt && (
                          <div className="project-info-item">
                            <div className="project-info-label">Pre-Bid:</div>
                            <div className="project-info-value">
                              {new Date(project.preBidConferenceDt).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-deadlines-message">
                  No projects with deadlines
                </div>
              )}
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
