/**
 * test.js
 * --------
 * Quick manual sanity check — NOT a formal test suite (no Jest/Mocha here).
 * Run with: node logic/test.js
 *
 * Purpose: run one realistic example through each scenario module and print
 * the result, so we can eyeball that the math makes sense BEFORE wiring up
 * Express routes or a frontend. Same "backend-first, validate before you
 * build on top of it" approach used for Grid Toolkit.
 */

const {
  prioritizeRestoration,
  checkFeederLoad,
  calculateVoltageDrop,
  assessDERImpact,
} = require("./index");

console.log("\n===== 1. STORM RESTORATION PRIORITIZATION =====");
const restorationResult = prioritizeRestoration([
  { name: "Feeder 12", customersAffected: 500, estimatedRepairTimeHours: 2, isCriticalFacility: false },
  { name: "Substation 4 (Hospital tie)", customersAffected: 50, estimatedRepairTimeHours: 3, isCriticalFacility: true },
  { name: "Feeder 7", customersAffected: 120, estimatedRepairTimeHours: 4, isCriticalFacility: false },
]);
console.log(restorationResult);

console.log("\n===== 2. FEEDER/TRANSFORMER LOAD CHECK =====");
const loadResult = checkFeederLoad({
  ratedCapacityKVA: 500,
  connectedLoadsKW: [50, 80, 65, 40],
  diversityFactor: 0.7,
  newLoadKW: 60, // e.g. new EV chargers
});
console.log(loadResult);

console.log("\n===== 3. VOLTAGE DROP CALCULATION =====");
const vdResult = calculateVoltageDrop({
  currentAmps: 40,
  lengthFt: 150,
  awgSize: "10",
  nominalVoltage: 240,
});
console.log(vdResult);

console.log("\n===== 4. DER / SOLAR INTERCONNECTION IMPACT =====");
const derResult = assessDERImpact({
  circuitCapacityKW: 1000,
  circuitMinDaytimeLoadKW: 200,
  solarCapacityKW: 120,
});
console.log(derResult);

console.log("\nAll scenario modules ran without errors.\n");