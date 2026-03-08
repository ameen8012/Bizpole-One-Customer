import axiosInstance from "./axiosInstance";

// Get all states (like kerala etc)
export const getAllStates = async () => {
  try {
    const res = await axiosInstance.get("/states");
    // Return the array of state objects (with StateID, state_name, etc), fallback to []
    return res.data?.data || [];
  } catch (err) {
    console.error("Error fetching states:", err);
    return [];
  }
};

export default {
  getAllStates,
};
