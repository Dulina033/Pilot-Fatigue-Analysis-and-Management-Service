// src/components/About.jsx
import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Flightara</h1>
          <p className="subtitle">
            Pioneering Aviation Safety Through Artificial Intelligence
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p>
                We believe in the revolutionization of aviation at Flightara.
                security using advanced machine and artificial intelligence.
                learning. We aim at getting rid of fatigue related incidents.
                by offering predictive analytics and real-time to the airlines.
                tools that are used in monitoring and securing both pilots and passengers.
              </p>
              <p>
                We consider that all pilots have a right to be at their best and
                all passengers are entitled to safe travel. By combining aviation
                skilled in high-tech technology we are converting this dream into a reality.
                reality.
              </p>
            </div>
            <div className="mission-stats">
              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-number">10K+</div>
                <div className="stat-label">Flights Monitored</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👨‍✈️</div>
                <div className="stat-number">100+</div>
                <div className="stat-label">Pilots Protected</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-number">74.0%</div>
                <div className="stat-label">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <h2>Our Story</h2>
          <div className="story-content">
            <p>
              Flightara was born from a simple observation: despite advances in
              aviation technology, pilot fatigue remained one of the leading
              causes of operational incidents. Founded in 2024 by a team of
              aviation professionals and AI specialists, we set out to create a
              solution that would predict and prevent fatigue before it
              compromises safety.
            </p>
            <p>
              Today, Flightara stands at the intersection of aviation expertise
              and artificial intelligence. Our hybrid models combine decades of
              ICAO/IATA fatigue research with cutting-edge machine learning to
              deliver predictions that are both accurate and actionable.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🛡️</div>
              <h3>Safety First</h3>
              <p>
                Every decision prioritizes the safety of pilots and passengers
                above all else.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🔬</div>
              <h3>Innovation</h3>
              <p>
                Constantly pushing the boundaries of what's possible in fatigue
                prediction.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Integrity</h3>
              <p>
                Transparent, ethical, and compliant with all international
                aviation standards.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌍</div>
              <h3>Global Impact</h3>
              <p>
                Making aviation safer for airlines and passengers worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
