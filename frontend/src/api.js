
// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
//   headers: {
//     "Content-Type": "application/json"
//   }
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("campusspace_token");

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// export default api;




import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Attach the saved login token to requests.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("campusspace_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API errors consistently.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        "API error:",
        error.response.status,
        error.response.data?.message || error.message
      );
    } else if (error.request) {
      console.error(
        "Cannot connect to the backend. Check that the server is running at http://localhost:5000."
      );
    } else {
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
