import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPackagesByServiceType } from "../api/ServiceType";
import { upsertQuote } from "../api/Quote";
import { motion } from "framer-motion";
import { Check, Calendar } from "lucide-react";
import { setSecureItem, getSecureItem } from "../utils/secureStorage"; // ✅ Import secure storage
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Subscription = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCount, setSelectedCount] = useState(0);
  // Track selected services count from localStorage
  useEffect(() => {
    const updateCount = () => {
      try {
        const arr = JSON.parse(localStorage.getItem("SelectedServices") || "[]");
        setSelectedCount(Array.isArray(arr) ? arr.length : 0);
      } catch {
        setSelectedCount(0);
      }
    };
    updateCount();
    window.addEventListener("storage", updateCount);
    return () => window.removeEventListener("storage", updateCount);
  }, []);

  // 🔹 Handle quote creation
  const handleQuote = async (plan) => {
    try {
      const data = await upsertQuote(plan);

      // If QuoteID is present, update user securely
      if (data && data.QuoteID) {
        const user = getSecureItem("user"); // ✅ Decrypt and get user
        if (user) {
          user.QuoteID = data.QuoteID;
          setSecureItem("user", user); // ✅ Encrypt and save updated user
        }
      }
      toast.dismiss();
      toast.success(`Quote Successfully created! QuoteCode: ${data.QuoteCode}`);
      setTimeout(() => navigate("/dashboard/bizpoleone"), 1200);
    } catch (err) {
      console.error("Error creating quote:", err);
      toast.dismiss();
      toast.error("Failed to create quote.");
    }
  };

  // 🔹 Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      setError(null);
      try {
        let typeId = 4;

        // 1️⃣ Prefer location.state
        if (location?.state?.type) {
          typeId = location.state.type;
        } else {
          // 2️⃣ Else check secure localStorage
          const loc = getSecureItem("location"); // ✅ Secure get
          console.log(loc, "loc");

          if (loc && loc.type) {
            typeId = loc.type;
          }
        }

        const data = await getPackagesByServiceType(typeId);
        console.log("Fetched packages:", data.data || data);
        setPlans(data || []);
      } catch (err) {
        console.error("Failed to load packages:", err);
        setError("Failed to load packages");
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [location]);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Top Navbar */}
      <div className="w-full flex justify-start items-center p-6">
        <img
          src="/Images/logo.webp"
          alt="Logo"
          className="absolute top-6 left-6 w-38 h-auto"
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="custom-container rounded-4xl p-6 md:p-12">
          {/* Skip Button */}
          <div className="w-full flex justify-end mb-2">
            <button
              className="bg-yellow-500 cursor-pointer hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2 rounded-full transition"
              onClick={() => navigate("/dashboard/bizpoleone")}
            >
              Skip
            </button>
          </div>

          <h2 className="text-center text-3xl md:text-4xl pb-10 font-bold text-[#F3C625]">
            The Right Plan for Your Business
          </h2>
          <p className="text-center text-gray-600 mt-2 max-w-3xl mx-auto pb-6 text-sm md:text-base">
            We have several powerful plans to showcase your business and get
            discovered as a creative entrepreneur. Everything you need.
          </p>

          {/* Package label */}
          <div className="text-center mb-8 flex flex-wrap gap-3 justify-center">
            <button className="inline-block bg-black text-white rounded-full px-4 py-2 font-medium cursor-pointer transition-colors duration-200 hover:bg-gray-900 hover:text-white">
              Package
            </button>
            <button
              className="inline-block bg-white text-black rounded-full px-4 py-2 font-medium border-2 cursor-pointer transition-colors duration-200 hover:bg-[#F3C625] hover:text-black relative"
              style={{ borderColor: "#F3C625" }}
              onClick={() => navigate("/services")}
            >
              Choose individual service
              {selectedCount > 0 && (
                <span className="ml-2 inline-block bg-[#F3C625] text-black text-xs font-bold rounded-full px-3 py-1 align-middle">
                  You chose {selectedCount} service{selectedCount > 1 ? "s" : ""}
                </span>
              )}
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {loading && (
              <div className="col-span-4 text-center text-gray-500">
                Loading packages...
              </div>
            )}
            {error && (
              <div className="col-span-4 text-center text-red-500">{error}</div>
            )}
            {!loading && !error && plans.length === 0 && (
              <div className="col-span-4 text-center text-gray-500">
                No packages found.
              </div>
            )}
            {!loading &&
              !error &&
              plans.map((plan, i) => (
                <motion.div
                  key={plan.id || plan.packageId || i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                  whileHover={{
                    scale: 1.02,
                    y: -15,
                    backgroundColor: "#1f1f1f",
                    color: "#ffffff",
                  }}
                  onHoverStart={() => setHoveredCard(i)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="relative rounded-3xl p-6 flex flex-col justify-between shadow-lg md:min-w-[400px] h-[590px] bg-white text-black transition-all duration-300 group border-2"
                  style={{ borderColor: "#F3C625" }}
                >
                  {/* Top-right tags with icons */}
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <span
                      className="bg-white border-2 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 flex items-center gap-1"
                      style={{ borderColor: "#F3C625" }}
                    >
                      <Calendar size={14} className="text-gray-400" /> Yearly
                    </span>
                  </div>

                  {/* Plan header */}
                  <div>
                    <h3 className="text-xl md:text-2xl mb-2 mt-10 transition-colors">
                      {plan.name || plan.PackageName || plan.packageName}
                    </h3>
                    <span className="md:text-4xl font-semibold">
                      ₹{plan.price || plan.YearlyMRP || plan.amount}
                    </span>
                    <p className="text-lg text-gray-600 mt-2 mb-1 group-hover:text-gray-300 transition-colors">
                      {plan.description || plan.Description}
                    </p>
                    <p className="text-lg font-medium mt-4 text-gray-800 group-hover:text-gray-200 transition-colors">
                      {plan.audience || plan.Audience}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="my-4 border-t border-gray-300 group-hover:border-gray-600 transition-colors"></div>

                  {/* Features */}
                  {plan.services &&
                    Array.isArray(plan.services) &&
                    plan.services.length > 0 && (
                      <ul className="space-y-3 flex-1">
                        {plan.services.map((service, idx) => (
                          <li
                            key={service.ID || idx}
                            className="flex items-center gap-2 transition-colors text-gray-700 group-hover:text-white"
                          >
                            <span className="bg-gray-200 p-1 flex items-center justify-center group-hover:bg-[#3b393275]">
                              <Check
                                size={18}
                                className="transition-colors text-gray-500"
                                style={
                                  hoveredCard === i ? { color: "#F3C625" } : {}
                                }
                              />
                            </span>
                            <span className="text-lg font-medium">
                              {service.ServiceName}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                  {/* Button */}
                  <div className="mt-6">
                    <button
                      className={`w-full rounded-3xl py-3 font-semibold transition-colors cursor-pointer`}
                      style={{
                        backgroundColor: "#F3C625",
                        color: "black",
                      }}
                      onClick={() => handleQuote(plan)}
                    >
                      {plan.button || "Get Quote"}
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
