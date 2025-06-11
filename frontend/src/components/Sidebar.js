import React from "react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
// import { IoHome } from "react-icons/io5";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "sidebar-link active" : "sidebar-link";

  const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
      logout();
      navigate("/login");
  };

  const [avatar, setAvatar] = useState(
    localStorage.getItem("selectedAvatar") || "user-icon.png"
  );

  useEffect(() => {
    const handleStorageChange = () => {
      const updated = localStorage.getItem("selectedAvatar") || "user-icon.png";
      setAvatar(updated);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className={`sidebar ${isOpen ? "show" : "hidden"}`}>
      <div className="sidebar-content">
        <div className="sidebar-links">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src={"paros-mate-logo.png"} alt="ParosMate Logo" className="sidebar-logo" />
            <h2 className="sidebar-title">ParosMate</h2>
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>×</button>
        </div>

        {/* <NavLink to="/profile" className={isActive("/profile")}>
          <img src="user-icon.png" alt="User Logo" className="link-icon" />
          <span className="link-text">Profile</span>
        </NavLink> */}

        <NavLink to="/profile" className={isActive("/profile")}>
          <img src={`/avatars/${avatar}`} alt="User Logo" className="link-icon" />
          <span className="link-text">Profile</span>
        </NavLink>

        <NavLink to="/" className={isActive("/")}>
          <img src="home-icon-small.png" alt="Home Logo" className="link-icon" />
          <span className="link-text">Home</span>
        </NavLink>

        <NavLink to="/parosgpt" className={isActive("/parosgpt")}>
          <img src="parosgpt-logo-transparent.png" alt="ParosGPT Logo" className="link-icon" />
          <span className="link-text">ParosGPT</span>
        </NavLink>

        <NavLink to="/itinerarybuilder" className={isActive("/itinerarybuilder")}>
          <img src="itinerary-icon.png" alt="Itinerary Logo" className="link-icon" />
          <span className="link-text">Itinerary Builder</span>
        </NavLink>

        <NavLink to="/smart-guide" className={isActive("/smart-guide")}>
          <img src="smart-guide-icon.png" alt="Smart Guide Logo" className="link-icon" />
          <span className="link-text">Smart Guide</span>
        </NavLink>

        <NavLink to="/map-explorer" className={isActive("/map-explorer")}>
          <img src="map-explorer-icon.png" alt="Map Explorer Logo" className="link-icon" />
          <span className="link-text">Map Explorer</span>
        </NavLink>

        <NavLink to="/weather-forecast" className={isActive("/weather-forecast")}>
          <img src="weather-icon.png" alt="Weather Forecast Logo" className="link-icon" />
          <span className="link-text">Weather Forecast</span>
        </NavLink>

        <NavLink to="/reviews" className={isActive("/reviews")}>
          <img src="reviews-icon.png" alt="Reviews Logo" className="link-icon" />
          <span className="link-text">Smart Reviews</span>
        </NavLink>
        </div>

        {/* <NavLink to="/itineraryform" className={isActive("/itineraryform")}>
          <span className="link-text">💬 Component Test</span>
        </NavLink> */}

        {/* 🔽 Logout pushed below main links, above footer */}
        <div className="sidebar-link logout-link" onClick={handleLogout}>
          <img src="/logout-icon.png" alt="Logout" className="link-icon" />
          <span className="link-text">Logout</span>
        </div>



        <div className="sidebar-footer">
          Powered by <a className="queryble-link" href="https://queryble.ai">Queryble</a>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
