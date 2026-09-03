/**
 * ResultReadout.jsx
 * -------------------
 * Displays a computed scenario result like a physical meter readout:
 * monospace digits, a glowing border/text color based on pass/fail state.
 * This is the shared visual signature used by all four scenarios, so a
 * result always FEELS like something real equipment just measured.
 *
 * PROPS:
 *   verdict   - string, the plain-English verdict from the backend
 *   isGood    - boolean, true = "pass" styling (green glow), false = "fail" (red glow)
 *   metrics   - array of { label, value } pairs to display as readout rows
 */
export default function ResultReadout({ verdict, isGood, metrics }) {
  return (
    <div
      className="result-readout"
      style={{
        border: `1px solid ${isGood ? "var(--pass)" : "var(--fail)"}`,
        boxShadow: `0 0 24px -8px ${isGood ? "var(--pass)" : "var(--fail)"}`,
        background: "var(--panel-2)",
        borderRadius: "6px",
        padding: "20px 24px",
        marginTop: "20px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.85rem",
          letterSpacing: "0.02em",
          color: isGood ? "var(--pass)" : "var(--fail)",
          marginBottom: "14px",
        }}
      >
        {isGood ? "WITHIN LIMITS" : "EXCEEDS LIMITS"}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "var(--font-mono)",
              fontSize: "0.95rem",
            }}
          >
            <span style={{ color: "var(--text-dim)" }}>{m.label}</span>
            <span style={{ color: "var(--text)" }}>{m.value}</span>
          </div>
        ))}
      </div>

      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.95rem",
          color: "var(--text)",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {verdict}
      </p>
    </div>
  );
}
