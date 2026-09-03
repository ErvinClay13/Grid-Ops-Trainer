/**
 * MathBreakdown.jsx
 * -------------------
 * Renders a step-by-step calculation trail — the same kind of walkthrough
 * you'd write out by hand. Takes a plain array of steps so any scenario can
 * use it, not just Load Capacity Check.
 *
 * PROPS:
 *   steps - array of { label, formula }
 *     label   - what this step is doing, e.g. "Step 1 — Add up existing loads"
 *     formula - the actual numbers, e.g. "80 + 65 = 145 kW"
 */
export default function MathBreakdown({ steps }) {
  return (
    <div
      style={{
        marginTop: "14px",
        padding: "16px 20px",
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--warn)",
        borderRadius: "4px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          color: "var(--warn)",
          marginBottom: "12px",
        }}
      >
        Show the math
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {steps.map((step, i) => (
          <div key={i}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginBottom: "2px" }}>
              {step.label}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--text)" }}>
              {step.formula}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
