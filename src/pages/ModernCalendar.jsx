import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, X } from 'lucide-react';

const ModernCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date()); // Today
  const [view, setView] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', duration: '' });

  // Events state
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Meeting with CEO',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 8),
      duration: '3h',
      type: 'meeting',
      color: 'bg-blue-100 text-blue-800 border-l-4 border-l-blue-500'
    },
    {
      id: 2,
      title: 'Presentation of the new project',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 8),
      duration: '2h',
      type: 'presentation',
      color: 'bg-orange-100 text-orange-800 border-l-4 border-l-orange-500'
    },
    {
      id: 3,
      title: 'Presentation of the new features',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 16),
      duration: '2h',
      type: 'presentation',
      color: 'bg-purple-100 text-purple-800 border-l-4 border-l-purple-500'
    },
    {
      id: 4,
      title: 'Meeting with service team',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 16),
      duration: '2h',
      type: 'meeting',
      color: 'bg-green-100 text-green-800 border-l-4 border-l-green-500'
    },
    {
      id: 5,
      title: 'Meeting with Gst team',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 28),
      duration: '3h',
      type: 'meeting',
      color: 'bg-cyan-100 text-cyan-800 border-l-4 border-l-cyan-500'
    }
  ]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event =>
      event.date.toDateString() === date.toDateString()
    );
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.duration) {
      const eventDate = new Date(newEvent.date);
      const colors = [
        'bg-blue-100 text-blue-800 border-l-4 border-l-blue-500',
        'bg-orange-100 text-orange-800 border-l-4 border-l-orange-500',
        'bg-purple-100 text-purple-800 border-l-4 border-l-purple-500',
        'bg-green-100 text-green-800 border-l-4 border-l-green-500',
        'bg-cyan-100 text-cyan-800 border-l-4 border-l-cyan-500'
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const event = {
        id: Date.now(),
        title: newEvent.title,
        date: eventDate,
        duration: newEvent.duration,
        type: 'meeting',
        color: randomColor
      };
      setEvents([...events, event]);
      setNewEvent({ title: '', date: '', duration: '' });
      setShowAddModal(false);
    }
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <div className="flex space-x-2">
            {['month', 'week', 'day'].map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${view === viewType
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center font-medium text-gray-600 text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentDay = isToday(date);

            return (
              <div
                key={index}
                className={`min-h-32 border-r border-b border-gray-100 last:border-r-0 p-2 ${!date ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                  } transition-colors relative`}
              >
                {date && (
                  <>
                    {/* Date Number */}
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={`text-sm font-medium ${isCurrentDay
                            ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs'
                            : 'text-gray-900'
                          }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>

                    {/* Events */}
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`${event.color} px-2 py-1 rounded text-xs font-medium cursor-pointer hover:shadow-sm transition-all`}
                        >
                          <div className="truncate font-semibold">{event.title}</div>
                          <div className="text-xs opacity-75 flex items-center mt-0.5">
                            <Clock className="h-3 w-3 mr-1" />
                            {event.duration}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <div className="h-4 w-4 bg-gray-400 rounded mr-2"></div>
                {selectedEvent.date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                Duration: {selectedEvent.duration}
              </div>
              <div className={`inline-block px-3 py-1 rounded text-sm font-medium ${selectedEvent.color}`}>
                {selectedEvent.type}
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <button
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setNewEvent({
                    title: selectedEvent.title,
                    date: selectedEvent.date.toISOString().slice(0, 10),
                    duration: selectedEvent.duration
                  });
                  setShowAddModal(true);
                  setSelectedEvent(null);
                  setEvents(events.filter(ev => ev.id !== selectedEvent.id));
                }}
              >
                Edit Event
              </button>
              <button
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setEvents(events.filter(ev => ev.id !== selectedEvent.id));
                  setSelectedEvent(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add New Event</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={newEvent.duration}
                  onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2h"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernCalendar;