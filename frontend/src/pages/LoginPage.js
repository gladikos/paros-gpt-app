// LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./LoginRegister.css";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("username", email);
    form.append("password", password);

    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      body: form,
    });

    if (res.ok) {
      const data = await res.json();
      login(email, data.access_token, remember);
      navigate("/");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="auth-page">
        <div className="auth-background">
            <div className="auth-wrapper">
                <div className="auth-header">
                  <img src="/paros-mate-logo.png" alt="ParosMate Logo" className="auth-logo" />
                  <h2>Welcome Back</h2>
                </div>
                <form onSubmit={handleLogin}>
                    <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    />
                    <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    />
                    <label>
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                    />
                    Remember me
                    </label>
                    <button type="submit">Log In</button>
                    <p
                    onClick={() => navigate("/register")}
                    className="switch-link"
                    >
                    No account? Register here
                    </p>
                </form>
            </div>
        </div>
    </div>
  );
}

export default LoginPage;
