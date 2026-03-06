// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  getServiceFormFullMapping,
  getCompanyServices,
  getServiceDeliverablesByServiceDetailId,
} from "../api/TaskApi";
import {
  getSecureItem,
  setSecureItem,
  removeSecureItem,
} from "../utils/secureStorage";

const currentTasks = [
  {
    id: 1,
    title: "Create a user flow of social application design",
    status: "Approved",
    date: "18 Apr 2021",
    progress: 60,
    completed: true,
  },
  {
    id: 2,
    title: "Create a user flow of social application design",
    status: "In review",
    date: "18 Apr 2021",
    progress: 40,
    completed: true,
  },
  {
    id: 3,
    title: "Landing page design for Fintech project of singapore",
    status: "Not Approved", // <-- changed from 'In review'
    date: "18 Apr 2021",
    progress: 80,
    completed: true,
  },
  {
    id: 4,
    title: "Interactive prototype for app screens of delannine project",
    status: "In review",
    date: "18 Apr 2021",
    progress: 25,
    completed: false,
  },
  {
    id: 5,
    title: "Interactive prototype for app screens of delannine project",
    status: "Approved",
    date: "",
    progress: 90,
    completed: true,
  },
];

// Upcoming tasks should only show "Disable" (not started) and have no click functionality
const upcomingTasks = [
  {
    id: 1,
    title: "Create a user flow of social application design",
    status: "Disable",
    date: "18 Apr 2021",
    progress: 0,
  },
  {
    id: 2,
    title: "Create a user flow of social application design",
    status: "Disable",
    date: "18 Apr 2021",
    progress: 0,
  },
  {
    id: 3,
    title: "Landing page design for Fintech project of singapore",
    status: "Disable",
    date: "18 Apr 2021",
    progress: 0,
  },
  {
    id: 4,
    title: "Interactive prototype for app screens of delannine project",
    status: "Disable",
    date: "",
    progress: 0,
  },
  {
    id: 5,
    title: "Interactive prototype for app screens of delannine project",
    status: "Disable",
    date: "",
    progress: 0,
  },
];

export default function ServiceSelection() {
  // State for company services
  const [companyServices, setCompanyServices] = useState(null);
  const [loadingCompanyServices, setLoadingCompanyServices] = useState(false);
  const [companyServicesError, setCompanyServicesError] = useState(null);

  // Fetch company services when companyId is available

  useEffect(() => {
    const raw = localStorage.getItem("selectedCompany");
    if (raw && raw === "[object Object]") {
      // Remove the invalid value
      removeSecureItem("selectedCompany");
      // Optionally, set a default or prompt user to re-select
      console.warn(
        "selectedCompany was invalid and has been removed. Please re-select the company.",
      );
    }
  }, []);
  // Get selectedCompany from secure storage
  const selectedCompany = getSecureItem("selectedCompany");
  console.log("selectedCompany from secure storage:", selectedCompany);
  const companyId =
    selectedCompany && selectedCompany.CompanyID
      ? selectedCompany.CompanyID
      : null;
  const [selectedService, setSelectedService] = useState(null);
  const [serviceFormMapping, setServiceFormMapping] = useState(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Task");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);
  const [collectDataTask, setCollectDataTask] = useState(null);
  const [noteTask, setNoteTask] = useState(null);
  useEffect(() => {
    if (companyId) {
      setLoadingCompanyServices(true);
      setCompanyServicesError(null);
      getCompanyServices(companyId)
        .then((data) => {
          setCompanyServices(data);
          setLoadingCompanyServices(false);
          // Set first service as default if available
          if (data && data.services && data.services.length > 0) {
            setSelectedService(data.services[0]);
          }
        })
        .catch((err) => {
          setCompanyServicesError("Failed to fetch company services.");
          setLoadingCompanyServices(false);
        });
    } else {
      setCompanyServices(null);
      setSelectedService(null);
    }
  }, [companyId]);
  // Fix selectedCompany in localStorage if it is not valid JSON
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "In review":
        return "bg-yellow-100 text-yellow-700";
      case "Not Approved":
        return "bg-red-100 text-red-700";
      case "Disable":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getProgressBarColor = (progress) => {
    if (progress >= 80) return "bg-green-400";
    if (progress >= 60) return "bg-yellow-400";
    if (progress >= 40) return "bg-orange-400";
    return "bg-red-400";
  };

  const filteredCurrentTasks =
    statusFilter === "All"
      ? currentTasks
      : currentTasks.filter((task) => task.status === statusFilter);
  const filteredUpcomingTasks =
    statusFilter === "All"
      ? upcomingTasks
      : upcomingTasks.filter((task) => task.status === statusFilter);

  // Fetch service form mapping when Documents tab is active and service is selected
  useEffect(() => {
    if (activeTab === "Documents" && selectedService && selectedService.id) {
      setLoadingDocuments(true);
      setDocumentsError(null);
      getServiceFormFullMapping(selectedService.id)
        .then((data) => {
          setServiceFormMapping(data);
          setLoadingDocuments(false);
        })
        .catch((err) => {
          setDocumentsError("Failed to fetch service form mapping.");
          setLoadingDocuments(false);
        });
    } else {
      setServiceFormMapping(null);
    }
  }, [activeTab, selectedService]);

  // Fetch deliverables when selectedService changes and Deliverables tab is active
  const [serviceDeliverables, setServiceDeliverables] = useState(null);
  const [loadingDeliverables, setLoadingDeliverables] = useState(false);
  const [deliverablesError, setDeliverablesError] = useState(null);

  useEffect(() => {
    if (
      activeTab === "Deliverables" &&
      selectedService &&
      selectedService.ServiceDetailID
    ) {
      setLoadingDeliverables(true);
      setDeliverablesError(null);
      getServiceDeliverablesByServiceDetailId(selectedService.ServiceDetailID)
        .then((data) => {
          setServiceDeliverables(data);
          setLoadingDeliverables(false);
        })
        .catch((err) => {
          setDeliverablesError("Failed to fetch deliverables.");
          setLoadingDeliverables(false);
        });
    } else if (activeTab === "Deliverables") {
      setServiceDeliverables(null);
    }
  }, [activeTab, selectedService]);

  // Form for collecting data
  const CollectDataForm = ({ task, onBack }) => {
    const [form, setForm] = useState({
      name: "",
      mobile: "",
      aadhaar: "",
      pan: "",
      address: "",
      fileAadhaar: null,
      filePan: null,
      fileOther: null,
    });

    const handleChange = (e) => {
      const { name, value, files } = e.target;
      if (
        name === "fileAadhaar" ||
        name === "filePan" ||
        name === "fileOther"
      ) {
        setForm({ ...form, [name]: files[0] });
      } else {
        setForm({ ...form, [name]: value });
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      // Handle form submission logic here
      onBack();
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <button
          onClick={onBack}
          className="mb-4 text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Back to Tasks
        </button>
        <h2 className="text-xl font-bold mb-4 text-yellow-600">
          Collect Data for Task
        </h2>
        <div className="mb-4">
          <div className="font-semibold text-gray-700 mb-2">Task Name</div>
          <div className="text-gray-900 mb-2">{task.title}</div>
          <div className="text-sm text-gray-500 mb-2">
            Status:{" "}
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
              {task.status}
            </span>
          </div>
          <div className="text-sm text-gray-500 mb-2">
            Date: {task.date || "N/A"}
          </div>
          <div className="text-sm text-gray-500 mb-2">
            Progress: {task.progress}%
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            placeholder="Enter your name"
            required
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number
          </label>
          <input
            type="tel"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            placeholder="Enter your mobile number"
            required
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aadhaar Number
          </label>
          <input
            type="text"
            name="aadhaar"
            value={form.aadhaar}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            placeholder="Enter Aadhaar number"
            required
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Aadhaar Card
          </label>
          <input
            type="file"
            name="fileAadhaar"
            accept="image/*,application/pdf"
            onChange={handleChange}
            className="mb-4"
          />
          {form.fileAadhaar && (
            <div className="mb-4">
              <span className="block text-xs text-gray-500 mb-1">Preview:</span>
              <img
                src={URL.createObjectURL(form.fileAadhaar)}
                alt="Aadhaar Preview"
                className="h-24 rounded-lg object-cover"
              />
            </div>
          )}
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PAN Number
          </label>
          <input
            type="text"
            name="pan"
            value={form.pan}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            placeholder="Enter PAN number"
            required
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PAN Card
          </label>
          <input
            type="file"
            name="filePan"
            accept="image/*,application/pdf"
            onChange={handleChange}
            className="mb-4"
          />
          {form.filePan && (
            <div className="mb-4">
              <span className="block text-xs text-gray-500 mb-1">Preview:</span>
              <img
                src={URL.createObjectURL(form.filePan)}
                alt="PAN Preview"
                className="h-24 rounded-lg object-cover"
              />
            </div>
          )}
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            placeholder="Enter address"
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Other Document
          </label>
          <input
            type="file"
            name="fileOther"
            accept="image/*,application/pdf"
            onChange={handleChange}
            className="mb-4"
          />
          {form.fileOther && (
            <div className="mb-4">
              <span className="block text-xs text-gray-500 mb-1">Preview:</span>
              <img
                src={URL.createObjectURL(form.fileOther)}
                alt="Other Document Preview"
                className="h-24 rounded-lg object-cover"
              />
            </div>
          )}
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold px-6 py-2 rounded-lg shadow w-full"
          >
            Submit Data
          </button>
        </form>
      </div>
    );
  };

  // Form for adding a note when not approved
  const NoteForm = ({ task, onBack }) => {
    const [showReAddForm, setShowReAddForm] = useState(false);
    const [form, setForm] = useState({
      name: "",
      description: "",
      file: null,
    });

    const handleChange = (e) => {
      const { name, value, files } = e.target;
      if (name === "file") {
        setForm({ ...form, file: files[0] });
      } else {
        setForm({ ...form, [name]: value });
      }
    };

    const handleReAddSubmit = (e) => {
      e.preventDefault();
      // Handle re-adding form logic here
      onBack();
    };

    return (
      <div className="bg-white rounded-lg border border-red-400 p-8 mb-8">
        <button
          onClick={onBack}
          className="mb-4 text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Back to Tasks
        </button>
        <h2 className="text-xl font-bold mb-4 text-red-600">
          Not Approved Task
        </h2>
        <div className="mb-4">
          <div className="font-semibold text-gray-700 mb-2">Task Name</div>
          <div className="text-gray-900 mb-2">{task.title}</div>
          <div className="text-sm text-gray-500 mb-2">
            Status:{" "}
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
              {task.status}
            </span>
          </div>
          <div className="text-sm text-gray-700 mb-2 font-semibold">
            Why not approved?
          </div>
          <div className="bg-gray-100 text-gray-700 rounded-lg p-3 mb-4">
            Required data items are missing. Please re-submit with all required
            information.
          </div>
        </div>
        {/* Show re-add form directly */}
        <form onSubmit={handleReAddSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            placeholder="Enter your name"
            required
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            placeholder="Describe your work"
            rows={3}
            required
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image
          </label>
          <input
            type="file"
            name="file"
            accept="image/*"
            onChange={handleChange}
            className="mb-4"
          />
          {form.file && (
            <div className="mb-4">
              <img
                src={URL.createObjectURL(form.file)}
                alt="Preview"
                className="h-24 rounded-lg object-cover"
              />
            </div>
          )}
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold px-6 py-2 rounded-lg shadow w-full"
          >
            Re-Add Task
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-12 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Task</h1>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-yellow-400 hover:bg-[#F3C625] text-gray-800 font-medium px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {selectedService && selectedService.ItemName
              ? selectedService.ItemName
              : "Choose Service"}
            <span className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs ml-2">
              ⚙
            </span>
          </button>
          {/* Services Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="p-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">
                  Select a Service
                </h3>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {loadingCompanyServices ? (
                  <div className="p-4 text-gray-500">Loading...</div>
                ) : companyServicesError ? (
                  <div className="p-4 text-red-500">{companyServicesError}</div>
                ) : companyServices &&
                  companyServices.services &&
                  companyServices.services.length > 0 ? (
                  companyServices.services.map((service) => (
                    <div
                      key={service.ServiceDetailID}
                      onClick={() => {
                        setSelectedService(service);
                        setIsDropdownOpen(false);
                      }}
                      className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 ${selectedService && selectedService.ServiceDetailID === service.ServiceDetailID ? "bg-yellow-100" : ""}`}
                    >
                      <span className="text-2xl mr-3">🛠️</span>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {service.ItemName ||
                            `Service ID: ${service.ServiceID}`}
                        </h4>
                        <p className="text-xs text-gray-500">
                          ServiceDetailID: {service.ServiceDetailID} | QuoteID:{" "}
                          {service.QuoteID}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-gray-500">No services found.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GST Task Card (no dropdown here) */}
      <div className="bg-white  rounded-2xl border border-yellow-500 shadow-lg p-6  mb-6">
        {selectedService && selectedService.ItemName && (
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {selectedService.ItemName}
          </h2>
        )}
        {/* Show selected service name below GST title if selected */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="border-r border-gray-200 pr-4">
            <p className="text-sm text-gray-600 mb-2">Status</p>
            <div className="flex items-center gap-2">
              <span className="bg-yellow-400 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                In Progress
              </span>
              <span className="text-lg font-semibold text-gray-800">51%</span>
            </div>
          </div>
          <div className="border-r border-gray-200 pr-4">
            <p className="text-sm text-gray-600 mb-2">Total Tasks</p>
            <p className="text-lg font-semibold text-gray-800">
              15 <span className="text-gray-400">/</span> 48
            </p>
          </div>
          <div className="border-r border-gray-200 pr-4">
            <p className="text-sm text-gray-600 mb-2">Start Date</p>
            <p className="text-lg font-semibold text-gray-800">29 Jan, 2025</p>
          </div>
          <div className="border-r border-gray-200 pr-4">
            <p className="text-sm text-gray-600 mb-2">Payment Due</p>
            <p className="text-lg font-semibold text-gray-800">$15,000</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Status Filter in one line */}
      <div className="border-t border-[#F3C625] mt-12 mb-6">
        <div className="flex items-center justify-between mt-6">
          <div className="flex space-x-8">
            {["Task", "Documents", "Deliverables"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCollectDataTask(null);
                  setNoteTask(null);
                }}
                className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab && !collectDataTask && !noteTask
                    ? "border-yellow-400 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
            {collectDataTask && (
              <button
                className="pb-3 px-1 border-b-2 font-medium text-sm border-yellow-400 text-yellow-600"
                disabled
              >
                Collect Data
              </button>
            )}
            {noteTask && (
              <button
                className="pb-3 px-1 border-b-2 font-medium text-sm border-red-400 text-red-600"
                disabled
              >
                Add Note
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option>All</option>
              <option>Approved</option>
              <option>In review</option>
              <option>Disable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {collectDataTask ? (
        <CollectDataForm
          task={collectDataTask}
          onBack={() => setCollectDataTask(null)}
        />
      ) : noteTask ? (
        <NoteForm task={noteTask} onBack={() => setNoteTask(null)} />
      ) : activeTab === "Task" ? (
        <>
          {/* Current Task Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Current Task
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg border border-gray-200">
                <thead>
                  <tr className="text-sm font-medium text-gray-600 bg-gray-100">
                    <th className="py-3 px-4 text-left">Task</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCurrentTasks.map((task) => {
                    let statusColor = getStatusColor(task.status);

                    return (
                      <tr
                        key={task.id}
                        className="hover:bg-yellow-50 transition cursor-pointer"
                        onClick={() => {
                          if (task.status === "In review")
                            setCollectDataTask(task);
                          else if (task.status === "Not Approved")
                            setNoteTask(task);
                        }}
                      >
                        <td className="py-5 px-4 font-medium text-gray-800 flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${task.completed ? "bg-yellow-400" : "border-2 border-gray-300"}`}
                          >
                            {task.completed && (
                              <span className="text-white text-xs">✓</span>
                            )}
                          </span>
                          {task.title}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor}`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{task.date}</td>
                        <td className="py-3 px-4">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getProgressBarColor(task.progress)} transition-all duration-300`}
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {/* Upcoming Task Section */}
        </>
      ) : activeTab === "Documents" ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Documents
          </h3>
          {loadingDocuments && (
            <p className="text-gray-600">Loading documents...</p>
          )}
          {documentsError && <p className="text-red-500">{documentsError}</p>}
          {!loadingDocuments && !documentsError && serviceFormMapping && (
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(serviceFormMapping, null, 2)}
            </pre>
          )}
          {!loadingDocuments && !documentsError && !serviceFormMapping && (
            <p className="text-gray-600">No documents uploaded yet.</p>
          )}
        </div>
      ) : activeTab === "Deliverables" ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Deliverables
          </h3>
          {loadingDeliverables && (
            <p className="text-gray-600">Loading deliverables...</p>
          )}
          {deliverablesError && (
            <p className="text-red-500">{deliverablesError}</p>
          )}
          {!loadingDeliverables &&
            !deliverablesError &&
            serviceDeliverables && (
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                {JSON.stringify(serviceDeliverables, null, 2)}
              </pre>
            )}
          {!loadingDeliverables &&
            !deliverablesError &&
            !serviceDeliverables && (
              <p className="text-gray-600">No deliverables available yet.</p>
            )}
        </div>
      ) : null}

      {/* Fixed Chat Button */}
      <button className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold px-6 py-3 rounded-lg shadow-lg">
        CHAT
      </button>
    </div>
  );
}
