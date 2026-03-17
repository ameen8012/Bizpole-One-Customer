import { useState } from "react";

const RegistrationStatusForm = ({ onNext, onBack }) => {
  const questions = [
    "DO YOU HAVE IE CODE ?",
    "DO YOU HAVE FSSAI?",
    "DO YOU HAVE ESI REGISTRATION?",
    "DO YOU HAVE EPF REGISTRATION?",
    "DO YOU FILE TDS RETURNS?",
  ];
  // Keys for the payload object
  const statusKeys = [
    "IECode",
    "FSSAI",
    "ESIRegistration",
    "EPFRegistration",
    "TDSReturns",
  ];
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (idx, value) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  const handleNext = async (e) => {
    e.preventDefault();

    // Check if all questions are answered
    const unanswered = answers.some((answer) => answer === "");
    if (unanswered) {
      setError("Please answer all questions before proceeding.");
      return;
    }

    // Map answers to object with required keys
    const registrationStatusObj = statusKeys.reduce((acc, key, idx) => {
      acc[key] = answers[idx];
      return acc;
    }, {});
    console.log("🚀 Registration status prepared:", registrationStatusObj);
    // Pass registrationStatusObj to next step
    if (onNext) onNext(registrationStatusObj);
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f5f5f5]">
      {/* Left Section */}
      <div className="flex-1 p-4 sm:p-8 md:p-10 lg:p-12 bg-cover bg-center rounded-tl-2xl rounded-bl-2xl">
        <h1 className="text-3xl font-bold text-center mb-12">
          Registration Status (For Compliance Calendar)
        </h1>
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          {questions.map((label, index) => (
            <div key={index}>
              <label className="block mb-2 text-lg font-semibold">{label}</label>
              <select
                className="w-full border-2 border-yellow-400 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={answers[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                disabled={loading}
                required
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="na">NA</option>
              </select>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-8 md:mt-12 max-w-3xl mx-auto gap-6 md:gap-0">
          <button
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center border-2 border-yellow-400 rounded-full text-yellow-500 text-xl hover:bg-yellow-100 transition focus:outline-none focus:ring-2 focus:ring-yellow-500"
            title="Back"
            type="button"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-base">
              <input type="checkbox" className="accent-yellow-500" />
              Remind me later!
            </label>
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3 rounded-full flex items-center gap-2 transition focus:outline-none focus:ring-2 focus:ring-yellow-500"
              onClick={handleNext}
              title="Next"
              disabled={loading}
            >
              {loading ? "Saving..." : "Next »"}
            </button>
          </div>
        </div>

        {error && <div className="text-red-500 text-center mt-4">{error}</div>}
      </div>
    </div>
  );
};

export default RegistrationStatusForm;
