import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent } from '../../types/CalendarTypes';
import { fetchEvents, addEvent, updateEvent, deleteEvent } from '../../services/calendarService';
import EventModal from '../Calendar/EventModal';
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

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const eventData = await fetchEvents();
        setEvents(eventData);
        setError(null);
      } catch (err) {
        console.error('Failed to load events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
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
    setSelectedEvent(event);
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

  // Custom event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    const style = {
      backgroundColor: event.color || '#3174ad',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return {
      style
    };
  };

  if (isLoading) {
    return <div className="calendar-loading">Loading calendar...</div>;
  }

  if (error) {
    return <div className="calendar-error">{error}</div>;
  }

  return (
    <div className="calendar-container">
      <h2>Calendar</h2>
      <div className="calendar-wrapper">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          defaultView={Views.MONTH}
          defaultDate={new Date()}
        />
      </div>

      {isModalOpen && selectedEvent && (
        <EventModal
          isOpen={isModalOpen}
          mode={modalMode}
          event={selectedEvent}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Calendar;
