import { useEffect } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const services = [
  {
    id: 1,
    name: "GST",
    status: "Approved",
    date: "18 Apr 2021",
    progress: 70,
    icon: <CheckCircle className="text-green-500 w-5 h-5" />,
    statusColor: "text-green-600",
  },
  {
    id: 2,
    name: "Webdevelopment",
    status: "Disable",
    date: "18 Apr 2021",
    progress: 40,
    icon: <XCircle className="text-red-500 w-5 h-5" />,
    statusColor: "text-red-600",
  },
  {
    id: 3,
    name: "uiux design",
    status: "Error",
    date: "20 May 2021",
    progress: 80,
    icon: <AlertTriangle className="text-yellow-500 w-5 h-5" />,
    statusColor: "text-yellow-600",
  },
  {
    id: 4,
    name: "GST",
    status: "Approved",
    date: "12 Jul 2021",
    progress: 30,
    icon: <CheckCircle className="text-green-500 w-5 h-5" />,
    statusColor: "text-green-600",
  },
];

const ServicesTable = () => {
  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-out" });
  }, []);

  return (
    <motion.div
      className="bg-white shadow-md rounded-2xl p-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      data-aos="fade-up"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-indigo-900">Services</h2>
        <button className="bg-yellow-50 text-yellow-500 px-3 py-1 rounded-full">
          ...
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-sm">
              <th className="pb-3">NAME</th>
              <th className="pb-3">STATUS</th>
              <th className="pb-3">DATE</th>
              <th className="pb-3">PROGRESS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services.map((service) => (
              <motion.tr
                key={service.id}
                className="text-indigo-900 text-sm"
              >
                <td className="py-4 font-medium">{service.name}</td>
                <td className="py-4 flex items-center gap-2">
                  {service.icon}
                  <span className={`font-medium ${service.statusColor}`}>
                    {service.status}
                  </span>
                </td>
                <td className="py-4">{service.date}</td>
                <td className="py-4 w-40">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <motion.div
                      className="bg-yellow-400 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${service.progress}%` }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default ServicesTable;
