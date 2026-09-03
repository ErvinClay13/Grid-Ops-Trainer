/**
 * loadCheck.js
 * -------------
 * SCENARIO: Feeder / Transformer Load Capacity Check
 *
 * THE REAL-WORLD PROBLEM:
 * Equipment (a feeder or transformer) has a maximum rated capacity. If you add
 * new load — say, a cluster of EV chargers on a residential street — you need
 * to know whether that equipment can handle it, WITHOUT running it right up to
 * the edge of its nameplate rating (that leaves no safety margin for hot days,
 * measurement error, or future growth).
 *
 * THE MATH:
 * 1. "Diversity factor" accounts for the fact that not every connected
 *    customer uses their full load at the same time (not everyone runs their
 *    A/C and oven at once). So we DON'T just add up every load — we apply
 *    a diversity factor (a decimal, e.g. 0.7) to the sum of connected loads.
 *
 *      diversifiedLoad = sum(connectedLoadsKW) * diversityFactor
 *      totalDemandKW = diversifiedLoad + newLoadKW
 *
 * 2. We compare totalDemandKW against 80% of rated capacity, not 100%.
 *    Utilities plan to ~80% of nameplate rating on purpose, to leave headroom
 *    for hot-weather load growth and measurement uncertainty. This is a
 *    simplified stand-in for real planning criteria/standards.
 *
 *      safeThresholdKW = ratedCapacityKVA * 0.8
 *      isOverloaded = totalDemandKW > safeThresholdKW
 *
 * NOTE ON UNITS: We're treating kVA and kW as roughly interchangeable here for
 * simplicity (i.e. assuming a power factor close to 1). Real-world load studies
 * account for power factor separately — flagged here so it's not a surprise
 * later if you build this out further.
 *
 * INPUT SHAPE:
 * {
 *   ratedCapacityKVA: 500,             // number > 0, required
 *   connectedLoadsKW: [50, 80, 65],    // array of numbers > 0, required
 *   diversityFactor: 0.7,              // number between 0 and 1, required
 *   newLoadKW: 40                      // number >= 0, required
 * }
 */

const SAFE_LOADING_THRESHOLD = 0.8; // plan to 80% of nameplate capacity

function validateLoadCheckInput(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Input must be an object.");
  }
  if (typeof input.ratedCapacityKVA !== "number" || input.ratedCapacityKVA <= 0) {
    throw new Error('"ratedCapacityKVA" must be a number > 0.');
  }
  if (
    !Array.isArray(input.connectedLoadsKW) ||
    input.connectedLoadsKW.length === 0 ||
    input.connectedLoadsKW.some((v) => typeof v !== "number" || v < 0)
  ) {
    throw new Error('"connectedLoadsKW" must be a non-empty array of numbers >= 0.');
  }
  if (
    typeof input.diversityFactor !== "number" ||
    input.diversityFactor <= 0 ||
    input.diversityFactor > 1
  ) {
    throw new Error('"diversityFactor" must be a number between 0 (exclusive) and 1 (inclusive).');
  }
  if (typeof input.newLoadKW !== "number" || input.newLoadKW < 0) {
    throw new Error('"newLoadKW" must be a number >= 0.');
  }
}

/**
 * Checks whether adding a new load would overload a feeder/transformer.
 *
 * @param {Object} input - see INPUT SHAPE above
 * @returns {Object} breakdown of the calculation and a pass/fail verdict
 */
function checkFeederLoad(input) {
  validateLoadCheckInput(input);

  const { ratedCapacityKVA, connectedLoadsKW, diversityFactor, newLoadKW } = input;

  const sumConnectedLoadsKW = connectedLoadsKW.reduce((sum, v) => sum + v, 0);
  const diversifiedLoadKW = sumConnectedLoadsKW * diversityFactor;
  const totalDemandKW = diversifiedLoadKW + newLoadKW;
  const safeThresholdKW = ratedCapacityKVA * SAFE_LOADING_THRESHOLD;
  const isOverloaded = totalDemandKW > safeThresholdKW;
  const percentOfRatedCapacity = (totalDemandKW / ratedCapacityKVA) * 100;

  return {
    sumConnectedLoadsKW: round2(sumConnectedLoadsKW),
    diversifiedLoadKW: round2(diversifiedLoadKW),
    totalDemandKW: round2(totalDemandKW),
    safeThresholdKW: round2(safeThresholdKW),
    percentOfRatedCapacity: round2(percentOfRatedCapacity),
    isOverloaded,
    verdict: isOverloaded
      ? `Overloaded: demand (${round2(totalDemandKW)} kW) exceeds the 80% safety threshold (${round2(safeThresholdKW)} kW).`
      : `Within limits: demand (${round2(totalDemandKW)} kW) is under the 80% safety threshold (${round2(safeThresholdKW)} kW).`,
  };
}

// Small helper to keep output numbers readable (2 decimal places)
function round2(num) {
  return Math.round(num * 100) / 100;
}

module.exports = { checkFeederLoad, validateLoadCheckInput, SAFE_LOADING_THRESHOLD };