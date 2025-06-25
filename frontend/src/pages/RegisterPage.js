// RegisterPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { userPool } from "../cognitoConfig";
import "./LoginRegister.css";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    mobile: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = (e) => {
    e.preventDefault();

    const { name, surname, mobile, email, password } = formData;

    const attributeList = [
      new CognitoUserAttribute({ Name: "name", Value: name }),
      new CognitoUserAttribute({ Name: "given_name", Value: name }),
      new CognitoUserAttribute({ Name: "family_name", Value: surname }),
      new CognitoUserAttribute({ Name: "phone_number", Value: mobile }), // Format: +30xxxxxxxxxx
      new CognitoUserAttribute({ Name: "birthdate", Value: "1990-01-01" }), // Placeholder if required
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        alert(err.message || JSON.stringify(err));
        return;
      }

      alert("Registered! Check your email for confirmation.");
      navigate("/confirm");
    });
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
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="First Name"
              required
            />
            <input
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              placeholder="Last Name"
              required
            />
            <input
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Mobile Number"
              required
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            <button type="submit">Register</button>
            <p
              onClick={() => navigate("/login")}
              className="switch-link"
            >
              Already have an account? Log in
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
