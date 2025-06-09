import React, { useEffect, useState } from "react";
import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiThunderstorm,
  WiSnow,
  WiFog,
  WiNightClear,
} from "react-icons/wi";
import "./WeatherForecast.css";

function WeatherForecast() {
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [bgClass, setBgClass] = useState("default");

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const [currentRes, forecastRes] = await Promise.all([
          fetch("http://localhost:8000/weather/current"),
          fetch("http://localhost:8000/weather/forecast"),
        ]);

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        setCurrent(currentData);
        setForecast(forecastData.list);

        const condition = currentData.weather[0].main.toLowerCase();
        if (condition.includes("clear")) setBgClass("sunny");
        else if (condition.includes("cloud")) setBgClass("cloudy");
        else if (condition.includes("rain")) setBgClass("rainy");
        else if (condition.includes("storm") || condition.includes("thunder")) setBgClass("stormy");
        else setBgClass("default");
      } catch (err) {
        console.error("Weather fetch error:", err);
      }
    };

    fetchWeather();
  }, []);

  const groupByDay = () => {
    const map = new Map();
    forecast.forEach((item) => {
      const date = item.dt_txt.slice(0, 10); // yyyy-mm-dd
      if (!map.has(date)) map.set(date, []);
      map.get(date).push(item);
    });
    return Array.from(map.entries()).slice(0, 5);
  };

  const getWeatherIcon = (main, timestamp) => {
    const hour = new Date(timestamp * 1000).getHours();
    const isDay = hour >= 6 && hour < 18;

    const condition = main.toLowerCase();

    if (condition.includes("clear")) {
      return isDay ? <WiDaySunny size={64} color="#f5ba13" /> : <WiNightClear size={64} color="#5c6bc0" />;
    }

    if (condition.includes("cloud")) {
      return isDay ? <WiCloudy size={64} color="#6e7f8d" /> : <WiCloudy size={64} color="#3c4a5e" />;
    }

    if (condition.includes("rain")) return <WiRain size={64} color="#0077be" />;
    if (condition.includes("thunder")) return <WiThunderstorm size={64} color="#5f27cd" />;
    if (condition.includes("snow")) return <WiSnow size={64} color="#b8e0f9" />;
    if (condition.includes("fog") || condition.includes("mist")) return <WiFog size={64} color="#9e9e9e" />;

    return isDay ? <WiDaySunny size={64} color="#1e90ff" /> : <WiNightClear size={64} color="#1e90ff" />;
  };


  return (
    <div className={`weather-wrapper ${bgClass}`}>
      <div className="weather-header">
        <img src="/weather-icon.png" alt="Weather Logo" className="weather-logo" />
        <h1 className="weather-title">Weather in Paros</h1>
      </div>

      {current && (
        <div className="weather-current glass">
          <div className="weather-main">
            {/* <img
              src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
              alt="weather icon"
            /> */}
            {getWeatherIcon(current.weather[0].main, current.dt)}
            <div>
              <h2>{current.main.temp.toFixed(1)}°C</h2>
              <p>{current.weather[0].description}</p>
            </div>
          </div>
          <div className="weather-details">
            <p>💧 <strong>Humidity:</strong> {current.main.humidity}%</p>
            <p>💨 <strong>Wind:</strong> {current.wind.speed} m/s</p>
            <p>📊 <strong>Pressure:</strong> {current.main.pressure} hPa</p>
          </div>
        </div>
      )}

      <h2 className="forecast-label">Next 24 Hours</h2>
      <div className="weather-forecast-section">
        {forecast.slice(0, 8).map((item) => (
          <div className="forecast-card glass animate-fade" key={item.dt}>
            <p><strong>{new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></p>
            {/* <img
              src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
              alt="icon"
            /> */}
            {getWeatherIcon(item.weather[0].main, item.dt)}
            <p>{item.main.temp.toFixed(1)}°C</p>
            <p className="forecast-desc">{item.weather[0].main}</p>
          </div>
        ))}
      </div>

      <h2 className="forecast-label">5-Day Forecast</h2>
      <div className="weather-day-grid">
        {groupByDay().map(([date, entries], i) => {
          const displayDate = new Date(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
          const temps = entries.map(e => e.main.temp);
          const min = Math.min(...temps).toFixed(1);
          const max = Math.max(...temps).toFixed(1);
          const mid = entries[Math.floor(entries.length / 2)];

          return (
            <div className="forecast-card glass animate-fade" key={i}>
              <h4>{displayDate}</h4>
              {/* <img
                src={`https://openweathermap.org/img/wn/${mid.weather[0].icon}@2x.png`}
                alt="icon"
              /> */}
              {getWeatherIcon(mid.weather[0].main, mid.dt)}
              <p>{mid.weather[0].description}</p>
              <p className="forecast-desc">🌡 {min}°C - {max}°C</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeatherForecast;
