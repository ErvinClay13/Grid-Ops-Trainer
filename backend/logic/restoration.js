/**
 * restoration.js
 * ---------------
 * SCENARIO: Storm Restoration Prioritization
 *
 * THE REAL-WORLD PROBLEM:
 * After a storm, multiple sites (feeders/substations) are down at once, but you
 * only have a limited number of crews. You need to decide WHICH ORDER to restore
 * power in. Two competing values matter:
 *   1. Critical facilities (hospitals, water treatment, 911 centers) get priority
 *      no matter what — public safety comes first, period.
 *   2. Among everything else, you want to restore the most people per hour of
 *      crew work. A site with 500 customers and a 2-hour fix is a better use of
 *      a crew than a site with 50 customers and a 4-hour fix.
 *
 * THE MATH:
 * For non-critical sites, we rank by:
 *      priorityScore = customersAffected / estimatedRepairTimeHours
 * Higher score = higher priority (more customers restored per hour spent).
 *
 * INPUT SHAPE (array of site objects):
 * {
 *   name: "Feeder 12",              // string, required
 *   customersAffected: 500,         // number > 0, required
 *   estimatedRepairTimeHours: 2,    // number > 0, required
 *   isCriticalFacility: false       // boolean, required
 * }
 */

/**
 * Validates a single site object. Throws a descriptive error if something's wrong,
 * so the caller (API route or UI) can show a helpful message instead of crashing.
 */
function validateSite(site, index) {
  if (!site || typeof site !== "object") {
    throw new Error(`Site at index ${index} must be an object.`);
  }
  if (typeof site.name !== "string" || site.name.trim() === "") {
    throw new Error(`Site at index ${index} needs a non-empty "name" string.`);
  }
  if (typeof site.customersAffected !== "number" || site.customersAffected <= 0) {
    throw new Error(`Site "${site.name}" needs "customersAffected" > 0.`);
  }
  if (
    typeof site.estimatedRepairTimeHours !== "number" ||
    site.estimatedRepairTimeHours <= 0
  ) {
    throw new Error(
      `Site "${site.name}" needs "estimatedRepairTimeHours" > 0.`
    );
  }
  if (typeof site.isCriticalFacility !== "boolean") {
    throw new Error(`Site "${site.name}" needs "isCriticalFacility" (true/false).`);
  }
}

/**
 * Ranks a list of storm-damaged sites in the order crews should restore them.
 *
 * @param {Array<Object>} sites - see INPUT SHAPE above
 * @returns {Array<Object>} the same sites, sorted by restoration priority,
 *   each with an added `priorityScore` and `reason` field explaining WHY
 *   it landed where it did (useful for the coaching/feedback feature later).
 */
function prioritizeRestoration(sites) {
  if (!Array.isArray(sites) || sites.length === 0) {
    throw new Error("prioritizeRestoration requires a non-empty array of sites.");
  }

  sites.forEach(validateSite);

  // Attach a priority score to every site up front.
  const scored = sites.map((site) => {
    const priorityScore = site.customersAffected / site.estimatedRepairTimeHours;
    return {
      ...site,
      priorityScore: Math.round(priorityScore * 100) / 100, // round to 2 decimals
    };
  });

  // Sort: critical facilities first (regardless of score), then by score descending.
  const sorted = scored.sort((a, b) => {
    if (a.isCriticalFacility && !b.isCriticalFacility) return -1;
    if (!a.isCriticalFacility && b.isCriticalFacility) return 1;
    return b.priorityScore - a.priorityScore;
  });

  // Add a plain-English reason for each ranking — helpful for UI display
  // and as context to feed into the Claude coaching call later.
  return sorted.map((site, index) => ({
    ...site,
    rank: index + 1,
    reason: site.isCriticalFacility
      ? "Critical facility — always restored first regardless of customer count."
      : `Restores ${site.priorityScore} customers per crew-hour, ${
          index === 0 ? "the highest of the remaining sites." : "based on customers affected vs. repair time."
        }`,
  }));
}

module.exports = { prioritizeRestoration, validateSite };