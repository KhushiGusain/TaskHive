'use client';
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarSectionClient() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
      <h2 className="flex-none text-lg font-semibold text-gray-900 mb-3">Calendar</h2>
      <div className="flex-1 flex items-center">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          className="rounded-lg border-none w-full"
          tileClassName={({ date }) =>
            date.toDateString() === new Date().toDateString()
              ? 'bg-yellow-100 font-semibold rounded-full'
              : ''
          }
          tileContent={({ date }) => {
            const today = new Date();
            return date.toDateString() === today.toDateString() ? (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full" />
            ) : null;
          }}
        />
      </div>
    </div>
  );
} 