const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
  pilotId: { type: String, required: true },
  fullName: String,
  nationality: String,
  photo: String,
  score: { type: Number, required: true },
  riskLevel: { type: String, enum: ["Low", "Medium", "High"] },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Prediction", predictionSchema);
