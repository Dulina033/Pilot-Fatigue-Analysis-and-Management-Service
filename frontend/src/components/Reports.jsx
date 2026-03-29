// src/components/Reports.jsx - Fix preview function
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import "./Reports.css";

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_URL}/api/reports/list`);
      const data = await response.json();

      if (data.success) {
        setReports(data.reports);
      } else {
        setError("Failed to load reports");
      }
    } catch (err) {
      setError("Error fetching reports");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (downloadUrl, fileName) => {
    try {
      const response = await fetch(`${config.API_URL}${downloadUrl}`);
      if (!response.ok) {
        throw new Error("Download failed");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download report. Please try again.");
    }
  };

  const handlePreview = async (downloadUrl, fileName) => {
    try {
      setPreviewError("");
      console.log("Previewing:", downloadUrl);

      const response = await fetch(`${config.API_URL}${downloadUrl}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error("Preview failed:", err);
      setPreviewError(`Failed to load preview: ${err.message}`);
    }
  };

  const handleViewDetails = (pilotId) => {
    navigate(`/pilot/${pilotId}`);
  };

  // Filter and sort reports
  const filteredReports = reports
    .filter((report) => {
      const matchesSearch =
        report.pilotName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.pilotId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.riskLevel?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRisk =
        filterRisk === "all" || report.riskLevel === filterRisk;

      return matchesSearch && matchesRisk;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date) - new Date(a.date);
        case "date-asc":
          return new Date(a.date) - new Date(b.date);
        case "name-asc":
          return (a.pilotName || "").localeCompare(b.pilotName || "");
        case "name-desc":
          return (b.pilotName || "").localeCompare(a.pilotName || "");
        case "score-desc":
          return b.score - a.score;
        case "score-asc":
          return a.score - b.score;
        default:
          return 0;
      }
    });

  const getRiskColor = (risk) => {
    switch (risk) {
      case "High":
        return "var(--danger)";
      case "Medium":
        return "var(--warning)";
      case "Low":
        return "var(--success)";
      default:
        return "#64748b";
    }
  };

  const getRiskClass = (risk) => {
    switch (risk) {
      case "High":
        return "risk-high";
      case "Medium":
        return "risk-medium";
      case "Low":
        return "risk-low";
      default:
        return "";
    }
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewError("");
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>
          <span className="header-icon">📊</span>
          Pilot Assessment Reports
        </h1>
        <p className="header-subtitle">
          View and download fatigue assessment reports for all pilots
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>Total Reports</h3>
            <p className="stat-number">{reports.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <h3>High Risk</h3>
            <p className="stat-number">
              {reports.filter((r) => r.riskLevel === "High").length}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟠</div>
          <div className="stat-content">
            <h3>Medium Risk</h3>
            <p className="stat-number">
              {reports.filter((r) => r.riskLevel === "Medium").length}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>Low Risk</h3>
            <p className="stat-number">
              {reports.filter((r) => r.riskLevel === "Low").length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by pilot name, ID, or risk level..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Risk Levels</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="score-desc">Highest Score</option>
            <option value="score-asc">Lowest Score</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="results-count">
        Showing {filteredReports.length} of {reports.length} reports
      </div>

      {/* Reports Grid */}
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="reports-grid">
          {filteredReports.map((report) => (
            <div key={report.id || report.pilotId} className="report-card">
              <div className="report-card-header">
                <div className="pilot-avatar">
                  {report.pilotName?.charAt(0) || "P"}
                </div>
                <div className="pilot-info">
                  <h3>{report.pilotName || "Unknown Pilot"}</h3>
                  <p className="pilot-id">{report.pilotId}</p>
                </div>
                <span
                  className={`risk-badge ${getRiskClass(report.riskLevel)}`}
                >
                  {report.riskLevel}
                </span>
              </div>

              <div className="report-card-body">
                <div className="report-details">
                  <div className="detail-item">
                    <span className="detail-label">Nationality</span>
                    <span className="detail-value">
                      {report.nationality || "—"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fatigue Score</span>
                    <span
                      className="detail-value"
                      style={{ color: getRiskColor(report.riskLevel) }}
                    >
                      {report.score?.toFixed(2) || "—"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">
                      {report.date
                        ? new Date(report.date).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="score-indicator">
                  <div
                    className="score-bar"
                    style={{
                      width: `${(report.score || 0) * 100}%`,
                      backgroundColor: getRiskColor(report.riskLevel),
                    }}
                  ></div>
                </div>
              </div>

              <div className="report-card-footer">
                <button
                  className="action-btn preview-btn"
                  onClick={() =>
                    handlePreview(report.downloadUrl, report.fileName)
                  }
                  title="Preview Report"
                >
                  👁️ Preview
                </button>
                <button
                  className="action-btn download-btn"
                  onClick={() =>
                    handleDownload(report.downloadUrl, report.fileName)
                  }
                  title="Download Report"
                >
                  📥 Download
                </button>
                <button
                  className="action-btn view-btn"
                  onClick={() => handleViewDetails(report.pilotId)}
                  title="View Pilot Details"
                >
                  👤 Details
                </button>
              </div>
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="no-results">
              <p>No reports found matching your criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div className="preview-modal" onClick={closePreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Report Preview</h3>
              <button className="close-btn" onClick={closePreview}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {previewError ? (
                <div className="preview-error">
                  <p>❌ {previewError}</p>
                </div>
              ) : (
                <iframe
                  src={previewUrl}
                  title="Report Preview"
                  className="pdf-preview"
                ></iframe>
              )}
            </div>
            <div className="modal-footer">
              <button className="close-modal-btn" onClick={closePreview}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
