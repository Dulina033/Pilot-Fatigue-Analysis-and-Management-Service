// src/components/Footer.jsx - UPDATED with Home Page Style
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <img src="/images/logo.png" alt="Flightara Logo" />
          <h3>Flightara</h3>
          <p>Empowering aviation safety and performance.</p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li onClick={() => navigate("/home")}>Home</li>
            <li onClick={() => navigate("/dashboard")}>Dashboard</li>
            <li onClick={() => navigate("/reports")}>Reports</li>
            <li onClick={() => navigate("/contact")}>Contact Us</li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Email: support@flightara.com</p>
          <p>Phone: +94 77 123 4567</p>
          <p>Colombo, Sri Lanka</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Flightara. All rights reserved.</p>
      </div>
    </footer>
  );
}
