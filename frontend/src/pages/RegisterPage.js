// RegisterPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Account created! You can now log in.");
        navigate("/login");
      } else {
        const error = await res.json();
        alert(error.detail || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again.");
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
            <p onClick={() => navigate("/login")} className="switch-link">
              Already have an account? Log in
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
