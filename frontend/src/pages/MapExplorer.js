import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  InfoWindow,
  Polyline,
} from "@react-google-maps/api";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { FaRoute } from "react-icons/fa";
import { RxReset } from "react-icons/rx";
import { CgDetailsMore } from "react-icons/cg";
import { IoIosRemoveCircleOutline, IoIosAddCircleOutline } from "react-icons/io";
import { RiPinDistanceFill } from "react-icons/ri";
import { CiTimer } from "react-icons/ci";
import { RiUserLocationFill } from "react-icons/ri";
import { FaCar } from "react-icons/fa";
import { FaPersonWalking } from "react-icons/fa6";
import { FaUmbrellaBeach } from "react-icons/fa";
import { MdOutlineRestaurant } from "react-icons/md";
import { MdOutlineLocalBar } from "react-icons/md";
import { PiDiscoBall } from "react-icons/pi";
import { TbBuildingMonument } from "react-icons/tb";
import { FiSunset } from "react-icons/fi";
import { RxReload } from "react-icons/rx";
import "./MapExplorer.css";

const center = { lat: 37.0557, lng: 25.2079 };
const activityOptions = [
  { label: "Beaches", icon: <FaUmbrellaBeach /> },
  { label: "Food", icon: <MdOutlineRestaurant /> },
  { label: "Bars", icon: <MdOutlineLocalBar /> },
  { label: "Clubs", icon: <PiDiscoBall /> },
  { label: "Cultural", icon: <TbBuildingMonument /> },
  { label: "Sunsets", icon: <FiSunset /> },
];

const libraries = ["places"];

const MapExplorer = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activity, setActivity] = useState("");
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlaceIndex, setSelectedPlaceIndex] = useState(null);
  const [customInterest, setCustomInterest] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [multiRouteStops, setMultiRouteStops] = useState([]);
  const [multiRoutePath, setMultiRoutePath] = useState([]);
  const [multiRouteSummary, setMultiRouteSummary] = useState(null);
  const [multiRouteId, setMultiRouteId] = useState(0);
  const [routeLegs, setRouteLegs] = useState([]);
  const [travelMode, setTravelMode] = useState("DRIVING");
  const [mapResetKey, setMapResetKey] = useState(0);

  const mapRef = useRef(null);

  const onMapLoad = (mapInstance) => {
    mapRef.current = mapInstance;
  };

  useEffect(() => {
    if (mapRef.current) {
      window.google.maps.event.trigger(mapRef.current, "resize");
      mapRef.current.panTo(center); // Optional: re-center if it's shifted
    }
  }, [sidebarOpen]);


  const resetMap = () => {
    window.location.reload();
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const tripDetailsRef = useRef(null);
  useEffect(() => {
    if (multiRouteSummary && tripDetailsRef.current) {
      tripDetailsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [multiRouteSummary]);

  // useEffect(() => {
  //   if (tripDetails && tripDetailsRef.current) {
  //     tripDetailsRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [tripDetails]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
        }
      );
    } else {
      console.warn("Geolocation not supported");
    }
  }, []);

  const handleActivityClick = (type) => {
    setActivity(type);
  };

  const handleSearch = async () => {
    setLoading(true);
    setPlaces([]);

    try {
      const response = await fetch("http://127.0.0.1:8000/map_explorer", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ activity: customInterest || activity }),
      });

      const data = await response.json();
      const lines = data.answer.split("\n").filter(Boolean);

      const geocoder = new window.google.maps.Geocoder();
      const results = await Promise.all(
        lines.map((line) => {
          const match = line.match(/^(.*?)\s*-\s*(.*?)$/);
          if (!match) return null;

          const [_, name, description] = match;
          return new Promise((resolve) => {
            geocoder.geocode({ address: `${name}, Paros, Greece` }, (results, status) => {
              if (status === "OK" && results[0]) {
                const result = results[0];
                const locationType = result.geometry.location_type;
                const loc = result.geometry.location;
                const lat = loc.lat();
                const lng = loc.lng();

                const isAcceptable =
                  locationType === "ROOFTOP" || locationType === "GEOMETRIC_CENTER";

                if (isAcceptable) {
                  resolve({
                    name: name.trim(),
                    description: description.trim(),
                    lat,
                    lng,
                  });
                } else {
                  console.warn(
                    `Filtered vague result (${locationType}) for "${name}" at ${lat}, ${lng}`
                  );
                  resolve(null);
                }
              }
            });
          });
        })
      );

      setPlaces(results.filter(Boolean));
    } catch (err) {
      console.error("Error fetching places:", err);
    }

    setLoading(false);
  };

  const formatDuration = (totalSeconds) => {
    const totalMinutes = Math.round(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""} ` : ""}${minutes} min${minutes !== 1 ? "s" : ""}`;
  };


  const calculateMultiRoute = (stops) => {
    if (!userLocation || stops.length === 0) return;

    const directionsService = new window.google.maps.DirectionsService();

    const waypoints = stops.slice(0, -1).map((stop) => ({
      location: { lat: stop.lat, lng: stop.lng },
      stopover: true,
    }));

    const finalDestination = stops[stops.length - 1];

    directionsService.route(
      {
        origin: userLocation,
        destination: { lat: finalDestination.lat, lng: finalDestination.lng },
        waypoints,
        travelMode: window.google.maps.TravelMode[travelMode],
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === "OK") {
          const routePath = result.routes[0].overview_path;
          const totalDistance = result.routes[0].legs.reduce(
            (sum, leg) => sum + leg.distance.value,
            0
          );
          const totalDuration = result.routes[0].legs.reduce(
            (sum, leg) => sum + leg.duration.value,
            0
          );

          setMultiRoutePath(routePath);
          setMultiRouteId(id => id + 1);
          setMultiRouteSummary({
            distance: (totalDistance / 1000).toFixed(1) + " km",
            duration: formatDuration(totalDuration),
            stops: stops.map((p) => p.name),
          });
          setRouteLegs(result.routes[0].legs);
        } else {
          console.warn("Multi-route error:", status);
        }
      }
    );
  };

  const addToRoute = (place) => {
    if (!multiRouteStops.some((p) => p.name === place.name)) {
      const updatedStops = [...multiRouteStops, place];
      setMultiRouteStops(updatedStops);
      calculateMultiRoute(updatedStops);
    }
  };

  const removeStop = (indexToRemove) => {
    const updatedStops = multiRouteStops.filter((_, idx) => idx !== indexToRemove);
    setMultiRouteStops(updatedStops);
    if (updatedStops.length > 0) {
      calculateMultiRoute(updatedStops);
    } else {
      setMultiRoutePath([]);
      setMultiRouteSummary(null);
      setMultiRouteId(id => id + 1);
    }
  };

  if (!isLoaded) return <div className="loading-screen">Loading map...</div>;

  return (
    <div className="mapexplorer-container">
      <div className="mapexplorer-main">
        <header className="mapexplorer-header">
          <div className="mapexplorer-title">
            <img src="/map-explorer-icon.png" alt="Map Explorer" className="mapexplorer-icon" />
            <h1>Map Explorer</h1>
          </div>
          <div className="search-toolbar">
            <p>Choose places you would like to search for, or type your own interest</p>
            <button className="reset-map-button" onClick={resetMap}><RxReset /> Reset Map</button>
          </div>


          <div className="mapexplorer-chips">
            {activityOptions.map(({ label, icon }) => (
              <button
                key={label}
                className={`chip ${activity === label ? "active" : ""}`}
                onClick={() => handleActivityClick(label)}
              >
                {icon} {label}
              </button>
              
            ))}

            <div className="floating-input">
              <input
                type="text"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                id="customInterest"
                placeholder=" "
              />
              <label htmlFor="customInterest">Your own interest</label>
            </div>

            <button className="chip action" onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Show Places"}
            </button>
          </div>
        </header>

        <div style={{ height: "70vh", width: "100%", position: "relative" }}>
          <GoogleMap
            key={multiRouteId}
            center={center}
            zoom={12}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            onLoad={onMapLoad}
          >
            {userLocation && (
              <>
                <Marker
                  position={userLocation}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                  onClick={() => setShowUserInfo(true)}
                />

                {showUserInfo && (
                  <InfoWindow
                    position={userLocation}
                    onCloseClick={() => setShowUserInfo(false)}
                  >
                    <div className="info-box">
                      <div className="info-title">📍 Your current location</div>
                    </div>
                  </InfoWindow>
                )}
              </>
            )}

            {places.map((place, idx) => (
              <Marker
                key={idx}
                position={{ lat: place.lat, lng: place.lng }}
                title={place.name}
                onClick={() => setSelectedPlaceIndex(idx)}
              />
            ))}

            {selectedPlaceIndex !== null && (
              <InfoWindow
                position={{
                  lat: places[selectedPlaceIndex].lat,
                  lng: places[selectedPlaceIndex].lng,
                }}
                onCloseClick={() => setSelectedPlaceIndex(null)}
              >
                <div>
                  <div className="info-box">
                    <div className="info-title">{places[selectedPlaceIndex].name}</div>
                    <div className="info-description">{places[selectedPlaceIndex].description}</div>
                  </div>
                  <div className="route-buttons">
                    {!multiRouteStops.some(p => p.name === places[selectedPlaceIndex].name) ? (
                      <button
                        className="route-button add"
                        onClick={() => addToRoute(places[selectedPlaceIndex])}
                      >
                        <IoIosAddCircleOutline /> Add to Route
                      </button>
                    ) : (
                      <button
                        className="route-button remove"
                        onClick={() => {
                          const index = multiRouteStops.findIndex(
                            (p) => p.name === places[selectedPlaceIndex].name
                          );
                          if (index !== -1) removeStop(index);
                        }}
                      >
                        <IoIosRemoveCircleOutline /> Remove from Route
                      </button>
                    )}
                  </div>

                </div>
              </InfoWindow>


            )}

            {multiRoutePath.length > 0 && (
              <Polyline
                key={multiRouteId}
                path={multiRoutePath}
                options={{
                  strokeColor: "#0077cc",
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                  // icons: [
                  //   {
                  //     icon: {
                  //       path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  //     },
                  //     offset: "100%",
                  //   },
                  // ],
                }}
              />
            )}

          </GoogleMap>
        </div>

        <div ref={tripDetailsRef} className="trip-details-wrapper">
          {multiRouteSummary && (
            <div className="trip-details">
              <h2><CgDetailsMore /> Multi-Stop Trip</h2>

              <div className="stop-cards">
                {/* <div className="stop-card origin">
                  <span className="stop-number"><RiUserLocationFill /></span>
                  <span className="stop-name">Your Location</span>
                </div> */}

                <DragDropContext
                  onDragEnd={(result) => {
                    const { destination, source } = result;
                    if (!destination || destination.index === source.index) return;

                    const reordered = Array.from(multiRouteStops);
                    const [moved] = reordered.splice(source.index, 1);
                    reordered.splice(destination.index, 0, moved);

                    setMultiRouteStops(reordered);
                    calculateMultiRoute(reordered);
                  }}
                >
                  <Droppable droppableId="stops">
                    {(provided) => (
                      <div
                        className="stop-cards"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        <div className="stop-card origin">
                          <span className="stop-number"><RiUserLocationFill /></span>
                          <span className="stop-name">Your Location</span>
                        </div>

                        {multiRouteStops.map((stop, index) => (
                          <Draggable key={stop.name} draggableId={stop.name} index={index}>
                            {(provided) => (
                              <div
                                className="stop-card"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <span className="stop-number">{index + 1}</span>
                                <span className="stop-name">{stop.name}</span>
                              </div>
                            )}
                          </Draggable>
                        ))}

                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

              </div>

              <div className="trip-summary-row">
                <div className="trip-meta">
                  <span className="trip-metric">
                    <RiPinDistanceFill /> Total Distance: <strong>{multiRouteSummary?.distance}</strong>
                  </span>
                  <span className="trip-metric">
                    <CiTimer /> Total Duration: <strong>{multiRouteSummary?.duration}</strong>
                  </span>
                </div>

                <div className="trip-controls-horizontal">
                  <div className="travel-mode-toggle">
                    <label>
                      <input
                        type="radio"
                        value="DRIVING"
                        checked={travelMode === "DRIVING"}
                        onChange={(e) => setTravelMode(e.target.value)}
                      />
                      <FaCar size={20} />
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="WALKING"
                        checked={travelMode === "WALKING"}
                        onChange={(e) => setTravelMode(e.target.value)}
                      />
                      <FaPersonWalking size={20} />
                    </label>
                  </div>

                  <button
                    className="recalc-button-inline"
                    onClick={() => calculateMultiRoute(multiRouteStops)}
                  >
                    <RxReload /> Recalculate
                  </button>
                </div>
              </div>

              {routeLegs.length > 0 && (
                <div className="trip-segments">
                  <h3>Segment Details</h3>
                  <ul>
                    {routeLegs.map((leg, index) => (
                      <li key={index}>
                        <strong>{index === 0 ? "From your location" : `Stop ${index}`}</strong> to{" "}
                        <strong>{`Stop ${index + 1}`}</strong>:{" "}
                        {leg.distance.text}, {leg.duration.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MapExplorer;
