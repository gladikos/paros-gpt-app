// ProfilePage.js
import React, { useEffect, useState } from "react";
import "./LoginRegister.css";

function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        alert("Failed to fetch profile. Please log in again.");
      }
    };

    fetchProfile();
  }, []);

  if (!user) return <div className="auth-page">Loading profile...</div>;

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-wrapper">
          <h2>Your Profile</h2>
          <p><strong>Name:</strong> {user.name} {user.surname}</p>
          <p><strong>Mobile:</strong> {user.mobile}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
