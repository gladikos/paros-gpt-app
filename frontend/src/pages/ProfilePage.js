// ProfilePage.js
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { FaEye, FaFilePdf } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
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

//   const handleSavePDF = async (itineraryContent, index) => {
//         const pdf = new jsPDF("p", "pt", "a4");
//         const element = document.getElementById(`itinerary-content-${index}`);

//         if (element) {
//             const canvas = await html2canvas(element, { scale: 2 });
//             const imgData = canvas.toDataURL("image/png");

//             const imgProps = pdf.getImageProperties(imgData);
//             const pdfWidth = pdf.internal.pageSize.getWidth();
//             const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

//             pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//             pdf.save(`itinerary-${index + 1}.pdf`);
//         }
//     };

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
      <h1 className="profile-header">Profile Page</h1>

      <div className="section">
        <div className="section-header">
          <h2>User Summary</h2>
          <h4>Explore your personal information.</h4>
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
          <h2>Saved Itineraries</h2>
          <h4>Explore your saved itineraries. If you want you can download them locally to your computer.</h4>
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
