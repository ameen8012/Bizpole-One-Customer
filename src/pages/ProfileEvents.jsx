import { ChevronLeft, ChevronRight, Plus, ArrowDown, FileText, Calendar } from 'lucide-react';

const ProfileEvents = () => {
  const events = [
    {
      id: 1,
      title: "Presentation of the new department",
      date: "Today",
      time: "6:00 PM",
      duration: "4h",
      color: "border-l-yellow-400",
      icon: <ArrowDown className="w-4 h-4 text-green-500" />
    },
    {
      id: 2,
      title: "Project Palakkad Meetings",
      date: "Today",
      time: "5:00 PM",
      duration: "2h",
      color: "border-l-purple-400",
      icon: <FileText className="w-4 h-4 text-yellow-500" />
    },
    {
      id: 3,
      title: "Meeting with Development Team",
      date: "Tomorrow",
      time: "5:00 PM",
      duration: "4h",
      color: "border-l-yellow-400",
      icon: null
    },
    {
      id: 4,
      title: "Camping Meeting",
      date: "Sep 15",
      time: "5:00 PM",
      duration: "3h",
      color: "border-l-purple-400",
      icon: <Calendar className="w-4 h-4 text-purple-500" />
    },
    {
      id: 5,
      title: "Meeting with CEO",
      date: "Sep 14",
      time: "5:00 PM",
      duration: "1h",
      color: "border-l-yellow-400",
      icon: <ArrowDown className="w-4 h-4 text-green-500" />
    },
    {
      id: 6,
      title: "Meeting with CTO",
      date: "Sep 30",
      time: "12:00",
      duration: "1h",
      color: "border-l-yellow-400",
      icon: <ArrowDown className="w-4 h-4 text-green-500" />
    }
  ];

  return (
    <div className="bg-white min-h-screen p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Upcoming Events</h1>
          <button className=" py-3.5 bg-yellow-500 cursor-pointer text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors shadow-md px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
            <Plus className="w-4 h-4" />
            Followups
          </button>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">May 21 – 26, 2045</div>
            </div>
            <button className="text-gray-600 hover:text-gray-900">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-gray-100 px-3 py-1 rounded-md">
            <span className="text-sm font-medium text-gray-700">Today</span>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event.id} className={`bg-white border-l-4 ${event.color} border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 flex-1 pr-2">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2">
                  {event.icon && (
                    <div className="flex-shrink-0">
                      {event.icon}
                    </div>
                  )}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-500 mb-1">{event.duration}</div>
                    {event.id === 4 && (
                      <ArrowDown className="w-4 h-4 text-green-500 ml-auto" />
                    )}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {event.date} | {event.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileEvents;