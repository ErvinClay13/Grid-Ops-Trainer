/**
 * voltageDrop.js
 * ---------------
 * SCENARIO: Voltage Drop Calculation
 *
 * THE REAL-WORLD PROBLEM:
 * As current travels down a wire, some voltage is lost to the wire's own
 * resistance — like friction slowing down water in a pipe. Run a wire too
 * long or too thin for the current it's carrying, and the voltage at the far
 * end drops too low to run equipment properly. Utilities and electricians
 * check this BEFORE running a line, not after.
 *
 * THE MATH (single-phase, two-conductor circuit):
 *      %VD = (2 * I * L * R) / (1000 * V_nominal) * 100
 *
 *   I  = current in amps
 *   L  = ONE-WAY conductor length in feet (we multiply by 2 because current
 *        has to travel out AND back — there and back again, like the wire's
 *        own round trip)
 *   R  = conductor resistance in ohms per 1000 ft (from wireResistance.js,
 *        looked up by AWG size)
 *   V_nominal = the nominal system voltage (e.g. 240V, 120V, 480V)
 *
 * We divide by 1000 because R is expressed "per 1000 feet" — this scales the
 * resistance down to the actual length being used.
 *
 * THE LIMIT:
 * Utilities generally aim to keep voltage drop under about 5% total
 * (this is a simplified stand-in for ANSI C84.1 Range A service voltage
 * limits — real projects split this budget between feeder and branch
 * circuits, but 5% overall is a reasonable teaching threshold).
 *
 * INPUT SHAPE:
 * {
 *   currentAmps: 40,        // number > 0, required
 *   lengthFt: 150,          // number > 0, required (one-way distance)
 *   awgSize: "10",          // string/number, required — see wireResistance.js
 *   nominalVoltage: 240     // number > 0, required
 * }
 */

const { getResistancePer1000Ft } = require("./wireResistance");

const MAX_ACCEPTABLE_VOLTAGE_DROP_PERCENT = 5;

function validateVoltageDropInput(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Input must be an object.");
  }
  if (typeof input.currentAmps !== "number" || input.currentAmps <= 0) {
    throw new Error('"currentAmps" must be a number > 0.');
  }
  if (typeof input.lengthFt !== "number" || input.lengthFt <= 0) {
    throw new Error('"lengthFt" must be a number > 0.');
  }
  if (input.awgSize === undefined || input.awgSize === null || input.awgSize === "") {
    throw new Error('"awgSize" is required (e.g. "10", "1/0").');
  }
  if (typeof input.nominalVoltage !== "number" || input.nominalVoltage <= 0) {
    throw new Error('"nominalVoltage" must be a number > 0.');
  }
}

/**
 * Calculates percent voltage drop for a run of conductor and checks it
 * against the acceptable limit.
 *
 * @param {Object} input - see INPUT SHAPE above
 * @returns {Object} breakdown of the calculation and a pass/fail verdict
 */
function calculateVoltageDrop(input) {
  validateVoltageDropInput(input);

  const { currentAmps, lengthFt, awgSize, nominalVoltage } = input;

  // This throws its own descriptive error if awgSize isn't in the table —
  // we let it bubble up so the caller sees exactly what went wrong.
  const resistancePer1000Ft = getResistancePer1000Ft(awgSize);

  const percentVoltageDrop =
    (2 * currentAmps * lengthFt * resistancePer1000Ft) / (1000 * nominalVoltage) * 100;

  const voltsDropped = (percentVoltageDrop / 100) * nominalVoltage;
  const exceedsLimit = percentVoltageDrop > MAX_ACCEPTABLE_VOLTAGE_DROP_PERCENT;

  return {
    resistancePer1000Ft,
    percentVoltageDrop: round2(percentVoltageDrop),
    voltsDropped: round2(voltsDropped),
    maxAcceptablePercent: MAX_ACCEPTABLE_VOLTAGE_DROP_PERCENT,
    exceedsLimit,
    verdict: exceedsLimit
      ? `Fails: ${round2(percentVoltageDrop)}% drop exceeds the ${MAX_ACCEPTABLE_VOLTAGE_DROP_PERCENT}% limit. Consider a larger conductor or shorter run.`
      : `Passes: ${round2(percentVoltageDrop)}% drop is within the ${MAX_ACCEPTABLE_VOLTAGE_DROP_PERCENT}% limit.`,
  };
}

function round2(num) {
  return Math.round(num * 100) / 100;
}

module.exports = {
  calculateVoltageDrop,
  validateVoltageDropInput,
  MAX_ACCEPTABLE_VOLTAGE_DROP_PERCENT,
};