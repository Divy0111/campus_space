import Rooms from "./pages/Rooms";
import Buildings from "./pages/Buildings";
import BookingForm from "./pages/BookingForm";

import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import { useAuth } from "./AuthContext";
import "./App.css";
import "./index.css";

function Navbar({ theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function signOut() {
    logout();
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">C</span>
        <span>Campus <span className="brand-accent">  Space</span></span>
      </Link>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        <a href="/#rooms">Book Rooms</a>
        <Link to={user ? "/profile" : "/login"}>My Bookings</Link>
      </nav>

      <div className="nav-actions">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle light and dark theme"
          title="Toggle theme"
        >
          {theme === "light" ? "☾" : "☀"}
        </button>

        {!user ? (
          <>
            <Link className="login-link" to="/login">Login</Link>
            <Link className="primary-btn nav-signup" to="/signup">
              Sign Up
            </Link>
          </>
        ) : (
          <div className="profile-menu">
            <button
              className="avatar"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Open profile menu"
            >
              {user.name?.charAt(0).toUpperCase()}
            </button>

            {menuOpen && (
              <div className="dropdown">
                <div className="dropdown-heading">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                  <small>{user.role === "admin" ? "Administrator" : "Student"}</small>
                </div>

                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  My Profile
                </Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  {user.role === "admin" ? "Manage Bookings" : "My Bookings"}
                </Link>
                <button onClick={signOut}>Log out</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading your account...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}

function LoginRoute() {
  const { user } = useAuth();
  return user ? <Navigate to={user.role === "admin" ? "/admin" : "/"} replace /> : <Login />;
}

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("campusspace_theme") || "light"
  );

  const location = useLocation();
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(location.pathname);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("campusspace_theme", theme);
  }, [theme]);

  return (
    <div className="app-shell">
      <Navbar
        theme={theme}
        toggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
      />

      <Routes>
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/buildings" element={<Buildings />} />
        <Route path="/book/:roomId" element={<BookingForm />} />

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute admin>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAuthPage && (
        <footer className="footer">
          <Link to="/" className="footer-brand">CampusSpace</Link>
          <p>Making campus spaces easier to discover and book.</p>
          <span>© {new Date().getFullYear()} CampusSpace · Built for campus communities</span>
        </footer>
      )}
    </div>
  );
}
