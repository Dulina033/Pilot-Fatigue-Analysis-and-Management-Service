// backend/routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const { generatePilotReport } = require("../controllers/reportController");

// This catches pilotId strings (like "PT001")
router.get("/:pilotId", generatePilotReport);

module.exports = router;
