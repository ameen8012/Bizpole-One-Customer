import axiosInstance from "../axiosInstance";
import { getSecureItem, setSecureItem } from "../../utils/secureStorage";

/**
 * List orders with filters and pagination
 * @param {Object} filters - { FranchiseeID, EmployeeID, search, isAssociate, AssociateID, ... }
 * @returns {Promise<Object>} - { success, total, data, page, limit }
 */
export const listOrders = async (filters) => {
  try {
    const response = await axiosInstance.post("/orderlist", filters);
    return response.data;
  } catch (error) {
    console.error("Error listing orders:", error);
    throw error;
  }
};
export const initPayment = async (payload) => {
  try {
    const response = await axiosInstance.post("https://api.bizpoleindia.in/initiate", payload);
    return response.data;
  } catch (error) {
    console.error("Error initPayment:", error);
    throw error;
  }
};




/**
 * Get order details by ID
 * @param {string|number} orderId
 * @returns {Promise<Object>} - { success, data: { ... } }
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting order by ID:", error);
    throw error;
  }
};


// 🔹 Fetch orders for a specific companyId (bypassing storage)





export const getOrdersByCompanyId = async ({ companyId, limit = 10, page = 1, IsIndividual }) => {
  if (!companyId) throw new Error("companyId is required");
  const body = { companyId, limit, page };
  if (typeof IsIndividual !== "undefined") body.IsIndividual = IsIndividual;
  const response = await axiosInstance.post(`/order/company`, body);
  return response.data;
};

// Helper: always get latest selectedCompany.CompanyID from secure storage
export const getCompanyIdFromStorage = () => {
  try {
    // Always check both localStorage and sessionStorage for latest value
    let raw = getSecureItem("selectedCompany");
    if (!raw) {
      raw = window.localStorage.getItem("selectedCompany") || window.sessionStorage.getItem("selectedCompany");
    }
    if (raw) {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (parsed && parsed.CompanyID) {
        return parsed.CompanyID; // Return the CompanyID from selectedCompany
      }
    }
    // Fallback: try from user object
    let userDataRaw = getSecureItem("user") || getSecureItem("partnerUser");
    if (!userDataRaw) {
      userDataRaw = window.localStorage.getItem("user") || window.localStorage.getItem("partnerUser") ||
        window.sessionStorage.getItem("user") || window.sessionStorage.getItem("partnerUser");
    }
    const userData = userDataRaw && typeof userDataRaw === "string" ? JSON.parse(userDataRaw) : userDataRaw;
    if (userData && userData.Companies && userData.Companies.length > 0) {
      return userData.Companies[0].CompanyID; // Return the first company ID as a fallback
    }
    return null;
  } catch (error) {
    console.error("Error getting company ID:", error);
    return null;
  }
};

// 🔹 Fetch all orders for logged-in company
export const getAllOrdersByCompany = async (filters = {}) => {
  const companyId = getCompanyIdFromStorage();
  if (!companyId) throw new Error("Company not selected");

  // Use POST request and send filters in body (matches backend)
  const response = await axiosInstance.post(`/order/company/${companyId}`, {
    ...filters,
    limit: filters.limit || 10,
    page: filters.page || 1,
  });

  return response.data;
};

// 🔹 Fetch individual orders only
export const getIndividualOrders = async (filters = {}) => {
  return getAllOrdersByCompany({
    ...filters,
    IsIndividual: true,
  });
};

// 🔹 Fetch package orders only
export const getPackageOrders = async (filters = {}) => {
  return getAllOrdersByCompany({
    ...filters,
    IsIndividual: false,
  });
};

// Set selected company
export const setSelectedCompany = (company) => {
  if (!company || !company.CompanyID) {
    console.warn("Invalid company object provided");
    return;
  }
  setSecureItem(
    "selectedCompany",
    JSON.stringify({
      CompanyID: company.CompanyID,
      CompanyName: company.BusinessName || company.CompanyName || "",
    })
  );
  setSecureItem("CompanyId", company.CompanyID.toString());
  setShowCompanyDropdown(false);
  // Dispatch a custom event so order pages can reload
  window.dispatchEvent(new Event("company-switched"));
};

// 🔹 Fetch invoice for a specific order
export const getInvoicesForOrder = async (orderId) => {
  if (!orderId) throw new Error("orderId is required");
  const response = await axiosInstance.post("/getinvoiceforservice", { orderId: orderId.toString() });
  return response.data;
};

// New helper function to fetch orders and their invoices
export const getOrdersWithInvoices = async (companyId) => {
  if (!companyId) throw new Error("companyId is required");

  // Fetch orders
  const orders = await getOrdersByCompanyId({ companyId });

  // Fetch invoices for each order
  const ordersWithInvoices = await Promise.all(
    orders.map(async (order) => {
      const invoices = await getInvoicesForOrder(order.id);
      return { ...order, invoices };
    })
  );

  return ordersWithInvoices;
};
