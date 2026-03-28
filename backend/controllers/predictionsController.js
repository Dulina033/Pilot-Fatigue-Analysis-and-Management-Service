const Prediction = require("../models/predictionModel");
const Register = require("../models/registerModel"); // <-- add this

exports.getPredictions = async (req, res) => {
  try {
    // Fetch last 200 predictions
    const preds = await Prediction.find().sort({ date: -1 }).limit(200);

    // Get all pilotIds from predictions
    const pilotIds = preds.map((p) => p.pilotId);

    // Find matching pilots in Register collection
    const registeredPilots = await Register.find({
      pilotId: { $in: pilotIds },
    });

    // Create a quick lookup map for pilotId → nationality
    const nationalityMap = {};
    registeredPilots.forEach((r) => {
      nationalityMap[r.pilotId] = r.nationality;
    });

    // Attach nationality to each prediction
    const predsWithNationality = preds.map((p) => ({
      ...p.toObject(),
      nationality: nationalityMap[p.pilotId] || "Unknown",
    }));

    // Send enriched data
    res.json(predsWithNationality);
  } catch (err) {
    console.error("Get predictions error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
