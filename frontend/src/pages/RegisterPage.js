// RegisterPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginRegister.css";

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      alert("Account created! You can now log in.");
      navigate("/login");
    } else {
      alert("Email already in use.");
    }
  };

  return (
    <div className="auth-page">
        <div className="auth-background">
            <div className="auth-wrapper">
                <div className="auth-header">
                  <img src="/paros-mate-logo.png" alt="ParosMate Logo" className="auth-logo" />
                  <h2>Register</h2>
                </div>
                <form onSubmit={handleRegister}>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                    <button type="submit">Register</button>
                    <p onClick={() => navigate("/login")} className="switch-link">Already have an account? Log in</p>
                </form>
            </div>
        </div>
    </div>
  );
}

export default RegisterPage;
