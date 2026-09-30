import React, { useState } from "react";

const QUESTIONS = [
  { name: "iecEnabled", label: "DO YOU HAVE IE CODE?" },
  { name: "fssaiEnabled", label: "DO YOU HAVE FSSAI?" },
  { name: "esiEnabled", label: "DO YOU HAVE ESI REGISTRATION?" },
  { name: "pfEnabled", label: "DO YOU HAVE EPF REGISTRATION?" },
  { name: "tdsEnabled", label: "DO YOU FILE TDS RETURNS?" },
];

const RegistrationDetailsForm = ({ onNext, onBack, initialData }) => {
  // Controlled state for this step's fields - all optional, nothing mandatory
  const [form, setForm] = useState({
    iecEnabled: "",
    fssaiEnabled: "",
    esiEnabled: "",
    pfEnabled: "",
    tdsEnabled: "",
    ...initialData,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (onNext) onNext(form);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Header - Mobile/Tablet */}
      <div className="lg:hidden flex justify-between items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Registration Status</h1>
      </div>

      {/* Left Section */}
      <div className="flex-1 p-4 sm:p-8 md:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header - Desktop */}
          <div className="hidden lg:flex justify-between items-center mb-10">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Registration Status (For Compliance Calendar)</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 w-20 bg-yellow-400 rounded-full"></div>
                <span className="text-xs text-gray-500">Step 3 of 4</span>
              </div>
            </div>
          </div>

          {/* Mobile Header Progress */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 bg-yellow-400 rounded-full"></div>
              <span className="text-xs text-gray-500">Step 3 of 4</span>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-8">
            {QUESTIONS.map((q) => (
              <div key={q.name}>
                <label className="block mb-2 text-sm font-bold text-gray-700 tracking-wide">
                  {q.label}
                </label>
                <select
                  name={q.name}
                  value={form[q.name]}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-full px-4 py-3 text-sm focus:outline-none bg-white"
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            ))}
          </div>

          {/* Bottom Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-gray-200">
            <button
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center border-2 border-yellow-400 rounded-full text-yellow-500 hover:bg-yellow-50 transition-all"
              title="Back"
              type="button"
            >
              ←
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 accent-yellow-400" />
                <span className="text-xs text-gray-600">Remind me later!</span>
              </label>

              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-3 rounded-full flex items-center gap-1.5 transition-all shadow-sm hover:shadow text-sm"
                onClick={handleNext}
                title="Next"
                type="button"
              >
                Next »
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Timeline Stepper */}
      <div className="hidden lg:block w-80 bg-white border-l border-gray-200 text-gray-800 p-6">
        <div className="sticky top-6">
          <h2 className="font-bold text-lg mb-1 text-center">Quick Setup</h2>
          <p className="text-gray-500 text-xs mb-8 text-center">Complete these 4 steps</p>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Step 1 - Completed */}
            <div className="relative flex items-center gap-3 mb-8">
              <div className="w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center font-bold text-xs z-10 shadow flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-800">Company Information</h3>
                <p className="text-gray-500 text-xs">Completed</p>
              </div>
            </div>

            {/* Step 2 - Completed */}
            <div className="relative flex items-center gap-3 mb-8">
              <div className="w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center font-bold text-xs z-10 shadow flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-800">Director/Promoter Details</h3>
                <p className="text-gray-500 text-xs">Completed</p>
              </div>
            </div>

            {/* Step 3 - Current */}
            <div className="relative flex items-center gap-3 mb-8">
              <div className="w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center font-bold text-xs z-10 shadow flex-shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-sm text-gray-800">Registration Status</h3>
                <p className="text-gray-500 text-xs">Company & tax registrations</p>
                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full mt-0.5 inline-block">Current</span>
              </div>
            </div>

            {/* Step 4 - Upcoming */}
            <div className="relative flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold text-xs z-10 shadow flex-shrink-0">4</div>
              <div>
                <h3 className="font-semibold text-sm text-gray-400">Compliance</h3>
                <p className="text-gray-400 text-xs">Final verification & documents</p>
              </div>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="mt-10 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between mb-1 text-xs text-gray-700">
              <span>Overall Progress</span>
              <span className="font-bold">75%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-yellow-400 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">One more step to finish.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDetailsForm;
