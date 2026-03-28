const Prediction = require("../models/predictionModel");
const Register = require("../models/registerModel");

/**
 * Return ICAO/IATA fatigue-mitigation recommendations
 * according to pilot fatigue score range.
 */
exports.getRecommendations = async (req, res) => {
  try {
    const { pilotId } = req.params;

    // 1️⃣ Find pilot’s latest prediction
    const pilot = await Prediction.findOne({ pilotId })
      .sort({ date: -1 })
      .lean();

    if (!pilot) {
      return res
        .status(404)
        .json({ success: false, message: "Pilot not found." });
    }

    const score = Number(pilot.score || 0);
    let riskLevel = "Low";
if (score >= 0.8) riskLevel = "High";
else if (score >= 0.5) riskLevel = "Medium";

    // 2️⃣ ICAO/IATA-aligned recommendation sets
    let recommendations = [];

    if (riskLevel === "Low") {
      recommendations = [
        "Continue normal duty schedule while monitoring alertness.",
        "Ensure minimum rest of 10 hours within any 24-hour period.",
        "Encourage light physical activity and hydration.",
        "Follow standard ICAO FRMS rest-reporting protocols.",
      ];
    } else if (riskLevel === "Medium") {
      recommendations = [
        "Review recent duty rosters for cumulative fatigue exposure.",
        "Schedule at least 12 consecutive hours of rest before next flight duty.",
        "Avoid multiple night operations within 48 hours.",
        "Encourage strategic naps (≤40 min) before duty if permitted by airline policy.",
        "Conduct self-assessment using ICAO fatigue checklist before flight.",
      ];
    } else if (riskLevel === "High") {
      recommendations = [
        "Remove pilot from flight duty until medical and fatigue assessment is completed.",
        "Implement at least 24 hours of continuous rest before resuming operations.",
        "Review circadian disruption (time-zone changes >4 h) per ICAO FRMS guidelines.",
        "Assign alternate crew or split duty periods for the next 72 hours.",
        "File a fatigue event report in accordance with IATA/ICAO safety reporting frameworks.",
      ];
    }

    // 3️⃣ Optional: include nationality or register data
    const registerInfo = await Register.findOne({ pilotId }).lean();

    res.json({
      success: true,
      pilotId,
      score,
      riskLevel,
      nationality: registerInfo?.nationality || "Unknown",
      recommendations,
    });
  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while generating recommendations.",
    });
  }
};
