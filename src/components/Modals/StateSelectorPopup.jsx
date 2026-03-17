import { useState } from "react";

const StateSelectorPopup = ({ onSave }) => {
  const [stateId, setStateId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (stateId) {
      onSave(stateId);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Select Your State</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={stateId}
            onChange={(e) => setStateId(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">-- Select State --</option>
            <option value="1">Kerala</option>
            <option value="2">Tamil Nadu</option>
            <option value="3">Karnataka</option>
            {/* Add your state list here */}
          </select>

          <button
            type="submit"
            disabled={!stateId}
            className="w-full bg-[#F3C625] text-white font-semibold py-2 rounded-lg hover:bg-[#e0b420] transition"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default StateSelectorPopup;
