import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ Added
import { motion } from "framer-motion"; // ✅ Added
import { ArrowLeft, Building2 } from "lucide-react"; // ✅ Added
import { getAllServiceTypes } from "../api/ServiceType";

const ChooseBusinessType = ({ onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const suggested = location.state?.suggested;
  const isDashBoard = location.state?.navigate || false;

  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllServiceTypes()
      .then((data) => {
        setBusinessTypes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load business types");
        setLoading(false);
      });
  }, []);

  return (
    <motion.div
      className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      initial={{ opacity: 0, x: 120 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -120 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="flex flex-col lg:flex-row min-h-[800px]">
        {/* Left Side */}
        <div
          className="lg:w-1/2 bg-gray-50 p-10 flex flex-col justify-center relative bg-cover bg-center bg-no-repeat rounded-2xl"
          style={{ backgroundImage: "url('/Images/hero-bg.webp')" }}
        >
          {/* Logo */}
          <img
            src="/Images/logo.webp"
            alt="Logo"
            className="absolute top-6 left-6 w-28 h-auto"
          />

          <motion.h1
            className="text-4xl font-extrabold mb-4 text-gray-900"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Choose Your Business Type
          </motion.h1>
          <motion.p
            className="text-gray-600 mb-8"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Select the business structure that best suits your needs and goals.
          </motion.p>

          {/* Business Type Buttons */}
          <div className="grid grid-cols-2 gap-10">
            {loading && (
              <div className="col-span-2 text-center text-gray-500">
                Loading business types...
              </div>
            )}
            {error && (
              <div className="col-span-2 text-center text-red-500">{error}</div>
            )}
            {!loading &&
              !error &&
              businessTypes &&
              businessTypes.length > 0 &&
              businessTypes.map((type, index) => {

                const typeName = type.Service_Name || "";
                const normalize = (str) => (str || "").toLowerCase().replace(/[^a-z]/gi, "");

                // Build a set of possible normalized suggestions
                let allSuggested = [];
                if (suggested) {
                  // Split on common delimiters (or, /, (,), ,)
                  let base = suggested.split(/\s*[,/()-]|\s+or\s+/i).map(s => s.trim()).filter(Boolean);
                  // Add original and normalized
                  base.push(suggested);
                  // Add some common replacements
                  base = base.flatMap(s => [
                    s,
                    s.replace(/company|firm/gi, "").trim(),
                    s.replace(/limited/gi, "ltd").trim(),
                    s.replace(/ltd/gi, "limited").trim(),
                    s.replace(/opc/gi, "one person company").trim(),
                    s.replace(/one person company/gi, "opc").trim(),
                  ]);
                  // Remove empty and deduplicate
                  allSuggested = Array.from(new Set(base.filter(Boolean)));
                }

                // Match only if normalized suggestion and type name are exactly equal, or if both are short and one contains the other (for abbreviations)
                const normType = normalize(typeName);
                const isSuggested = allSuggested.length > 0 && allSuggested.some(s => {
                  const normS = normalize(s);
                  if (normType === normS) return true;
                  // Allow for short abbreviations (e.g., 'opc' vs 'onepersoncompany')
                  if (normType.length <= 6 || normS.length <= 6) {
                    return normType.includes(normS) || normS.includes(normType);
                  }
                  return false;
                });

                const handleTypeClick = (type) => {
                  if (isDashBoard) {
                    navigate("/startbusiness/subscriptions", { state: { type: type.Id } });
                  }
                  else {
                    navigate("/startbusiness/about", {
                      state: { selectedType: typeName, type: type.Id }
                    });

                  }

                };

                return (
                  <motion.div
                    key={type.Id || typeName}
                    className={`relative group flex items-center justify-between py-4 px-5 border-2 rounded-xl shadow-sm font-medium transition-all duration-300 cursor-pointer
                      ${isSuggested
                        ? "bg-yellow-400 border-yellow-500 text-yellow-900 scale-105 z-10 ring-2 ring-yellow-500 ring-offset-2 shadow-lg"
                        : "bg-white border-gray-200 text-gray-800 hover:bg-yellow-100 hover:border-yellow-400"
                      }
                    `}
                    whileHover={{ scale: isSuggested ? 1.08 : 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => { handleTypeClick(type) }}
                  >
                    <span
                      className={
                        isSuggested
                          ? "font-bold text-yellow-900 flex items-center gap-2"
                          : ""
                      }
                    >
                      {typeName}
                      {isSuggested && (
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-white text-yellow-500 rounded-full border-2 border-yellow-400 shadow">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                      )}
                    </span>

                    {/* Hover Learn More Button */}
                    <motion.button
                      className={`absolute right-0 top-1 cursor-pointer -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-3 transition-all duration-300 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-1 rounded-full shadow-md ${isSuggested ? "!opacity-100 !translate-x-0" : ""
                        }`}
                    >
                      Learn More
                    </motion.button>
                  </motion.div>
                );
              })}
          </div>

          {/* Help Section */}
          <motion.div
            className="mt-10 flex items-center justify-between bg-gray-900 text-white p-5 rounded-2xl shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div>
              <h3 className="font-semibold text-lg">Confused?</h3>
              <p className="text-sm text-gray-300">
                We’re here to help! Your solution’s just a page away.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-400 text-black font-semibold px-5 py-2 rounded-full shadow-md hover:bg-yellow-500 cursor-pointer"
              onClick={() => navigate("/quiz")}
            >
              Take Quiz
            </motion.button>
          </motion.div>
        </div>

        {/* Right Side */}
        <div className="lg:w-1/2 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 relative flex items-center justify-center overflow-hidden">
          {/* Back Button */}
          <motion.button
            className="absolute left-4 top-4 flex items-center gap-2 bg-white text-gray-800 rounded-full px-4 py-2 shadow-lg hover:bg-gray-100 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={isDashBoard ? () => { navigate(-1) } : onBack}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          {/* Illustration */}
          <motion.div
            className="flex flex-col items-center justify-center text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="w-28 h-28 rounded-3xl bg-white/30 flex items-center justify-center mb-6">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-white font-extrabold text-3xl">
              Build Your Dream
            </h2>
            <p className="text-white/80 mt-2 max-w-xs">
              Every great company starts with the right foundations.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChooseBusinessType;
