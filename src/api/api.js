
// Alternative API implementation
// const fetchCountryCodes = async () => {
//   try {
//     setLoadingCountries(true);
//     const response = await fetch("https://api.first.org/data/v1/countries?limit=300");
    
//     if (!response.ok) {
//       throw new Error("Failed to fetch country data");
//     }
    
//     const data = await response.json();
//     const countriesData = data.data;
    
//     // Process country data to extract codes and flags
//     const processedCountries = Object.entries(countriesData).map(([code, country]) => ({
//       code: country.callingcode ? `+${country.callingcode[0]}` : "+1",
//       label: `${country.country} +${country.callingcode ? country.callingcode[0] : "1"}`,
//       name: country.country
//     })).sort((a, b) => a.name.localeCompare(b.name));
    
//     setCountryCodes(processedCountries);
//   } catch (err) {
//     console.error("Error fetching countries:", err);
//     // Fallback to a few common codes if API fails
//     setCountryCodes([
//       { code: "+91", label: "🇮🇳 +91", name: "India" },
//       { code: "+1", label: "🇺🇸 +1", name: "United States" },
//       { code: "+44", label: "🇬🇧 +44", name: "United Kingdom" },
//       { code: "+971", label: "🇦🇪 +971", name: "United Arab Emirates" },
//       { code: "+61", label: "🇦🇺 +61", name: "Australia" },
//     ]);
//   } finally {
//     setLoadingCountries(false);
//   }
// };




//
// export const assignCustomer = async ({ language, state, district }) => {
//   const res = await axiosInstance.post("/api/bdeRoundRobin/assignCustomer", {
//     language,
//     state,
//     district,
//   });
//   return res.data;
// };

// Customer APIs
// export const createCustomer = (payload) =>
//   axiosInstance.post("/customer", payload);

// export const getCustomers = () => axiosInstance.get("/customer");

// export const getCustomerById = (id) =>
//   axiosInstance.get(`/customer/${id}`);

// export const deleteCustomer = (id) =>
//   axiosInstance.delete(`/customer/${id}`);



// Later you can add Jobs, Bookings, Workers, etc here
// export const createJob = (payload) => axiosInstance.post("/job", payload);
// export const getBookings = () => axiosInstance.get("/bookings");
// export const getWorkers = () => axiosInstance.get("/workers");

// Example for authentication (if needed in future)
// export const login = (credentials) => axiosInstance.post("/auth/login", credentials);
// export const register = (data) => axiosInstance.post("/auth/register", data);    