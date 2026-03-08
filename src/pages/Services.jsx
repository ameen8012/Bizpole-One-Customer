import React, { useEffect, useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { upsertQuote } from "../api/Quote";
import { getSecureItem } from "../utils/secureStorage";
import ServicesApi from "../api/ServicesApi";
import axios from "../api/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import SigninModal from "../components/Modals/SigninModal";

// Icons
const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IconFilter = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
  </svg>
);
const IconChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
const IconChevronUp = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);
const IconArrowRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
const IconStar = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const IconLocation = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconGrid = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

// Category icon map
const getCategoryIcon = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("incorporat")) return "🏢";
  if (lower.includes("tax")) return "📋";
  if (lower.includes("legal")) return "⚖️";
  if (lower.includes("compliance")) return "✅";
  if (lower.includes("finance")) return "💰";
  if (lower.includes("trade")) return "🌐";
  return "📁";
};

import { getAllStates } from "../api/States";

const ServiceCard = ({ service, onLearnMore, isSelected, onSelect, price, onSelectState, stateId, bulkLoading }) => {
  const features = service.Features || [];
  const categoryName = service.Category?.CategoryName || service.CategoryName;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden flex flex-col ${
        isSelected
          ? "border-[#F3C625] shadow-[0_0_0_3px_rgba(243,198,37,0.15)]"
          : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
      }`}
    >
      {/* Popular Badge */}
      {service.IsPopular && (
        <div className="bg-[#F3C625] text-white text-xs font-bold px-3 py-1 flex items-center gap-1 justify-end">
          <IconStar /> POPULAR
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl flex-shrink-0">
            {service.Icon || "⚡"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-gray-900 text-base leading-tight">{service.ServiceName}</h3>
              {isSelected && (
                <div className="w-5 h-5 bg-[#F3C625] rounded-full flex items-center justify-center flex-shrink-0">
                  <IconCheck />
                </div>
              )}
            </div>
            {categoryName && (
              <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                {categoryName}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {service.Description || "Professional service tailored to meet your specific requirements."}
        </p>

        {/* Features */}
        {features.length > 0 && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-4">
            {features.slice(0, 4).map((feat, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F3C625] flex-shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        )}

        {/* Know More */}
        <button
          onClick={() => onLearnMore(service.ServiceID)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#F3C625] transition-colors mb-4 group border border-gray-200 hover:border-[#F3C625] rounded-lg px-3 py-1 self-start"
        >
          <svg className="w-4 h-4 text-gray-400 group-hover:text-[#F3C625]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
          </svg>
          Know More
          <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
        </button>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
          {!stateId ? (
            <button
              className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 hover:text-[#F3C625] hover:border-[#F3C625] transition-colors flex-1 rounded-lg px-3 py-1"
              onClick={onSelectState}
            >
              <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center">
                <IconLocation />
              </div>
              <span className="font-medium">Select Your State</span>
              <span className="text-gray-400 text-[10px]">To view pricing</span>
            </button>
          ) : price ? (
            <div className="flex-1 flex flex-col  justify-left text-xs">
              <div className="flex  justify-left text-2xl font-bold text-green-700 mb-2">
                <span className="mr-1">₹</span>
                {price.TotalFee}
              </div>
              <span className="text-xs text-gray-400 mb-1">Total Fee (All Inclusive)</span>
              <button
                className="mt-1 text-xs text-black-500 underline text-left"
                onClick={onSelectState}
              >Change State</button>
            </div>
          ) : (
            <button
              className="flex-1 flex items-center justify-center text-xs font-semibold rounded-lg px-3 py-2 border border-yellow-400 text-black hover:bg-yellow-500 transition-colors"
              style={{ minHeight: 36 }}
              type="button"
              // You can add an onClick handler here if you want to open a contact/enquiry modal
            >
              Enquire Now
            </button>
          )}

          <motion.button
            onClick={() => onSelect(service.ServiceID)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={` bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-2 rounded-xl shadow-md hover:shadow-xl ${
              isSelected
                ? "bg-[#F3C625] text-black"
                : "bg-[#F3C625] text-white hover:bg-[#e0b420]"
            }`}
          >
            {isSelected ? (
              <>
               
                Selected
              </>
            ) : (
              "Select"
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { cart, addToCart, removeFromCart } = useContext(CartContext);
  // selectedServices is now derived from cart keys
  const selectedServices = Object.keys(cart).map(id => Number(id));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stateId, setStateId] = useState(() => localStorage.getItem("StateID"));
  const [bulkPrices, setBulkPrices] = useState({});
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [allStates, setAllStates] = useState([]);
  const [showSigninModal, setShowSigninModal] = useState(false);
  const [selectedStateForModal, setSelectedStateForModal] = useState("");
  const [statesLoading, setStatesLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch categories
  useEffect(() => {
    setCategoriesLoading(true);
    ServicesApi.getServiceCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Fetch services
  useEffect(() => {
    setLoading(true);
    const updateAllServicesCache = (data) => {
      try {
        const prev = JSON.parse(localStorage.getItem("AllServicesCache") || "[]");
        // Merge new data with previous, avoiding duplicates
        const merged = [...prev];
        data.forEach(svc => {
          if (!merged.some(s => s.ServiceID === svc.ServiceID)) merged.push(svc);
        });
        localStorage.setItem("AllServicesCache", JSON.stringify(merged));
      } catch {}
    };
    if (selectedCategory) {
      ServicesApi.getServicesByCategory(selectedCategory, { page, limit })
        .then((res) => {
          setServices(res.data || []);
          updateAllServicesCache(res.data || []);
          const total = res.total || 0;
          setTotalCount(total);
          setTotalPages(Math.max(1, Math.ceil(total / limit)));
        })
        .catch(() => { setServices([]); setTotalPages(1); })
        .finally(() => setLoading(false));
    } else {
      ServicesApi.getServices({ page, limit, filter })
        .then((res) => {
          setServices(res.data || []);
          updateAllServicesCache(res.data || []);
          setTotalPages(res.pagination?.totalPages || 1);
          setTotalCount(res.pagination?.total || res.data?.length || 0);
        })
        .catch(() => setServices([]))
        .finally(() => setLoading(false));
    }
  }, [page, limit, filter, selectedCategory]);



  // Modal is not shown automatically. Only open when user clicks select/change state.

  // Handle state selection in modal
  const handleStateModalSubmit = (e) => {
    e.preventDefault();
    if (selectedStateForModal) {
      localStorage.setItem("StateID", selectedStateForModal);
      setStateId(selectedStateForModal);
      setShowStateModal(false);
    }
  };

  // Open modal and fetch states if needed
  const openStateModal = () => {
    setShowStateModal(true);
    setSelectedStateForModal("");
    if (allStates.length === 0) {
      setStatesLoading(true);
      getAllStates()
        .then((states) => setAllStates(states || []))
        .catch(() => setAllStates([]))
        .finally(() => setStatesLoading(false));
    }
  };

  // Fetch bulk prices when services or stateId changes
  useEffect(() => {
    if (stateId && services.length > 0) {
      const serviceIds = services.map(s => s.ServiceID);
      setBulkLoading(true);
      axios.post("service-price-currency/bulk", {
        StateID: Number(stateId),
        ServiceIDs: serviceIds,
        isIndividual: 1
      })
        .then(res => {
          const priceMap = {};
          if (res.data && res.data.data) {
            res.data.data.forEach(item => {
              priceMap[item.ServiceID] = item;
            });
          }
          setBulkPrices(priceMap);
        })
        .catch(() => setBulkPrices({}))
        .finally(() => setBulkLoading(false));
    }
  }, [stateId, services]);

  const handleLearnMore = (serviceId) => {
    navigate(`/services/${serviceId}`, { state: { serviceId } });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? "" : categoryId);
    setPage(1);
  };

  const handleSelectService = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      removeFromCart(serviceId);
    } else {
      // Find the service and its price to add to cart
      const svc = services.find(s => s.ServiceID === serviceId);
      const price = bulkPrices[serviceId] || {};
      addToCart(serviceId, { ...price, ServiceName: svc?.ServiceName || svc?.Name });
    }
  };

  // No need to sync SelectedServices in localStorage; handled by CartContext

  // Helper to get price for a service
  const getBulkPrice = (serviceId) => {
    return bulkPrices[serviceId];
  };


  // Helper to change stateId (reuse modal)
  const handleChangeState = () => {
    setShowStateModal(true);
    setSelectedStateForModal("");
    if (allStates.length === 0) {
      setStatesLoading(true);
      getAllStates()
        .then((states) => setAllStates(states || []))
        .catch(() => setAllStates([]))
        .finally(() => setStatesLoading(false));
    }
  };

  // Store latest known prices for selected services in localStorage
  useEffect(() => {
    if (Object.keys(bulkPrices).length > 0) {
      try {
        const prev = JSON.parse(localStorage.getItem("SelectedServicePrices") || "{}") || {};
        const updated = { ...prev };
        Object.entries(bulkPrices).forEach(([sid, priceObj]) => {
          if (priceObj && priceObj.TotalFee) {
            updated[sid] = priceObj.TotalFee;
          }
        });
        localStorage.setItem("SelectedServicePrices", JSON.stringify(updated));
      } catch {}
    }
  }, [bulkPrices]);

  return (
    <>
      <SigninModal isOpen={showSigninModal} onClose={() => setShowSigninModal(false)} />
      <div className="min-h-screen mt-20 bg-gray-50">
      {/* State selection modal */}
      {showStateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Select Your State
              </h2>
              <p className="text-gray-600 text-xs">Please select your state to get accurate pricing</p>
            </div>
            <form onSubmit={handleStateModalSubmit}>
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-700 mb-3">
                  Select your state *
                </label>
                <select
                  value={selectedStateForModal}
                  onChange={e => setSelectedStateForModal(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-xl border-2 text-sm border-gray-200 focus:ring-2 focus:ring-[#F3C625] focus:border-[#F3C625]"
                  disabled={statesLoading}
                >
                  <option value="">Choose your state</option>
                  {allStates.map((state) => (
                    <option key={state.id || state.StateID} value={state.id || state.StateID}>
                      {state.state_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowStateModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:border-gray-400"
                  disabled={!!stateId}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedStateForModal}
                  className="flex-1 px-6 py-3 bg-[#F3C625] text-white text-sm font-semibold rounded-xl hover:bg-[#e0b420] disabled:opacity-50"
                >
                  Get Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Page Header */}
      <div className=" border-b border-gray-100">
        <div className="max-w-7xl mt-26 mb-18 mx-auto px-6 py-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-[#c9a700] text-xs font-semibold rounded-full mb-4 border border-amber-100">
            <IconStar /> Explore Our Services
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-black text-gray-900 mb-3">
            Choose Your Perfect Service
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto text-sm">
            Professional business services tailored to help your company thrive in today's competitive market
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        {/* Sidebar */}
        <motion.aside
          animate={{ width: sidebarOpen ? 240 : 0, opacity: sidebarOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 overflow-hidden"
        >
          <div className="w-60 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky ">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                <IconFilter />
                Filters
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs">
                <IconChevronUp />
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">Search Services</p>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={filter}
                  onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#F3C625] focus:ring-1 focus:ring-[#F3C625] outline-none transition-all"
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <IconSearch />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Categories</p>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryChange("")}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    !selectedCategory
                      ? "bg-[#F3C625] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <IconGrid />
                  All
                </button>
                {categoriesLoading ? (
                  <div className="text-xs text-gray-400 px-3 py-2">Loading…</div>
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat.CategoryID}
                      onClick={() => handleCategoryChange(cat.CategoryID.toString())}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedCategory === cat.CategoryID.toString()
                          ? "bg-[#F3C625] text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{getCategoryIcon(cat.CategoryName)}</span>
                      {cat.CategoryName}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Selected Services Summary */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="font-bold text-gray-800">{selectedServices.length}</span> service{selectedServices.length !== 1 ? "s" : ""} selected
              </p>
              {selectedServices.length > 0 && (
                <>
                  <div className="mt-2 mb-2 max-h-40 overflow-y-auto">
                    {selectedServices.map(sid => {
                      // Try to find the service in current page, else fallback to localStorage cache
                      let svc = services.find(s => s.ServiceID === sid);
                      if (!svc) {
                        try {
                          const allSvcs = JSON.parse(localStorage.getItem("AllServicesCache") || "[]");
                          svc = allSvcs.find(s => s.ServiceID === sid);
                        } catch {}
                      }
                      // Get price from bulkPrices or fallback to localStorage
                      let price = bulkPrices[sid]?.TotalFee;
                      if (!price) {
                        try {
                          const priceCache = JSON.parse(localStorage.getItem("SelectedServicePrices") || "{}");
                          price = priceCache[sid];
                        } catch {}
                      }
                      return (
                        <div key={sid} className="flex justify-between items-center text-xs py-1 border-b border-gray-100 last:border-b-0">
                          <span className="truncate max-w-[110px]" title={svc?.ServiceName}>{svc?.ServiceName || 'Service'}</span>
                          <span className="font-semibold text-green-700">
                            {price && typeof price === 'object' ? `₹${price.TotalFee}` : price ? `₹${price}` : '--'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Total Price Calculation */}
                  <div className="flex justify-between items-center text-sm font-bold py-2 border-t border-gray-200 mb-2">
                    <span>Total</span>
                    <span className="text-green-700">
                      ₹{
                        selectedServices.reduce((sum, sid) => {
                          let price = bulkPrices[sid];
                          let value = 0;
                          if (price && typeof price === 'object' && price.TotalFee) {
                            value = parseFloat(price.TotalFee) || 0;
                          } else if (typeof price === 'number' || typeof price === 'string') {
                            value = parseFloat(price) || 0;
                          } else {
                            try {
                              const priceCache = JSON.parse(localStorage.getItem("SelectedServicePrices") || "{}");
                              value = parseFloat(priceCache[sid]) || 0;
                            } catch {}
                          }
                          return sum + value;
                        }, 0).toLocaleString('en-IN')
                      }
                    </span>
                  </div>
                 <button
    style={{marginTop: 8}}
    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-2 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
    onClick={async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setShowSigninModal(true);
        return;
      }
      try {
        const user = getSecureItem("user");
        const selectedCompany = getSecureItem("selectedCompany");
        const franchiseeId = user?.FranchiseeId || user?.FranchiseeID || 1;
        const employeeId = user?.EmployeeID || 9;
        const employeeName = user?.FirstName || "admin";
        const customerId = user?.CustomerID || 2;
        const customerName = user?.FirstName ? `${user.FirstName} ${user.LastName || ''}`.trim() : "John Doe";
        const stateName = selectedCompany?.State || "";
        const companyName = selectedCompany?.CompanyName || "";
        const companyId = selectedCompany?.CompanyID || null;
        
        // Get selected services and prices from localStorage
        let selectedServiceIds = [];
        let selectedServicePrices = {};
        try {
          selectedServiceIds = JSON.parse(localStorage.getItem("SelectedServices") || "[]");
        } catch {}
        try {
          selectedServicePrices = JSON.parse(localStorage.getItem("SelectedServicePrices") || "{}");
        } catch {}
        
        // Build ServiceDetails from localStorage
        const serviceDetails = selectedServiceIds.map(sid => {
          let svc = services.find(s => s.ServiceID === sid);
          if (!svc) {
            try {
              const allCache = JSON.parse(localStorage.getItem("AllServicesCache") || "[]");
              svc = allCache.find(s => s.ServiceID === sid);
            } catch {}
          }
          let price = selectedServicePrices[sid];
          if (!price || typeof price !== 'object') {
            price = bulkPrices[sid] || {};
          }
          return {
            ServiceID: svc?.ServiceID,
            ItemName: svc?.ServiceName,
            ProfessionalFee: price.ProfessionalFee ?? 100,
            VendorFee: price.VendorFee ?? 100,
            GovtFee: price.GovtFee ?? 100,
            ContractorFee: price.ContractorFee ?? 100,
            GSTPercent: price.GSTPercent ?? 0,
            GstAmount: price.GstAmount ?? 18,
            CGST: price.CGST ?? 9,
            SGST: price.SGST ?? 9,
            IGST: price.IGST ?? 0,
            Discount: price.Discount ?? 0,
            Rounding: price.Rounding ?? 0,
            Total: price.TotalFee ?? (typeof price === 'number' ? price : 418),
            AdvanceAmount: price.AdvanceAmount ?? 126,
            IsManual: 0,
            IsIndividual: 1
          };
        });

        const payload = {
          IsIndividual: 1,
          IsMonthly: 0,
          FranchiseeID: franchiseeId,
          SelectedCompany: {
            CompanyID: companyId,
            CompanyName: companyName,
            State: stateName
          },
          SelectedCustomer: {
            CustomerID: customerId,
            CustomerName: customerName
          },
          QuoteCRE: {
            EmployeeID: employeeId,
            EmployeeName: employeeName
          },
          SourceOfSale: "Website",
          StateService: stateName,
          Remarks: "",
          QuoteStatus: "Draft",
          IsDirect: 1,
          ServiceDetails: serviceDetails,
          SelectedServices: selectedServiceIds,
          SelectedServicePrices: selectedServicePrices,
          MailQuoteCustomers: [
            {
              CustomerID: customerId,
              CustomerName: customerName,
              Email: user?.Email || ""
            }
          ],
          PaymentType: 1,
          EmployeeID: employeeId
        };

        const res = await upsertQuote(payload);
        navigate("/dashboard/bizpoleone");
      } catch (err) {
        alert("Failed to create quote. Please try again.");
      }
    }}
>
  Request Quote
</button>
 {/* <button
                    style={{marginTop: 8}}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-2 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      if (!token) {
                        setShowSigninModal(true);
                        return;
                      }
                      try {
                        const user = getSecureItem("user");
                        const selectedCompany = getSecureItem("selectedCompany");
                        const franchiseeId = user?.FranchiseeId || user?.FranchiseeID || 1;
                        const employeeId = user?.EmployeeID || 9;
                        const employeeName = user?.FirstName || "admin";
                        const customerId = user?.CustomerID || 2;
                        const customerName = user?.FirstName ? `${user.FirstName} ${user.LastName || ''}`.trim() : "John Doe";
                        const stateName = selectedCompany?.State || "";
                        const companyName = selectedCompany?.CompanyName || "";
                        const companyId = selectedCompany?.CompanyID || null;
                        // Get selected services and prices from localStorage
                        let selectedServiceIds = [];
                        let selectedServicePrices = {};
                        try {
                          selectedServiceIds = JSON.parse(localStorage.getItem("SelectedServices") || "[]");
                        } catch {}
                        try {
                          selectedServicePrices = JSON.parse(localStorage.getItem("SelectedServicePrices") || "{}");
                        } catch {}
                        // Build ServiceDetails from localStorage, always send IsIndividual: 1
                        const serviceDetails = selectedServiceIds.map(sid => {
                          // Try to get service info from current page, else fallback to cache
                          let svc = services.find(s => s.ServiceID === sid);
                          if (!svc) {
                            try {
                              const allCache = JSON.parse(localStorage.getItem("AllServicesCache") || "[]");
                              svc = allCache.find(s => s.ServiceID === sid);
                            } catch {}
                          }
                          // Try to get price from SelectedServicePrices, fallback to bulkPrices, fallback to 0
                          let price = selectedServicePrices[sid];
                          if (!price || typeof price !== 'object') {
                            price = bulkPrices[sid] || {};
                          }
                          return {
                            ServiceID: svc?.ServiceID,
                            ItemName: svc?.ServiceName,
                            ProfessionalFee: price.ProfessionalFee ?? 100,
                            VendorFee: price.VendorFee ?? 100,
                            GovtFee: price.GovtFee ?? 100,
                            ContractorFee: price.ContractorFee ?? 100,
                            GSTPercent: price.GSTPercent ?? 0,
                            GstAmount: price.GstAmount ?? 18,
                            CGST: price.CGST ?? 9,
                            SGST: price.SGST ?? 9,
                            IGST: price.IGST ?? 0,
                            Discount: price.Discount ?? 0,
                            Rounding: price.Rounding ?? 0,
                            Total: price.TotalFee ?? (typeof price === 'number' ? price : 418),
                            AdvanceAmount: price.AdvanceAmount ?? 126,
                            IsManual: 0,
                            IsIndividual: 1
                          };
                        });
                        const payload = {
                          IsIndividual: 1,
                          IsMonthly: 0,
                          FranchiseeID: franchiseeId,
                          SelectedCompany: {
                            CompanyID: companyId,
                            CompanyName: companyName,
                            State: stateName
                          },
                          SelectedCustomer: {
                            CustomerID: customerId,
                            CustomerName: customerName
                          },
                          QuoteCRE: {
                            EmployeeID: employeeId,
                            EmployeeName: employeeName
                          },
                          SourceOfSale: "Website",
                          StateService: stateName,
                          Remarks: "",
                          QuoteStatus: "Draft",
                          IsDirect: 1,
                          ServiceDetails: serviceDetails,
                          SelectedServices: selectedServiceIds,
                          SelectedServicePrices: selectedServicePrices,
                          MailQuoteCustomers: [
                            {
                              CustomerID: customerId,
                              CustomerName: customerName,
                              Email: user?.Email || ""
                            }
                          ],
                          PaymentType: 1,
                          EmployeeID: employeeId
                        };
                        const res = await upsertQuote(payload);
                        navigate("/dashboard/bizpoleone");
                      } catch (err) {
                        alert("Failed to create quote. Please try again.");
                      }
                    }}
                  >
                    Checkout
                  </button> */}
                  <button
                    onClick={() => setSelectedServices([])}
                    className="text-xs text-red-400 hover:text-red-600 mt-1 transition-colors w-full text-center"
                  >
                    Clear selection
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-[#F3C625] hover:text-[#F3C625] transition-all"
                >
                  <IconFilter /> Filters
                </button>
              )}
              <div>
                <p className="font-bold text-gray-900 text-sm">
                  {loading ? "Loading..." : `${totalCount} Services Available`}
                </p>
                <p className="text-xs text-gray-400">
                  {selectedCategory
                    ? `In: ${categories.find(c => c.CategoryID.toString() === selectedCategory)?.CategoryName || "category"}`
                    : "across all categories"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(filter || selectedCategory) && (
                <button
                  onClick={() => { setFilter(""); setSelectedCategory(""); setPage(1); }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Clear filters
                </button>
              )}
              <div className="text-xs text-amber-500 font-semibold flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                <IconStar /> Popular picks
              </div>
            </div>
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-4/5 mb-4" />
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[1,2,3,4].map(j => <div key={j} className="h-3 bg-gray-100 rounded" />)}
                    </div>
                    <div className="h-10 bg-gray-100 rounded-xl" />
                  </div>
                ))}
              </motion.div>
            ) : services.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 bg-white rounded-2xl border border-gray-100"
              >
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No services found</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {filter || selectedCategory ? "Try adjusting your filters" : "No services available"}
                </p>
                {(filter || selectedCategory) && (
                  <button
                    onClick={() => { setFilter(""); setSelectedCategory(""); setPage(1); }}
                    className="px-5 py-2 bg-[#F3C625] text-white rounded-xl font-semibold text-sm hover:bg-[#e0b420] transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div key="grid" layout>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <ServiceCard
                      key={service.ServiceID}
                      service={service}
                      onLearnMore={handleLearnMore}
                      isSelected={selectedServices.includes(service.ServiceID)}
                      onSelect={handleSelectService}
                      price={getBulkPrice(service.ServiceID)}
                      onSelectState={openStateModal}
                      stateId={stateId}
                      bulkLoading={bulkLoading}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 disabled:opacity-40 hover:border-[#F3C625] hover:text-[#F3C625] transition-all"
                    >
                      ← Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                              page === pageNum
                                ? "bg-[#F3C625] text-white shadow-sm"
                                : "bg-white text-gray-600 border border-gray-200 hover:border-[#F3C625]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 disabled:opacity-40 hover:border-[#F3C625] hover:text-[#F3C625] transition-all"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>
    </>
  );
};

export default Services;