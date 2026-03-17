import { useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { upsertRegistrationStatus } from "../../api/CompanyApi";
import { useNavigate } from "react-router-dom";

const ComplianceStatusCheck = ({ onNext, onPrev, registrationStatusObj }) => {
  // Debug: Check registrationStatus prop received from RegistrationStatusForm
  console.log("[ComplianceStatusCheck] registrationStatus prop:s", onNext, onPrev, registrationStatusObj);
  const navigate = useNavigate(); // Initialize navigate function
  // Speech recognition hook
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // Controlled state for all fields
  const [form, setForm] = useState({
    gstReturns: "",
    gstReturnsYear: "",
    rocFiling: "",
    booksOfAccounts: "",
    itReturn: "",
    auditor: "",
    businessText: "",
    expectationText: "",
  });
  const [activeField, setActiveField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMicClick = (field) => {
    setActiveField(field);
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
  };

  const handleStop = () => {
    SpeechRecognition.stopListening();
    if (activeField === "business") {
      setForm((prev) => ({
        ...prev,
        businessText: prev.businessText + (prev.businessText ? " " : "") + transcript
      }));
    } else if (activeField === "expectation") {
      setForm((prev) => ({
        ...prev,
        expectationText: prev.expectationText + (prev.expectationText ? " " : "") + transcript
      }));
    }
    setActiveField(null);
  };

  const handleFinish = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.gstReturns || !form.booksOfAccounts || !form.auditor) {
      setError("Please fill in all required compliance fields.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Prepare compliance data for API
      const complianceData = {
        gstReturns: form.gstReturns,
        gstReturnsYear: form.gstReturnsYear,
        rocFiling: form.rocFiling,
        booksOfAccounts: form.booksOfAccounts,
        itReturn: form.itReturn,
        auditor: form.auditor,
        businessUnderstanding: form.businessText,
        expectations: form.expectationText
      };

      // Flatten registrationStatusObj if it contains nested registrationStatus or CompanyID
      let flatRegistrationStatus = registrationStatusObj || {};
      if (flatRegistrationStatus.registrationStatus) {
        flatRegistrationStatus = flatRegistrationStatus.registrationStatus;
      }
      // Merge flat registration status and compliance data
      const mergedStatus = {
        ...flatRegistrationStatus,
        ...complianceData
      };


      // Get CompanyID from secureStorage/localStorage and ensure it's a number
      let CompanyID = null;
      try {
        CompanyID = window.localStorage.getItem("CompanyId");
      } catch (err) {
        console.log("❌ Error getting CompanyID from localStorage", err);
      }
      if (!CompanyID && typeof window !== "undefined") {
        try {
          CompanyID = window.sessionStorage.getItem("CompanyId");
        } catch (err) {
          console.log("❌ Error getting CompanyID from sessionStorage", err);
        }
      }
      if (CompanyID) {
        CompanyID = Number(CompanyID);
      }

      // Prepare final payload for API (matches backend expectation)
      const payload = {
        CompanyID,
        registrationStatus: mergedStatus
      };

      console.log("📤 Sending registrationStatus payload:", payload);

      // Call the API function
      const response = await upsertRegistrationStatus(payload);
      console.log("✅ Registration & compliance status saved successfully:", response);

      // ✅ Navigate to dashboard after successful submission
      navigate("/", { state: { openSigninModal: true } });
    } catch (err) {
      console.error("❌ Error saving registration status:", err);
      setError(err.response?.data?.message || "Failed to save compliance information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">Your browser does not support Speech Recognition.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f5f5f5]">
      {/* Left Section */}
      <div className="flex-1 p-4 sm:p-8 md:p-10 lg:p-12 bg-cover bg-center rounded-tl-2xl rounded-bl-2xl">
        <h1 className="text-3xl font-bold text-center mb-12">
          Compliance Status Check
        </h1>

        {/* Form Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* Left Column */}
          <div className="space-y-8">
            {/* GST Returns */}
            <div>
              <label className="block mb-2 text-lg font-semibold">
                ARE GST RETURNS UP TO DATE?
              </label>
              <select
                name="gstReturns"
                value={form.gstReturns}
                onChange={handleChange}
                className="w-full border-2 border-yellow-400 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="na">NA</option>
              </select>
              {form.gstReturns === "yes" && (
                <input
                  type="text"
                  name="gstReturnsYear"
                  value={form.gstReturnsYear}
                  onChange={handleChange}
                  placeholder="Financial year of last GST return"
                  className="w-full border-2 border-yellow-400 rounded-full px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              )}
            </div>

            {/* ROC Filing */}
            <div>
              <label className="block mb-2 text-lg font-semibold">
                IS ROC FILING CURRENT?
              </label>
              <input
                type="text"
                name="rocFiling"
                value={form.rocFiling}
                onChange={handleChange}
                placeholder="Financial year of last ROC return"
                className="w-full border-2 border-yellow-400 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Books of Accounts */}
            <div>
              <label className="block mb-2 text-lg font-semibold">
                BOOKS OF ACCOUNTS UP TO DATE?
              </label>
              <select
                name="booksOfAccounts"
                value={form.booksOfAccounts}
                onChange={handleChange}
                className="w-full border-2 border-yellow-400 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="na">NA</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* IT Return */}
            <div>
              <label className="block mb-2 text-lg font-semibold">
                IS IT RETURN UP TO DATE?
              </label>
              <input
                type="text"
                name="itReturn"
                value={form.itReturn}
                onChange={handleChange}
                placeholder="Financial year of last IT return"
                className="w-full border-2 border-yellow-400 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Auditor */}
            <div>
              <label className="block mb-2 text-lg font-semibold">
                DO YOU HAVE AN AUDITOR?
              </label>
              <select
                name="auditor"
                value={form.auditor}
                onChange={handleChange}
                className="w-full border-2 border-yellow-400 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="na">NA</option>
              </select>
            </div>
          </div>
        </div>

        {/* Business Understanding */}
        <div className="max-w-5xl mx-auto mt-8 md:mt-12">
          <h2 className="text-xl font-bold mb-8">Business Understanding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {/* Tell Us More */}
            <div>
              <label className="block mb-2 text-lg font-semibold">
                TELL US MORE ABOUT YOUR BUSINESS
              </label>
              <div className="relative">
                <textarea
                  rows={4}
                  name="businessText"
                  value={form.businessText}
                  onChange={handleChange}
                  placeholder="Audio to Text"
                  className="w-full border-2 border-yellow-400 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                ></textarea>
                <button
                  type="button"
                  onClick={
                    listening && activeField === "business"
                      ? handleStop
                      : () => handleMicClick("business")
                  }
                  className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-black font-bold transition ${listening && activeField === "business"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-yellow-400 hover:bg-yellow-500"
                    }`}
                  title={
                    listening && activeField === "business"
                      ? "Stop Recording"
                      : "Start Recording"
                  }
                >
                  🎤
                </button>
              </div>
              {listening && activeField === "business" && (
                <p className="text-sm text-green-600 mt-2">Listening... {transcript}</p>
              )}
            </div>

            {/* Expectation */}
            <div>
              <label className="block mb-2 text-lg font-semibold">
                WHAT IS YOUR EXPECTATION FROM BIZPOLE?
              </label>
              <div className="relative">
                <textarea
                  rows={4}
                  name="expectationText"
                  value={form.expectationText}
                  onChange={handleChange}
                  placeholder="Audio to Text"
                  className="w-full border-2 border-yellow-400 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                ></textarea>
                <button
                  type="button"
                  onClick={
                    listening && activeField === "expectation"
                      ? handleStop
                      : () => handleMicClick("expectation")
                  }
                  className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-black font-bold transition ${listening && activeField === "expectation"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-yellow-400 hover:bg-yellow-500"
                    }`}
                  title={
                    listening && activeField === "expectation"
                      ? "Stop Recording"
                      : "Start Recording"
                  }
                >
                  🎤
                </button>
              </div>
              {listening && activeField === "expectation" && (
                <p className="text-sm text-green-600 mt-2">Listening... {transcript}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-8 md:mt-12 max-w-5xl mx-auto gap-6 md:gap-0">
          <button
            onClick={onPrev}
            className="w-12 h-12 flex items-center justify-center border-2 border-yellow-400 rounded-full text-yellow-500 text-xl hover:bg-yellow-100 transition focus:outline-none focus:ring-2 focus:ring-yellow-500"
            title="Back"
            disabled={loading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-base">
              <input type="checkbox" className="accent-yellow-500" />
              Remind me later!
            </label>
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3 rounded-full flex items-center gap-2 transition focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleFinish}
              title="Finish"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full"></span>
                  Saving...
                </>
              ) : (
                "Finish & Go to Dashboard"
              )}
            </button>
          </div>
        </div>
        {error && (
          <div className="text-red-500 text-center mt-4 p-3 bg-red-50 rounded-xl max-w-5xl mx-auto">
            {error}
          </div>
        )}
      </div>

      {/* Right Sidebar Timeline Stepper */}
      <div className="w-full lg:w-100 bg-yellow-400 text-black p-4 sm:p-8 rounded-tr-2xl rounded-br-2xl pt-10 lg:pt-60 flex flex-col items-center mt-8 lg:mt-0">
        <h2 className="font-bold text-xl mb-10 text-white">Quick & Easy Setup</h2>
        <ol className="relative border-l-2 border-black/30 ml-4">
          {/* Step 1 */}
          <li className="mb-10 ml-6 flex flex-col">
            <span className="absolute -left-4 flex items-center justify-center w-8 h-8 bg-black text-white rounded-full font-bold text-lg border-4 border-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="font-semibold text-lg mt-1">Company Information</span>
            <span className="text-xs text-black/70 mt-1">Step 1 of 4</span>
          </li>
          {/* Step 2 */}
          <li className="mb-10 ml-6 flex flex-col">
            <span className="absolute -left-4 flex items-center justify-center w-8 h-8 bg-black text-white rounded-full font-bold text-lg border-4 border-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="font-semibold text-lg mt-1">Director/Promoter Details</span>
            <span className="text-xs text-black/70 mt-1">Step 2 of 4</span>
          </li>
          {/* Step 3 */}
          <li className="mb-10 ml-6 flex flex-col">
            <span className="absolute -left-4 flex items-center justify-center w-8 h-8 bg-black text-white rounded-full font-bold text-lg border-4 border-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="font-semibold text-lg mt-1">Registration Status</span>
            <span className="text-xs text-black/70 mt-1">Step 3 of 4</span>
          </li>
          {/* Step 4 */}
          <li className="ml-6 flex flex-col">
            <span className="absolute -left-4 flex items-center justify-center w-8 h-8 bg-black text-yellow-400 rounded-full font-bold text-lg border-4 border-white">
              4
            </span>
            <span className="font-semibold text-lg mt-1">Compliance</span>
            <span className="text-xs text-black/70 mt-1">Step 4 of 4</span>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default ComplianceStatusCheck;