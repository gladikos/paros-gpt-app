import React, { useState } from "react";
import "./ItineraryBuilder.css";
import { FaFilePdf, FaEnvelope } from "react-icons/fa";

function ItineraryBuilder() {
  const [formData, setFormData] = useState({
    days: "",
    adults: "",
    children: "",
    transportation: "",
    ageRange: "",
    budget: "",
    priorities: "",
  });

  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addPriority = (value) => {
    setFormData((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(value)
        ? prev.priorities
        : prev.priorities
        ? `${prev.priorities}, ${value}`
        : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      days: "",
      adults: "",
      children: "",
      transportation: "",
      ageRange: "",
      budget: "",
      priorities: "",
    });
    setItinerary("");
  };

  const generateItinerary = async () => {
    setLoading(true);
    const response = await fetch("http://localhost:8000/generate-itinerary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    setItinerary(data.itinerary);
    setLoading(false);
  };

  return (
    <div className="itinerary-container">
      <header className="itinerary-header">
        <img src="/itinerary-icon.png" alt="Itinerary Logo" />
        <h1>Itinerary Builder</h1>
      </header>

      <main className="itinerary-main">
        <section className="itinerary-form">
          <div className="form-header">
            <h2>Plan your trip</h2>
            <div className="form-buttons">
              <button className="generate" onClick={generateItinerary} disabled={loading}>
                {loading ? "Loading..." : "Generate"}
              </button>
              <button className="reset" onClick={resetForm}>Reset</button>
            </div>
          </div>
          <div className="form-scrollable">
            <div className="input-group">
              <input
                type="number"
                name="days"
                value={formData.days}
                onChange={handleChange}
                className={formData.days ? "filled" : ""}
              />
              <label className={formData.days ? "filled" : ""}>Number of Days</label>
              <small className="input-hint">
                Choose the number of days you are staying.
              </small>
            </div>


            <div className="input-row">
              <div className="input-group">
                <input
                  type="number"
                  name="adults"
                  value={formData.adults}
                  onChange={handleChange}
                  className={formData.adults ? "filled" : ""}
                />
                <label className={formData.adults ? "filled" : ""}>Adults</label>
                <small className="input-hint">
                  Choose the number of adults.
                </small>
              </div>

              <div className="input-group">
                <input
                  type="number"
                  name="children"
                  value={formData.children}
                  onChange={handleChange}
                  className={formData.children ? "filled" : ""}
                />
                <label className={formData.children ? "filled" : ""}>Children</label>
                <small className="input-hint">
                  Choose the number of children (if any).
                </small>
              </div>
            </div>


            <div className="input-group">
              <select
                name="transportation"
                value={formData.transportation}
                onChange={handleChange}
                className={formData.transportation ? "filled" : ""}
              >
                <option value="">--</option>
                <option value="rented car">Rented Car</option>
                <option value="own car">Own Car</option>
                <option value="taxi">Taxi</option>
                <option value="bus">Bus</option>
                <option value="bike">Bike</option>
              </select>
              <label className={formData.transportation ? "filled" : ""}>
                Transportation
              </label>
              <small className="input-hint">
                Choose how you’ll move around Paros: rented car, bus, taxi, etc.
              </small>
            </div>

            <div className="input-group">
              <select name="ageRange" value={formData.ageRange} onChange={handleChange} className={formData.ageRange ? "filled" : ""}>
                <option value="">--</option>
                <option value="18-26">18–26</option>
                <option value="26-32">26–32</option>
                <option value="32-45">32–45</option>
                <option value="40+">40+</option>
              </select>
              <label className="filled">Age Range</label>
              <small className="input-hint">
                Choose the average age range of the group.
              </small>
            </div>

            <div className="input-group">
              <select name="budget" value={formData.budget} onChange={handleChange} className={formData.budget ? "filled" : ""}>
                <option value="">--</option>
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
              </select>
              <label className="filled">Budget</label>
              <small className="input-hint">
                Choose the available budget for your trip.
              </small>
            </div>

            <div className="input-group">
              <div className="input-group priorities-group">
                <textarea
                  name="priorities"
                  value={formData.priorities}
                  onChange={handleChange}
                  className={formData.priorities ? "filled" : ""}
                />
                <label className={formData.priorities ? "filled" : ""}>Your Priorities</label>
                <small className="input-hint">Mention any special preferences, e.g. beaches, villages, relaxation, nightlife etc.</small>

                {formData.priorities && (
                  <button
                    type="button"
                    className="clear-input"
                    onClick={() => setFormData({ ...formData, priorities: "" })}
                    aria-label="Clear priorities"
                  >
                    &times;
                  </button>
                )}
              </div>

              <div className="priority-tags">
                {["beach", "food", "bars", "clubs", "hiking", "culture", "romantic"].map((tag) => (
                  <span key={tag} onClick={() => addPriority(tag)}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="itinerary-output">
          <div className="output-header">
            <h2>Your Custom Itinerary</h2>
            <div className="output-actions">
              <div className="tooltip">
                <FaFilePdf onClick={() => alert("Export to PDF coming soon")} />
                <span className="tooltip-text">Export PDF</span>
              </div>
              <div className="tooltip">
                <FaEnvelope onClick={() => alert("Send to Email coming soon")} />
                <span className="tooltip-text">Send to Email</span>
              </div>
            </div>
          </div>
          {itinerary &&
            itinerary
              .split(/(?=###\s*Day\s\d+:)/)
              .map((section, idx) =>
                section.trim() ? (
                  <div className="day-card" key={idx}>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: section
                          .trim()
                          .replace(/\*\*Morning\*\*/g, '<span class="highlight-time">Morning</span>')
                          .replace(/\*\*Afternoon\*\*/g, '<span class="highlight-time">Afternoon</span>')
                          .replace(/\*\*Evening\*\*/g, '<span class="highlight-time">Evening</span>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      }}
                    ></p>
                  </div>
                ) : null
              )}
        </section>
      </main>
    </div>
  );
}

export default ItineraryBuilder;
