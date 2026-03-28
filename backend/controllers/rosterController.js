const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const Register = require("../models/registerModel");
const Prediction = require("../models/predictionModel");

// Multer setup
const upload = multer({ dest: "uploads/" });
exports.uploadMiddleware = upload.single("file");

exports.uploadRoster = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const filePath = path.join(__dirname, "../", req.file.path);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Normalize pilot IDs from Excel
    const excelPilotIds = data
      .map((row) => (row["Pilot ID"] ? String(row["Pilot ID"]).trim() : null))
      .filter(Boolean);

    // Check if pilots exist
    const registeredPilots = await Register.find(
      { pilotId: { $in: excelPilotIds } },
      { pilotId: 1, fullName: 1, photo: 1, _id: 0 }
    );

    const registeredIds = registeredPilots.map((p) => p.pilotId);
    const missingIds = excelPilotIds.filter(
      (id) => !registeredIds.includes(id)
    );

    if (missingIds.length > 0) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}
      return res.json({
        success: false,
        message: `The following pilots are not registered: ${missingIds.join(
          ", "
        )}`,
      });
    }

    // Prepare rows for prediction
    const rowsToPredict = data.map((row) => {
      const safe = (key) => (row[key] !== undefined ? row[key] : "");
      const parseNumber = (v) => {
        if (!v) return 0;
        if (typeof v === "number") return v;
        const cleaned = String(v)
          .replace(",", ".")
          .replace(/[^\d.\-]/g, "");
        const n = parseFloat(cleaned);
        return Number.isFinite(n) ? n : 0;
      };

      return {
        pilotId: String(safe("Pilot ID")).trim(),
        fullName: safe("Full Name") || "",
        totalFlightHours: parseNumber(safe("Total Flight Hours")),
        restHours: parseNumber(safe("Rest Hours")),
        consecutiveNightShifts: parseNumber(safe("Consecutive Night Shifts")),
        tzChanges: parseNumber(safe("Time Zone Changes")),
        flightSegments: parseNumber(safe("Flight Segments")),
        dutyType: safe("Duty Type") || "",
      };
    });

    // Call Python prediction service
    const pyResp = await axios.post(
      "http://localhost:5001/predict",
      { rows: rowsToPredict },
      { timeout: 120000 }
    );

    const predictions = pyResp.data.predictions || [];

    // Clear old predictions before saving new ones
    await Prediction.deleteMany({});

    // Map register data
    const regMap = {};
    registeredPilots.forEach((p) => {
      regMap[p.pilotId] = p;
    });

    const predictionDocs = predictions.map((p) => {
      const score = Math.max(0, Math.min(1, Number(p.score || 0)));
      let riskLevel = "Low";
      if (score > 0.7) riskLevel = "High";
      else if (score > 0.3) riskLevel = "Medium";

      const reg = regMap[p.pilotId] || {};
      return {
        pilotId: p.pilotId,
        fullName: reg.fullName || p.pilotId,
        photo: reg.photo || "",
        score,
        riskLevel,
        date: new Date(),
      };
    });

    await Prediction.insertMany(predictionDocs);

    try {
      fs.unlinkSync(filePath);
    } catch (e) {}

    res.json({ success: true, message: "🟢Predictions updated successfully." });
  } catch (error) {
    console.error("Roster upload error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error processing roster." });
  }
};
