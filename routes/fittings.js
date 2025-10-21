// routes/fittings.js
const express = require("express");
const router = express.Router();
const calculateFitting = require("../utils/calculate_fitting"); // correct

router.post("/calculate", async (req, res) => {
  try {
    const { line_length_km, gauge_type } = req.body;
    const result = await calculateFitting({ line_length_km, gauge_type });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
