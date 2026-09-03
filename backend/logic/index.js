/**
 * index.js
 * ---------
 * Single entry point for all scenario math modules. This is what an Express
 * route (or anything else) should require, instead of reaching into each
 * file individually. Keeps imports clean:
 *
 *   const { prioritizeRestoration, checkFeederLoad } = require("./logic");
 *
 * instead of:
 *
 *   const { prioritizeRestoration } = require("./logic/restoration");
 *   const { checkFeederLoad } = require("./logic/loadCheck");
 */

const { prioritizeRestoration } = require("./restoration");
const { checkFeederLoad } = require("./loadCheck");
const { calculateVoltageDrop } = require("./voltageDrop");
const { assessDERImpact } = require("./derImpact");

module.exports = {
  prioritizeRestoration,
  checkFeederLoad,
  calculateVoltageDrop,
  assessDERImpact,
};