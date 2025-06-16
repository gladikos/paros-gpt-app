// ProfilePage.js
import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { FaEye, FaFilePdf } from "react-icons/fa";
import { FaTrash, FaUser, FaMapMarkedAlt, FaSearchLocation } from "react-icons/fa";
import { MdFavorite } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
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
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showConfirmFavorite, setShowConfirmFavorite] = useState(false);
  const [selectedFavoriteId, setSelectedFavoriteId] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });

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
    // const token = localStorage.getItem("token");

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUser(await res.json());
    };

    const fetchItineraries = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/user/itineraries", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setItineraries(await res.json());
    };

    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/user/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setFavorites(await res.json());
    };

    fetchProfile();
    fetchItineraries();
    fetchFavorites();

  }, []);

const handleDeleteItinerary = async (itineraryId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:8000/itineraries/${itineraryId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setItineraries((prev) => prev.filter((it) => it.id !== itineraryId));
    showNotification("Itinerary deleted successfully", "success");
  } catch (error) {
    showNotification("Failed to delete", "error");
  }
};

const confirmDeleteFavorite = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:8000/favorites/${selectedFavoriteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFavorites((prev) => prev.filter((f) => f.id !== selectedFavoriteId));
    showNotification("Favorite deleted successfully", "success");
  } catch (err) {
    showNotification("Failed to delete", "error");
  } finally {
    setShowConfirmFavorite(false);
    setSelectedFavoriteId(null);
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

const showNotification = (message, type = "success") => {
  setNotification({ message, type });

  setTimeout(() => {
    setNotification({ message: "", type: "" });
  }, 20000);
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
      </div>


      <div className="section">
        <div className="section-header">
          <div className="section-header-text">
            <h2><FaUser  size={30}/> User Summary</h2>
            <p className="section-subtitle">A complete summary of your details.</p>
          </div>
          <button onClick={() => setShowSummary(!showSummary)}>
            {showSummary ? "▲" : "▼"}
          </button>
        </div>
        {showSummary && user && (
          <div className="section-content">
            <div className="user-cards-container">
              <div className="user-card"><strong>Name:</strong> {user.name} {user.surname}</div>
              <div className="user-card"><strong>Mobile:</strong> {user.mobile}</div>
              <div className="user-card"><strong>Email:</strong> {user.email}</div>
              {user.created_at && (
                <div className="user-card">
                  <strong>Member Since:</strong>{" "}
                  {new Date(user.created_at).toLocaleDateString("en-GB")}
                </div>
              )}
              <div className="user-card">
                <strong>Saved Itineraries:</strong> {itineraries.length}
              </div>

              <div className="user-card">
                <strong>Favorite Places:</strong> {favorites.length}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <div className="section-header-text">
            <h2><FaMapMarkedAlt size={35}/> Saved Itineraries ({itineraries.length})</h2>
            <p className="section-subtitle">These are your custom trips created using the itinerary builder.</p>
          </div>
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

      <div className="section">
        <div className="section-header">
          <div className="section-header-text">
            <h2><MdFavorite size={35}/> Favourite Places ({favorites.length})</h2>
            <p className="section-subtitle">Your handpicked gems across Paros — saved for easy access.</p>
          </div>
          <button onClick={() => setShowFavorites(!showFavorites)}>
            {showFavorites ? "▲" : "▼"}
          </button>
        </div>

        {showFavorites && (
          <div className="section-content">
            {favorites.length === 0 ? (
              <p>No favourite places saved yet.</p>
            ) : (
              favorites.map((f, idx) => (
                <div key={f.id} className="itinerary-card">
                  <h4>{f.name}</h4>
                  <p><strong>Description:</strong> {f.description}</p>
                  <p><strong>Coordinates:</strong> ({f.latitude}, {f.longitude})</p>
                  <p><strong>Saved:</strong> {new Date(f.created_at).toLocaleDateString()}</p>
                  <div className="itinerary-buttons">
                    <div className="tooltip-wrapper">
                      <button
                        className="icon-button"
                        onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(f.name + " Paros")}`, "_blank")}
                      >
                        <FaSearchLocation />
                      </button>
                      <span className="custom-tooltip">Search for this place online</span>
                    </div>
                    <div className="tooltip-wrapper">
                      <button
                        className="icon-button"
                        onClick={() => {
                          setSelectedFavoriteId(f.id);
                          setShowConfirmFavorite(true);
                        }}
                      >
                        <FaTrash />
                      </button>
                      <span className="custom-tooltip">Remove from favourites</span>
                    </div>
                  </div>
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

      {showConfirmFavorite && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Confirmation</h3>
            <p>Are you sure you want to remove this place from your favourites?</p>
            <div className="confirm-buttons">
              <button onClick={confirmDeleteFavorite}>Yes, remove</button>
              <button onClick={() => setShowConfirmFavorite(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {notification.message && (
        <div className={`notification-popup ${notification.type}`}>
          <span>{notification.message}</span>
          <button className="notification-dismiss" onClick={() => setNotification({ message: "", type: "" })}>
            <IoMdClose />
          </button>
        </div>
      )}

    </div>
  );
}

export default ProfilePage;
