// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../AuthContext";

// export default function Login() {
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const [mode, setMode] = useState("student");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [busy, setBusy] = useState(false);

//   async function handleSubmit(event) {
//     event.preventDefault();
//     setError("");
//     setBusy(true);

//     try {
//       const result = await login(email, password, mode);
//       navigate(result.user.role === "admin" ? "/admin" : "/");
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//         "Unable to log in. Check your connection."
//       );
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <main className="auth-layout">
//       <section className="auth-decoration">
//         <span className="eyebrow">WELCOME TO CAMPUSSPACE</span>
//         <h1>Your campus.<br />Your space.</h1>
//         <p>One place for campus room bookings and event planning.</p>
//         <div className="auth-decoration-icon">⌂</div>
//       </section>

//       <section className="auth-panel">
//         <span className="eyebrow">YOUR ACCOUNT</span>
//         <h2>Welcome back</h2>
//         <p className="muted">Sign in to continue to CampusSpace.</p>

//         <div className="auth-tabs">
//           <button
//             type="button"
//             className={mode === "student" ? "active" : ""}
//             onClick={() => { setMode("student"); setError(""); }}
//           >
//             Student Login
//           </button>
//           <button
//             type="button"
//             className={mode === "admin" ? "active" : ""}
//             onClick={() => { setMode("admin"); setError(""); }}
//           >
//             Admin Login
//           </button>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <label>
//             Email address
//             <input
//               type="email"
//               placeholder="you@college.edu"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </label>

//           <label>
//             Password
//             <input
//               type="password"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </label>

//           <div className="auth-links">
//             <Link to="/forgot-password">Forgot password?</Link>
//           </div>

//           {error && <p className="form-message">{error}</p>}

//           <button className="primary-btn full-btn" disabled={busy}>
//             {busy ? "Signing in..." : "Sign in →"}
//           </button>
//         </form>

//         <p className="auth-footer">
//           Don't have an account? <Link to="/signup">Create one</Link>
//         </p>
//       </section>
//     </main>
//   );
// }






import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter both your email and password.");
      return;
    }

    if (mode !== "student" && mode !== "admin") {
      setError("Please select a valid login type.");
      return;
    }

    setBusy(true);

    try {
      // Send the selected login mode to the authentication context.
      const result = await login(normalizedEmail, password, mode);

      if (!result || !result.user) {
        throw new Error("Login response did not contain user details.");
      }

      // Prevent access through the wrong login tab.
      if (result.user.role !== mode) {
        setError(
          `This account is not registered for ${mode} login. Please select the correct login type.`
        );
        return;
      }

      // Redirect according to the authenticated user's role.
      if (result.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to log in. Check your connection and try again."
      );
    } finally {
      setBusy(false);
    }
  }

  function changeMode(selectedMode) {
    setMode(selectedMode);
    setError("");
  }

  return (
    <main className="auth-layout">
      <section className="auth-decoration">
        <span className="eyebrow">WELCOME TO CAMPUSSPACE</span>

        <h1>
          Your campus.
          <br />
          Your space.
        </h1>

        <p>
          One place for campus room bookings and event planning.
        </p>

        <div className="auth-decoration-icon">⌂</div>
      </section>

      <section className="auth-panel">
        <span className="eyebrow">YOUR ACCOUNT</span>

        <h2>Welcome back</h2>

        <p className="muted">
          Sign in to continue to CampusSpace.
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "student" ? "active" : ""}
            onClick={() => changeMode("student")}
            disabled={busy}
            aria-pressed={mode === "student"}
          >
            Student Login
          </button>

          <button
            type="button"
            className={mode === "admin" ? "active" : ""}
            onClick={() => changeMode("admin")}
            disabled={busy}
            aria-pressed={mode === "admin"}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">
            Email address
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
              disabled={busy}
            />
          </label>

          <label htmlFor="login-password">
            Password
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              disabled={busy}
            />
          </label>

          <div className="auth-links">
            <Link to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          {error && (
            <p className="form-message" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="primary-btn full-btn"
            disabled={busy}
          >
            {busy
              ? "Signing in..."
              : mode === "admin"
                ? "Sign in as Admin →"
                : "Sign in →"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/signup">Create one</Link>
        </p>
      </section>
    </main>
  );
}
