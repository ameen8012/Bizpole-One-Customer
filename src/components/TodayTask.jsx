import { useEffect } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

const tasks = [
  {
    id: 1,
    title: "Create a user flow of social application design",
    date: "May 20, 2020",
  },
  {
    id: 2,
    title: "Landing page design for Fintech project of Singapore",
    date: "May 20, 2020",
  },
  {
    id: 3,
    title: "Interactive prototype for app screens of deltamine project",
    date: "May 20, 2020",
  },
  {
    id: 4,
    title: "Design dashboard for healthcare management",
    date: "May 20, 2020",
  },
];

const TodayTask = () => {

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-out" });
  }, []);

  return (
    <motion.div
      className="bg-white shadow-md rounded-2xl p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      data-aos="fade-up"
    >
      {/* Header */}
      <h2 className="text-lg font-semibold text-indigo-900 mb-4">
        Current Task
      </h2>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            className="bg-indigo-50 rounded-xl p-4 cursor-pointer hover:shadow-md transition"
            whileHover={{ scale: 1.01 }}
          >
            <p className="text-sm text-gray-800">{task.title}</p>
            <p className="text-xs text-gray-500 mt-1">{task.date}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TodayTask;
