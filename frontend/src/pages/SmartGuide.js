import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ReactMarkdown from "react-markdown";
import { useRef, useEffect } from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import "./SmartGuide.css";

const SmartGuide = () => {
  const [timeOfDay, setTimeOfDay] = useState("");
  const [weather, setWeather] = useState("");
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState("");
  const [showOutput, setShowOutput] = useState(true);
  const outputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!timeOfDay || !weather || !mood) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    setLoading(true);
    setRecommendation("");

    const question = `I'm currently in Paros. It's ${weather.toLowerCase()} and it's ${timeOfDay.toLowerCase()}. I'm feeling ${mood.toLowerCase()}. What should I do right now? Can you give me 2 or 3 different options?`;

    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ question }),
      });

      const data = await response.json();
      setRecommendation(data.answer || "No response received.");
      setShowOutput(true);
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (err) {
      setRecommendation("Something went wrong.");
    }

    setLoading(false);
  };


  return (
    <div className="smartguide-main-content">
      <div className="smartguide-container">
        <Sidebar />
        <div className="smartguide-main">
          <div className="smartguide-header">
              <div className="smartguide-title-row">
                  <img src="/smart-guide-icon.png" alt="Smart Guide Icon" className="smartguide-icon" />
                  <h1>Smart Activity Finder</h1>
              </div>
              <p>Get personalized suggestions based on time, weather, and mood</p>
          </div>
          
            <form onSubmit={handleSubmit} className="smartguide-horizontal-form">

              <div className="input-wrapper">
                
                <select
                  className={`custom-select ${timeOfDay ? "filled" : ""}`}
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                  required
                >
                  <option value="" disabled hidden></option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
                <label className={timeOfDay ? "float-label" : ""}>Time of Day</label>
              </div>

              <div className="input-wrapper">
                
                <select
                  className={`custom-select ${weather ? "filled" : ""}`}
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  required
                >
                  <option value="" disabled hidden></option>
                  <option value="Sunny">Sunny</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Windy">Windy</option>
                  <option value="Rainy">Rainy</option>
                </select>
                <label className={weather ? "float-label" : ""}>Weather</label>
              </div>

              <div className="input-wrapper">
                
                <select
                  className={`custom-select ${mood ? "filled" : ""}`}
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  required
                >
                  <option value="" disabled hidden></option>
                  <option value="Relaxing">Relaxing</option>
                  <option value="Romantic">Romantic</option>
                  <option value="Adventurous">Adventurous</option>
                  <option value="Local">Local</option>
                </select>
                <label className={mood ? "float-label" : ""}>Mood</label>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Thinking..." : "Find Something"}
              </button>

            </form>


            <div className="smartguide-output-section" ref={outputRef}>
              <div className="smartguide-output-header">
                <h3>ParosMate suggests:</h3>

                <div className="smartguide-tooltip-wrapper">
                  <button
                    className="smartguide-toggle-btn"
                    onClick={() => setShowOutput(!showOutput)}
                    aria-label={showOutput ? "Hide suggestions" : "Show suggestions"}
                  >
                    {showOutput ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  <span className="smartguide-custom-tooltip">
                    {showOutput ? "Hide suggestions" : "Show suggestions"}
                  </span>
                </div>

              </div>

              {showOutput && recommendation &&
                recommendation
                  .split(/\d\.\s|\n(?=\d\.)|(?=\*\*.*?\*\*:)/)
                  .filter(Boolean)
                  .map((block, index) => (
                    <div key={index} className="smartguide-output fade-in">
                      {index === 0 ? null : <h3>Option {index}</h3>}
                      <ReactMarkdown>{block.trim()}</ReactMarkdown>
                    </div>
                  ))
              }
            </div>

        </div>
      </div>
    </div>
  );
};

export default SmartGuide;
