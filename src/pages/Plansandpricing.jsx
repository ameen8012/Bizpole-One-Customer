import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { getPackagesByServiceType, getAllServiceTypes } from "../api/ServiceType";
import { upsertQuote } from "../api/Quote";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Calendar, Sparkles, ArrowRight } from "lucide-react";
import { setSecureItem, getSecureItem } from "../utils/secureStorage";

const PlansAndPricing = () => {
  const [activeTab, setActiveTab] = useState("packages");
  const navigate = useNavigate();
  // const [selectedServices, setSelectedServices] = useState([]);

  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState(null);

  // 🔹 Load service type from local storage
  useEffect(() => {
    const loc = getSecureItem("location");
    console.log('Loaded location from storage:', loc);
    if (loc && loc.serviceTypeId) {
      setSelectedTypeId(loc.serviceTypeId);
    } else {
      setSelectedTypeId("");
    }
  }, []);

  // 🔹 Handle package quote
  const handlePackageQuote = async (plan) => {
    try {
      // Always send the package's services as ServiceDetails in the payload
      const serviceDetailsArr = Array.isArray(plan.services)
        ? plan.services.map((s) => ({
          ServiceID: s.ServiceID,
          ServiceName: s.ServiceName || s.name,
          Price: s.Price || s.price || 0,
          Description: s.Description || s.description || '',
        }))
        : [];

      const quoteData = {
        packageId: plan.id || plan.packageId || plan.PackageID,
        packageName: plan.name || plan.PackageName || plan.packageName,
        amount: plan.price || plan.YearlyMRP || plan.amount,
        type: "package",
        ServiceDetails: serviceDetailsArr,
        services: serviceDetailsArr, // For upsertQuote.js to map package services
      };

      quoteData.is_manual = 0;
      // Debug: log the payload to verify ServiceDetails
      console.log('Submitting package quote:', quoteData);
      const data = await upsertQuote(quoteData);
      if (data && data.QuoteID) {
        const user = getSecureItem("user");
        if (user) {
          user.QuoteID = data.QuoteID;
          setSecureItem("user", user);
        }
      }

      toast.dismiss();
      toast.success(`Package quote created! QuoteCode: ${data.QuoteCode}`);
    } catch (err) {
      console.error("Error creating package quote:", err);
      toast.dismiss();
      toast.error("Failed to create package quote.");
    }
  };

  // 🔹 Toggle service selection
  // const toggleServiceSelection = (service) => {
  //   setSelectedServices((prev) =>
  //     prev.find((s) => s.ID === service.ID)
  //       ? prev.filter((s) => s.ID !== service.ID)
  //       : [...prev, service]
  //   );
  // };

  // 🔹 Create quote for services
  // const handleServicesQuote = async () => {
  //   if (selectedServices.length === 0) {
  //     toast.info("Please select at least one service");
  //     return;
  //   }

  //   try {
  //     const totalAmount = selectedServices.reduce(
  //       (sum, s) => sum + (s.Price || s.price || 0),
  //       0
  //     );

  //     const quoteData = {
  //       services: selectedServices.map((s) => ({
  //         serviceId: s.ID,
  //         serviceName: s.ServiceName,
  //         price: s.Price || s.price,
  //       })),
  //       amount: totalAmount,
  //       type: "individual",
  //     };

  //     quoteData.is_manual = 0;
  //     const data = await upsertQuote(quoteData);
  //     if (data && data.QuoteID) {
  //       const user = getSecureItem("user");
  //       if (user) {
  //         user.QuoteID = data.QuoteID;
  //         setSecureItem("user", user);
  //       }
  //     }

  //     toast.dismiss();
  //     toast.success(`Services quote created! QuoteCode: ${data.QuoteCode}`);
  //   } catch (err) {
  //     console.error("Error creating services quote:", err);
  //     toast.dismiss();
  //     toast.error("Failed to create services quote.");
  //   }
  // };

  // 🔹 Fetch business types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await getAllServiceTypes();
        setBusinessTypes(Array.isArray(types) ? types : []);
      } catch {
        setBusinessTypes([]);
      }
    };
    fetchTypes();
  }, []);

  // 🔹 Fetch packages and services - FIXED VERSION
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get serviceTypeId from localStorage or use default
        const loc = getSecureItem("location");
        let serviceTypeId = loc?.serviceTypeId || loc?.type || 29;

        console.log('Fetching data for serviceTypeId:', serviceTypeId);

        if (!serviceTypeId) {
          console.warn('No serviceTypeId found');
          setPackages([]);
          setServices([]);
          setLoading(false);
          return;
        }

        const data = await getPackagesByServiceType(serviceTypeId);
        console.log('API Response:', data);

        // Handle different response structures
        let packagesArr = [];

        if (Array.isArray(data)) {
          packagesArr = data;
        } else if (data && Array.isArray(data.data)) {
          packagesArr = data.data;
        } else if (data && data.packages) {
          packagesArr = data.packages;
        } else if (data && data.data && Array.isArray(data.data.packages)) {
          packagesArr = data.data.packages;
        }

        console.log('Processed packages:', packagesArr);
        setPackages(packagesArr);

        // Extract services from packages
        const allServices = packagesArr.reduce((acc, pkg) => {
          if (pkg.services && Array.isArray(pkg.services)) {
            pkg.services.forEach((service) => {
              if (!acc.find((s) => s.ID === service.ID)) acc.push(service);
            });
          }
          return acc;
        }, []);

        setServices(allServices);
        console.log('Extracted services:', allServices);

      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load pricing information");
        setPackages([]);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedTypeId !== null) {
      fetchData();
    }
  }, [selectedTypeId]);

  // 🔹 Calculate total selected services
  // const calculateTotal = () =>
  //   selectedServices.reduce(
  //     (sum, s) => sum + (s.Price || s.price || 0),
  //     0
  //   );

  // 🔹 Switch between tabs (navigate for services)
  const handleTabClick = (tab) => {
    if (tab === "services") {
      navigate("/services");
    } else {
      setActiveTab(tab);
    }
  };

  // 🔹 Render package cards with better error handling
  const renderPackageCard = (plan, index) => {
    // Safely extract values with fallbacks
    const packageId = plan.PackageID || plan.id || plan.packageId || index;
    const packageName = plan.PackageName || plan.name || plan.packageName || "Unnamed Package";
    const price = plan.YearlyFinalAmount || plan.YearlyMRP || plan.price || plan.amount || 0;
    const description = plan.Description || "No description available";
    const planServices = plan.services || [];

    return (
      <motion.div
        key={packageId}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.03, y: -10 }}
        className="relative rounded-2xl p-6 bg-white shadow-lg hover:shadow-2xl border-2 border-gray-100 min-h-[450px] hover:border-[#F3C625]"
      >
        {index === 1 && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-[#F3C625] text-black px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Sparkles size={12} /> POPULAR
            </span>
          </div>
        )}

        <div className="absolute top-4 right-4">
          <span className="bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 flex items-center gap-1">
            <Calendar size={12} /> {plan.BillingPeriod || "Yearly"}
          </span>
        </div>

        <div className="mt-6 mb-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{packageName}</h3>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-4xl font-bold text-gray-900">
              ₹{price}
            </span>
            <span className="text-gray-500">/year</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {description}
          </p>
        </div>

        <div className="border-t border-gray-200 my-4"></div>

        {planServices.length > 0 ? (
          <ul className="space-y-3">
            {planServices.slice(0, 5).map((service, idx) => (
              <li key={service.ID || idx} className="flex items-start gap-2 text-gray-700">
                <div className="bg-[#F3C625] bg-opacity-20 p-1 rounded mt-0.5">
                  <Check size={14} className="text-[#F3C625]" />
                </div>
                <span className="text-sm">{service.ServiceName || service.name || "Unnamed Service"}</span>
              </li>
            ))}
            {planServices.length > 5 && (
              <li className="text-sm text-gray-500 pl-6">
                +{planServices.length - 5} more services
              </li>
            )}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No services included</p>
        )}

        <button
          onClick={() => handlePackageQuote(plan)}
          className="w-full mt-6 bg-[#F3C625] hover:bg-[#d4ab1f] text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          Get Quote <ArrowRight size={18} />
        </button>
      </motion.div>
    );
  };

  return (
    <div className="w-full min-h-[100%] bg-gradient-to-br from-gray-50 to-gray-100">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Choose Your Perfect <span className="text-[#F3C625]">Plan</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto"
          >
            Select from our comprehensive packages or build your own custom
            solution with individual services
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-full p-1 shadow-lg inline-flex">
            <button
              onClick={() => handleTabClick("packages")}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${activeTab === "packages"
                ? "bg-[#F3C625] text-black shadow-md"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Packages
            </button>
            <button
              onClick={() => handleTabClick("services")}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${activeTab === "services"
                ? "bg-[#F3C625] text-black shadow-md"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Individual Services
            </button>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F3C625]"></div>
            <p className="mt-4 text-gray-600">Loading options...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-[#F3C625] text-black px-6 py-2 rounded-lg font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Packages Content */}
        {!loading && !error && (
          <AnimatePresence mode="wait">
            {activeTab === "packages" && (
              <motion.div
                key="packages"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {packages.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    No packages available for your business type.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {packages.map((plan, index) => renderPackageCard(plan, index))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default PlansAndPricing;
