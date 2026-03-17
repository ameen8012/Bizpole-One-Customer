import { useState } from "react";
import { upsertCompany } from "../../api/CompanyApi";
import { getSecureItem } from "../../utils/secureStorage";

const DirectorPromoterForm = ({ onNext, onBack }) => {
  const [count, setCount] = useState(1);
  const [directors, setDirectors] = useState([
    {
      fullName: "",
      designation: "",
      din: "",
      mobile: "",
      email: "",
      pan: "",
      aadhaar: "",
      isPrimary: true
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({});

  // Handle number of directors change
  const handleCountChange = (e) => {
    const newCount = Number(e.target.value);
    setCount(newCount);

    setDirectors((prev) => {
      if (newCount > prev.length) {
        // Add new directors
        const newDirectors = [...prev];
        for (let i = prev.length; i < newCount; i++) {
          newDirectors.push({
            fullName: "",
            designation: "",
            din: "",
            mobile: "",
            email: "",
            pan: "",
            aadhaar: "",
            isPrimary: i === 0 // First one remains primary
          });
        }
        return newDirectors;
      } else {
        // Remove directors
        return prev.slice(0, newCount).map((director, index) => ({
          ...director,
          isPrimary: index === 0 // Ensure first one is primary if removing others
        }));
      }
    });
  };

  // Handle input changes for each director
  const handleDirectorChange = (idx, field, value) => {
    setDirectors((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  // Handle blur for validation
  const handleBlur = (idx, field) => {
    setTouched((prev) => ({
      ...prev,
      [`${idx}-${field}`]: true,
    }));
  };

  // Set primary director
  const setPrimaryDirector = (idx) => {
    setDirectors((prev) =>
      prev.map((director, index) => ({
        ...director,
        isPrimary: index === idx,
      }))
    );
  };

  // Validation functions
  const validateEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile) => {
    if (!mobile) return false;
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  const validatePAN = (pan) => {
    if (!pan) return false;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
  };

  const validateAadhaar = (aadhaar) => {
    if (!aadhaar) return true; // Aadhaar is optional
    const aadhaarRegex = /^\d{12}$/;
    return aadhaarRegex.test(aadhaar);
  };

  const validateForm = () => {
    const errors = [];

    // Validate each director
    directors.forEach((director, idx) => {
      if (!director.fullName?.trim()) {
        errors.push(`Director ${idx + 1}: Full Name is required`);
      }

      if (!director.designation) {
        errors.push(`Director ${idx + 1}: Designation is required`);
      }

      if (!director.mobile?.trim()) {
        errors.push(`Director ${idx + 1}: Mobile Number is required`);
      } else if (!validateMobile(director.mobile)) {
        errors.push(`Director ${idx + 1}: Mobile Number must be 10 digits starting with 6-9`);
      }

      if (!director.email?.trim()) {
        errors.push(`Director ${idx + 1}: Email is required`);
      } else if (!validateEmail(director.email)) {
        errors.push(`Director ${idx + 1}: Please enter a valid email address`);
      }

      if (!director.pan?.trim()) {
        errors.push(`Director ${idx + 1}: PAN is required`);
      } else if (!validatePAN(director.pan)) {
        errors.push(`Director ${idx + 1}: PAN should be in valid format (e.g., ABCDE1234F)`);
      }

      if (!validateAadhaar(director.aadhaar)) {
        errors.push(`Director ${idx + 1}: Aadhaar should be 12 digits`);
      }
    });

    return errors;
  };

  // Check if field has error
  const hasError = (idx, field) => {
    return touched[`${idx}-${field}`] && !directors[idx][field]?.trim();
  };

  // Handle "Next" (submit) button
  const handleNext = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setError(validationErrors[0]);
        setLoading(false);
        return;
      }

      // Safely retrieve and parse company info from secure storage
      const storedCompany = getSecureItem("companyInfo");
      console.log(storedCompany, 'companyDetails');

      let companyInfo = null;

      if (storedCompany) {
        try {
          companyInfo = typeof storedCompany === "string"
            ? JSON.parse(storedCompany)
            : storedCompany;
        } catch (err) {
          console.error("Error parsing companyInfo:", err);
          setError("Invalid company information. Please complete the previous step again.");
          setLoading(false);
          return;
        }
      }

      // Validate EmployeeID & FranchiseID
      if (!companyInfo || !companyInfo.EmployeeID || !companyInfo.FranchiseID) {
        setError(
          "Please complete the Company Information step to assign an agent and franchisee before proceeding."
        );
        setLoading(false);
        return;
      }

      // Map directors → Customers array
      const Customers = directors.map((d) => ({
        FirstName: d.fullName.split(' ')[0] || "",
        LastName: d.fullName.split(' ').slice(1).join(' ') || "",
        DateOfBirth: "",
        PreferredLanguage: companyInfo.Customers?.[0]?.PreferredLanguage || "english",
        Email: d.email,
        Mobile: d.mobile,
        Country: "India",
        State: companyInfo.State || "",
        City: companyInfo.City || "",
        PinCode: companyInfo.PinCode || "",
        PANNumber: d.pan.toUpperCase(),
        IsComponyRegistered: 1,
        PrimaryCustomer: d.isPrimary ? 1 : 0,
      }));

      // Merge into final payload
      const payload = {
        ...companyInfo,
        Customers,
        EmployeeID: companyInfo.EmployeeID,
        FranchiseID: companyInfo.FranchiseID,
      };

      console.log("Final payload:", payload);

      // API call
      await upsertCompany(payload);
      if (onNext) onNext();
    } catch (err) {
      console.error("Error while saving:", err);
      setError(err.response?.data?.message || "Failed to save director/promoter details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f5f5f5]">
      {/* Left Section */}
      <div
        className="flex-1 p-4 sm:p-8 md:p-10 lg:p-12 bg-cover bg-center rounded-tl-2xl rounded-bl-2xl"
        style={{ backgroundImage: "url('/Images/hero-bg.webp')" }}
      >
        <h1 className="text-4xl font-bold text-center mb-12">
          Director/Promoter Details
        </h1>

        {/* Number of Directors/Partners Dropdown */}
        <div className="max-w-6xl mx-auto mb-10">
          <label className="block mb-2 text-lg font-semibold">
            Number of Directors/Partners *
          </label>
          <select
            className="w-48 border-2 border-yellow-400 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={count}
            onChange={handleCountChange}
            disabled={loading}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-600 mt-2">
            Select the number of directors/partners. The first director will be set as primary.
          </p>
        </div>

        {/* Director/Partner Details */}
        <div className="space-y-8 md:space-y-12 max-w-6xl mx-auto">
          {directors.map((director, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 bg-white/80 rounded-2xl p-4 md:p-8 shadow relative"
            >
              {/* Primary Director Indicator */}
              <div className="absolute top-4 left-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="primaryDirector"
                    checked={director.isPrimary}
                    onChange={() => setPrimaryDirector(idx)}
                    className="accent-yellow-500"
                    disabled={loading}
                  />
                  <span className="text-sm font-semibold text-yellow-600">
                    Primary Director
                  </span>
                </label>
              </div>

              {/* Director Number */}
              <div className="absolute top-4 right-4">
                <span className="text-sm font-semibold text-gray-600 bg-yellow-100 px-3 py-1 rounded-full">
                  Director {idx + 1}
                </span>
              </div>

              {/* Left Column */}
              <div className="space-y-8 mt-8">
                {/* Full Name */}
                <div>
                  <label className="block mb-2 text-lg font-semibold">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={director.fullName}
                    onChange={(e) =>
                      handleDirectorChange(idx, "fullName", e.target.value)
                    }
                    onBlur={() => handleBlur(idx, "fullName")}
                    placeholder="e.g. John Doe"
                    className={`w-full border-2 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${hasError(idx, "fullName") ? "border-red-500" : "border-yellow-400"
                      }`}
                    disabled={loading}
                  />
                  {hasError(idx, "fullName") && (
                    <p className="text-red-500 text-sm mt-1">Full Name is required</p>
                  )}
                </div>

                {/* Designation */}
                <div>
                  <label className="block mb-2 text-lg font-semibold">
                    Designation *
                  </label>
                  <select
                    name="designation"
                    value={director.designation}
                    onChange={(e) =>
                      handleDirectorChange(idx, "designation", e.target.value)
                    }
                    onBlur={() => handleBlur(idx, "designation")}
                    className={`w-full border-2 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${hasError(idx, "designation") ? "border-red-500" : "border-yellow-400"
                      }`}
                    disabled={loading}
                  >
                    <option value="">Select Designation</option>
                    <option value="Director">Director</option>
                    <option value="Managing Director">Managing Director</option>
                    <option value="CEO">CEO</option>
                    <option value="Partner">Partner</option>
                    <option value="Proprietor">Proprietor</option>
                    <option value="Chairman">Chairman</option>
                  </select>
                  {hasError(idx, "designation") && (
                    <p className="text-red-500 text-sm mt-1">Designation is required</p>
                  )}
                </div>

                {/* DIN */}
                <div>
                  <label className="block mb-2 text-lg font-semibold">DIN</label>
                  <input
                    type="text"
                    name="din"
                    value={director.din}
                    onChange={(e) =>
                      handleDirectorChange(idx, "din", e.target.value)
                    }
                    placeholder="e.g. 12345678"
                    className="w-full border-2 border-yellow-400 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8 mt-8">
                {/* Mobile */}
                <div>
                  <label className="block mb-2 text-lg font-semibold">Mobile Number *</label>
                  <input
                    type="text"
                    name="mobile"
                    value={director.mobile}
                    onChange={(e) =>
                      handleDirectorChange(idx, "mobile", e.target.value)
                    }
                    onBlur={() => handleBlur(idx, "mobile")}
                    placeholder="e.g. 9876543210"
                    className={`w-full border-2 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${hasError(idx, "mobile") ? "border-red-500" : "border-yellow-400"
                      }`}
                    disabled={loading}
                  />
                  {hasError(idx, "mobile") && (
                    <p className="text-red-500 text-sm mt-1">Valid mobile number is required</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-2 text-lg font-semibold">Email ID *</label>
                  <input
                    type="email"
                    name="email"
                    value={director.email}
                    onChange={(e) =>
                      handleDirectorChange(idx, "email", e.target.value)
                    }
                    onBlur={() => handleBlur(idx, "email")}
                    placeholder="e.g. john@gmail.com"
                    className={`w-full border-2 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${hasError(idx, "email") ? "border-red-500" : "border-yellow-400"
                      }`}
                    disabled={loading}
                  />
                  {hasError(idx, "email") && (
                    <p className="text-red-500 text-sm mt-1">Valid email is required</p>
                  )}
                </div>

                {/* PAN */}
                <div>
                  <label className="block mb-2 text-lg font-semibold">PAN *</label>
                  <input
                    type="text"
                    name="pan"
                    value={director.pan}
                    onChange={(e) =>
                      handleDirectorChange(idx, "pan", e.target.value.toUpperCase())
                    }
                    onBlur={() => handleBlur(idx, "pan")}
                    placeholder="e.g. ABCDE1234F"
                    className={`w-full border-2 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${hasError(idx, "pan") ? "border-red-500" : "border-yellow-400"
                      }`}
                    disabled={loading}
                  />
                  {hasError(idx, "pan") && (
                    <p className="text-red-500 text-sm mt-1">Valid PAN is required</p>
                  )}
                </div>

                {/* Aadhaar */}
                <div>
                  <label className="block mb-2 text-lg font-semibold">Aadhaar</label>
                  <input
                    type="text"
                    name="aadhaar"
                    value={director.aadhaar}
                    onChange={(e) =>
                      handleDirectorChange(idx, "aadhaar", e.target.value)
                    }
                    placeholder="e.g. 123456789012"
                    className="w-full border-2 border-yellow-400 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-8 md:mt-12 max-w-6xl mx-auto gap-6 md:gap-0">
          <button
            className="w-12 h-12 flex items-center justify-center border-2 border-yellow-400 rounded-full text-yellow-500 text-xl hover:bg-yellow-100 transition disabled:opacity-50"
            type="button"
            disabled={loading}
            onClick={onBack}
          >
            ←
          </button>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-base">
              <input type="checkbox" className="accent-yellow-500" disabled={loading} />
              Remind me later!
            </label>
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3 rounded-full flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full"></span>
                  Saving...
                </>
              ) : (
                "Next »"
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-red-500 text-center mt-4 p-3 bg-red-50 rounded-xl max-w-6xl mx-auto">
            {error}
          </div>
        )}
      </div>

      {/* Right Sidebar Stepper */}
      <div className="w-full lg:w-100 bg-yellow-400 text-black p-4 sm:p-8 rounded-tr-2xl rounded-br-2xl pt-10 lg:pt-60 flex flex-col items-center mt-8 lg:mt-0">
        <h2 className="font-bold text-xl mb-10 text-white">Quick & Easy Setup</h2>
        <ol className="relative border-l-2 border-black/30 ml-4">
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
          <li className="mb-10 ml-6 flex flex-col">
            <span className="absolute -left-4 flex items-center justify-center w-8 h-8 bg-black text-yellow-400 rounded-full font-bold text-lg border-4 border-white">
              2
            </span>
            <span className="font-semibold text-lg mt-1">Director/Promoter Details</span>
            <span className="text-xs text-black/70 mt-1">Step 2 of 4</span>
          </li>
          <li className="mb-10 ml-6 flex flex-col">
            <span className="absolute -left-4 flex items-center justify-center w-8 h-8 bg-white text-black rounded-full font-bold text-lg border-4 border-black/30">
              3
            </span>
            <span className="font-semibold text-lg mt-1">Registration Status</span>
            <span className="text-xs text-black/70 mt-1">Step 3 of 4</span>
          </li>
          <li className="ml-6 flex flex-col">
            <span className="absolute -left-4 flex items-center justify-center w-8 h-8 bg-white text-black rounded-full font-bold text-lg border-4 border-black/30">
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

export default DirectorPromoterForm;