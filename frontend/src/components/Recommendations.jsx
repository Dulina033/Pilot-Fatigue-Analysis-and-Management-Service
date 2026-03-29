// src/components/Recommendations.jsx - CLEAN CARDS, MATCHING BUTTONS
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import config from "../config";
import "./Recommendations.css";

export default function Recommendations() {
  const { pilotId } = useParams();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [pilotData, setPilotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${config.API_URL}/api/recommendations/${pilotId}`, {
      headers: {
        Authorization: `Bearer ${config.API_KEY}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPilotData({
            id: data.pilotId,
            score: data.score,
            riskLevel: data.riskLevel,
            nationality: data.nationality || "—",
          });
          setRecommendations(data.recommendations || []);
        } else {
          setError(data.message || "No recommendations found.");
        }
      })
      .catch((err) => {
        console.error("Error fetching recommendations:", err);
        setError("Failed to load recommendations.");
      })
      .finally(() => setLoading(false));
  }, [pilotId]);

  const getRiskClass = (riskLevel) => {
    switch (riskLevel) {
      case "High":
        return "high";
      case "Medium":
        return "medium";
      case "Low":
        return "low";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="recommendations-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading recommendations</div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <div className="recommendations-header">
        <h2>Fatigue Management</h2>
        <button onClick={() => navigate(-1)} className="back-btn">
          ← BACK
        </button>
      </div>

      {error ? (
        <p className="error-text">{error}</p>
      ) : (
        <>
          {/* Pilot Summary Section */}
          <div className="pilot-summary">
            <h3>Pilot Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-label">PILOT ID</div>
                <div className="summary-value">{pilotData.id}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">NATIONALITY</div>
                <div className="summary-value">{pilotData.nationality}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">FATIGUE SCORE</div>
                <div className="summary-value">
                  <div className="score-display">
                    <div
                      className={`score-circle-small ${getRiskClass(pilotData.riskLevel)}`}
                    >
                      {Math.round(pilotData.score * 100)}%
                    </div>
                    <span>{pilotData.score.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-label">RISK LEVEL</div>
                <div className="summary-value">
                  <span
                    className={`risk-badge ${getRiskClass(pilotData.riskLevel)}`}
                  >
                    {pilotData.riskLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <h3 className="section-title">Recommended Actions</h3>
          <div className="recommendations-list">
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`recommendation-card ${getRiskClass(pilotData.riskLevel)}`}
                >
                  <span
                    className={`rec-number ${getRiskClass(pilotData.riskLevel)}`}
                  >
                    {index + 1}
                  </span>
                  <p className="rec-text">{rec}</p>
                  <span
                    className={`priority-tag ${getRiskClass(pilotData.riskLevel)}`}
                  >
                    {pilotData.riskLevel} Priority
                  </span>
                </div>
              ))
            ) : (
              <p>No recommendations available.</p>
            )}
          </div>

          {/* Generate Report Button - Same Style as Back Button */}
          <div className="report-button-container">
            <button
              className="generate-report-btn"
              onClick={() =>
                window.open(`${config.API_URL}/api/reports/${pilotData.id}`)
              }
            >
              <i></i> GENERATE FATIGUE REPORT
            </button>
          </div>
        </>
      )}
    </div>
  );
}
