// src/components/PilotDetail.jsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Human3D from "./Human3D";
import config from "../config";
import "./PilotDetail.css";

export default function PilotDetail() {
  const { pilotId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const passedPilot = location.state?.pilot || null;
  const [remotePilot, setRemotePilot] = useState(null);

  const pilot = passedPilot || remotePilot;
  const score = pilot ? Number(pilot.score || 0) : 0;

  const controlsRef = useRef();

  const getRisk = (score) => {
    if (score >= 0.8) return { level: "High", color: "#e49b9b" };
    if (score >= 0.5) return { level: "Medium", color: "#e6b87a" };
    return { level: "Low", color: "#9bb88b" };
  };

  const risk = getRisk(score);

  const getAffectedAreas = (score) => {
    if (score >= 0.8) return ["Full Body", "Arms", "Legs", "Torso", "Head"];
    if (score >= 0.5) return ["Arms", "Legs", "Torso"];
    return ["Eyes", "Head"];
  };

  useEffect(() => {
    if (!passedPilot && pilotId) {
      fetch(`${config.API_URL}/api/predictions`, {
        headers: {
          Authorization: `Bearer ${config.API_KEY}`,
        },
      })
        .then((res) => res.json())
        .then((list) => {
          const found = list.find(
            (x) => String(x.pilotId) === decodeURIComponent(pilotId),
          );
          setRemotePilot(found || null);
        })
        .catch((err) => console.error("Failed to fetch pilot:", err));
    }
  }, [passedPilot, pilotId]);

  const Icon = ({ type }) => {
    const icons = {
      id: "🆔",
      nationality: "🌍",
      score: "📊",
      risk: "⚠️",
      areas: "🔴",
    };
    return <span className="info-icon">{icons[type] || "•"}</span>;
  };

  return (
    <div className="pilot-detail-page">
      {/* LEFT PANEL - Aesthetic Design */}
      <div className="pilot-info">
        <h2>{pilot?.fullName || `Pilot ${pilotId}`}</h2>

        <div className="pilot-info-grid">
          <div className="info-item">
            <div className="info-label">
              <Icon type="id" /> PILOT ID
            </div>
            <div className="info-value">{pilot?.pilotId || "—"}</div>
          </div>

          <div className="info-item">
            <div className="info-label">
              <Icon type="nationality" /> NATIONALITY
            </div>
            <div className="info-value">{pilot?.nationality || "—"}</div>
          </div>

          <div className="info-item">
            <div className="info-label">
              <Icon type="score" /> FATIGUE SCORE
            </div>
            <div className="score-container">
              <div className={`score-circle ${risk.level.toLowerCase()}`}>
                {Math.round(score * 100)}%
              </div>
              <div className="score-details">
                <div className="score-label">Current Score</div>
                <div className="score-value" style={{ color: risk.color }}>
                  {score.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="info-item">
            <div className="info-label">
              <Icon type="risk" /> RISK LEVEL
            </div>
            <div className={`risk-badge ${risk.level.toLowerCase()}`}>
              <span
                className="risk-dot"
                style={{ backgroundColor: risk.color }}
              ></span>
              <span>{risk.level}</span>
            </div>
          </div>

          <div className="info-item">
            <div className="info-label">
              <Icon type="areas" /> AFFECTED AREAS
            </div>
            <div className="areas-tags">
              {getAffectedAreas(score).map((area, idx) => (
                <span key={idx} className="area-tag">
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* BUTTONS - YOUR STYLE PRESERVED */}
        <div className="button-container">
          <button onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
          <button onClick={() => navigate(`/recommendations/${pilotId}`)}>
            View Recommendations →
          </button>
        </div>
      </div>

      {/* RIGHT PANEL - 3D MODEL */}
      <div className="model-canvas">
        <div className="canvas-container">
          <Canvas camera={{ position: [6, 4, 6], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1.2} />
            <Human3D score={score} />
            <OrbitControls
              ref={controlsRef}
              autoRotate={true}
              autoRotateSpeed={2.0}
              enableZoom={true}
              enablePan={true}
              enableDamping={true}
              dampingFactor={0.05}
            />
          </Canvas>
        </div>

        <div className="legend-card">
          <div className="legend-icon">✨</div>
          <div className="legend-text">
            <strong>Blinking areas</strong> indicate fatigue-affected body parts
            <br />
            <span className="low">● Low: Eyes, Head</span> •{" "}
            <span className="medium">● Medium: Arms, Legs, Torso</span> •{" "}
            <span className="high">● High: Full Body</span>
            <br />
            <span
              style={{
                fontSize: "12px",
                opacity: 0.6,
                marginTop: "8px",
                display: "block",
              }}
            >
              ✦ Model auto-rotating - drag to explore
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
