import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Search,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import ServiceTaskForm from "./ServiceTaskForm";

const ServiceTaskListing = ({ formConfig, serviceDetails, onTaskUpdate }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  console.log("In Service Listing ", serviceDetails);
  const tasks = useMemo(() => {
    if (!formConfig) return [];

    return formConfig.map((item) => ({
      id: item.Id,
      title: item.SubFormMaster?.SubFormName || "Required Form",
      subtitle:
        item.Section || item.Sections?.[0]?.SectionName || "Documentation",
      status: item.Status || "In review",
      date: item.EmployeeAssignment?.CreatedAt
        ? new Date(item.EmployeeAssignment.CreatedAt).toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
            },
          )
        : item.UpdatedAt
          ? new Date(item.UpdatedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "Pending",
      progress: item.Progress || (item.Status === "Approved" ? 100 : 40),
      assignee: {
        name: item.EmployeeAssignment?.EmployeeName || "Aaron More",
        image:
          "https://ui-avatars.com/api/?name=" +
          encodeURIComponent(
            item.EmployeeAssignment?.EmployeeName || "Aaron More",
          ) +
          "&background=4b49ac&color=fff",
      },
      originalData: item,
    }));
  }, [formConfig]);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (statusFilter !== "All") {
      result = result.filter((task) => task.status === statusFilter);
    }

    if (searchTerm) {
      result = result.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return result;
  }, [tasks, statusFilter, searchTerm]);

  const currentTasks = filteredTasks.slice(0, 5);
  const upcomingTasks = filteredTasks.slice(5);

  const getStatusIcon = (status) => {
    if (status === "Approved")
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === "In review")
      return <Clock className="w-4 h-4 text-amber-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusStyles = (status) => {
    if (status === "Approved") return "bg-green-100 text-green-700";
    if (status === "In review") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="space-y-8">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between bg-white rounded-xl p-4 shadow-md">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm bg-gray-50"
        >
          <option value="All">All Tasks</option>
          <option value="Approved">Approved</option>
          <option value="In review">In Review</option>
          <option value="Not Approved">Not Approved</option>
        </select>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search task..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-2 rounded-lg text-sm w-64 bg-gray-50"
          />
        </div>
      </div>

      {/* Current Tasks */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700">Current Tasks</h2>

          <span className="text-sm text-gray-500">
            {currentTasks.length} active
          </span>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Task</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Assignee</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {currentTasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="hover:bg-indigo-50 cursor-pointer transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(task.status)}

                      <div>
                        <p className="font-medium text-gray-700">
                          {task.title}
                        </p>

                        <p className="text-xs text-gray-400">{task.subtitle}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(
                        task.status,
                      )}`}
                    >
                      {task.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {task.date}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={task.assignee.image}
                        alt=""
                        className="w-7 h-7 rounded-full"
                      />

                      <span className="text-sm text-gray-600">
                        {task.assignee.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-400 mb-3">
            Upcoming Tasks ({upcomingTasks.length})
          </h2>

          <div className="bg-gray-50 rounded-xl overflow-hidden opacity-70 shadow-sm">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200">
                {upcomingTasks.map((task) => (
                  <tr key={task.id} className="cursor-not-allowed">
                    <td className="px-6 py-4 text-gray-400">{task.title}</td>

                    <td className="px-6 py-4 text-red-400 text-sm flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Disabled
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Modal */}

      <AnimatePresence>
        {selectedTask && (
          <ServiceTaskForm
            task={selectedTask}
            serviceDetails={serviceDetails}
            onClose={() => setSelectedTask(null)}
            onSuccess={() => {
              setSelectedTask(null);
              if (onTaskUpdate) onTaskUpdate();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceTaskListing;
