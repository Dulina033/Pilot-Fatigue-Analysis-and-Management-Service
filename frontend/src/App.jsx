import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Login from "./components/Login.jsx";
import Home from "./components/Home.jsx";
import Register from "./components/Register.jsx";
import UploadRoster from "./components/UploadRoster.jsx";
import Dashboard from "./components/Dashboard.jsx";
import PilotDetail from "./components/PilotDetail.jsx";
import Recommendations from "./components/Recommendations.jsx";
import Reports from "./components/Reports.jsx";
import About from "./components/About.jsx";
import Contact from "./components/Contact.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Login />} />

      {/* All pages under this Layout will share the Navbar */}
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload-roster" element={<UploadRoster />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pilot/:pilotId" element={<PilotDetail />} />
        <Route path="/recommendations/:pilotId" element={<Recommendations />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Default fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
