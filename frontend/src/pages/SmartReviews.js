import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import "./SmartReviews.css";

const restaurants = [
  { name: "Barbarossa", images: ["barbarossa-2.jpg", "barbarossa-3.jpg", "barbarossa-1.jpg"] },
  { name: "Siparos", images: ["siparos-1.jpg", "siparos-2.jpeg", "siparos-3.jpg"] },
  { name: "Axinos", images: ["axinos-1.jpg", "axinos-2.jpg", "axinos-3.jpg"] },
  { name: "Marios Restaurant", images: ["marios-1.jpg", "marios-2.png", "marios-3.jpg"] },
  { name: "Tsachpinis", images: ["tsachpinis-1.jpg", "tsachpinis-2.jpg", "tsachpinis-3.jpg"] },
  { name: "Flora Restaurant", images: ["flora-1.jpg", "flora-2.jpg", "flora-3.jpg"] },
];

function SmartReviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activePlace, setActivePlace] = useState(null);
  const reviewRef = useRef(null);
  useEffect(() => {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, 50);
}, []);

  useLayoutEffect(() => {
  window.scrollTo({ top: 0 });
}, []);

  const fetchReview = async (place) => {
    if (result?.place === place && !expanded) {
      setExpanded(true);
      return;
    }
    if (result?.place === place && expanded) return;

    setLoading(true);
    setActivePlace(place);

    const res = await fetch("http://localhost:8000/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ place, type: "restaurant" }),
    });

    const data = await res.json();

    setResult({
      place,
      pros: data.pros || [],
      cons: data.cons || [],
      summary: data.summary || "",
      rating: data.rating || 4.3,
    });

    setSearchTerm("");
    setLoading(false);
    setExpanded(true);

    setTimeout(() => {
      if (reviewRef.current) {
        reviewRef.current.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => window.scrollBy({ top: -200, behavior: "smooth" }), 600);
      }
    }, 100);
  };


  const toggleReview = () => {
    setExpanded(!expanded);
    if (!expanded && reviewRef.current) {
      setTimeout(() => {
        reviewRef.current.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
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
          onClick={() => {
            document.querySelector(".search-section")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          🔍 Search
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

      <section className="search-section">
        <h2>Search any place in Paros</h2>
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
      </section>

      <section ref={reviewRef} className="review-result-section">
        {result && (
          <>
            <div className="review-header">
              <h4>Review Summary</h4>
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
                <h3>📍 {result.place}</h3>
                <div className="review-pros-cons">

                  {result.pros && (
                    <div className="review-box pros">
                      <h4>✅ Pros</h4>
                      <ul>
                        {result.pros.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}


                  {result.cons && (
                    <div className="review-box cons">
                      <h4>❌ Cons</h4>
                      <ul>
                        {result.cons.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}


                </div>

                {result.summary && (
                  <div className="review-box summary">
                    <h4>📝 Summary</h4>
                    <p>{result.summary}</p>
                  </div>
                )}


                <p className="rating">⭐ <strong>Average star rating: {result.rating}</strong> / 5</p>
                
              </div>

            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default SmartReviews;
