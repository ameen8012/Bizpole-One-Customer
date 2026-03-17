// src/layouts/ProfileLayout.jsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { setSecureItem, getSecureItem } from "../utils/secureStorage";
import {
  LayoutGrid,
  Calendar,
  FileText,
  Folder,
  Briefcase,
  MessageSquare,
  Bell,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";

const menuItems = [
  { name: "Profile", path: "", icon: LayoutGrid },
  { name: "Calendars", path: "calendar", icon: Calendar },
  { name: "Company Details", path: "companydetails", icon: FileText },
  { name: "Files", path: "files", icon: Folder },
  { name: "Compliance Calendar", path: "events", icon: Briefcase },
  { name: "Invoice", path: "invoice", icon: MessageSquare },
];

const ProfileLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState({});
  const [selectedCompany, setSelectedCompany] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [companies, setCompanies] = useState([]);
  const navigate = useNavigate();

  // Load user and company data from secureStorage (robust parse)
  useEffect(() => {
    try {
      const rawUser = getSecureItem("user");
      // getSecureItem might already return parsed object or a string
      const parsedUser = rawUser && typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;

      if (parsedUser) {
        setUser(parsedUser);

        if (Array.isArray(parsedUser.Companies) && parsedUser.Companies.length > 0) {
          setCompanies(parsedUser.Companies);

          // Try to get saved selectedCompany
          const rawSaved = getSecureItem("selectedCompany");
          const parsedSaved = rawSaved && typeof rawSaved === "string" ? JSON.parse(rawSaved) : rawSaved;

          if (parsedSaved && parsedSaved.CompanyID) {
            const found = parsedUser.Companies.find(
              (c) => String(c.CompanyID) === String(parsedSaved.CompanyID)
            );
            if (found) {
              setSelectedCompany(found.BusinessName || found.CompanyName || "");
            } else {
              // saved selectedCompany not found in user's companies, fallback to first
              const first = parsedUser.Companies[0];
              setSelectedCompany(first.BusinessName || first.CompanyName || "");
              setSecureItem(
                "selectedCompany",
                JSON.stringify({
                  CompanyID: first.CompanyID,
                  CompanyName: first.BusinessName || first.CompanyName || "",
                })
              );
            }
          } else {
            // no saved selectedCompany -> set first and persist
            const first = parsedUser.Companies[0];
            setSelectedCompany(first.BusinessName || first.CompanyName || "");
            setSecureItem(
              "selectedCompany",
              JSON.stringify({
                CompanyID: first.CompanyID,
                CompanyName: first.BusinessName || first.CompanyName || "",
              })
            );
          }
        }
      }
    } catch (err) {
      console.log("Error parsing user data in ProfileLayout:", err);
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedCompany");
    // or localStorage.clear(); if you want to wipe everything
    navigate("/login");
  };

  // Handle back to dashboard - MOVED INSIDE THE COMPONENT
  const handleBackToDashboard = () => {
    navigate("/dashboard/bizpoleone");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ===== Navbar ===== */}
      <header className="bg-white px-6 py-3 flex justify-between items-center shadow-sm fixed top-0 left-0 right-0 z-50">
        {/* Logo */}
        <div className="flex items-center">
          <img src="/Images/logo.webp" alt="Bizpole Logo" className="h-14" />
        </div>

        {/* Desktop Right Section */}
        <div className="hidden lg:flex items-center space-x-6">
          {/* Company Selector */}
          <div className="relative">
            <button
              className="px-6 py-2 rounded-full font-semibold text-black bg-[#FFC42A40] hover:bg-[#FFC42A70] transition flex items-center gap-2"
              onClick={() => setShowCompanyDropdown((prev) => !prev)}
              type="button"
            >
              {selectedCompany || "Select Company"}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showCompanyDropdown && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg z-10 border border-gray-200">
                {companies.map((company) => (
                  <button
                    key={company.CompanyID || company.BusinessName}
                    className={`w-full text-left px-5 py-3 hover:bg-yellow-100 rounded-xl transition ${selectedCompany === (company.BusinessName || company.CompanyName)
                        ? "bg-yellow-50 font-bold"
                        : ""
                      }`}
                    onClick={() => {
                      setSelectedCompany(company.BusinessName || company.CompanyName || "");
                      setSecureItem(
                        "selectedCompany",
                        JSON.stringify({
                          CompanyID: company.CompanyID,
                          CompanyName: company.BusinessName || company.CompanyName || "",
                        })
                      );
                      setSecureItem("CompanyId", company.CompanyID.toString());
                      setShowCompanyDropdown(false);
                      // Force reload to ensure all order pages use new company
                      window.location.reload();
                    }}
                  >
                    {company.BusinessName || company.CompanyName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search + Notifications + Profile */}
          <div className="flex items-center bg-white rounded-full shadow-md px-3 py-2 space-x-4">
            {/* Search */}
            <div className="flex items-center bg-[#FFC42A40] rounded-full px-3 py-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z" />
              </svg>
              <input type="text" placeholder="Search" className="bg-transparent outline-none text-sm placeholder-gray-500 w-32 focus:w-44 transition-all" />
            </div>

            {/* Bell */}
            <button className="p-2 rounded-full hover:bg-gray-100 relative cursor-pointer">
              <Bell size={22} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile */}
            <NavLink to="/profile" className="flex items-center cursor-pointer">
              <img src="/Images/user.jpg" alt="Profile" className="w-9 h-9 rounded-full shadow" />
            </NavLink>
          </div>
        </div>

        {/* Mobile Right Section */}
        <div className="flex items-center space-x-3 lg:hidden">
          <button className="p-2 rounded-full hover:bg-gray-100 relative cursor-pointer">
            <Bell size={22} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          <img src="/Images/user.jpg" alt="Profile" className="w-9 h-9 rounded-full shadow" />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded hover:bg-gray-100">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* ===== Sidebar ===== */}
      <aside
        className={`fixed lg:static min-h-screen mt-16 left-0 w-72 bg-white shadow-md flex flex-col justify-between transform transition-transform duration-300 z-40 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div>
          {/* Profile Section */}
          <div className="p-8 text-center">
            <div className="relative inline-block">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-24 h-24 rounded-full mx-auto border-4 border-yellow-400" />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto border-4 border-yellow-400 bg-gray-100 flex items-center justify-center">
                  <User size={56} className="text-gray-400" />
                </div>
              )}
            </div>
            <h2 className="text-lg font-semibold mt-4">
              {user?.FirstName || user?.firstName || "User"} {user?.LastName || user?.lastName || ""}
            </h2>
            <p className="text-sm text-gray-500">{user?.Email || user?.email || ""}</p>
          </div>

          {/* Grid Menu */}
          <div className="grid grid-cols-2 gap-4 px-6">
            {menuItems.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={name}
                to={path}
                end={name === "Profile"}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center rounded-xl border p-4 text-sm font-medium transition ${isActive ? "bg-yellow-50 border-yellow-400 text-yellow-600" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-100"
                  }`
                }
              >
                <Icon size={20} className="mb-2" />
                {name}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="p-6 space-y-4">
          {/* Back to Dashboard Button */}
          <button
            onClick={handleBackToDashboard}
            className="flex w-full items-center justify-between rounded-lg bg-amber-500 hover:bg-amber-600 px-4 py-3 text-white font-medium transition duration-200 shadow-md hover:shadow-lg"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Dashboard
            </span>

          </button>

          {/* <button className="flex w-full items-center justify-between rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200">
            <span className="flex items-center gap-2">
              <Send size={16} /> Send Feedback
            </span>
            <span>→</span>
          </button> */}
          {/* <button className="flex w-full items-center justify-between rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200">
            <span className="flex items-center gap-2">
              <HelpCircle size={16} /> Knowledge Base
            </span>
            <span>→</span>
          </button> */}

          {/* Logout */}
          <button onClick={handleLogout} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-red-500 hover:bg-gray-700 hover:text-red-400 transition">
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <main className="flex-1 p-8 overflow-y-auto mt-[76px]">
        <Outlet />
      </main>
    </div>
  );
};

export default ProfileLayout;