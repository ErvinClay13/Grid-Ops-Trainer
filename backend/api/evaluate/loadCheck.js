/**
 * api/evaluate/loadCheck.js
 * ----------------------------
 * HTTP wrapper around logic/loadCheck.js — no math lives here, only
 * request/response handling. See api/evaluate/restoration.js for the
 * full explanation of why this split exists.
 */

const express = require("express");
const router = express.Router();

const { checkFeederLoad } = require("../../logic/loadCheck");

// POST /api/evaluate/load-check
router.post("/", (req, res) => {
  try {
    const { ratedCapacityKVA, connectedLoadsKW, diversityFactor, newLoadKW } = req.body;

    const result = checkFeederLoad({
      ratedCapacityKVA,
      connectedLoadsKW,
      diversityFactor,
      newLoadKW,
    });

    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;