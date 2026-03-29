// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { useNavigate } from "react-router-dom";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import config from "../config";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// 🌍 Normalize nationality text to actual country names on the map
const normalizeCountryName = (name) => {
  if (!name) return "";
  const map = {
    USA: "United States",
    US: "United States",
    UK: "United Kingdom",
    "United States of America": "United States",
    UAE: "United Arab Emirates",
    "South Korea": "Korea, Republic of",
    "North Korea": "Korea, Democratic People's Republic of",
    Russia: "Russian Federation",
    "Czech Republic": "Czechia",
    "Myanmar (Burma)": "Myanmar",
    Vietnam: "Viet Nam",
    Iran: "Iran, Islamic Republic of",
    Syria: "Syrian Arab Republic",
    Tanzania: "Tanzania, United Republic of",
    SriLanka: "Sri Lanka",
    "Sri Lankan": "Sri Lanka",
    Deutschland: "Germany",
    German: "Germany",
    Germany: "Germany",
    Chineese: "China",
    indian: "India",
  };
  return map[name.trim()] || name.trim();
};

const getRandomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;

export default function Dashboard() {
  const [predictions, setPredictions] = useState([]);
  const [pilotCountries, setPilotCountries] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${config.API_URL}/api/predictions`, {
      headers: {
        Authorization: `Bearer ${config.API_KEY}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const withRisk = (data || []).map((p) => {
          const score = Number(p.score || 0);

          let riskLevel = "Low";
          if (score >= 0.8) riskLevel = "High";
          else if (score >= 0.5) riskLevel = "Medium";

          return { ...p, score, riskLevel };
        });

        setPredictions(withRisk);

        // Create color mapping for pilot nationalities
        const countryColors = {};
        withRisk.forEach((p) => {
          if (p.nationality) {
            const normalized = normalizeCountryName(p.nationality);
            if (!countryColors[normalized]) {
              countryColors[normalized] = getRandomColor();
            }
          }
        });
        setPilotCountries(countryColors);
      })
      .catch((err) => console.error("Failed to load predictions:", err));
  }, []);

  const counts = { Low: 0, Medium: 0, High: 0 };
  predictions.forEach((p) => {
    counts[p.riskLevel] = (counts[p.riskLevel] || 0) + 1;
  });

  const donutData = {
    labels: ["Low", "Medium", "High"],
    datasets: [
      {
        data: [counts.Low, counts.Medium, counts.High],
        backgroundColor: ["#139408ff", "#f59e0b", "#f70404"],
        borderWidth: 2,
        cutout: "70%",
      },
    ],
  };

  const centerTextPlugin = {
    id: "centerText",
    beforeDraw(chart) {
      const { width, height } = chart;
      const ctx = chart.ctx;
      ctx.restore();
      ctx.font = "bold 16px sans-serif";
      ctx.textBaseline = "middle";
      const total = chart.data.datasets[0].data.reduce(
        (sum, val) => sum + val,
        0,
      );
      const text = `${total} Predictions`;
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 2;
      ctx.fillStyle = "#2d2a24"; // Changed to match aesthetic
      ctx.fillText(text, textX, textY);
      ctx.save();
    },
  };

  const getCountryColor = (name) => pilotCountries[name] || "#e0d5ca";

  return (
    <div className="dashboard">
      <div className="dashboard-left">
        <div className="chart-card">
          <h3>Risk Overview</h3>
          <div className="charts-container">
            <div className="small-chart">
              <Doughnut data={donutData} plugins={[centerTextPlugin]} />
            </div>
          </div>
        </div>

        <div className="side-cards">
          <div className="side-card low">Low: {counts.Low}</div>
          <div className="side-card medium">Medium: {counts.Medium}</div>
          <div className="side-card high">High: {counts.High}</div>
        </div>

        <button
          className="upload-btn"
          onClick={() => navigate("/upload-roster")}
        >
          Upload Again
        </button>

        {/* 🌍 World Map */}
        <div className="map-wrapper">
          <ComposableMap
            projectionConfig={{ scale: 200 }}
            style={{ width: "100%", height: "400px" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties.name;
                  const color = getCountryColor(countryName);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => {
                        const pilots = predictions.filter(
                          (p) =>
                            normalizeCountryName(p.nationality) === countryName,
                        );
                        if (pilots.length > 0) {
                          alert(
                            `${
                              pilots.length
                            } pilot(s) from ${countryName}: ${pilots
                              .map((p) => p.fullName)
                              .join(", ")}`,
                          );
                        }
                      }}
                      style={{
                        default: {
                          fill: color,
                          outline: "none",
                        },
                        hover: { fill: "#c0a890", outline: "none" },
                        pressed: { fill: "#a88b70", outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>
      </div>

      <div className="dashboard-right">
        <div className="dashboard-header">
          <img src="/images/logo.png" alt="Logo" className="dashboard-logo" />
          <h2>Pilot Predictions</h2>
        </div>

        <div className="table-wrapper">
          <table className="pilot-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Pilot</th>
                <th>Nationality</th>
                <th>Score</th>
                <th>Risk</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p, idx) => (
                <tr
                  key={p._id || idx}
                  className="clickable-row"
                  onClick={() =>
                    navigate(`/pilot/${encodeURIComponent(p.pilotId || idx)}`, {
                      state: { pilot: p },
                    })
                  }
                >
                  <td>
                    {p.photo ? (
                      <img src={p.photo} alt="pilot" className="pilot-img" />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{p.fullName || p.pilotId}</td>
                  <td>{p.nationality || "—"}</td>
                  <td>{(p.score || 0).toFixed(2)}</td>
                  <td
                    className={
                      p.riskLevel === "High"
                        ? "risk-high"
                        : p.riskLevel === "Medium"
                          ? "risk-medium"
                          : "risk-low"
                    }
                  >
                    {p.riskLevel}
                  </td>
                  <td>{p.date ? new Date(p.date).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
