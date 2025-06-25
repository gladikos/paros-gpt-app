import React, { useState, useRef, useEffect } from "react";
import "./ItineraryBuilder.css";
import ReactMarkdown from "react-markdown";
import { FaFilePdf } from "react-icons/fa";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { FaCheckCircle, FaTimes } from "react-icons/fa";
import { FaSave } from "react-icons/fa";
import axios from "axios";

// Helpers to initialize from localStorage
const getInitialFormData = () => {
  const saved = localStorage.getItem("itinerary_form");
  return saved
    ? JSON.parse(saved)
    : {
        days: "",
        adults: "",
        children: "",
        transportation: "",
        ageRange: "",
        budget: "",
        priorities: "",
      };
};

const getInitialOutput = () => {
  const saved = localStorage.getItem("itinerary_output");
  return saved ? JSON.parse(saved) : null;
};

const getInitialExpanded = () => {
  return localStorage.getItem("itinerary_expanded") === "true";
};

const ItineraryBuilder = () => {
  const [formData, setFormData] = useState(getInitialFormData);
  const [output, setOutput] = useState(getInitialOutput);
  const [outputExpanded, setOutputExpanded] = useState(getInitialExpanded);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  const outputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("itinerary_form", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (output) {
      localStorage.setItem("itinerary_output", JSON.stringify(output));
    }
  }, [output]);

  useEffect(() => {
    localStorage.setItem("itinerary_expanded", outputExpanded);
  }, [outputExpanded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagClick = (tag) => {
    setFormData((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(tag)
        ? prev.priorities
        : `${prev.priorities} ${tag}`.trim(),
    }));
  };

  const handleReset = () => {
    const empty = {
      days: "",
      adults: "",
      children: "",
      transportation: "",
      ageRange: "",
      budget: "",
      priorities: "",
    };
    setFormData(empty);
    setOutput(null);
    localStorage.removeItem("itinerary_form");
    localStorage.removeItem("itinerary_output");
    localStorage.removeItem("itinerary_expanded");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/generate-itinerary", {
        days: parseInt(formData.days),
        adults: parseInt(formData.adults),
        children: parseInt(formData.children || 0),
        transportation: formData.transportation,
        ageRange: formData.ageRange,
        budget: formData.budget,
        priorities: formData.priorities,
      });

      setOutput(response.data);
      setOutputExpanded(true);
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (error) {
      setOutput({ error: "Failed to generate itinerary. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItinerary = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:8000/save-itinerary",
        {
          ...formData,
          content: output.itinerary,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotification({ type: "success", message: "Itinerary saved to your profile!" });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 20000);
    } catch (err) {
      setNotification({ type: "error", message: "Failed to save itinerary. Please try again." });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 20000);
    }
  };

  return (
    <>
      {showNotification && (
        <div className={`notification-bar ${notification.type}`}>
          <span>{notification.message}</span>
          <button className="close-btn" onClick={() => setShowNotification(false)}>
            ×
          </button>
        </div>
      )}

      <div className="page-container">
        <div className="page-header">
          <img src="itinerary-icon.png" alt="Itinerary Icon" className="page-logo" />
          <h1>Itinerary Builder</h1>
        </div>

        <div className="itinerary-form-container">
          <form className="itinerary-form" onSubmit={handleSubmit}>
            <h2>Plan your trip</h2>

            <div className="form-row three">
              <div className="form-group">
                <label>Days</label>
                <input
                  type="number"
                  name="days"
                  value={formData.days}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Adults</label>
                <input
                  type="number"
                  name="adults"
                  value={formData.adults}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Children</label>
                <input
                  type="number"
                  name="children"
                  value={formData.children}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row three">
              <div className="form-group">
                <label>Transportation</label>
                <select
                  name="transportation"
                  value={formData.transportation}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="rented car">Rented Car</option>
                  <option value="bus">Bus</option>
                  <option value="taxi">Taxi</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>
              <div className="form-group">
                <label>Age Range</label>
                <select
                  name="ageRange"
                  value={formData.ageRange}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="18-25">18–25</option>
                  <option value="26-35">26–35</option>
                  <option value="36-50">36–50</option>
                  <option value="50+">50+</option>
                </select>
              </div>
              <div className="form-group">
                <label>Budget</label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="form-row full">
              <div className="form-group full">
                <label>Priorities</label>
                <textarea
                  name="priorities"
                  value={formData.priorities}
                  onChange={handleChange}
                  placeholder="Mention any special preferences..."
                />
              </div>
            </div>

            <div className="tags">
              {["beach", "food", "bars", "clubs", "hiking", "culture", "romantic"].map((tag) => (
                <button type="button" key={tag} onClick={() => handleTagClick(tag)}>
                  {tag}
                </button>
              ))}
            </div>

            <div className="form-buttons">
              <button type="submit" className="generate" disabled={loading}>
                {loading ? <span className="spinner"></span> : "Generate"}
              </button>
              <button type="button" className="reset" onClick={handleReset} disabled={loading}>
                Reset
              </button>
            </div>
          </form>
        </div>

        {output && (
          <div style={{ width: "100%", maxWidth: "900px" }}>
            <div ref={outputRef} className="output-wrapper">
              <div className="output-header">
                <h3>Personalized Itinerary</h3>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <div className="tooltip-container">
                    <button className="open-btn" onClick={handleSaveItinerary}>
                      <FaSave size={20} />
                    </button>
                    <span className="tooltip-text">Save this itinerary to your profile</span>
                  </div>

                  <div className="tooltip-container">
                    <button
                      className="open-btn"
                      onClick={() => setOutputExpanded((prev) => !prev)}
                    >
                      {outputExpanded ? (
                        <FaChevronUp size={20} />
                      ) : (
                        <FaChevronDown size={20} />
                      )}
                    </button>
                    <span className="tooltip-text">
                      {outputExpanded ? "Collapse itinerary" : "Expand itinerary"}
                    </span>
                  </div>
                </div>
              </div>

              {outputExpanded && (
                <div className="output-card">
                  {output.error ? (
                    <p className="error">{output.error}</p>
                  ) : (
                    <div className="itinerary-text">
                      {(output.itinerary || "")
                        .split(/### /)
                        .filter(Boolean)
                        .map((daySection, idx) => (
                          <div key={idx} className="day-card">
                            <ReactMarkdown>{`### ${daySection.trim()}`}</ReactMarkdown>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ItineraryBuilder;
