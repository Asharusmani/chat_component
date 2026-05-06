import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .auth-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #080810;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }
  .auth-bg-orb1 {
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
    top: -200px; left: -200px;
    pointer-events: none;
  }
  .auth-bg-orb2 {
    position: absolute;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
    bottom: -150px; right: -150px;
    pointer-events: none;
  }
  .auth-bg-grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }
  .auth-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 440px;
    margin: 0 16px;
    background: rgba(15, 15, 25, 0.85);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    padding: 44px 40px;
    backdrop-filter: blur(20px);
    box-shadow: 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05);
    animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .auth-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 32px;
  }
  .auth-brand-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    box-shadow: 0 8px 24px rgba(99,102,241,0.4);
  }
  .auth-brand-name {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: #f1f1ff;
    letter-spacing: -0.5px;
  }
  .auth-brand-badge {
    font-size: 10px;
    font-weight: 500;
    color: #6366f1;
    background: rgba(99,102,241,0.12);
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 20px;
    padding: 2px 8px;
    margin-left: 4px;
  }
  .auth-heading {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 700;
    color: #f1f1ff;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }
  .auth-subheading {
    font-size: 14px;
    color: #6b6b8a;
    margin-bottom: 30px;
    line-height: 1.5;
  }
  .auth-tabs {
    display: flex;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 28px;
    gap: 4px;
  }
  .auth-tab {
    flex: 1;
    padding: 9px 0;
    border-radius: 9px;
    border: none;
    cursor: pointer;
    font-size: 13.5px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    background: transparent;
    color: #6b6b8a;
    transition: all 0.2s ease;
  }
  .auth-tab:hover { color: #a0a0c0; }
  .auth-tab.active {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    box-shadow: 0 4px 14px rgba(99,102,241,0.35);
  }
  .auth-name-row {
    display: flex;
    gap: 12px;
  }
  .auth-name-row .auth-field {
    flex: 1;
  }
  .auth-field { margin-bottom: 18px; }
  .auth-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #8080a0;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .auth-input-wrap { position: relative; }
  .auth-input-icon {
    position: absolute;
    left: 14px; top: 50%;
    transform: translateY(-50%);
    font-size: 15px;
    opacity: 0.4;
    pointer-events: none;
  }
  .auth-input {
    width: 100%;
    padding: 13px 14px 13px 40px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: #f1f1ff;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    box-sizing: border-box;
    transition: all 0.2s ease;
  }
  .auth-input::placeholder { color: rgba(255,255,255,0.2); }
  .auth-input:focus {
    border-color: rgba(99,102,241,0.6);
    background: rgba(99,102,241,0.06);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
  }
  .auth-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 10px;
    padding: 10px 14px;
    color: #f87171;
    font-size: 13px;
    margin-bottom: 16px;
  }
  .auth-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    margin-top: 6px;
    transition: all 0.25s ease;
    box-shadow: 0 6px 24px rgba(99,102,241,0.4);
    position: relative;
    overflow: hidden;
  }
  .auth-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .auth-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 32px rgba(99,102,241,0.5); }
  .auth-btn:hover::after { opacity: 1; }
  .auth-btn:active { transform: translateY(0); }
  .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .auth-switch {
    text-align: center;
    color: #6b6b8a;
    font-size: 13.5px;
    margin-top: 4px;
  }
  .auth-switch-link {
    color: #818cf8;
    cursor: pointer;
    font-weight: 500;
    transition: color 0.2s;
  }
  .auth-switch-link:hover { color: #a5b4fc; text-decoration: underline; }
  .auth-footer {
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.05);
    display: flex;
    justify-content: center;
    gap: 20px;
  }
  .auth-footer-link {
    font-size: 12px;
    color: rgba(255,255,255,0.2);
    cursor: pointer;
    transition: color 0.2s;
  }
  .auth-footer-link:hover { color: rgba(255,255,255,0.45); }
`;

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false); // ← add karo


  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!form.firstName || !form.lastName || !form.email || !form.password) {
          setError("Sab fields fill karein");
          setLoading(false);
          return;
        }
        await signUp(form.firstName, form.lastName, form.email, form.password);
      } else {
        if (!form.email || !form.password) {
          setError("Email aur password daalen");
          setLoading(false);
          return;
        }
        await signIn(form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Kuch masla hua, dobara try karein");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="auth-wrapper">
        <div className="auth-bg-orb1" />
        <div className="auth-bg-orb2" />
        <div className="auth-bg-grid" />

        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-brand-icon">💬</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="auth-brand-name">NexChat</span>
              <span className="auth-brand-badge">BETA</span>
            </div>
          </div>

          <h1 className="auth-heading">
            {mode === "signin" ? "Wapas aamdeed 👋" : "Shuru karein"}
          </h1>
          <p className="auth-subheading">
            {mode === "signin"
              ? "Apne account mein sign in karein aur baat-cheet shuru karein"
              : "Muft account banao aur team se connect ho jao"}
          </p>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "signin" ? "active" : ""}`}
              onClick={() => { setMode("signin"); setError(""); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => { setMode("signup"); setError(""); }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="auth-name-row">
                <div className="auth-field">
                  <label className="auth-label">First Name</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">👤</span>
                    <input
                      name="firstName"
                      type="text"
                      placeholder="Pehla naam"
                      value={form.firstName}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Last Name</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">👤</span>
                    <input
                      name="lastName"
                      type="text"
                      placeholder="Aakhri naam"
                      value={form.lastName}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  name="email"
                  type="email"
                  placeholder="aap@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="auth-input"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    opacity: 0.5,
                    padding: 0,
                    lineHeight: 1,
                    color: "#f1f1ff",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0.5"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {mode === "signup" && (
                <p style={{ fontSize: "11px", color: "#6b6b8a", marginTop: "6px", marginBottom: 0 }}>
                  Min 8 characters, ek uppercase, ek number, ek special character (!@#$%)
                </p>
              )}
            </div>

            {error && (
              <div className="auth-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading
                ? "Thoda wait karein..."
                : mode === "signin"
                  ? "Sign In karein →"
                  : "Account Banao →"}
            </button>
          </form>

          <p className="auth-switch" style={{ marginTop: 20 }}>
            {mode === "signin" ? "Account nahi hai? " : "Pehle se account hai? "}
            <span
              className="auth-switch-link"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
            >
              {mode === "signin" ? "Sign Up karein" : "Sign In karein"}
            </span>
          </p>

          <div className="auth-footer">
            <span className="auth-footer-link">Privacy</span>
            <span className="auth-footer-link">Terms</span>
            <span className="auth-footer-link">Help</span>
          </div>
        </div>
      </div>
    </>
  );
}