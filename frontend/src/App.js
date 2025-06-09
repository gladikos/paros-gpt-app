import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Sidebar from "./components/Sidebar";
import ProfilePage from "./pages/ProfilePage";
import ParosGPT from "./pages/ParosGPT";
import ItineraryBuilder from "./pages/ItineraryBuilder";
import SmartGuide from "./pages/SmartGuide";
import MapExplorer from "./pages/MapExplorer";
import WeatherForecast from "./pages/WeatherForecast";
import SmartReviews from "./pages/SmartReviews";
import Home from "./pages/Home";
import "./App.css";

function AppLayout() {
  const location = useLocation();
  const isHiddenPage = ["/", "/login", "/register"].includes(location.pathname);

  const [sidebarOpen, setSidebarOpen] = useState(!isHiddenPage);

  useEffect(() => {
    const width = sidebarOpen ? "240px" : "0px";
    document.documentElement.style.setProperty("--sidebar-width", width);
  }, [sidebarOpen]);

  const { user } = useAuth();

  const PrivateRoute = ({ element }) => {
    return user ? element : <Navigate to="/login" replace />;
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {!sidebarOpen && (
        <div className="toggle-btn-wrapper">
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open Sidebar"
          >
            ☰
            <span className="custom-general-tooltip">Open Sidebar</span>
          </button>
          
        </div>
      )}
      <div className={`main-content ${!sidebarOpen ? "sidebar-hidden" : ""}`}>
        <Routes>
          <Route path="/" element={<PrivateRoute element={<Home />} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
          <Route path="/parosgpt" element={<PrivateRoute element={<ParosGPT />} />} />
          <Route path="/itinerarybuilder" element={<PrivateRoute element={<ItineraryBuilder />} />} />
          <Route path="/smart-guide" element={<PrivateRoute element={<SmartGuide />} />} />
          <Route path="/map-explorer" element={<PrivateRoute element={<MapExplorer />} />} />
          <Route path="/weather-forecast" element={<PrivateRoute element={<WeatherForecast />} />} />
          <Route path="/reviews" element={<PrivateRoute element={<SmartReviews />} />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
