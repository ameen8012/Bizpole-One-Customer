// Fetch company services by companyId
import axiosInstance from "./axiosInstance";
export const getCompanyServices = async (companyId) => {
  try {
    const response = await axiosInstance.post("/companyservices", {
      companyId,
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching company services:", error);
    throw error;
  }
};
// Fetch full service form mapping by serviceId
export const getServiceFormFullMapping = async (serviceId) => {
  try {
    const response = await axiosInstance.post("/getServiceFormFullMapping", {
      serviceId,
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching service form full mapping:", error);
    throw error;
  }
};
// Fetch service deliverables by serviceDetailId
export const getServiceDeliverablesByServiceDetailId = async (
  serviceDetailId,
) => {
  try {
    const response = await axiosInstance.post(
      "/getServiceDeliverablesByServiceDetailId",
      {
        serviceDetailedId: serviceDetailId,
        // permanent: 1,
      },
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching service deliverables:", error);
    throw error;
  }
};
// Fetch response fields by company ID
export const getResponseFields = async (companyId) => {
  try {
    const response = await axiosInstance.post("/response-fields", {
      CompanyID: companyId,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching response fields:", error);
    throw error;
  }
};
export const getResponseFieldsBySerId = async (serviceId) => {
  try {
    const response = await axiosInstance.post("/response-fieldsByServiceId", {
      ServiceID: serviceId,
    });

    console.log("MMMNNBB", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching response fields:", error);
    throw error;
  }
};
// Fetch response fields for tasks by company ID (for Tasks tab)

// Call /Task API endpoint
export const getTasks = async (payload) => {
  try {
    const response = await axiosInstance.post("/Task", payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks from /Task:", error);
    throw error;
  }
};
