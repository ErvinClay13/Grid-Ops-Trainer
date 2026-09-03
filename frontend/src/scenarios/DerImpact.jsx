/**
 * DerImpact.jsx
 * ---------------
 * UI for the DER/solar interconnection scenario. Trainee enters circuit
 * capacity, minimum daytime load, and proposed solar capacity — sees
 * reverse power flow risk and whether it needs a full engineering study.
 */
import { useState } from "react";
import { evaluateScenario } from "../api";
import CoachingPanel from "../components/CoachingPanel";
import InfoTooltip from "../components/InfoTooltip";
import MathBreakdown from "../components/MathBreakdown";
import { inputStyle, primaryButtonStyle, secondaryButtonStyle } from "../components/formStyles";

const labelStyle = {
  display: "block",
  fontSize: "0.85rem",
  color: "var(--text-dim)",
  marginBottom: "6px",
};

export default function DerImpact() {
  const [circuitCapacityKW, setCircuitCapacityKW] = useState("");
  const [circuitMinDaytimeLoadKW, setCircuitMinDaytimeLoadKW] = useState("");
  const [solarCapacityKW, setSolarCapacityKW] = useState("");
  const [result, setResult] = useState(null);
  const [submittedInputs, setSubmittedInputs] = useState(null);
  const [showMath, setShowMath] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setResult(null);
    setShowMath(false);
    setLoading(true);
    try {
      const payload = {
        circuitCapacityKW: Number(circuitCapacityKW),
        circuitMinDaytimeLoadKW: Number(circuitMinDaytimeLoadKW),
        solarCapacityKW: Number(solarCapacityKW),
      };
      const evaluated = await evaluateScenario("der-impact", payload);
      setResult(evaluated);
      setSubmittedInputs(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function buildMathSteps() {
    if (!result || !submittedInputs) return [];
    const { circuitCapacityKW, circuitMinDaytimeLoadKW, solarCapacityKW } = submittedInputs;
    const { reverseFlowRisk, percentPenetration, screeningLimitPercent, needsFullStudy } = result;

    return [
      {
        label: "Step 1 — Check reverse power flow risk",
        formula: `${solarCapacityKW} kW solar ${reverseFlowRisk ? ">" : "≤"} ${circuitMinDaytimeLoadKW} kW min daytime load → ${
          reverseFlowRisk ? "Risk present" : "No risk"
        }`,
      },
      {
        label: "Step 2 — Calculate % penetration of circuit capacity",
        formula: `${solarCapacityKW} ÷ ${circuitCapacityKW} × 100 = ${percentPenetration}%`,
      },
      {
        label: "Step 3 — Compare penetration to the fast-track screening limit",
        formula: `${percentPenetration}% ${needsFullStudy ? ">" : "≤"} ${screeningLimitPercent}% → ${
          needsFullStudy ? "Full study required" : "Passes fast-track screening"
        }`,
      },
    ];
  }

  const isGood = result ? !result.reverseFlowRisk && !result.needsFullStudy : false;

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "6px" }}>
        DER / Solar Interconnection Impact
      </h2>
      <p style={{ color: "var(--text-dim)", marginTop: 0, marginBottom: "24px" }}>
        Check a proposed solar interconnection for reverse power flow risk and screening thresholds.
      </p>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        <div style={{ flex: 1, minWidth: "160px" }}>
          <label style={labelStyle}>
            Circuit capacity (kW)
            <InfoTooltip text="The total rated capacity of the circuit this solar system would connect to." />
          </label>
          <input
            type="number"
            value={circuitCapacityKW}
            onChange={(e) => setCircuitCapacityKW(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: "160px" }}>
          <label style={labelStyle}>
            Min daytime load (kW)
            <InfoTooltip text="The lightest load this circuit sees during the day — the moment solar output is most likely to exceed everything else being drawn." />
          </label>
          <input
            type="number"
            value={circuitMinDaytimeLoadKW}
            onChange={(e) => setCircuitMinDaytimeLoadKW(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: "160px" }}>
          <label style={labelStyle}>
            Proposed solar capacity (kW)
            <InfoTooltip text="The size of the solar system being proposed for interconnection." />
          </label>
          <input
            type="number"
            value={solarCapacityKW}
            onChange={(e) => setSolarCapacityKW(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>
      </div>

      <button onClick={handleSubmit} disabled={loading} style={primaryButtonStyle}>
        {loading ? "Calculating…" : "Assess interconnection"}
      </button>

      {error && <p style={{ color: "var(--fail)", marginTop: "14px" }}>{error}</p>}

      {result && (
        <>
          <div
            style={{
              border: `1px solid ${isGood ? "var(--pass)" : "var(--fail)"}`,
              boxShadow: `0 0 24px -8px ${isGood ? "var(--pass)" : "var(--fail)"}`,
              background: "var(--panel-2)",
              borderRadius: "6px",
              padding: "20px 24px",
              marginTop: "20px",
            }}
          >
            <div style={{ display: "flex", gap: "20px", marginBottom: "16px", flexWrap: "wrap" }}>
              <StatusChip label="Reverse flow risk" isBad={result.reverseFlowRisk} />
              <StatusChip label="Needs full study" isBad={result.needsFullStudy} />
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.95rem",
                color: "var(--text)",
                marginBottom: "12px",
              }}
            >
              Penetration: {result.percentPenetration}% (screening limit {result.screeningLimitPercent}%)
            </div>
            <p style={{ margin: 0, lineHeight: 1.5 }}>{result.verdict}</p>
          </div>
          <CoachingPanel scenarioType="derImpact" result={result} />

          {!showMath && (
            <button onClick={() => setShowMath(true)} style={{ ...secondaryButtonStyle, marginTop: "12px" }}>
              Show the math
            </button>
          )}
          {showMath && <MathBreakdown steps={buildMathSteps()} />}
        </>
      )}
    </div>
  );
}

function StatusChip({ label, isBad }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.8rem",
        color: isBad ? "var(--fail)" : "var(--pass)",
      }}
    >
      {label}: {isBad ? "YES" : "NO"}
    </div>
  );
}
