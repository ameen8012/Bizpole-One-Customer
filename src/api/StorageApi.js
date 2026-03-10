import axiosInstance from "./axiosInstance";

/**
 * Upload a file to the server
 * @param {File} file - The file to upload
 * @returns {Promise<Object>} - The response from the server containing the file URL
 */
export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axiosInstance.post('/storage/upload-vercel-blob', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};

export default {
    uploadFile,
};
