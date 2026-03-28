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


app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
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
