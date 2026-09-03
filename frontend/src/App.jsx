/**
 * App.jsx
 * --------
 * Top-level layout: a sidebar listing the four scenarios, and a main panel
 * showing whichever one is selected. Kept intentionally simple — a single
 * piece of state (`activeScenario`) controls which component renders.
 */
import { useState } from "react";
import Restoration from "./scenarios/Restoration";
import LoadCheck from "./scenarios/LoadCheck";
import VoltageDrop from "./scenarios/VoltageDrop";
import DerImpact from "./scenarios/DerImpact";

const SCENARIOS = [
  { id: "restoration", label: "Storm Restoration", Component: Restoration },
  { id: "loadCheck", label: "Load Capacity Check", Component: LoadCheck },
  { id: "voltageDrop", label: "Voltage Drop", Component: VoltageDrop },
  { id: "derImpact", label: "DER Interconnection", Component: DerImpact },
];

export default function App() {
  const [activeId, setActiveId] = useState(SCENARIOS[0].id);
  const active = SCENARIOS.find((s) => s.id === activeId);
  const ActiveComponent = active.Component;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "260px",
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          padding: "28px 20px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.15rem",
            marginBottom: "4px",
          }}
        >
          Grid Ops Trainer
        </div>
        <div style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: "28px" }}>
          Not affiliated with ComEd
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              style={{
                textAlign: "left",
                background: s.id === activeId ? "var(--panel-2)" : "transparent",
                border: "none",
                borderLeft: s.id === activeId ? "3px solid var(--accent)" : "3px solid transparent",
                color: s.id === activeId ? "var(--text)" : "var(--text-dim)",
                padding: "10px 12px",
                fontSize: "0.9rem",
                borderRadius: "4px",
              }}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: "40px 48px", maxWidth: "720px" }}>
        <ActiveComponent />
      </main>
    </div>
  );
}
