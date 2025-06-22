import React, { useState } from "react";
import { FaHospitalSymbol } from "react-icons/fa";
import { FaClinicMedical, FaHospital, FaDog, FaUserNurse, FaTools, FaSwimmer, FaShieldAlt } from "react-icons/fa";
import { RxReset } from "react-icons/rx";
import { FaRegAddressBook } from "react-icons/fa";
import { MdOutlineLocalPhone } from "react-icons/md";
import { GrStatusCriticalSmall } from "react-icons/gr";
import { FaDirections } from "react-icons/fa";
import "./QuickServices.css";

const categories = [
  { label: " Pharmacies", type: "pharmacy", icon: <FaClinicMedical /> },
  { label: " Hospitals", type: "hospital", icon: <FaHospital /> },
  { label: " Vets", type: "veterinary_care", icon: <FaDog /> },
  { label: " Tech Support", type: "electrician", icon: <FaTools /> },
  { label: " Lifeguards", type: "fire_station", icon: <FaSwimmer /> },
  { label: " Police", type: "police", icon: <FaShieldAlt /> },
];

function QuickServices() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(() => {
  const saved = localStorage.getItem("quickservices_results");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedType, setSelectedType] = useState(() => {
    return localStorage.getItem("quickservices_selectedType") || null;
  });


    const fetchPlaces = async (type) => {
        setLoading(true);
        setSelectedType(type);

        try {
            const res = await fetch(`http://localhost:8000/quick_services?type=${type}`);
            const data = await res.json();

            if (Array.isArray(data)) {
            setResults(data);
            localStorage.setItem("quickservices_results", JSON.stringify(data));
            localStorage.setItem("quickservices_selectedType", type);
            } else {
            console.warn("Unexpected response:", data);
            setResults([]);
            localStorage.removeItem("quickservices_results");
            }
        } catch (error) {
            console.error("Failed to fetch services:", error);
            setResults([]);
            localStorage.removeItem("quickservices_results");
        }

        setLoading(false);
    };



  return (
    <div className="quick-services-container">
      <div className="quick-header">
        <img src="/quick-services-icon.png" alt="Quick Services Icon" className="quick-header-icon" />
        <h1 className="quick-header-title">Quick Services</h1>
      </div>
      <p className="quick-subtitle">Essential help around Paros, right when you need it.</p>

      <div className="quick-category-buttons">
        {categories.map(({ label, type, icon }) => (
          <button
            key={type}
            className={selectedType === type ? "active" : ""}
            onClick={() => fetchPlaces(type)}
          >
            <span className="category-icon">{icon}</span>
            <span className="category-label">{label}</span>
          </button>
        ))}

        
      </div>

      <div className="quick-reset-wrapper">
        <button
            className="reset-button"
            onClick={() => {
            localStorage.removeItem("quickservices_results");
            localStorage.removeItem("quickservices_selectedType");
            setResults([]);
            setSelectedType(null);
            }}
        >
            <RxReset /> Reset
        </button>
      </div>

      {loading ? (
        <div className="loading-bar-wrapper">
            <p className="loading-message">Loading results...</p>
            <div className="loading-bar"></div>
        </div>
      ) : (
        <div className="quick-results-list">
          {results.length === 0 && selectedType && (
            <p className="no-results">No results found in Paros.</p>
          )}
          {results.map((place) => (
            <div key={place.id} className="quick-card">
              <h3>{place.name}</h3>
              <p><strong><FaRegAddressBook /> Address: </strong>{place.address}</p>
              {place.phone && (
                <p><strong><MdOutlineLocalPhone /> Phone:</strong> {place.phone}</p>
              )}
              {place.open_now !== undefined && (
                <p><strong><GrStatusCriticalSmall /> Status:</strong> {place.open_now ? "🟢 Open" : "🔴 Closed"}</p>
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  place.name
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="directions-btn"
              >
                <FaDirections /> Open in Maps
              </a>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuickServices;
