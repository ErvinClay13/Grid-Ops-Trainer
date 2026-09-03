/**
 * lib/claudeClient.js
 * ---------------------
 * Sets up a single shared Anthropic API client, using the same "keep the API
 * key server-side, never in client code" pattern you already used for Grid
 * Toolkit's Grid Assistant. The frontend never talks to Anthropic directly —
 * it only talks to OUR backend, which then talks to Anthropic.
 *
 * Requires ANTHROPIC_API_KEY to be set in your .env file (same as before).
 */

const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// NOTE: verify this is still the model you want at docs.claude.com/en/docs/about-claude/models
// before deploying — model names/versions get updated over time.
const MODEL = "claude-sonnet-5";

module.exports = { client, MODEL };