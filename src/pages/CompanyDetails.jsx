import { useEffect, useState } from "react";
import {
  Building2, Mail, Phone, MapPin, Globe, FileText, Users,
  CheckCircle, XCircle, ChevronRight, ArrowLeftRight,
  Shield, Briefcase, Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCompanyDetails } from "../api/CompanyApi";
import { getSecureItem, setSecureItem } from "../utils/secureStorage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CompanyDetails = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("company");
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(getSecureItem("CompanyId") || "");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const cardHoverVariants = {
    rest: {
      y: 0,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    },
    hover: {
      y: -8,
      boxShadow: "0 20px 25px -5px rgba(251, 191, 36, 0.2), 0 10px 10px -5px rgba(251, 191, 36, 0.04)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  // Get companies from user object in secure storage
  useEffect(() => {
    const user = getSecureItem("user");
    if (user && user.Companies) {
      setCompanies(user.Companies);
      if (!selectedCompanyId && user.Companies.length > 0) {
        const companyId = user.Companies[0].CompanyID.toString();
        setSelectedCompanyId(companyId);
        setSecureItem("CompanyId", companyId);
      }
    }
  }, []);

  // Fetch company details
  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const response = await getCompanyDetails(selectedCompanyId);
        if (response.success) {
          setCompany(response.data);
        } else {
          setError("Failed to fetch company details");
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to fetch company details");
      } finally {
        setLoading(false);
      }
    };

    if (selectedCompanyId) fetchCompany();
  }, [selectedCompanyId]);

  const handleCompanyChange = (companyId) => {
    setSelectedCompanyId(companyId);
    setSecureItem("CompanyId", companyId);
    setError(null);
  };

  const InfoCard = ({ icon: Icon, label, value, className = "", onClick }) => (
    <motion.div
      variants={cardHoverVariants}
      whileHover="hover"
      initial="rest"
      animate="rest"
      onClick={onClick}
      className={`bg-white rounded-full p-5 border-2 border-yellow-100 cursor-pointer transition-all duration-300 ${className} ${onClick ? 'hover:border-yellow-400' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-lg font-semibold text-gray-900 truncate">{value || "—"}</p>
        </div>
        {onClick && <ChevronRight className="w-5 h-5 text-yellow-400" />}
      </div>
    </motion.div>
  );

  const StatCard = ({ icon: Icon, label, value, subtext, color = "yellow" }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br from-${color}-400 to-${color}-600 rounded-full p-6 text-white shadow-xl`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90 mb-1">{label}</p>
          <p className="text-3xl font-bold mb-1">{value}</p>
          {subtext && <p className="text-xs opacity-80">{subtext}</p>}
        </div>
        <div className="p-3 bg-white/20 rounded-full">
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </motion.div>
  );

  const TabButton = ({ label, icon: Icon, isActive, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center justify-center gap-3 px-6 py-4 rounded-full text-sm font-semibold transition-all duration-300 ${isActive
        ? "bg-yellow-400 text-white shadow-lg shadow-yellow-400/30"
        : "bg-white text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 border-2 border-yellow-100"
        }`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {label}
    </motion.button>
  );

  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-6"
        />
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-yellow-700 text-lg font-medium"
        >
          Loading company details...
        </motion.p>
      </motion.div>
    </div>
  );

  const ErrorScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center border-2 border-yellow-100"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <XCircle className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h3>
        <p className="text-gray-600 mb-8">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg shadow-yellow-400/30 hover:shadow-xl hover:shadow-yellow-400/40 transition-all duration-300"
        >
          Try Again
        </motion.button>
      </motion.div>
    </div>
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen />;
  if (!company) return <ErrorScreen />;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 p-4 md:p-6 lg:p-8"
      >
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="max-w-7xl mx-auto">
          {/* Header with Company Switcher */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full shadow-xl"
                >
                  <Building2 className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {company?.BusinessName || "Company Name"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 bg-yellow-400 text-white rounded-full text-sm font-semibold shadow-md"
                    >
                      {company?.ConstitutionCategory || "N/A"}
                    </motion.span>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 bg-white text-yellow-600 rounded-full text-sm font-semibold border-2 border-yellow-400"
                    >
                      {company?.Sector || "N/A"}
                    </motion.span>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${company?.IsActive === 1
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-red-100 text-red-700 border-2 border-red-300'
                        }`}
                    >
                      {company?.IsActive === 1 ? "Active" : "Inactive"}
                    </motion.span>
                  </div>
                </div>
              </div>

              {/* Company Switcher */}
              {companies.length > 1 && (
                <motion.div
                  variants={itemVariants}
                  className="relative"
                >
                  <div className="flex items-center gap-3 bg-white rounded-full p-2 border-2 border-yellow-100 shadow-lg">
                    <ArrowLeftRight className="w-5 h-5 text-yellow-400 ml-3" />
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => handleCompanyChange(e.target.value)}
                      className="bg-transparent border-none focus:outline-none focus:ring-0 px-3 py-2 text-gray-900 font-medium cursor-pointer appearance-none"
                    >
                      {companies.map((c) => (
                        <option key={c.CompanyID} value={c.CompanyID}>
                          {c.BusinessName || `Company #${c.CompanyID}`}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="w-5 h-5 text-yellow-400 mr-3" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Stats Row */}
            {/* <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
              <StatCard
                icon={Users}
                label="Total Customers"
                value={company?.Customers?.length || 0}
                color="yellow"
              />
              <StatCard
                icon={Briefcase}
                label="Active Orders"
                value={company?.Orders?.filter(o => o.OrderStatus === 'Active')?.length || 0}
                color="blue"
              />
              <StatCard
                icon={CreditCard}
                label="Annual Revenue"
                value="₹25.4L"
                subtext="Last FY"
                color="green"
              />
              <StatCard
                icon={Award}
                label="Rating"
                value="4.8"
                subtext="Customer Satisfaction"
                color="purple"
              />
            </motion.div> */}

            {/* Tab Navigation */}
            <motion.div
              variants={containerVariants}
              className="flex flex-wrap gap-3 mb-8"
            >
              <TabButton
                label="Company Info"
                icon={Building2}
                isActive={activeTab === "company"}
                onClick={() => setActiveTab("company")}
              />
              <TabButton
                label="Directors"
                icon={Users}
                isActive={activeTab === "director"}
                onClick={() => setActiveTab("director")}
              />
              <TabButton
                label="Legal & Compliance"
                icon={Shield}
                isActive={activeTab === "more"}
                onClick={() => setActiveTab("more")}
              />
              {/* <TabButton
                label="Analytics"
                icon={BarChart3}
                isActive={activeTab === "analytics"}
                onClick={() => setActiveTab("analytics")}
              />
              <TabButton
                label="Settings"
                icon={Settings}
                isActive={activeTab === "settings"}
                onClick={() => setActiveTab("settings")}
              /> */}
            </motion.div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "company" && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {/* Contact Section */}
                  <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border-2 border-yellow-100 shadow-lg">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <InfoCard
                        icon={Mail}
                        label="Company Email"
                        value={company?.Customers?.[0]?.Email}
                      />
                      <InfoCard
                        icon={Phone}
                        label="Company Mobile"
                        value={company?.Customers?.[0]?.Mobile}
                      />
                    </div>
                  </motion.div>

                  {/* Location Section */}
                  <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border-2 border-yellow-100 shadow-lg">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Location Details</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InfoCard icon={MapPin} label="City" value={company?.City} />
                      <InfoCard icon={MapPin} label="State" value={company?.State} />
                      <InfoCard icon={Globe} label="Country" value={company?.Country} />
                      <InfoCard icon={MapPin} label="Pin Code" value={company?.PinCode} />
                      <InfoCard icon={Globe} label="Website" value={company?.Website} />
                    </div>
                  </motion.div>

                  {/* Business Info */}
                  <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border-2 border-yellow-100 shadow-lg">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InfoCard icon={FileText} label="Business Nature" value={company?.BusinessNature} />
                      <InfoCard icon={FileText} label="Customer Category" value={company?.CustomerCategory} />
                      <InfoCard icon={FileText} label="Origin" value={company?.Origin} />
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "director" && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white rounded-3xl p-8 border-2 border-yellow-100 shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Director Information</h2>
                  </div>

                  {company?.Customers?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {company.Customers.map((customer) => (
                        <motion.div
                          key={customer.CustomerID}
                          variants={itemVariants}
                          whileHover={{ scale: 1.02 }}
                          className={`bg-gradient-to-br ${customer.PrimaryCustomer === 1 ? 'from-yellow-400 to-yellow-500' : 'from-gray-50 to-gray-100'} rounded-3xl p-6 border-2 ${customer.PrimaryCustomer === 1 ? 'border-yellow-400' : 'border-gray-200'}`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-full ${customer.PrimaryCustomer === 1 ? 'bg-white/20' : 'bg-gray-200'}`}>
                                <Users className={`w-6 h-6 ${customer.PrimaryCustomer === 1 ? 'text-white' : 'text-gray-600'}`} />
                              </div>
                              <div>
                                <h3 className={`text-xl font-bold ${customer.PrimaryCustomer === 1 ? 'text-white' : 'text-gray-900'}`}>
                                  {customer.FirstName} {customer.LastName}
                                </h3>
                                {customer.PrimaryCustomer === 1 && (
                                  <span className="px-3 py-1 bg-white text-yellow-600 rounded-full text-xs font-semibold">
                                    Primary Director
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <p className={`flex items-center gap-2 ${customer.PrimaryCustomer === 1 ? 'text-white/90' : 'text-gray-600'}`}>
                              <Mail className="w-4 h-4" />
                              {customer.Email || "—"}
                            </p>
                            <p className={`flex items-center gap-2 ${customer.PrimaryCustomer === 1 ? 'text-white/90' : 'text-gray-600'}`}>
                              <Phone className="w-4 h-4" />
                              {customer.Mobile || "—"}
                            </p>
                            <p className={`flex items-center gap-2 ${customer.PrimaryCustomer === 1 ? 'text-white/90' : 'text-gray-600'}`}>
                              <FileText className="w-4 h-4" />
                              PAN: {customer.PANNumber || "—"}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-gray-600 py-12"
                    >
                      No director information available
                    </motion.p>
                  )}
                </motion.div>
              )}

              {activeTab === "more" && company?.registrationStatus && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white rounded-3xl p-8 border-2 border-yellow-100 shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Legal & Compliance Details</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(company.registrationStatus).map(([key, value]) => (
                      <motion.div
                        key={key}
                        whileHover="hover"
                        initial="rest"
                        animate="rest"
                        variants={cardHoverVariants}
                        className="bg-white rounded-3xl p-6 border-2 border-yellow-100"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-yellow-50 rounded-full">
                            <CheckCircle className="w-6 h-6 text-yellow-500" />
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            Active
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h4>
                        <p className="text-gray-600">{value || "Not specified"}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Action Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-4 rounded-full shadow-2xl shadow-yellow-400/30 hover:shadow-3xl hover:shadow-yellow-400/40 z-50"
        >
          <Settings className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompanyDetails;
