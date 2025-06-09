import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ReactMarkdown from "react-markdown";
import "./SmartGuide.css";

const SmartGuide = () => {
  const [timeOfDay, setTimeOfDay] = useState("Afternoon");
  const [weather, setWeather] = useState("Sunny");
  const [mood, setMood] = useState("Relaxing");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      setRecommendation("Something went wrong.");
    }

    setLoading(false);
  };

  return (
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
        <div className="smartguide-body">
          <form onSubmit={handleSubmit} className="smartguide-form">
            <label>Time of Day</label>
            <select value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)}>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
              <option>Night</option>
            </select>

            <label>Weather</label>
            <select value={weather} onChange={(e) => setWeather(e.target.value)}>
              <option>Sunny</option>
              <option>Cloudy</option>
              <option>Windy</option>
              <option>Rainy</option>
            </select>

            <label>Your Mood</label>
            <select value={mood} onChange={(e) => setMood(e.target.value)}>
              <option>Relaxing</option>
              <option>Romantic</option>
              <option>Adventurous</option>
              <option>Local</option>
            </select>

            <button type="submit" disabled={loading}>
              {loading ? "Thinking..." : "Find Something"}
            </button>
          </form>

          <div className="smartguide-output-wrapper">
            <h3>ParosMate suggests:</h3>
            {recommendation &&
                recommendation
                .split(/\d\.\s|\n(?=\d\.)|(?=\*\*.*?\*\*:)/)
                .filter(Boolean)
                .map((block, index) => (
                    <div key={index} className="smartguide-output fade-in">
                    {index === 0 ? null : <h3>Option {index}</h3>}
                    <ReactMarkdown>{block.trim()}</ReactMarkdown>
                    </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartGuide;
