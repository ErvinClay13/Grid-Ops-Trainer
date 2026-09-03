/**
 * derImpact.js
 * -------------
 * SCENARIO: DER (Distributed Energy Resource) / Solar Interconnection Impact
 *
 * "DER" = Distributed Energy Resource — generation that lives on the customer
 * side of the meter instead of a big central power plant. Rooftop solar is
 * the most common example. This scenario checks two things utilities care
 * about when someone wants to connect solar to an existing circuit.
 *
 * PROBLEM 1 — REVERSE POWER FLOW:
 * Power on a distribution circuit is normally designed to flow ONE way: from
 * the substation out to customers. If a home's solar panels generate MORE
 * power than the circuit is using at that moment, extra power flows backward
 * toward the substation — equipment and protection systems aren't always
 * designed for that.
 *
 *   Risk exists if: solarCapacityKW > circuitMinDaytimeLoadKW
 *   (i.e., even on the lightest-load part of the day, solar output could
 *   exceed everything else being drawn on the circuit — so backflow happens.)
 *
 * PROBLEM 2 — PENETRATION SCREENING:
 * Utilities use a quick "screening" check before requiring a full engineering
 * study: if the new solar capacity is a small enough slice of the circuit's
 * total capacity, it's assumed safe to approve without deeper study. This
 * scenario uses 15%, mirroring the common "15% of peak load" fast-track
 * screening rule used across the industry (specific utilities' actual
 * thresholds vary — this is a simplified teaching version).
 *
 *   % penetration = (solarCapacityKW / circuitCapacityKW) * 100
 *   Needs full study if % penetration > 15%
 *
 * INPUT SHAPE:
 * {
 *   circuitCapacityKW: 1000,        // number > 0, required (total circuit rating)
 *   circuitMinDaytimeLoadKW: 200,   // number >= 0, required (lightest daytime load)
 *   solarCapacityKW: 120            // number > 0, required (proposed solar size)
 * }
 */

const PENETRATION_SCREENING_LIMIT_PERCENT = 15;

function validateDERInput(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Input must be an object.");
  }
  if (typeof input.circuitCapacityKW !== "number" || input.circuitCapacityKW <= 0) {
    throw new Error('"circuitCapacityKW" must be a number > 0.');
  }
  if (
    typeof input.circuitMinDaytimeLoadKW !== "number" ||
    input.circuitMinDaytimeLoadKW < 0
  ) {
    throw new Error('"circuitMinDaytimeLoadKW" must be a number >= 0.');
  }
  if (typeof input.solarCapacityKW !== "number" || input.solarCapacityKW <= 0) {
    throw new Error('"solarCapacityKW" must be a number > 0.');
  }
}

/**
 * Assesses whether a proposed solar interconnection is likely to cause
 * reverse power flow and/or require a full engineering study.
 *
 * @param {Object} input - see INPUT SHAPE above
 * @returns {Object} breakdown of both checks and an overall verdict
 */
function assessDERImpact(input) {
  validateDERInput(input);

  const { circuitCapacityKW, circuitMinDaytimeLoadKW, solarCapacityKW } = input;

  const reverseFlowRisk = solarCapacityKW > circuitMinDaytimeLoadKW;
  const percentPenetration = (solarCapacityKW / circuitCapacityKW) * 100;
  const needsFullStudy = percentPenetration > PENETRATION_SCREENING_LIMIT_PERCENT;

  let verdict;
  if (reverseFlowRisk && needsFullStudy) {
    verdict = "High concern: reverse power flow risk AND exceeds fast-track screening — requires full engineering study.";
  } else if (reverseFlowRisk) {
    verdict = "Caution: reverse power flow is possible during low-load periods, even though penetration screening passed.";
  } else if (needsFullStudy) {
    verdict = "Caution: penetration exceeds the fast-track screening threshold — requires full engineering study.";
  } else {
    verdict = "Low concern: passes fast-track screening with no reverse power flow risk identified.";
  }

  return {
    reverseFlowRisk,
    percentPenetration: round2(percentPenetration),
    screeningLimitPercent: PENETRATION_SCREENING_LIMIT_PERCENT,
    needsFullStudy,
    verdict,
  };
}

function round2(num) {
  return Math.round(num * 100) / 100;
}

module.exports = {
  assessDERImpact,
  validateDERInput,
  PENETRATION_SCREENING_LIMIT_PERCENT,
};