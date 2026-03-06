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
        permanent: 1,
      },
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching service deliverables:", error);
    throw error;
  }
};
