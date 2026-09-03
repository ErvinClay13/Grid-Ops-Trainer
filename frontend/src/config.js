/**
 * config.js
 * ----------
 * Single source of truth for the backend URL, same pattern as Grid Toolkit.
 *
 * IMPORTANT LESSON FROM GRID TOOLKIT: this file MUST be committed to git
 * before you deploy to Vercel. If it's still pointing at localhost when
 * Vercel builds the site, the deployed frontend will try to call your local
 * machine and silently fail. Change this value, THEN commit, THEN deploy.
 *
 * For local development, leave it as localhost. Before deploying, change it
 * to your Render backend URL (e.g. "https://grid-ops-trainer-api.onrender.com").
 */

export const BACKEND_URL = "https://grid-ops-trainer.onrender.com";