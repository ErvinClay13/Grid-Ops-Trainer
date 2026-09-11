/**
 * SwitchingTaggingScenario.jsx
 * -----------------------------
 */
import { useState } from "react";
import CoachingPanel from "../components/CoachingPanel";
import InfoTooltip from "../components/InfoTooltip";
import { primaryButtonStyle, secondaryButtonStyle } from "./formStyles";

// Functional status colors - these carry fixed safety meaning (like a real
// one-line diagram legend) rather than following the app's accent theme.
const STATE_COLORS = {
  closed: "#1D9E75", // energized
  open: "#6b6f76", // de-energized
  tagged: "#E24B4A", // tagged / locked out
  cleared: "#378ADD", // cleared for work
};

const STATE_LABELS = {
  closed: "Closed (energized)",
  open: "Open (de-energized)",
  tagged: "Tagged (locked out)",
};

function SwitchNode({ state, label, onClick }) {
  return (
    <div style={{ textAlign: "center" }}>
      <button
        onClick={onClick}
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          background: STATE_COLORS[state],
          color: "#fff",
          fontSize: "0.65rem",
          fontFamily: "var(--font-body)",
          cursor: "pointer",
        }}
      >
        {state === "closed" ? "CLOSED" : state === "open" ? "OPEN" : "TAG"}
      </button>
      <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginTop: "6px" }}>
        {label}
      </div>
    </div>
  );
}

export default function SwitchingTaggingScenario() {
  const [switchA, setSwitchA] = useState("closed");
  const [switchB, setSwitchB] = useState("closed");
  const [clearanceConfirmed, setClearanceConfirmed] = useState(false);
  const [log, setLog] = useState([]);

  function logAction(text) {
    const time = new Date().toLocaleTimeString();
    setLog((prev) => [...prev, `[${time}] ${text}`]);
  }

  // A switch can only move forward one step at a time: closed -> open -> tagged.
  // Enforces the real safety rule - you cannot tag an energized switch.
  function advanceSwitch(which) {
    const current = which === "A" ? switchA : switchB;
    const setFn = which === "A" ? setSwitchA : setSwitchB;

    if (current === "closed") {
      setFn("open");
      logAction(`Switch ${which} opened - de-energized`);
    } else if (current === "open") {
      setFn("tagged");
      logAction(`Safety tag applied to Switch ${which}`);
    }
  }

  const bothTagged = switchA === "tagged" && switchB === "tagged";
  const workZoneColor = clearanceConfirmed
    ? STATE_COLORS.cleared
    : bothTagged
    ? STATE_COLORS.tagged
    : switchA === "closed" || switchB === "closed"
    ? STATE_COLORS.closed
    : STATE_COLORS.open;

  function confirmClearance() {
    if (!bothTagged) return; // guard: cannot confirm clearance early
    setClearanceConfirmed(true);
    logAction("Clearance confirmed - crew cleared to work on segment");
  }

  // Restore reverses the whole sequence in one action, the way a real
  // operator closes out a job: remove tags, close switches, re-energize.
  function restore() {
    setClearanceConfirmed(false);
    setSwitchA("closed");
    setSwitchB("closed");
    logAction("Tags removed, switches closed - segment re-energized");
  }

  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.4rem",
          marginBottom: "6px",
        }}
      >
        Switching & Safety Tagging
      </h1>
      <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", marginBottom: "28px" }}>
        Isolate the work zone, apply tags, and confirm clearance before the crew
        can work. Reverse the sequence with Restore when the job is done.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          background: "var(--panel-2)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          padding: "28px 24px",
          marginBottom: "20px",
        }}
      >
        <div style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.8rem" }}>
          Source
        </div>
        <div style={{ width: "24px", height: "3px", background: "var(--border)" }} />

        <SwitchNode
          state={switchA}
          label={
            <>
              Switch A <InfoTooltip text="Click to advance: closed -> open -> tagged" />
            </>
          }
          onClick={() => advanceSwitch("A")}
        />

        <div style={{ width: "24px", height: "3px", background: "var(--border)" }} />

        <div
          style={{
            width: "110px",
            height: "44px",
            background: workZoneColor,
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "0.75rem",
            fontFamily: "var(--font-body)",
          }}
        >
          Work Zone
        </div>

        <div style={{ width: "24px", height: "3px", background: "var(--border)" }} />

        <SwitchNode
          state={switchB}
          label={
            <>
              Switch B <InfoTooltip text="Click to advance: closed -> open -> tagged" />
            </>
          }
          onClick={() => advanceSwitch("B")}
        />

        <div style={{ width: "24px", height: "3px", background: "var(--border)" }} />
        <div style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.8rem" }}>
          Load
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        {Object.entries(STATE_LABELS).map(([key, label]) => (
          <span
            key={key}
            style={{
              marginRight: "18px",
              fontSize: "0.8rem",
              color: "var(--text-dim)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "9px",
                height: "9px",
                background: STATE_COLORS[key],
                marginRight: "6px",
                borderRadius: "50%",
              }}
            />
            {label}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <button
          onClick={confirmClearance}
          disabled={!bothTagged || clearanceConfirmed}
          style={{
            ...primaryButtonStyle,
            opacity: !bothTagged || clearanceConfirmed ? 0.5 : 1,
            cursor: !bothTagged || clearanceConfirmed ? "default" : "pointer",
          }}
        >
          Confirm Clearance
        </button>
        <button onClick={restore} style={secondaryButtonStyle}>
          Restore
        </button>
      </div>

      <div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "var(--accent)",
            marginBottom: "8px",
          }}
        >
          Operating log
        </div>
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "14px 16px",
            fontSize: "0.8rem",
            color: "var(--text)",
            maxHeight: "160px",
            overflowY: "auto",
          }}
        >
          {log.length === 0 ? (
            <div style={{ color: "var(--text-dim)" }}>No actions yet.</div>
          ) : (
            log.map((entry, i) => <div key={i}>{entry}</div>)
          )}
        </div>
      </div>

      {clearanceConfirmed && (
        <CoachingPanel
          scenarioType="switchingTagging"
          result={{ switchA, switchB, clearanceConfirmed }}
        />
      )}
    </div>
  );
}
