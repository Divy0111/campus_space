
import React from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  return (
    <main className="simple-page">
      <section className="auth-panel">
        <span className="eyebrow">ACCOUNT RECOVERY</span>
        <h2>Forgot your password?</h2>
        <p className="muted">
          Password recovery is not configured yet. Contact your
          campus administrator to verify your identity and restore access.
        </p>
        <Link className="primary-btn full-btn button-link" to="/login">
          Back to login
        </Link>
      </section>
    </main>
  );
}
