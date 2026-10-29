
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    phone: ""
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      await signup(form);
      navigate("/login", {
        state: { message: "Account created successfully. Please log in." }
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Check your connection."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-layout signup-layout">
      <section className="auth-decoration">
        <span className="eyebrow">GET STARTED</span>
        <h1>Make room<br />for great ideas.</h1>
        <p>Create an account to request rooms and manage your bookings.</p>
        <div className="auth-decoration-icon">✦</div>
      </section>

      <section className="auth-panel">
        <span className="eyebrow">NEW ACCOUNT</span>
        <h2>Create your account</h2>
        <p className="muted">Fill in your details to get started.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Full name
            <input name="name" value={form.name} onChange={update}
              placeholder="Your full name" maxLength={80} required />
          </label>

          <label>
            College email
            <input type="email" name="email" value={form.email}
              onChange={update} placeholder="you@college.edu" required />
          </label>

          <label>
            Password
            <input type="password" name="password" value={form.password}
              onChange={update} placeholder="At least 8 characters"
              minLength={8} required />
          </label>

          <label>
            Department
            <input name="department" value={form.department}
              onChange={update} placeholder="e.g. ECE" maxLength={80} />
          </label>

          <label>
            Phone (optional)
            <input type="tel" name="phone" value={form.phone}
              onChange={update} placeholder="Contact number" maxLength={20} />
          </label>

          {error && <p className="form-message">{error}</p>}

          <button className="primary-btn full-btn" disabled={busy}>
            {busy ? "Creating account..." : "Create account →"}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
