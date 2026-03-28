// backend/controllers/reportsListController.js
const Report = require("../models/reportModel");
const fs = require("fs");
const path = require("path");

// Get all available reports from database
exports.getAllReports = async (req, res) => {
  try {
    console.log("📋 Fetching all reports...");

    // Get all reports from database, sorted by newest first
    const reports = await Report.find({}).sort({ generatedAt: -1 }).lean();

    console.log(`✅ Found ${reports.length} reports in database`);

    // Format reports for frontend
    const formattedReports = reports.map((report) => ({
      id: report._id,
      pilotId: report.pilotId,
      pilotName: report.pilotName,
      fileName: report.fileName,
      score: report.score,
      riskLevel: report.riskLevel,
      date: report.generatedAt,
      reportUrl: `/api/reports/${report.pilotId}`, // For generating new report
      downloadUrl: `/api/reports/download/${report._id}`, // For downloading saved file
      downloadedCount: report.downloadedCount || 0,
    }));

    res.json({
      success: true,
      count: formattedReports.length,
      reports: formattedReports,
    });
  } catch (err) {
    console.error("❌ Error fetching reports:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};

// Download a saved report file
exports.downloadSavedReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    console.log(`📥 Downloading report: ${reportId}`);

    const report = await Report.findById(reportId);

    if (!report) {
      console.log("❌ Report not found in database");
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Check if file exists
    if (!fs.existsSync(report.filePath)) {
      console.log("❌ Report file not found on server:", report.filePath);
      return res.status(404).json({
        success: false,
        message: "Report file not found on server",
      });
    }

    // Increment download count
    report.downloadedCount += 1;
    await report.save();

    console.log(`✅ Download count updated: ${report.downloadedCount}`);

    // Send file
    res.download(report.filePath, report.fileName);
  } catch (err) {
    console.error("❌ Error downloading report:", err);
    res.status(500).json({
      success: false,
      message: "Failed to download report",
    });
  }
};

// Get single report by ID
exports.getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    console.log(`🔍 Fetching report by ID: ${reportId}`);

    const report = await Report.findById(reportId);

    if (!report) {
      console.log("❌ Report not found");
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    console.log(`✅ Found report for pilot: ${report.pilotName}`);

    res.json({
      success: true,
      report: {
        id: report._id,
        pilotId: report.pilotId,
        pilotName: report.pilotName,
        fileName: report.fileName,
        score: report.score,
        riskLevel: report.riskLevel,
        date: report.generatedAt,
        downloadedCount: report.downloadedCount,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching report:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch report",
    });
  }
};
