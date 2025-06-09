import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      <img src="/paros-mate-logo.png" alt="ParosMate Logo" className="home-logo" />
      <h1 className="home-title">Welcome to ParosMate</h1>
      <p className="home-subtitle">
        Discover, plan, and explore the island of Paros with AI-powered tools. Designed for curious travelers, built for unforgettable adventures.
      </p>

      <div className="feature-grid">

        <div className="feature-card" onClick={() => navigate("/parosgpt")}>
          <div className="feature-header">
            <img src="/parosgpt-logo-transparent.png" alt="ParosGPT" className="feature-icon" />
            <h2>ParosGPT</h2>
          </div>
          <p>
            Ask anything about Paros — beaches, food, transport, and more.
            Fast, smart and tailored to your vibe.
          </p>
          <button className="home-button">Launch ParosGPT</button>
        </div>

        <div className="feature-card" onClick={() => navigate("/itinerarybuilder")}>
          <div className="feature-header">
            <img src="/itinerary-icon.png" alt="Itinerary" className="feature-icon" />
            <h2>Itinerary Builder</h2>
          </div>
          <p>
            Generate a fully personalized Paros travel plan based on your interests, type of holiday, dates, and pace — in seconds.
          </p>
          <button className="home-button secondary">Start Planning</button>
        </div>

        <div className="feature-card" onClick={() => navigate("/smart-guide")}>
          <div className="feature-header">
            <img src="/smart-guide-icon.png" alt="Smart Guide" className="feature-icon" />
            <h2>Smart Guide</h2>
          </div>
          <p>
            Not sure what to do right now? We’ll suggest a variety of perfect activities for your mood, the time, and the weather.
          </p>
          <button className="home-button">Open Smart Guide</button>
        </div>

        <div className="feature-card" onClick={() => navigate("/map-explorer")}>
          <div className="feature-header">
            <img src="/map-explorer-icon.png" alt="Map Explorer" className="feature-icon" />
            <h2>Map Explorer</h2>
          </div>
          <p>
            Explore the island interactively. View top spots, plot routes, measure distances, and discover new favorites.
          </p>
          <button className="home-button secondary">Explore Map</button>
        </div>

        <div className="feature-card" onClick={() => navigate("/weather-forecast")}>
          <div className="feature-header">
            <img src="/weather-icon.png" alt="Weather Forecast" className="feature-icon" />
            <h2>Weather Forecast</h2>
          </div>
          <p>
            Watch the forecast and prepare your suitcase, or plan your day according to the current local weather on Paros island. 
          </p>
          <button className="home-button">Explore Weather</button>
        </div>

        <div className="feature-card" onClick={() => navigate("/reviews")}>
          <div className="feature-header">
            <img src="/reviews-icon.png" alt="Smart Reviews" className="feature-icon" />
            <h2>Smart Reviews</h2>
          </div>
          <p>
            Check wether the most famous places in the island meet your needs. Learn all you need on the click of a button.
          </p>
          <button className="home-button secondary">Read Reviews</button>
        </div>

      </div>
    </div>
  );
}

export default Home;
