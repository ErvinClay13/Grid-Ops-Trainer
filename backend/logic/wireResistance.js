/**
 * wireResistance.js
 * -------------------
 * Lookup table of copper conductor resistance, in ohms per 1000 feet.
 *
 * WHY THIS EXISTS:
 * Voltage drop depends on how much resistance the current has to push through.
 * Thicker wire (lower AWG number, or "0" sizes like 1/0, 2/0) has LESS resistance.
 * These values are approximate, based on standard NEC Chapter 9 Table 8 figures
 * for uncoated copper conductors. Good enough for training/estimation purposes —
 * NOT a substitute for a real engineering-grade conductor table.
 *
 * "1/0", "2/0", etc. are wire sizes bigger than 1 AWG (used in feeders/services).
 * We store them as strings because "1/0" isn't a valid plain number.
 */

const COPPER_RESISTANCE_OHMS_PER_1000FT = {
  "14": 3.07,
  "12": 1.93,
  "10": 1.21,
  "8": 0.764,
  "6": 0.491,
  "4": 0.308,
  "2": 0.194,
  "1": 0.154,
  "1/0": 0.122,
  "2/0": 0.0967,
  "3/0": 0.0766,
  "4/0": 0.0608,
};

/**
 * Look up resistance for a given AWG size.
 * @param {string|number} awgSize - e.g. "12", 12, or "1/0"
 * @returns {number} resistance in ohms per 1000 ft
 * @throws {Error} if the size isn't in our table
 */
function getResistancePer1000Ft(awgSize) {
  const key = String(awgSize);
  const resistance = COPPER_RESISTANCE_OHMS_PER_1000FT[key];

  if (resistance === undefined) {
    const validSizes = Object.keys(COPPER_RESISTANCE_OHMS_PER_1000FT).join(", ");
    throw new Error(
      `Unknown AWG size "${awgSize}". Valid sizes are: ${validSizes}`
    );
  }

  return resistance;
}

// CommonJS export (matches your Express backend style)
module.exports = {
  COPPER_RESISTANCE_OHMS_PER_1000FT,
  getResistancePer1000Ft,
};