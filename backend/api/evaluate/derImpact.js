/**
 * api/evaluate/derImpact.js
 * ----------------------------
 * HTTP wrapper around logic/derImpact.js — no math lives here, only
 * request/response handling. See api/evaluate/restoration.js for the
 * full explanation of why this split exists.
 */

const express = require("express");
const router = express.Router();

const { assessDERImpact } = require("../../logic/derImpact");

// POST /api/evaluate/der-impact
router.post("/", (req, res) => {
  try {
    const { circuitCapacityKW, circuitMinDaytimeLoadKW, solarCapacityKW } = req.body;

    const result = assessDERImpact({
      circuitCapacityKW,
      circuitMinDaytimeLoadKW,
      solarCapacityKW,
    });

    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;