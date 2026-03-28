// backend/models/reportModel.js
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    pilotId: {
      type: String,
      required: true,
      ref: "Register",
    },
    pilotName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    downloadedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
reportSchema.index({ pilotId: 1, generatedAt: -1 });
reportSchema.index({ riskLevel: 1 });

module.exports = mongoose.model("Report", reportSchema);
