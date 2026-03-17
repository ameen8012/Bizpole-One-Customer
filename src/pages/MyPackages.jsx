// Order status mapping
const orderStatusList = [
  { value: 1, label: 'In Progress' },
  { value: 2, label: 'Completed' },
  { value: 3, label: 'Pending' },
  { value: 4, label: 'Completed, Payment Pending' },
  { value: 5, label: 'Completed, Payment Done' },
];

const getOrderStatusLabel = (statusValue) => {
  const found = orderStatusList.find((s) => s.value === statusValue);
  return found ? found.label : 'Unknown';
};
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrdersByCompanyId } from "../api/Orders/Order";
import { getSecureItem } from "../utils/secureStorage";
import DataTable from "../components/Datatable";



const PAGE_SIZE = 10;

const MyPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState(() => {
    try {
      const raw = getSecureItem("selectedCompany");
      return raw && typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        const companyId = selectedCompany?.CompanyID || selectedCompany?.CompanyId || null;
        const res = await getOrdersByCompanyId({ companyId, page, limit: PAGE_SIZE, IsIndividual: 0 });
        const data = res.data || res.orders || res;
        setPackages(Array.isArray(data) ? data : []);
        const total = res.total || res.count || (res.meta && res.meta.total) || (Array.isArray(res.data) ? res.total : 0);
        setTotalCount(total || 0);
        setTotalPages(total ? Math.ceil(total / PAGE_SIZE) : 1);
      } catch (err) {
        console.error("Error fetching packages:", err);
        setError("Failed to load your packages.");
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [page, selectedCompany]);

  useEffect(() => {
    // Listen for company switch event and update selectedCompany state immediately
    const handleCompanySwitch = () => {
      let parsed = null;
      try {
        const raw = getSecureItem("selectedCompany") || window.localStorage.getItem("selectedCompany") || window.sessionStorage.getItem("selectedCompany");
        parsed = raw && typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch (error) {
        console.error("Error parsing selected company:", error);
      }
      setSelectedCompany(parsed);
      setPage(1);
    };
    window.addEventListener("company-switched", handleCompanySwitch);
    return () => {
      window.removeEventListener("company-switched", handleCompanySwitch);
    };
  }, []);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const navigate = useNavigate();
  // Define columns for DataTable
  const columns = [
    { key: "OrderID", header: "Order ID" },
    { key: "PackageName", header: "Package Name", render: (row) => row.PackageName || row.PackageTitle || "Unnamed Package" },
    { key: "totalAmount", header: "Total Amount", render: (row) => `₹${row.TotalAmount || row.totalAmount || "N/A"}` },
    {
      key: "OrderStatus", header: "Status", render: (row) => {
        const label = getOrderStatusLabel(row.OrderStatus);
        let colorClass = "text-gray-700";
        if (row.OrderStatus === 1) colorClass = "text-blue-600  bg-blue-200 px-2 py-1 rounded-full";
        if (row.OrderStatus === 2) colorClass = "text-green-600 bg-green-200 px-2 py-1 rounded-full";
        if (row.OrderStatus === 3) colorClass = "text-yellow-600 bg-yellow-200 px-2 py-1 rounded-full";
        if (row.OrderStatus === 4) colorClass = "text-orange-600 bg-orange-200 px-2 py-1 rounded-full";
        if (row.OrderStatus === 5) colorClass = "text-purple-600 bg-purple-200 px-2 py-1 rounded-full";
        return <span className={colorClass}>{label}</span>;
      }
    },
    { key: "CreatedAt", header: "Ordered On", render: (row) => row.CreatedAt ? new Date(row.CreatedAt).toLocaleDateString() : "N/A" },
    {
      key: "action", header: "Action", render: (row) => (
        <button
          onClick={() => navigate("/dashboard/bizpoleone/orderdetails", { state: { order: row } })}
          className="px-3 py-2 bg-yellow-500 text-black rounded-full hover:bg-yellow-600 transition"
        >
          View Details
        </button>
      )
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-semibold mb-2"> Package Orders</h1>
      <h6 className="mb-6 text-gray-600">View and manage all your package orders in one place</h6>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading packages...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : (
        <DataTable
          columns={columns}
          data={packages}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  );
};

export default MyPackages;
