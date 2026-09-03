/**
 * CoachingPanel.jsx
 * -------------------
 * A "Get coaching" button that, once clicked, calls the /api/coach route
 * and displays Claude's explanation. Kept as its own component since all
 * four scenarios need the exact same behavior — one button, one loading
 * state, one feedback display.
 *
 * PROPS:
 *   scenarioType - string passed straight through to the backend
 *   result        - the computed result object to explain
 */
import { useState } from "react";
import { getCoaching } from "../api";

export default function CoachingPanel({ scenarioType, result }) {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const text = await getCoaching(scenarioType, result);
      setFeedback(text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "16px" }}>
      {!feedback && (
        <button
          onClick={handleClick}
          disabled={loading}
          style={{
            background: "transparent",
            border: "1px solid var(--accent)",
            color: "var(--accent)",
            borderRadius: "6px",
            padding: "10px 18px",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          {loading ? "Getting coaching…" : "Explain this result"}
        </button>
      )}

      {error && (
        <p style={{ color: "var(--fail)", fontSize: "0.9rem", marginTop: "10px" }}>
          {error}
        </p>
      )}

      {feedback && (
        <div
          style={{
            marginTop: "14px",
            padding: "16px 20px",
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderLeft: "3px solid var(--accent)",
            borderRadius: "4px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "var(--accent)",
              marginBottom: "8px",
            }}
          >
            Mentor notes
          </div>
          <p style={{ margin: 0, lineHeight: 1.6, color: "var(--text)" }}>{feedback}</p>
        </div>
      )}
    </div>
  );
}
