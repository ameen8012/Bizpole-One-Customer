import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { assignCustomer, createCustomer } from "../api/CustomerApi";
import { getAllStates } from "../api/States";
import { setSecureItem } from "../utils/secureStorage";
const Tellabout = () => {
  // ✅ States hook inside component
  const [states, setStates] = useState([]);
  const location = useLocation();
  console.log(location.state, "location");
  // ✅ Country codes with flags
  const [countryCodes, setCountryCodes] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const data = await getAllStates();
        setStates(data);
      } catch (err) {
        console.log(err);
        setStates([]);
      }
    };

    const fetchCountryCodes = async () => {
      try {
        setLoadingCountries(true);
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,flags,idd,cca2");

        if (!response.ok) {
          throw new Error("Failed to fetch country data");
        }

        const countriesData = await response.json();

        // Country flag mapping for better reliability
        const flagMap = {
          'IN': '🇮🇳', 'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺',
          'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 'JP': '🇯🇵',
          'CN': '🇨🇳', 'BR': '🇧🇷', 'RU': '🇷🇺', 'KR': '🇰🇷', 'MX': '🇲🇽',
          'AE': '🇦🇪', 'SA': '🇸🇦', 'SG': '🇸🇬', 'MY': '🇲🇾', 'TH': '🇹🇭',
          'ID': '🇮🇩', 'PH': '🇵🇭', 'VN': '🇻🇳', 'BD': '🇧🇩', 'PK': '🇵🇰',
          'LK': '🇱🇰', 'NP': '🇳🇵', 'MM': '🇲🇲', 'KH': '🇰🇭', 'LA': '🇱🇦'
        };

        // Process country data to extract codes and flags
        const processedCountries = countriesData
          .filter(country => country.idd.root && country.idd.suffixes)
          .flatMap(country => {
            return country.idd.suffixes.map(suffix => {
              const code = `${country.idd.root}${suffix}`;
              const flag = flagMap[country.cca2] || country.flags?.emoji || "🏳";
              return {
                code,
                label: `${flag} ${code}`,
                name: country.name.common,
                flag: flag,
                cca2: country.cca2
              };
            });
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountryCodes(processedCountries);
      } catch (err) {
        console.error("Error fetching countries:", err);
        // Fallback to common codes with flags if API fails
        setCountryCodes([
          { code: "+91", label: "🇮🇳 +91", name: "India", flag: "🇮🇳", cca2: "IN" },
          { code: "+1", label: "🇺🇸 +1", name: "United States", flag: "🇺🇸", cca2: "US" },
          { code: "+44", label: "🇬🇧 +44", name: "United Kingdom", flag: "🇬🇧", cca2: "GB" },
          { code: "+971", label: "🇦🇪 +971", name: "United Arab Emirates", flag: "🇦🇪", cca2: "AE" },
          { code: "+61", label: "🇦🇺 +61", name: "Australia", flag: "🇦🇺", cca2: "AU" },
          { code: "+49", label: "🇩🇪 +49", name: "Germany", flag: "🇩🇪", cca2: "DE" },
          { code: "+33", label: "🇫🇷 +33", name: "France", flag: "🇫🇷", cca2: "FR" },
          { code: "+81", label: "🇯🇵 +81", name: "Japan", flag: "🇯🇵", cca2: "JP" },
          { code: "+86", label: "🇨🇳 +86", name: "China", flag: "🇨🇳", cca2: "CN" },
        ]);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchStates();
    fetchCountryCodes();
  }, []);

  const partnerIdFromStorage = localStorage.getItem("PartnerID");
  const isAssociate = !!partnerIdFromStorage;
  const AssociateID = partnerIdFromStorage ? Number(partnerIdFromStorage) : null;

  // ✅ Form data state
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    CountryCode: "+91",
    Mobile: "",
    Country: "India",
    State: "",
    City: "null",
    District: "",
    PinCode: "",
    PreferredLanguage: "",
    AddressLine1: "",
    AddressLine2: "",
    DateOfBirth: "",
    PANNumber: "",
    IsComponyRegistered: 1,
    Origin: "",
    SecondaryMobile: "",
    SecondaryEmail: "",
    CustomerCategory: "",
    FranchiseeID: null,
    CreatedBy: null,
    Companies: [
      {
        BusinessName: "",
        CompanyEmail: "",
        CompanyMobile: "",
        Country: "India",
        State: "",
        City: "null",
        District: "",
        Agents: [],
        CompanyPAN: "",
        GSTNumber: "",
        CIN: "",
        ConstitutionCategory: "",
        Sector: "",
        BusinessNature: "",
        Website: "",
        PinCode: "",
        PrimaryCompany: 1,
        AssociateID: AssociateID,
        isAssociate: isAssociate,
      },
    ],
  });

  // Assignment state
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [lastAssignParams, setLastAssignParams] = useState({});

  // Language dropdown options
  const languageOptions = [
    { label: "English", value: "english" },
    { label: "Hindi", value: "hindi" },
    { label: "Marathi", value: "marathi" },
    { label: "Tamil", value: "tamil" },
    { label: "Telugu", value: "telugu" },
    { label: "Gujarati", value: "gujarati" },
    { label: "Bengali", value: "bengali" },
    { label: "Kannada", value: "kannada" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let updated = { ...prev, [name]: value };
      // If FirstName or LastName changes, update company name
      if (name === "FirstName" || name === "LastName") {
        const clientName = (name === "FirstName" ? value : prev.FirstName) +
          " " +
          (name === "LastName" ? value : prev.LastName);
        updated.Companies = [
          {
            ...prev.Companies[0],
            BusinessName: clientName.trim(),
          },
        ];
      }
      // Always set Country and City for both customer and company
      updated.Country = "India";
      updated.City = "null";
      updated.Companies = [
        {
          ...updated.Companies[0],
          Country: "India",
          City: "null",
        },
      ];
      return updated;
    });
  };

  // Call assignCustomer only on blur of language, state, or district
  const handleAssignBlur = () => {
    const { PreferredLanguage, State, District } = formData;
    if (
      PreferredLanguage &&
      State &&
      District &&
      (lastAssignParams.language !== PreferredLanguage ||
        lastAssignParams.state !== State ||
        lastAssignParams.district !== District)
    ) {
      setAssignLoading(true);
      setAssignError(null);
      assignCustomer({
        language: PreferredLanguage,
        state: State,
        district: District,
      })
        .then((assignRes) => {
          setFormData((prev) => ({
            ...prev,
            FranchiseeID: assignRes.franchiseeId,
            CreatedBy: assignRes.agent ? assignRes.agent.id : null,
            Companies: [
              {
                ...prev.Companies[0],
                Agents: assignRes.agent ? [{ EmployeeID: assignRes.agent.id }] : [],
              },
            ],
          }));
          setLastAssignParams({
            language: PreferredLanguage,
            state: State,
            district: District,
          });
        })
        .catch((err) => {
          setAssignError("Could not assign franchisee/agent. Try again.", err);
        })
        .finally(() => setAssignLoading(false));
    }
  };

  const handleCountrySelect = (countryCode) => {
    setFormData((prev) => ({ ...prev, CountryCode: countryCode }));
    setShowCountryDropdown(false);
  };

  const selectedCountry = countryCodes.find(c => c.code === formData.CountryCode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const user = getSecureItem("user") || {};
    // const isAssociate = user.role === "associate";
    // const AssociateID = isAssociate ? user.id : null;

    const partnerIdFromStorage = localStorage.getItem("PartnerID");
    const isAssociate = !!partnerIdFromStorage;
    const AssociateID = partnerIdFromStorage ? Number(partnerIdFromStorage) : null;

    if (!formData.FranchiseeID) {
      alert("Please select language, state, and district to assign a franchisee before submitting.");
      return;
    }
    try {
      // Store HowDidYouHear value in Origin before submit
      const updatedFormData = {
        ...formData,
        Origin: formData.HowDidYouHear || formData.Origin || "website"
      };
      // Build payload to match required structure
      const agentId = updatedFormData.CreatedBy;
      const company = {
        ...updatedFormData.Companies[0],
        BusinessName: updatedFormData.Companies[0].BusinessName,
        CompanyEmail: updatedFormData.Companies[0].CompanyEmail,
        CompanyMobile: updatedFormData.Companies[0].CompanyMobile,
        Country: "India",
        State: updatedFormData.State,
        City: "null",
        District: updatedFormData.District,
        Agents: agentId ? [{ EmployeeID: agentId }] : [],
        CompanyPAN: updatedFormData.Companies[0].CompanyPAN,
        GSTNumber: updatedFormData.Companies[0].GSTNumber,
        CIN: updatedFormData.Companies[0].CIN,
        ConstitutionCategory: updatedFormData.Companies[0].ConstitutionCategory,
        Sector: updatedFormData.Companies[0].Sector,
        BusinessNature: updatedFormData.Companies[0].BusinessNature,
        Website: updatedFormData.Companies[0].Website,
        AssociateID: AssociateID,
        isAssociate: isAssociate,
        PinCode: updatedFormData.PinCode,
        PrimaryCompany: 1,
      };


      const payload = {
        ...updatedFormData,
        Companies: [company],
        isAssociate,
        AssociateID
      };
      const res = await createCustomer(payload);
      console.log("Customer created:", res);
      // Store token and user in localStorage if present
      if (res && res.data.token) {
        localStorage.setItem('token', res.data.token);
        setSecureItem('user', JSON.stringify(res.data.user));
      }
      // Store and log location state
      if (location && location.state) {
        setSecureItem('location', JSON.stringify(location.state));
        console.log('Location state:', location.state);
      }
      // Pass type id to subscription page
      const typeId = (location.state && location.state.type) ? location.state.type : null;
      navigate("/startbusiness/subscriptions", { state: { type: typeId } });
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong while saving customer");
    }
  };

  return (
    <motion.div
      className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-10"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side */}
        <div className="lg:w-1/2 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 relative flex items-center justify-center p-8 lg:p-12">
          <motion.div
            className="relative z-10 bg-white/20 backdrop-blur-sm rounded-3xl p-12 lg:p-16 border border-white/30 w-full max-w-md h-80 lg:h-96 shadow-lg flex items-center justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center text-white">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">Welcome!</h2>
              <p className="text-lg opacity-90">Tell us about yourself to get started</p>
            </div>
          </motion.div>
          <div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay blur-3xl"></div>
        </div>

        {/* Right Side - Form */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 text-center lg:text-left">
            Tell Us About You
          </h1>

          <form className="space-y-4 lg:space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {/* First Name */}
              <div className="md:col-span-1">
                <input
                  type="text"
                  name="FirstName"
                  placeholder="First Name"
                  value={formData.FirstName}
                  onChange={handleChange}
                  className="w-full border-2 border-yellow-400 rounded-3xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="md:col-span-1">
                <input
                  type="text"
                  name="LastName"
                  placeholder="Last Name"
                  value={formData.LastName}
                  onChange={handleChange}
                  className="w-full border-2 border-yellow-400 rounded-3xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                  required
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <input
                  type="email"
                  name="Email"
                  placeholder="Email ID"
                  value={formData.Email}
                  onChange={handleChange}
                  className="w-full border-2 border-yellow-400 rounded-3xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                  required
                />
              </div>

              {/* Phone Number with Country Code */}
              <div className="md:col-span-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Country Code Selector */}
                  <div className="sm:w-40 flex-shrink-0">
                    {loadingCountries ? (
                      <div className="border-2 border-yellow-400 rounded-3xl px-3 py-3 bg-white w-full flex items-center justify-center h-full">
                        <span className="text-sm text-gray-500">Loading...</span>
                      </div>
                    ) : (
                      <div className="relative w-full">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="border-2 border-yellow-400 rounded-3xl px-3 py-3 bg-white w-full flex items-center justify-between text-sm font-medium h-full min-h-[52px] focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        >
                          <span className="flex items-center">
                            <span className="text-lg mr-2">{selectedCountry?.flag || "🏳"}</span>
                            <span>{formData.CountryCode}</span>
                          </span>
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        </button>

                        {showCountryDropdown && (
                          <div className="absolute z-50 top-full mt-1 w-full bg-white border-2 border-yellow-400 rounded-3xl shadow-lg max-h-60 overflow-y-auto">
                            {countryCodes.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => handleCountrySelect(country.code)}
                                className="w-full px-3 py-2 text-left hover:bg-yellow-50 flex items-center text-sm border-b border-gray-100 last:border-b-0"
                              >
                                <span className="text-lg mr-3 flex-shrink-0">{country.flag}</span>
                                <span className="font-medium mr-2 flex-shrink-0">{country.code}</span>
                                <span className="text-gray-600 truncate">{country.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Phone Number Input */}
                  <div className="flex-1">
                    <input
                      type="tel"
                      name="Mobile"
                      placeholder="Phone Number"
                      value={formData.Mobile}
                      onChange={handleChange}
                      className="w-full border-2 border-yellow-400 rounded-3xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <input
                  type="text"
                  name="AddressLine1"
                  placeholder="Address"
                  value={formData.AddressLine1}
                  onChange={handleChange}
                  className="w-full border-2 border-yellow-400 rounded-3xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                />
              </div>

              {/* Country */}
              <div className="md:col-span-1">
                <input
                  type="text"
                  name="Country"
                  placeholder="Country"
                  value={formData.Country}
                  readOnly
                  className="w-full border-2 border-yellow-400 rounded-3xl px-4 py-3 bg-gray-50 text-gray-600"
                />
              </div>

              {/* State */}
              <div className="md:col-span-1">
                <select
                  name="State"
                  value={formData.State}
                  onChange={handleChange}
                  onBlur={handleAssignBlur}
                  className="w-full border-2 border-yellow-400 rounded-3xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                  required
                >
                  <option value="">Select State</option>
                  {states &&
                    states.length > 0 &&
                    states.map((state) => (
                      <option
                        key={state.id || state.state_code || state.state_name}
                        value={state.state_name}
                      >
                        {state.state_name}
                      </option>
                    ))}
                </select>
              </div>

              {/* District */}
              <div className="md:col-span-1">
                <input
                  type="text"
                  name="District"
                  placeholder="District"
                  value={formData.District}
                  onChange={handleChange}
                  onBlur={handleAssignBlur}
                  className="w-full border-2 border-yellow-400 rounded-3xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                  required
                />
              </div>

              {/* Pin Code */}
              <div className="md:col-span-1">
                <input
                  type="text"
                  name="PinCode"
                  placeholder="Pin Code"
                  value={formData.PinCode}
                  onChange={handleChange}
                  className="w-full border-2 border-yellow-400 rounded-3xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                  required
                />
              </div>

              {/* Preferred Language */}
              <div className="md:col-span-1">
                <select
                  name="PreferredLanguage"
                  value={formData.PreferredLanguage}
                  onChange={handleChange}
                  onBlur={handleAssignBlur}
                  className="w-full border-2 border-yellow-400 rounded-3xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                  required
                >
                  <option value="">Select Preferred Language</option>
                  {languageOptions.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* How Did You Hear About Us? */}
              <div className="md:col-span-1">
                <select
                  name="HowDidYouHear"
                  value={formData.HowDidYouHear || ''}
                  onChange={handleChange}
                  className="w-full border-2 border-yellow-400 rounded-3xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                  required
                >
                  <option value="">How Did You Hear About Us?</option>
                  <option value="Google">Google Search</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Friend">Friend/Referral</option>
                  <option value="Advertisement">Advertisement</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Assignment Status */}
            {assignLoading && (
              <div className="text-yellow-700 text-sm font-medium flex items-center gap-2 p-3 bg-yellow-50 rounded-xl">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"></span>
                Assigning franchisee/agent based on your location and language...
              </div>
            )}
            {assignError && (
              <div className="text-red-600 text-sm font-medium p-3 bg-red-50 rounded-xl">{assignError}</div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center lg:justify-end pt-4 lg:pt-6">
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-3 rounded-full shadow-lg flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2"
              >
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showCountryDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCountryDropdown(false)}
        />
      )}
    </motion.div>
  );
};

export default Tellabout;