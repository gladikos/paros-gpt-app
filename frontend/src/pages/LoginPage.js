// LoginPage.js
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import { userPool } from "../cognitoConfig";
import "./LoginRegister.css";

function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  if (user) return <Navigate to="/profile" replace />;

  const handleLogin = (e) => {
    e.preventDefault();

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (result) => {
        const token = result.getIdToken().getJwtToken();
        login(email, token, remember);
        navigate("/");
      },
      onFailure: (err) => {
        alert("Login failed: " + (err.message || JSON.stringify(err)));
      },
    });
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
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
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
