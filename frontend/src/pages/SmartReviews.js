// SmartReviews.js
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { RxReset } from "react-icons/rx";
import { FaLocationDot } from "react-icons/fa6";
import { BsFillStarFill } from "react-icons/bs";
import { AiFillCloseCircle } from "react-icons/ai";
import { MdSummarize, MdOutlineReviews} from "react-icons/md";
import { MdOutlineEuroSymbol } from "react-icons/md";
import { ImLocation } from "react-icons/im";
import { IoEarth } from "react-icons/io5";
import "./SmartReviews.css";

const restaurants = [
  { name: "Barbarossa Paros", images: ["barbarossa-2.jpg", "barbarossa-3.jpg", "barbarossa-1.jpg"] },
  { name: "Siparos Paros", images: ["siparos-1.jpg", "siparos-2.jpeg", "siparos-3.jpg"] },
  { name: "Axinos Restaurant Paros", images: ["axinos-1.jpg", "axinos-2.jpg", "axinos-3.jpg"] },
  { name: "Marios Restaurant Paros", images: ["marios-1.jpg", "marios-2.png", "marios-3.jpg"] },
  { name: "Tsachpinis Paros", images: ["tsachpinis-1.jpg", "tsachpinis-2.jpg", "tsachpinis-3.jpg"] },
  { name: "Flora Restaurant Paros", images: ["flora-1.jpg", "flora-2.jpg", "flora-3.jpg"] },
];

function SmartReviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showHours, setShowHours] = useState(false);
  const [result, setResult] = useState(() => {
    const stored = localStorage.getItem("smartreviews_result");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(() => {
    const stored = localStorage.getItem("smartreviews_expanded");
    return stored === "false" ? false : true;
  });
  const [activePlace, setActivePlace] = useState(() => localStorage.getItem("smartreviews_activePlace") || null);
  const reviewRef = useRef(null);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    localStorage.setItem("smartreviews_result", JSON.stringify(result));
  }, [result]);

  useEffect(() => {
    localStorage.setItem("smartreviews_expanded", expanded);
  }, [expanded]);

  useEffect(() => {
    if (activePlace) {
      localStorage.setItem("smartreviews_activePlace", activePlace);
    }
  }, [activePlace]);

  const fetchReview = async (place) => {
    if (result?.name === place && !expanded) {
      setExpanded(true);
      return;
    }
    if (result?.name === place && expanded) return;

    setLoading(true);
    setActivePlace(place);

    try {
      const res = await fetch("http://localhost:8000/google_reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place }),
      });

      const data = await res.json();

      if (data.error) {
        alert("Place not found.");
        setLoading(false);
        return;
      }

      setResult(data);
      console.log(data)
      setSearchTerm("");
      setExpanded(true);

      setTimeout(() => {
        if (reviewRef.current) {
          reviewRef.current.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => window.scrollBy({ top: -200, behavior: "smooth" }), 600);
        }
      }, 100);
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }

    setLoading(false);
  };

  const toggleReview = () => {
    setExpanded(!expanded);
    if (!expanded && reviewRef.current) {
      setTimeout(() => {
        reviewRef.current.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  };

  const handleReset = () => {
    setResult(null);
    setExpanded(true);
    setSearchTerm("");
    setActivePlace(null);
    localStorage.removeItem("smartreviews_result");
    localStorage.removeItem("smartreviews_expanded");
    localStorage.removeItem("smartreviews_activePlace");
  };

  return (
    <div className="smart-reviews-page">
      <header className="smart-reviews-header">
        <div className="header-left">
          <img src="/reviews-icon.png" alt="Logo" />
          <h1>Smart Reviews</h1>
        </div>
        <button
          className="scroll-to-search"
          // onClick={() => {
          //   document.querySelector(".search-section")?.scrollIntoView({ behavior: "smooth" });
          // }}
          onClick={handleReset}
        >
          <RxReset /> Reset
        </button>
      </header>

      <section className="restaurant-grid">
        {restaurants.map((res, i) => (
          <div className="restaurant-card" key={i}>
            <div className="image-scroll">
              {res.images.map((img, idx) => (
                <img key={idx} src={`/places/${img}`} alt={`${res.name} ${idx + 1}`} />
              ))}
            </div>
            <h3>{res.name}</h3>
            <button
              onClick={() => fetchReview(res.name)}
              disabled={loading && activePlace === res.name}
              className={loading && activePlace === res.name ? "loading" : ""}
            >
              {loading && activePlace === res.name ? "Loading..." : "View More"}
            </button>
          </div>
        ))}
      </section>

      {/* <section className="search-section">
        <h2>Search any place in Paros</h2>
        <div className="search-input-button-row">
          <input
            type="text"
            placeholder="e.g. Lefkes Tavern"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => fetchReview(searchTerm)}
            disabled={!searchTerm || loading}
          >
            {loading ? "Loading..." : "Search"}
          </button>
          <button className="reset-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      </section> */}

      <section ref={reviewRef} className="review-result-section">
        {result && (
          <>
            <div className="review-header">
              <h4>Google Reviews</h4>
              <button
                className="collapse-toggle"
                data-tooltip={expanded ? "Hide results" : "View results"}
                onClick={toggleReview}
              >
                <span>{expanded ? "▲" : "▼"}</span>
              </button>
            </div>
            <div className={`review-result-wrapper ${expanded ? "expanded" : ""}`}>
              
              <div className="review-result">
                <h3><FaLocationDot /> {result.name}</h3>
                <p><strong>Address:</strong> {result.address}</p>
                {result.phone && <p><strong>Phone:</strong> (+30) {result.phone}</p>}
                {result.price_level && (
                  <p><strong>Price:</strong>{" "}
                    {[...Array(result.price_level)].map((_, i) => (
                      <MdOutlineEuroSymbol 
                        key={i}
                        style={{
                          marginRight: "0.2rem",
                          color: "#0077aa",
                          verticalAlign: "middle", // 👈 aligns better
                          position: "relative",
                          top: "0px"                // 👈 nudges it down slightly
                        }} 
                      />
                    ))}
                  </p>
                )}

                {result.opening_hours && result.opening_hours.length > 0 && (
                  <div style={{ marginBottom: "1rem" }}>
                    <strong>Opening Hours:</strong>{" "}
                    <button
                      className="collapse-toggle"
                      data-tooltip={showHours ? "Hide hours" : "Show hours"}
                      onClick={() => setShowHours(!showHours)}
                      style={{ fontSize: "0.9rem", marginLeft: "0.6rem" }}
                    >
                      <span>{showHours ? "▲" : "▼"}</span>
                    </button>

                    {showHours && (
                      <ul style={{ padding: "1rem 1rem 1rem 2rem",
                                   marginTop: "0.6rem", 
                                   animation: "fadeInSlide 0.6s ease-in-out", 
                                   backgroundColor: "rgb(203, 239, 255)", 
                                   borderRadius: "18px",
                                   borderColor: "white"
                                  }}>
                        {result.opening_hours.map((line, idx) => (
                          <li key={idx}>{line}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <p className="rating">
                  <BsFillStarFill /> Average rating: {result.rating} ({result.total_ratings} reviews)
                </p>
                <div className="review-pros-cons">
                  {result.reviews.map((review, idx) => (
                    <div className="review-box" key={idx}>
                      <h4><MdOutlineReviews size={18}/> {review.author}</h4>
                      <p><BsFillStarFill /> <strong> Rating:</strong> {review.rating} / 5</p>
                      <p><em>{review.time}</em></p>
                      <p>{review.text}</p>
                    </div>
                  ))}
                </div>
                {result.summary && (
                  <div className="review-box summary review-summary-box">
                    <h4><MdSummarize size={20}/> Summary</h4>
                    <p>{result.summary}</p>
                  </div>
                )}

                {/* {result.photos && result.photos.length > 0 && (
                  <div className="image-scroll" style={{ marginBottom: "1.5rem" }}>
                    {result.photos.map((url, idx) => (
                      <img key={idx} src={url} alt={`Photo ${idx + 1}`} />
                    ))}
                  </div>
                )} */}
                <div className="smart-review-links">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noreferrer"
                    className="review-link-button"
                  >
                    <ImLocation style={{ marginRight: "0.5rem" }} />
                    View on Google Maps
                  </a>
                  {result.website && (
                    <a
                      href={result.website}
                      target="_blank"
                      rel="noreferrer"
                      className="review-link-button"
                    >
                      <IoEarth style={{ marginRight: "0.5rem" }} />
                      View Website
                    </a>
                  )}
                </div>


              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default SmartReviews;
