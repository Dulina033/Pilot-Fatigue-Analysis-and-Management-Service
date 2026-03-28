// src/components/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">

      {/* ------------------------- */}
      {/* Hero Section */}
      {/* ------------------------- */}
      <section className="hero">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="hero-text">
  <h1>
    <span>FLIGHTARA</span><br></br>
    The Future of<br />Fatigue Management
  </h1>
  <p>
    Where artificial intelligence meets aviation safety. Real-time 
    monitoring, predictive analytics, and automated reporting — 
    transforming how airlines manage pilot fatigue forever.
  </p>
</div>

          <div className="hero-boxes">
            <div className="action-box">
              <button className="btn red" onClick={() => navigate("/register")}>
                REGISTER
              </button>
            </div>

            <div className="action-box">
              <button className="btn red" onClick={() => navigate("/upload-roster")}>
                UPLOAD ROSTERS
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------- */}
      {/* How It Works */}
      {/* ------------------------- */}
      <section className="how-it-works">
        <h2>How It Works</h2>

        <p className="how-desc">
          Flightara simplifies pilot fatigue management into three clear steps.
        </p>

        <div className="steps-container">

          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Upload Flight Rosters</h3>
            <p>
              Upload duty schedules securely. The system automatically extracts and processes pilot workload data.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>View Fatigue Predictions</h3>
            <p>
              Instantly visualize fatigue scores and identify high-risk duty periods using rule-based and machine learning analysis.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Generate Reports</h3>
            <p>
              Download fatigue analysis reports aligned with ICAO/IATA fatigue management standards.
            </p>
          </div>

        </div>
      </section>

      {/* ------------------------- */}
      {/* Guidance Section */}
      {/* ------------------------- */}
      <section className="guidance-section">

        <h2>System Guidance</h2>
        <p className="guidance-desc">
          Explore how Flightara works through key system interfaces and features.
        </p>

        {/* Dashboard */}
        <div className="guide-row">
          <img src="/images/dashboard.png" alt="Dashboard Screenshot" />
          <div className="guide-text">
            <h3>Dashboard Overview</h3>
            <p>
              The dashboard displays fatigue predictions, risk distribution, and pilot analysis results.
              It helps operators quickly identify high fatigue risk pilots using visual charts and fatigue scores.
            </p>
          </div>
        </div>

        {/* Register */}
        <div className="guide-row reverse">
          <img src="/images/register.png" alt="Register Screenshot" />
          <div className="guide-text">
            <h3>User Registration</h3>
            <p>
              Users create accounts securely to access fatigue analysis features. Authentication ensures safe data management.
            </p>
          </div>
        </div>

        {/* Upload */}
        <div className="guide-row">
          <img src="/images/upload.png" alt="Upload Screenshot" />
          <div className="guide-text">
            <h3>Roster Upload</h3>
            <p>
              Operators upload pilot duty rosters in Excel format. The system extracts scheduling parameters and performs fatigue analysis.
            </p>
          </div>
        </div>

        {/* ML Model */}
        <div className="guide-row reverse">
          <img src="/images/mlmodel.png" alt="ML Screenshot" />
          <div className="guide-text">
            <h3>Machine Learning Prediction</h3>
            <p>
              The ML model refines fatigue estimation by learning hidden patterns from operational data and improving prediction accuracy.
            </p>
          </div>
        </div>

        {/* Recommendation */}
        <div className="guide-row">
          <img src="/images/recommendation.png" alt="Recommendation Screenshot" />
          <div className="guide-text">
            <h3>Fatigue Recommendations</h3>
            <p>
              The system provides fatigue mitigation suggestions including rest scheduling and duty adjustments to support safe operations.
            </p>
          </div>
        </div>

      </section>

      
          

    </div>
  );
}
