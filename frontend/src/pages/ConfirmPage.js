// ConfirmPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CognitoUser } from "amazon-cognito-identity-js";
import { userPool } from "../cognitoConfig";
import "./LoginRegister.css";

function ConfirmPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const handleConfirm = (e) => {
    e.preventDefault();

    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    user.confirmRegistration(code, true, (err, result) => {
      if (err) {
        alert("Confirmation failed: " + err.message);
      } else {
        alert("Email confirmed! You can now log in.");
        navigate("/login");
      }
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-wrapper">
          <div className="auth-header">
            <img src="/paros-mate-logo.png" alt="ParosMate Logo" className="auth-logo" />
            <h2>Confirm Your Account</h2>
          </div>
          <form onSubmit={handleConfirm}>
            <input
              type="email"
              placeholder="Email used to register"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button type="submit">Confirm</button>
            <p onClick={() => navigate("/login")} className="switch-link">
              Already confirmed? Log in
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ConfirmPage;
