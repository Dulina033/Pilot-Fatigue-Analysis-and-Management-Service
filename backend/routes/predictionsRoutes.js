const express = require("express");
const { getPredictions } = require("../controllers/predictionsController");
const router = express.Router();

router.get("/predictions", getPredictions);

module.exports = router;
