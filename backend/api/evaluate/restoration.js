/**
 * api/evaluate/restoration.js
 * -----------------------------
 * THIS FILE'S ONLY JOB: translate an HTTP request into a call to the pure
 * math function, and translate the result back into an HTTP response.
 * It should NOT contain any math itself — that all lives in logic/restoration.js.
 *
 * This is the same separation you already used in Grid Toolkit: your Express
 * routes for /api/report and /api/chat didn't contain business logic inline
 * either, they validated input and delegated.
 */

const express = require("express");
const router = express.Router();

// Pulling the actual math in from the logic folder — note the relative path
// goes UP two levels (out of api/evaluate) then INTO logic.
const { prioritizeRestoration } = require("../../logic/restoration");

// POST /api/evaluate/restoration
router.post("/", (req, res) => {
  try {
    const { sites } = req.body;

    // prioritizeRestoration() already validates each site internally and
    // throws a descriptive Error if something's wrong — we just need to
    // catch it and turn it into a proper HTTP error response.
    const result = prioritizeRestoration(sites);

    res.json({ success: true, result });
  } catch (error) {
    // 400 = bad request (the trainee's input was invalid), not a server bug
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;