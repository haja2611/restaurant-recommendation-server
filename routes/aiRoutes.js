const express = require("express");
const { aiRecommendation } = require("../controllers/aiController");
const router = express.Router();

router.post("/recommend", aiRecommendation);

module.exports = router;
