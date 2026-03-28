// backend/routes/reportsListRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllReports,
  getReportById,
  downloadSavedReport,
} = require("../controllers/reportsListController");

// Specific routes first
router.get("/list", getAllReports);
router.get("/download/:reportId", downloadSavedReport);
router.get("/:reportId", getReportById); // This catches MongoDB ObjectIds

module.exports = router;
