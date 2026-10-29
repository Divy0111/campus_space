
// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState
// } from "react";
// import api from "./api";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem("campusspace_token");

//     if (!token) {
//       setLoading(false);
//       return;
//     }

//     api.get("/auth/me")
//       .then((res) => setUser(res.data.user))
//       .catch(() => {
//         localStorage.removeItem("campusspace_token");
//         setUser(null);
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   async function login(email, password, mode) {
//     const res = await api.post("/auth/login", {
//       email,
//       password,
//       mode
//     });

//     localStorage.setItem("campusspace_token", res.data.token);
//     setUser(res.data.user);

//     return res.data;
//   }

//   async function signup(data) {
//     return api.post("/auth/signup", data);
//   }

//   function logout() {
//     localStorage.removeItem("campusspace_token");
//     setUser(null);
//   }

//   return (
//     <AuthContext.Provider
//       value={{ user, loading, login, signup, logout }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }






import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import api from "./api";

const AuthContext = createContext(null);

const TOKEN_KEY = "campusspace_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the logged-in user after refreshing the page.
  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        if (active) setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        if (active) {
          setUser(response.data.user || null);
        }
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  // Log in as either a student or an administrator.
  async function login(email, password, mode) {
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !password) {
      throw new Error("Please enter your email and password.");
    }

    if (!["student", "admin"].includes(mode)) {
      throw new Error("Please select Student Login or Admin Login.");
    }

    try {
      const response = await api.post("/auth/login", {
        email: normalizedEmail,
        password,
        mode
      });

      const data = response.data;

      if (!data || !data.token || !data.user) {
        throw new Error(
          "The server response is missing the login token or user details."
        );
      }

      // Verify the returned role matches the selected login mode.
      if (data.user.role !== mode) {
        throw new Error(
          "The selected login type does not match your account role."
        );
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);

      return data;
    } catch (error) {
      // Preserve meaningful messages returned by the backend.
      if (error.response?.data?.message) {
        throw error;
      }

      if (error.response) {
        throw new Error(
          `Login request failed with status ${error.response.status}.`
        );
      }

      if (error.request) {
        throw new Error(
          "Cannot connect to the backend. Make sure the server is running."
        );
      }

      throw error;
    }
  }

  // Register a student using the existing signup route.
  async function signup(data) {
    try {
      const response = await api.post("/auth/signup", data);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw error;
      }

      if (error.response) {
        throw new Error(
          `Signup failed with status ${error.response.status}.`
        );
      }

      throw new Error(
        "Cannot connect to the backend. Make sure the server is running."
      );
    }
  }

  // Log out the current user.
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
}
