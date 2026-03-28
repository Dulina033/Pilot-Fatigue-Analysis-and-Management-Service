const express = require("express");
const {
  uploadMiddleware,
  uploadRoster,
} = require("../controllers/rosterController");
const router = express.Router();

router.post("/upload-roster", uploadMiddleware, uploadRoster);

module.exports = router;
