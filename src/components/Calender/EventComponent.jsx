// src/components/Calendar/EventComponent.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Video, Phone } from 'lucide-react';
import { MEETING_TYPES } from './constants';
import { format } from 'date-fns';

const EventComponent = ({ event }) => {
  // const eventType = EVENT_TYPES[event.type] || EVENT_TYPES.MEETING;
  const meetingType = MEETING_TYPES[event.meetingType] || MEETING_TYPES.IN_PERSON;

  // Priority-based color
  const getPriorityColor = (priority) => {
    if (priority === "High") return "bg-red-100 text-black border-l-4 border-red-500";
    if (priority === "Medium") return "bg-yellow-100 text-black border-l-4 border-yellow-600";
    if (priority === "Low") return "bg-green-100 text-black border-l-4 border-green-700";
    return "bg-gray-200 text-gray-800 border-l-4 border-gray-400";
  };

  // Function to get the appropriate icon based on type
  // const getEventIcon = () => {
  //   switch (event.type) {
  //     case "MEETING":
  //       return <Users size={14} />;
  //     case "PRESENTATION":
  //       return <FileText size={14} />;
  //     case "TEAM":
  //       return <User size={14} />;
  //     case "PERSONAL":
  //       return <CalendarIcon size={14} />;
  //     default:
  //       return <Users size={14} />;
  //   }
  // };

  // Function to get the appropriate meeting type icon
  const getMeetingTypeIcon = () => {
    switch (event.meetingType) {
      case "IN_PERSON":
        return <MapPin size={14} />;
      case "VIDEO":
        return <Video size={14} />;
      case "PHONE":
        return <Phone size={14} />;
      default:
        return <MapPin size={14} />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`p-2 rounded-lg text-xs ${getPriorityColor(event.priority)} shadow-sm mb-1`}
    >
      <div className="font-medium truncate">{event.title}</div>
      <div className="flex items-center mt-1">
        <Clock size={10} className="mr-1" />
        <span>{format(event.start, "h:mm a")}</span>
      </div>
      <div className="flex items-center mt-1">
        {getMeetingTypeIcon()}
        <span className="ml-1">{meetingType.name}</span>
      </div>
    </motion.div>
  );
};

// Make sure you have this export default
export default EventComponent;