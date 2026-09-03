/**
 * LoadCheck.jsx
 * ---------------
 * UI for the feeder/transformer load capacity scenario. Trainee enters
 * rated capacity, a list of existing connected loads, a diversity factor,
 * and a proposed new load — then sees whether it overloads the equipment.
 *
 * Two teaching aids added on top of the base form:
 *   - InfoTooltip next to each field label, explaining what it means
 *   - A "Show the math" button (appears after coaching) that walks through
 *     the exact step-by-step calculation using the real submitted numbers
 */
import { useState } from "react";
import { evaluateScenario } from "../api";
import CoachingPanel from "../components/CoachingPanel";
import ResultReadout from "../components/ResultReadout";
import InfoTooltip from "../components/InfoTooltip";
import MathBreakdown from "../components/MathBreakdown";
import { inputStyle, primaryButtonStyle, secondaryButtonStyle, removeButtonStyle } from "../components/formStyles";

const labelStyle = {
  display: "block",
  fontSize: "0.85rem",
  color: "var(--text-dim)",
  marginBottom: "6px",
};

export default function LoadCheck() {
  const [ratedCapacityKVA, setRatedCapacityKVA] = useState("");
  const [connectedLoads, setConnectedLoads] = useState(["", ""]);
  const [diversityFactor, setDiversityFactor] = useState("");
  const [newLoadKW, setNewLoadKW] = useState("");
  const [result, setResult] = useState(null);
  // Snapshot of the exact inputs used for the calculation that produced
  // `result` — kept separate from the live form state so "Show the math"
  // stays accurate even if the trainee edits the fields afterward.
  const [submittedInputs, setSubmittedInputs] = useState(null);
  const [showMath, setShowMath] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function updateLoad(index, value) {
    const next = [...connectedLoads];
    next[index] = value;
    setConnectedLoads(next);
  }

  async function handleSubmit() {
    setError(null);
    setResult(null);
    setShowMath(false);
    setLoading(true);
    try {
      const payload = {
        ratedCapacityKVA: Number(ratedCapacityKVA),
        connectedLoadsKW: connectedLoads.map(Number),
        diversityFactor: Number(diversityFactor),
        newLoadKW: Number(newLoadKW),
      };
      const evaluated = await evaluateScenario("load-check", payload);
      setResult(evaluated);
      setSubmittedInputs(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Builds the step-by-step breakdown from the actual submitted numbers +
  // the result the backend computed from them.
  function buildMathSteps() {
    if (!result || !submittedInputs) return [];

    return [
      {
        label: "Step 1 — Add up existing loads",
        formula: `${submittedInputs.connectedLoadsKW.join(" + ")} = ${result.sumConnectedLoadsKW} kW`,
      },
      {
        label: "Step 2 — Apply the diversity factor",
        formula: `${result.sumConnectedLoadsKW} × ${submittedInputs.diversityFactor} = ${result.diversifiedLoadKW} kW`,
      },
      {
        label: "Step 3 — Add the proposed new load",
        formula: `${result.diversifiedLoadKW} + ${submittedInputs.newLoadKW} = ${result.totalDemandKW} kW`,
      },
      {
        label: "Step 4 — Calculate the safe threshold (80% of rated capacity)",
        formula: `${submittedInputs.ratedCapacityKVA} × 0.8 = ${result.safeThresholdKW} kW`,
      },
      {
        label: "Step 5 — Compare total demand to the safe threshold",
        formula: `${result.totalDemandKW} kW ${result.isOverloaded ? ">" : "≤"} ${result.safeThresholdKW} kW → ${
          result.isOverloaded ? "Overloaded" : "Within limits"
        } (${result.percentOfRatedCapacity}% of rated capacity)`,
      },
    ];
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "6px" }}>
        Feeder / Transformer Load Check
      </h2>
      <p style={{ color: "var(--text-dim)", marginTop: 0, marginBottom: "24px" }}>
        Check whether adding new load — like a cluster of EV chargers — overloads existing equipment.
      </p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "18px" }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>
            Rated capacity (kVA)
            <InfoTooltip text="The equipment's nameplate rating — the maximum load it's built to handle, stamped right on the transformer or feeder." />
          </label>
          <input
            type="number"
            value={ratedCapacityKVA}
            onChange={(e) => setRatedCapacityKVA(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>
            Diversity factor (0–1)
            <InfoTooltip text="Accounts for the fact that not every customer uses full load at the same time. A lower number means less overlap in usage; closer to 1 means loads tend to peak together." />
          </label>
          <input
            type="number"
            step="0.01"
            value={diversityFactor}
            onChange={(e) => setDiversityFactor(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>
      </div>

      <label style={labelStyle}>
        Existing connected loads (kW)
        <InfoTooltip text="The load already on this equipment from current customers. Add one entry per load source, or just a few representative values." />
      </label>
      {connectedLoads.map((load, i) => (
        <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
          <input
            type="number"
            placeholder={`Load ${i + 1} (kW)`}
            value={load}
            onChange={(e) => updateLoad(i, e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          {connectedLoads.length > 1 && (
            <button onClick={() => setConnectedLoads(connectedLoads.filter((_, idx) => idx !== i))} style={removeButtonStyle}>
              Remove
            </button>
          )}
        </div>
      ))}
      <button onClick={() => setConnectedLoads([...connectedLoads, ""])} style={secondaryButtonStyle}>
        + Add another load
      </button>

      <div style={{ marginTop: "18px" }}>
        <label style={labelStyle}>
          Proposed new load (kW)
          <InfoTooltip text="The new load you're considering adding — for example, a cluster of EV chargers being installed on this circuit." />
        </label>
        <input
          type="number"
          value={newLoadKW}
          onChange={(e) => setNewLoadKW(e.target.value)}
          style={{ ...inputStyle, width: "100%" }}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleSubmit} disabled={loading} style={primaryButtonStyle}>
          {loading ? "Calculating…" : "Check load capacity"}
        </button>
      </div>

      {error && <p style={{ color: "var(--fail)", marginTop: "14px" }}>{error}</p>}

      {result && (
        <>
          <ResultReadout
            verdict={result.verdict}
            isGood={!result.isOverloaded}
            metrics={[
              { label: "Sum of connected loads", value: `${result.sumConnectedLoadsKW} kW` },
              { label: "Diversified load", value: `${result.diversifiedLoadKW} kW` },
              { label: "Total demand", value: `${result.totalDemandKW} kW` },
              { label: "Safe threshold (80%)", value: `${result.safeThresholdKW} kW` },
              { label: "% of rated capacity", value: `${result.percentOfRatedCapacity}%` },
            ]}
          />
          <CoachingPanel scenarioType="loadCheck" result={result} />

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
 