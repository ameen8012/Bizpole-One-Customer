import { useEffect, useState } from "react";
import { createCustomer } from "../api/CustomerApi";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, User, Home } from "lucide-react";
import { setSecureItem, getSecureItem } from "../utils/secureStorage";

// Editable fields
const editableFields = [
  { name: "FirstName", icon: <User size={18} /> },
  { name: "LastName", icon: <User size={18} /> },
  { name: "AddressLine1", icon: <Home size={18} /> },
];

const viewOnlyFields = [];

const ProfilePage = () => {
  const [user, setUser] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const storedUser = getSecureItem("user");
    console.log(storedUser, "amlstored");

    if (storedUser) {
      setUser(storedUser);
      setForm(storedUser);
    }

  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setEditMode(true);
    setMessage({ type: "", text: "" });
  };

  const handleCancel = () => {
    setForm(user);
    setEditMode(false);
    setMessage({ type: "", text: "" });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const payload = { ...form };

      if (user.CustomerID) {
        payload.CustomerID = user.CustomerID;
      }

      const res = await createCustomer(payload);
      console.log(res, "Customer update response");

      setUser(payload);
      setEditMode(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });

      // Store as JSON string to avoid parsing error
      setSecureItem("user", payload);

      console.log("User updated in secure storage:", payload);

    } catch (err) {
      console.error(err, "aml error");
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };


  return (
    <motion.div
      className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-10 mt-12 border border-gray-100"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Profile Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {editableFields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label className="flex items-center gap-2 text-gray-600 font-medium mb-1">
              {field.icon}
              {field.name
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </label>
            {editMode ? (
              <input
                type="text"
                name={field.name}
                value={form[field.name] || ""}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
              />
            ) : (
              <div className="text-gray-800 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                {user[field.name] || (
                  <span className="text-gray-400">Not set</span>
                )}
              </div>
            )}
          </div>
        ))}

        {viewOnlyFields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label className="flex items-center gap-2 text-gray-600 font-medium mb-1">
              {field.icon}
              {field.name
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </label>
            <div className="text-gray-800 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              {user[field.name] || (
                <span className="text-gray-400">Not set</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-8">
        {editMode ? (
          <>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg transition shadow-sm"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg transition shadow-sm"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleEdit}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3 rounded-lg transition shadow-md"
          >
            Edit Profile
          </button>
        )}
      </div>

      {message.text && (
        <motion.div
          className={`mt-6 flex items-center gap-2 justify-center text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <XCircle size={18} />
          )}
          {message.text}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProfilePage;
