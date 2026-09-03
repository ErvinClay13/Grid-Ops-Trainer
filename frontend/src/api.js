/**
 * api.js
 * -------
 * Small wrapper around fetch() for talking to our backend. Every scenario
 * component uses these two functions instead of writing fetch() calls
 * directly — keeps the URL-building and error handling in one place.
 */

import { BACKEND_URL } from "./config";

/**
 * Submits scenario input to the matching /api/evaluate/<endpoint> route
 * and returns the computed result.
 *
 * @param {string} endpoint - e.g. "restoration", "load-check", "voltage-drop", "der-impact"
 * @param {object} payload - the scenario's input data
 * @returns {Promise<object>} the computed result object
 */
export async function evaluateScenario(endpoint, payload) {
  const response = await fetch(`${BACKEND_URL}/api/evaluate/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!data.success) {
    // The backend already gives us a readable error message — surface it
    // directly instead of a generic "something went wrong."
    throw new Error(data.error || "The server couldn't evaluate this scenario.");
  }

  return data.result;
}

/**
 * Sends a computed result to /api/coach and returns Claude's coaching
 * explanation as plain text.
 *
 * @param {string} scenarioType - "restoration" | "loadCheck" | "voltageDrop" | "derImpact"
 * @param {object} result - the object returned by evaluateScenario()
 * @param {string} [traineeReasoning] - optional, what the trainee guessed first
 * @returns {Promise<string>} Claude's feedback text
 */
export async function getCoaching(scenarioType, result, traineeReasoning) {
  const response = await fetch(`${BACKEND_URL}/api/coach`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenarioType, result, traineeReasoning }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Couldn't get coaching feedback.");
  }

  return data.feedback;
}
