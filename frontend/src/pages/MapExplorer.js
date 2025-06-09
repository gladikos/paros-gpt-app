import React, { useState, useEffect } from "react";
import { Tooltip } from "react-leaflet"; // make sure this import is at the top
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import Sidebar from "../components/Sidebar";
import "./MapExplorer.css";

const DEFAULT_CENTER = [37.0833, 25.15];
const activityOptions = ["Beaches", "Eating", "Drinking", "Cultural", "Sunset Spots"];

const haversineDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const dLon = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const lat1 = (coord1[0] * Math.PI) / 180;
  const lat2 = (coord2[0] * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MapExplorer = () => {
  const [activity, setActivity] = useState("Beaches");
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
//   const [includeUserInRoute, setIncludeUserInRoute] = useState(true);
  const [routePoints, setRoutePoints] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn("Location access denied.", err)
    );
  }, []);

  const handleActivityClick = (selected) => {
    setActivity(selected);
  };

  const handleSearch = async () => {
    setLoading(true);
    setPlaces([]);
    setRoutePoints([]);

    try {
      const response = await fetch("http://127.0.0.1:8000/map_explorer", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ activity }),
      });

      const data = await response.json();

      const parsed = data.answer
        .split("\n")
        .map((line) => {
          const match = line.match(/^(.*?)\s*-\s*(.*?)\s*\(([-.\d]+),\s*([-.\d]+)\)$/);
          if (!match) return null;
          return {
            name: match[1].trim(),
            description: match[2].trim(),
            lat: parseFloat(match[3]),
            lng: parseFloat(match[4]),
          };
        })
        .filter(Boolean);

      setPlaces(parsed);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const addToRoute = (coords) => {
    setRoutePoints((prev) => [...prev, coords]);
  };

  const fullRoute = userLocation ? [userLocation, ...routePoints] : routePoints;

  const totalDistance = fullRoute.reduce((sum, curr, i, arr) => {
    if (i === 0) return 0;
    return sum + haversineDistance(arr[i - 1], curr);
  }, 0);

  const estimatedMinutes = Math.round((totalDistance / 30) * 60); // assuming 30 km/h average driving

  const removeFromRoute = (coords) => {
    setRoutePoints((prev) =>
        prev.filter(([lat, lng]) => lat !== coords[0] || lng !== coords[1])
    );
  };

  const resetMap = () => {
    setPlaces([]);
    setRoutePoints([]);
    setActivity("Beaches");
  };



  return (
    <div className="mapexplorer-container">
      <Sidebar />
      <div className="mapexplorer-main">
        <div className="mapexplorer-header">
          <div className="mapexplorer-title">
            <img
                src="/map-explorer-icon.png"
                alt="Map Explorer"
                className="mapexplorer-icon"
            />
            <h1>Explore Paros</h1>
          </div>

          <p>Select your vibe and discover places on the map</p>
          <div className="mapexplorer-chips">
            {activityOptions.map((option) => (
              <button
                key={option}
                className={`chip ${option === activity ? "active" : ""}`}
                onClick={() => handleActivityClick(option)}
              >
                {option}
              </button>
            ))}
            <button className="chip action" onClick={handleSearch} disabled={loading}>
              {loading ? "Thinking..." : "Show Places"}
            </button>
            <button className="chip reset" onClick={resetMap}>
                Reset Map
            </button>

          </div>
        </div>

        <div className="mapexplorer-map">
          <MapContainer center={DEFAULT_CENTER} zoom={11} scrollWheelZoom={true}>
            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {userLocation && (
                <Marker
                    position={userLocation}
                    icon={L.icon({ iconUrl: "/user-location-icon.png", iconSize: [32, 32] })}
                >
                <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                    You are here
                    </Tooltip>
                </Marker>
            )}


            {places.map((place, idx) => {
              const coords = [place.lat, place.lng];
              return (
                <Marker
                  key={idx}
                  position={coords}
                  icon={L.icon({ iconUrl: "/dst-location-icon.png", iconSize: [32, 32] })}
                >
                  <Popup>
                    <strong>{place.name}</strong>
                    <br />
                    {place.description}
                    <br />
                    <button className="route-button" onClick={() => addToRoute(coords)}>
                        Add to Route
                    </button>
                    <br />
                    <button className="route-button" onClick={() => removeFromRoute(coords)}>
                        Remove from Route
                    </button>
                  </Popup>
                </Marker>
              );
            })}

            {fullRoute.length >= 2 && (
              <Polyline
                positions={fullRoute}
                pathOptions={{ color: "#ff5722", weight: 4, dashArray: "6" }}
              />
            )}
          </MapContainer>
        </div>
        {fullRoute.length >= 2 && (
            <div className="route-info">
              Total Distance: {totalDistance.toFixed(2)} km · Est. Time: {estimatedMinutes} min (assuming average speed of driving 30km/h)
            </div>
          )}
      </div>
    </div>
  );
};

export default MapExplorer;
