import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import "./UploadRoster.css";

export default function UploadRoster() {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files && e.dataTransfer.files[0];
    setFile(droppedFile || null);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${config.API_URL}/api/upload-roster`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        
        if (inputRef.current) inputRef.current.value = "";
        setFile(null);

        const ok = window.confirm(
          data.message + "\n\nClick OK to view dashboard with predictions.",
        );
        if (ok) navigate("/dashboard");
      } else {
        alert("🔴 " + data.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading roster.");
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-text">
        <h1>Transfer your files safely with flightara</h1>
        <p>We do not discriminate, big or small, we take care of them all.</p>
      </div>

      <div
        className="upload-box"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <img src="/images/logo.png" alt="Logo" className="upload-logo" />
        <p>
          {file
            ? file.name
            : "Drag & drop your roster (.xlsx) or use the browse button"}
        </p>

        <input
          ref={inputRef}
          id="fileInput"
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <button
          className="browse-btn"
          onClick={() => document.getElementById("fileInput").click()}
        >
          Browse
        </button>

        <ul className="file-list">
          {file && (
            <li>
              <span>{file.name}</span>
              <span className="file-size">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </li>
          )}
        </ul>

        <button className="upload-btn" onClick={handleUpload} disabled={!file}>
          Upload
        </button>
      </div>
    </div>
  );
}
