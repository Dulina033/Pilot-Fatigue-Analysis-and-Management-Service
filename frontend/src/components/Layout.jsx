// src/components/Layout.jsx
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import "./Layout.css";

export default function Layout() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const token = localStorage.getItem("authToken");

      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      localStorage.removeItem("authToken");
      localStorage.removeItem("rememberedEmail");
      sessionStorage.clear();

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div
          className="logo-container"
          onClick={() => navigate("/home")}
          style={{ cursor: "pointer" }}
        >
          <img
            src="/images/logo.png"
            alt="Flightara Logo"
            className="logo-img"
          />
          <span className="logo-text">Flightara</span>
        </div>
        <ul className="nav-links">
          <li onClick={() => navigate("/home")}>Home</li>
          <li onClick={() => navigate("/dashboard")}>Dashboard</li>
          <li onClick={() => navigate("/reports")}>Reports</li>
          <li onClick={() => navigate("/about")}>About</li>
          <li onClick={() => navigate("/contact")}>Contact Us</li>
          <li
            onClick={handleLogout}
            style={{
              cursor: "pointer",
              opacity: isLoggingOut ? 0.6 : 1,
              pointerEvents: isLoggingOut ? "none" : "auto",
            }}
          >
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </li>
        </ul>
      </nav>

      <div className="page-content">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}
