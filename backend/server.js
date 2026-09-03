/**
 * server.js
 * ----------
 * Entry point for the Grid Ops Trainer backend. Mirrors the structure you
 * already used in Grid Toolkit: cors + dotenv setup, a health check route,
 * then feature routes mounted under /api.
 *
 * Each scenario gets its own URL:
 *   POST /api/evaluate/restoration
 *   POST /api/evaluate/load-check
 *   POST /api/evaluate/voltage-drop
 *   POST /api/evaluate/der-impact
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const restorationRoute = require("./api/evaluate/restoration");
const loadCheckRoute = require("./api/evaluate/loadCheck");
const voltageDropRoute = require("./api/evaluate/voltageDrop");
const derImpactRoute = require("./api/evaluate/derImpact");
const coachRoute = require("./api/coach");

const app = express();

app.use(cors());
app.use(express.json());

// Simple health check — same pattern as Grid Toolkit's /api/health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mount each scenario's route under /api/evaluate/<scenario-name>
app.use("/api/evaluate/restoration", restorationRoute);
app.use("/api/evaluate/load-check", loadCheckRoute);
app.use("/api/evaluate/voltage-drop", voltageDropRoute);
app.use("/api/evaluate/der-impact", derImpactRoute);
app.use("/api/coach", coachRoute);

// Render (and most hosts) inject PORT as an environment variable —
// same fix you already applied in Grid Toolkit for Render compatibility.
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Grid Ops Trainer backend running on port ${PORT}`);
});