import { useEffect } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { ChevronDown, Calendar } from "lucide-react";

const UpcomingEvents = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  // Get today's date
  const today = new Date().toLocaleDateString("en-US", {

    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const events = [
    {
      id: 1,
      title: "Presentation of the new services",
      time: "Today | 5:00 PM",
      duration: "4h",
      borderColor: "border-l-orange-500",
      indicator: null,
    },
    {
      id: 2,
      title: "Palakkad Meetings",
      time: "Today | 6:00 PM",
      duration: "4h",
      borderColor: "border-l-purple-500",
      indicator: <ChevronDown size={16} className="text-gray-500" />,
    },
    {
      id: 3,
      title: "Meeting with CEO",
      time: "Tomorrow | 2:00 PM",
      duration: "4h",
      borderColor: "border-l-purple-500",
      indicator: null,
    },
  ];

  return (
    <motion.div
      className="bg-white rounded-xl  p-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      data-aos="fade-up"
    >
      {/* Today Date on Top */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-3xl font-semibold text-black mb-3">{today}</p>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center ">
        <h2 className="text-xl font-bold text-gray-700 mb-6">Upcoming Events</h2>
        <button className="text-blue-600 text-sm font-medium">View All</button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            className={`pl-3 ${event.borderColor} border-l-4`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-8">
                  {event.title}
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={14} className="mr-1" />
                  <span>{event.time}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {event.indicator && (
                  <div className="text-gray-400">{event.indicator}</div>
                )}
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
                  {event.duration}
                </span>
              </div>
            </div>

            {/* Divider */}
            {index < events.length - 1 && (
              <hr className="my-4 border-gray-200" />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default UpcomingEvents;
