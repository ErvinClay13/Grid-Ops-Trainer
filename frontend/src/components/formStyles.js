/**
 * formStyles.js
 * --------------
 * Shared inline style objects for form inputs/buttons, used by every
 * scenario component. Pulled into one file so the look stays consistent
 * and so a future scenario doesn't need to redefine these from scratch.
 */

export const inputStyle = {
  background: "var(--panel-2)",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  padding: "10px 12px",
  color: "var(--text)",
  fontFamily: "var(--font-body)",
  fontSize: "0.9rem",
};

export const primaryButtonStyle = {
  background: "var(--accent)",
  border: "none",
  color: "var(--bg)",
  borderRadius: "6px",
  padding: "12px 22px",
  fontWeight: 700,
  fontSize: "0.9rem",
};

export const secondaryButtonStyle = {
  background: "transparent",
  border: "1px solid var(--border)",
  color: "var(--text-dim)",
  borderRadius: "6px",
  padding: "8px 14px",
  fontSize: "0.85rem",
};

export const removeButtonStyle = {
  background: "transparent",
  border: "1px solid var(--fail)",
  color: "var(--fail)",
  borderRadius: "4px",
  padding: "6px 10px",
  fontSize: "0.8rem",
};
