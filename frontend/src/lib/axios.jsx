import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:6000/api" : "/", 
    withCredentials: true, // send cookies to the server
});

axiosInstance.interceptors.request.use((config) => {
    console.log("Request Cookies:", document.cookie); // Log cookies
    console.log("Request Headers:", config.headers); // Log headers
    return config;
  });
  

export default axiosInstance;
