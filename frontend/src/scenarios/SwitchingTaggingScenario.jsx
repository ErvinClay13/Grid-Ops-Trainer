import React, { useState } from "react";


const STATE_COLORS = {
  closed: "#1D9E75", // energized - green
  open: "#888780",   // de-energized - grey
  tagged: "#E24B4A", // tagged/locked out - red
};

const STATE_LABELS = {
  closed: "Closed (energized)",
  open: "Open (de-energized)",
  tagged: "Tagged (locked out)",
};

function SwitchIcon({ state }) {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="26" fill={STATE_COLORS[state]} />
      <text
        x="30"
        y="35"
        textAnchor="middle"
        fontSize="11"
        fill="#fff"
        fontFamily="sans-serif"
      >
        {state === "closed" ? "CLOSED" : state === "open" ? "OPEN" : "TAG"}
      </text>
    </svg>
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
  // This enforces the real safety rule: you cannot tag an energized switch.
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
    ? "#378ADD" // cleared for work - blue
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
    <div style={{ fontFamily: "sans-serif", maxWidth: 700 }}>
      <h2>Switching & Safety Tagging</h2>
      <p>
        Isolate the work zone, apply tags, and confirm clearance before the
        crew can work. Reverse the sequence with Restore when the job is
        done.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "24px 0",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div>Source</div>
        </div>
        <div style={{ width: 30, height: 4, background: "#888" }} />

        <div style={{ textAlign: "center" }}>
          <button onClick={() => advanceSwitch("A")} style={{ border: "none", background: "none", cursor: "pointer" }}>
            <SwitchIcon state={switchA} />
          </button>
          <div style={{ fontSize: 12 }}>Switch A</div>
        </div>

        <div style={{ width: 30, height: 4, background: "#888" }} />

        <div
          style={{
            width: 100,
            height: 40,
            background: workZoneColor,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 12,
          }}
        >
          Work Zone
        </div>

        <div style={{ width: 30, height: 4, background: "#888" }} />

        <div style={{ textAlign: "center" }}>
          <button onClick={() => advanceSwitch("B")} style={{ border: "none", background: "none", cursor: "pointer" }}>
            <SwitchIcon state={switchB} />
          </button>
          <div style={{ fontSize: 12 }}>Switch B</div>
        </div>

        <div style={{ width: 30, height: 4, background: "#888" }} />
        <div style={{ textAlign: "center" }}>
          <div>Load</div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Legend: </strong>
        {Object.entries(STATE_LABELS).map(([key, label]) => (
          <span key={key} style={{ marginRight: 16, fontSize: 13 }}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                background: STATE_COLORS[key],
                marginRight: 4,
                borderRadius: "50%",
              }}
            />
            {label}
          </span>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <button
          onClick={confirmClearance}
          disabled={!bothTagged || clearanceConfirmed}
        >
          Confirm Clearance
        </button>{" "}
        <button onClick={restore}>Restore</button>
      </div>

      <div>
        <strong>Operating Log</strong>
        <div
          style={{
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 4,
            fontSize: 13,
            maxHeight: 160,
            overflowY: "auto",
          }}
        >
          {log.length === 0 ? (
            <div style={{ color: "#888" }}>No actions yet.</div>
          ) : (
            log.map((entry, i) => <div key={i}>{entry}</div>)
          )}
        </div>
      </div>
    </div>
  );
}
