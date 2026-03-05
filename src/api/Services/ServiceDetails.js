import axiosInstance from "../axiosInstance";

/**
 * Fetch a single service detail by ID
 * @param {string|number} id - ServiceDetailID
 * @returns {Promise<Object>}
 */
export const getServiceDetailById = async (id) => {
    try {
        const response = await axiosInstance.get(`/service-details/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching service detail:", error);
        throw error;
    }
};
export const serviceFormMapping = async (id) => {
    
    try {
        const response = await axiosInstance.post(`/getServiceFormFullMapping`,{serviceId:id});
        
        return response.data;
    } catch (error) {
        console.error("Error fetching service form:", error);
        throw error;
    }
};


export const serviceFormSave = async (payload) => {
    
    try {
        const response = await axiosInstance.post(`/saveFormResponse`,payload);
        return response.data;
    } catch (error) {
        console.error("Error save the service form:", error);
        throw error;
    }
};

/**
 * Fetch tasks for a service detail
 * @param {Object} params - { serviceId, assignmentId }
 * @returns {Promise<Object>}
 */
export const getTasksByServiceAssignment = async (params) => {
    try {
        const response = await axiosInstance.post("/getTasksByServiceAssignment", params);
        return response.data;
    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
};
/**
 * Fetch deliverables for a service detail
 * @param {string|number} id - ServiceDetailID
 * @returns {Promise<Object>}
 */
export const getServiceDeliverablesByServiceDetailId = async (id) => {
    try {
        const response = await axiosInstance.post("/getServiceDeliverablesByServiceDetailId", { serviceDetailedId: id, permanent: 1 });
        return response.data;
    } catch (error) {
        console.error("Error fetching deliverables:", error);
        throw error;
    }
};

/**
 * Fetch tasks for a service detail
 * @param {Object} params - { serviceDetailsId, employeeId, franchiseId }
 * @returns {Promise<Object>}
 */
export const getServiceTasks = async (params) => {
    try {
        const response = await axiosInstance.post("/getServiceTasks", params);
        return response.data;
    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
};



