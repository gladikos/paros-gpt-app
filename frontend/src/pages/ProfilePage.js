// ProfilePage.js
import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { FaEye, FaFilePdf } from "react-icons/fa";
import { FaTrash, FaUser, FaMapMarkedAlt } from "react-icons/fa";
import html2pdf from "html2pdf.js";
import { marked } from "marked";
import "./ProfilePage.css";
import axios from "axios";


function ProfilePage() {
  const [user, setUser] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [showSummary, setShowSummary] = useState(true);
  const [showItineraries, setShowItineraries] = useState(false);
  const [expandedItineraryIndex, setExpandedItineraryIndex] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItineraryId, setSelectedItineraryId] = useState(null);

  // const avatarOptions = [
  // "old-man.png",
  // "old-woman.png",
  // "man.png",
  // "woman.png",
  // "young-man.png",
  // "young-woman.png",
  // "boy.png",
  // "girl.png",
  // "user-icon.png"
  // ];

  const avatarOptions = [
    { file: "old-man.png", label: "Grandpa" },
    { file: "old-woman.png", label: "Grandma" },
    { file: "man.png", label: "Father" },
    { file: "woman.png", label: "Mother" },
    { file: "young-man.png", label: "Teenage son" },
    { file: "young-woman.png", label: "Teenage daughter" },
    { file: "boy.png", label: "Son" },
    { file: "girl.png", label: "Daughter" },
    { file: "user-icon.png", label: "Default" },
  ];
  const [avatar, setAvatar] = useState("user-icon.png");
  const [showAvatars, setShowAvatars] = useState(false);

  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowAvatars(false);
      }
    };

    if (showAvatars) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAvatars]);

  // Load avatar from localStorage on page load
  useEffect(() => {
    const savedAvatar = localStorage.getItem("selectedAvatar");
    if (savedAvatar) {
      setAvatar(savedAvatar);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProfile = async () => {
      const res = await fetch("http://localhost:8000/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUser(await res.json());
    };

    const fetchItineraries = async () => {
      const res = await fetch("http://localhost:8000/user/itineraries", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setItineraries(await res.json());
    };

    fetchProfile();
    fetchItineraries();

  }, []);

const handleDeleteItinerary = async (itineraryId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:8000/itineraries/${itineraryId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setItineraries((prev) => prev.filter((it) => it.id !== itineraryId));
  } catch (error) {
    console.error("Failed to delete itinerary:", error);
  }
};

const handleSavePDF = (content, index) => {
  const container = document.createElement("div");
  container.className = "itinerary-pdf-content";
//   container.innerHTML = content.replaceAll("\n", "<br>");
  // Convert markdown to HTML
  const html = marked.parse(content);
  container.innerHTML = html;

  const opt = {
    margin:       1,
    filename:     `itinerary-${index + 1}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(container).save();
};

  return (
    <div className="profile-container">

      <div className="profile-header">
        <div className="avatar-title">
          <div className="avatar-container">
            <div className="tooltip-wrapper">
              <img
                src={`/avatars/${avatar}`}
                alt="Avatar"
                className="profile-avatar"
                onClick={() => setShowAvatars(!showAvatars)}
              />
              <span className="custom-tooltip">Click to edit avatar</span>
            </div>

            {showAvatars && (
              <div className="avatar-popup" ref={popupRef}>
                <button className="close-avatar-popup" onClick={() => setShowAvatars(false)}>×</button>
                {avatarOptions.map(({ file, label })  => (
                  <div key={file} className="avatar-option">
                    <img
                      key={file}
                      src={`/avatars/${file}`}
                      alt={label}
                      onClick={() => {
                        setAvatar(file);
                        localStorage.setItem("selectedAvatar", file);
                        window.dispatchEvent(new Event("storage")); // update sidebar
                        setShowAvatars(false);
                      }}
                    />
                    <span className="avatar-tooltip">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <h1>Profile Page</h1>
        </div>
        {/* {showAvatars && (
          <div className="avatar-options">
            {avatarOptions.map((opt) => (
              <img
                key={opt}
                src={`/avatars/${opt}`}
                alt={opt}
                className="avatar-option"
                onClick={() => {
                  setAvatar(opt);
                  localStorage.setItem("selectedAvatar", opt);
                  window.dispatchEvent(new Event("storage"));  // 🚀 force sidebar to refresh
                  setShowAvatars(false);
                }}
              />
            ))}
          </div>
        )} */}
      </div>


      <div className="section">
        <div className="section-header">
          <h2><FaUser /> User Summary</h2>
          {/* <h4>Explore your personal information.</h4> */}
          <button onClick={() => setShowSummary(!showSummary)}>
            {showSummary ? "▲" : "▼"}
          </button>
        </div>
        {showSummary && user && (
          <div className="section-content">
            <p><strong>Name:</strong> {user.name} {user.surname}</p>
            <p><strong>Mobile:</strong> {user.mobile}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2><FaMapMarkedAlt /> Saved Itineraries</h2>
          {/* <h4>Explore your saved itineraries. If you want you can download them locally to your computer.</h4> */}
          <button onClick={() => setShowItineraries(!showItineraries)}>
            {showItineraries ? "▲" : "▼"}
          </button>
        </div>
        {showItineraries && (
          <div className="section-content">
            {itineraries.length === 0 ? (
              <p>No itineraries saved yet.</p>
            ) : (
              itineraries.map((it, idx) => (
                <div key={it.id} className="itinerary-card">
                  <h4>Trip #{idx + 1} - {it.days} days</h4>
                  <p><strong>Group:</strong> {it.adults} adults, {it.children} children</p>
                  <p><strong>Budget:</strong> {it.budget}</p>
                  <p><strong>Transportation:</strong> {it.transportation}</p>
                  <p><strong>Created:</strong> {new Date(it.createdAt).toLocaleDateString()}</p>

                  <div className="itinerary-buttons">
                    <div className="tooltip-wrapper">
                        <button
                            className="icon-button"
                            onClick={() =>
                            setExpandedItineraryIndex(
                                idx === expandedItineraryIndex ? null : idx
                            )
                            }
                        >
                            <FaEye />
                        </button>
                        <span className="custom-tooltip">
                            {idx === expandedItineraryIndex ? "Hide itinerary" : "View itinerary"}
                        </span>
                    </div>

                    <div className="tooltip-wrapper">
                        <button
                        className="icon-button"
                        onClick={() => handleSavePDF(it.content, idx)}
                        >
                        <FaFilePdf />
                        </button>
                        <span className="custom-tooltip">Download as PDF</span>
                    </div>

                    <div className="tooltip-wrapper">
                        <button
                            className="icon-button"
                            onClick={() => {
                                setSelectedItineraryId(it.id); // store the ID
                                setShowConfirm(true);          // show confirmation box
                            }}
                            >
                            <FaTrash />
                        </button>
                        <span className="custom-tooltip">Delete itinerary</span>
                    </div>
                  </div>

                  

                    {idx === expandedItineraryIndex && (
                    <div
                        id={`itinerary-content-${idx}`}
                        className="itinerary-pdf-content"
                    >
                        <ReactMarkdown>{it.content}</ReactMarkdown>
                    </div>
                    )}

                </div>
              ))
            )}
          </div>
        )}
      </div>
      {showConfirm && (
        <div className="confirm-overlay">
            
            <div className="confirm-box">
                <h3>Confirmation</h3>
                <p>Are you sure you want to delete this itinerary?</p>
                <div className="confirm-buttons">
                    <button
                        onClick={() => {
                            if (selectedItineraryId !== null) {
                            handleDeleteItinerary(selectedItineraryId);
                            }
                            setShowConfirm(false);
                            setSelectedItineraryId(null);
                        }}
                        >Yes, delete</button>
                    <button onClick={() => setShowConfirm(false)}>Cancel</button>
                </div>
            </div>
        </div>
        )}
    </div>
  );
}

export default ProfilePage;
