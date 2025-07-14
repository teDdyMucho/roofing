import React from 'react';
import Calendar from './Calendar';
import './CalendarPage.css';

const CalendarPage: React.FC = () => {
  return (
    <div className="calendar-page">
      <div className="calendar-page-header">
        <h1>Calendar</h1>
        <p>Manage your appointments and events</p>
      </div>
      <Calendar />
    </div>
  );
};

export default CalendarPage;
