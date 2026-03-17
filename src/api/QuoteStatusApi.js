import axiosInstance from "./axiosInstance";
import { setSecureItem } from "../utils/secureStorage";

/**
 * Check quote status for multiple quoteIds
 * @param {number[]} quoteIds
 * @returns {Promise<{statuses: Array<{quoteId: number, quotestatus: string}>}>}
 */
export const getQuoteStatus = async (quoteIds) => {
  // Save the last quoteIds to localStorage (optional)
  if (Array.isArray(quoteIds) && quoteIds.length > 0) {
    setSecureItem("QuoteIds", JSON.stringify(quoteIds));
  }
  // Send the payload as { quoteIds: [...] }
  const res = await axiosInstance.post("/quote-status", { quoteIds });
  return res.data;
};

export default { getQuoteStatus };
