// backend/server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const registerRoutes = require("./routes/registerRoutes");
const rosterRoutes = require("./routes/rosterRoutes");
const predictionsRoutes = require("./routes/predictionsRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const reportsListRoutes = require("./routes/reportsListRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

// UPDATED CORS CONFIGURATION - Allow multiple frontend URLs
const allowedOrigins = [
  "http://localhost:5173", // Local development
  "https://pilot-fatigue-analysis-and-manageme.vercel.app", // Vercel frontend
  process.env.FRONTEND_URL, // Fallback from env
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));

// Use environment variable for MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/reports", reportsListRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api", authRoutes);
app.use("/api", registerRoutes);
app.use("/api", rosterRoutes);
app.use("/api", predictionsRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api", contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
