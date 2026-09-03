/**
 * VoltageDrop.jsx
 * -----------------
 * UI for the voltage drop scenario. Trainee enters current, conductor
 * length, wire gauge, and nominal voltage — sees whether the run stays
 * within the acceptable voltage drop limit.
 */
import { useState } from "react";
import { evaluateScenario } from "../api";
import CoachingPanel from "../components/CoachingPanel";
import ResultReadout from "../components/ResultReadout";
import InfoTooltip from "../components/InfoTooltip";
import MathBreakdown from "../components/MathBreakdown";
import { inputStyle, primaryButtonStyle, secondaryButtonStyle } from "../components/formStyles";

const labelStyle = {
  display: "block",
  fontSize: "0.85rem",
  color: "var(--text-dim)",
  marginBottom: "6px",
};

// Must match the keys in backend logic/wireResistance.js
const AWG_OPTIONS = ["14", "12", "10", "8", "6", "4", "2", "1", "1/0", "2/0", "3/0", "4/0"];

export default function VoltageDrop() {
  const [currentAmps, setCurrentAmps] = useState("");
  const [lengthFt, setLengthFt] = useState("");
  const [awgSize, setAwgSize] = useState("10");
  const [nominalVoltage, setNominalVoltage] = useState("240");
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
        currentAmps: Number(currentAmps),
        lengthFt: Number(lengthFt),
        awgSize,
        nominalVoltage: Number(nominalVoltage),
      };
      const evaluated = await evaluateScenario("voltage-drop", payload);
      setResult(evaluated);
      setSubmittedInputs(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Mirrors the formula in logic/voltageDrop.js:
  // %VD = (2 * I * L * R) / (1000 * V) * 100
  function buildMathSteps() {
    if (!result || !submittedInputs) return [];
    const { currentAmps, lengthFt, nominalVoltage } = submittedInputs;
    const { resistancePer1000Ft, percentVoltageDrop, voltsDropped, maxAcceptablePercent, exceedsLimit } = result;

    const numerator = 2 * currentAmps * lengthFt * resistancePer1000Ft;
    const denominator = 1000 * nominalVoltage;

    return [
      {
        label: "Step 1 — Look up conductor resistance",
        formula: `${awgSizeLabel(submittedInputs.awgSize)} AWG copper = ${resistancePer1000Ft} Ω per 1000 ft`,
      },
      {
        label: "Step 2 — Multiply current × round-trip length × resistance",
        formula: `2 × ${currentAmps}A × ${lengthFt}ft × ${resistancePer1000Ft} = ${round2(numerator)}`,
      },
      {
        label: "Step 3 — Divide by (1000 × nominal voltage), then ×100 for percent",
        formula: `${round2(numerator)} ÷ (1000 × ${nominalVoltage}) × 100 = ${percentVoltageDrop}%`,
      },
      {
        label: "Step 4 — Compare to the acceptable limit",
        formula: `${percentVoltageDrop}% ${exceedsLimit ? ">" : "≤"} ${maxAcceptablePercent}% → ${
          exceedsLimit ? "Fails" : "Passes"
        } (≈ ${voltsDropped} V dropped)`,
      },
    ];
  }

  function awgSizeLabel(size) {
    return size;
  }

  function round2(num) {
    return Math.round(num * 100) / 100;
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "6px" }}>
        Voltage Drop Calculation
      </h2>
      <p style={{ color: "var(--text-dim)", marginTop: 0, marginBottom: "24px" }}>
        Check whether a conductor run stays within the acceptable voltage drop limit.
      </p>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px" }}>
        <div style={{ flex: 1, minWidth: "140px" }}>
          <label style={labelStyle}>
            Current (A)
            <InfoTooltip text="The amount of current, in amps, flowing through the conductor." />
          </label>
          <input
            type="number"
            value={currentAmps}
            onChange={(e) => setCurrentAmps(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: "140px" }}>
          <label style={labelStyle}>
            One-way length (ft)
            <InfoTooltip text="The distance from the source to the load, in one direction. The calculation accounts for the round trip automatically." />
          </label>
          <input
            type="number"
            value={lengthFt}
            onChange={(e) => setLengthFt(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        <div style={{ flex: 1, minWidth: "140px" }}>
          <label style={labelStyle}>
            Wire gauge (AWG)
            <InfoTooltip text="Wire size. Smaller AWG numbers mean thicker wire with less resistance; larger numbers mean thinner wire with more resistance." />
          </label>
          <select
            value={awgSize}
            onChange={(e) => setAwgSize(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
          >
            {AWG_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} AWG
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: "140px" }}>
          <label style={labelStyle}>
            Nominal voltage
            <InfoTooltip text="The system's rated voltage, e.g. 120V, 240V, or 480V." />
          </label>
          <input
            type="number"
            value={nominalVoltage}
            onChange={(e) => setNominalVoltage(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>
      </div>

      <button onClick={handleSubmit} disabled={loading} style={primaryButtonStyle}>
        {loading ? "Calculating…" : "Calculate voltage drop"}
      </button>

      {error && <p style={{ color: "var(--fail)", marginTop: "14px" }}>{error}</p>}

      {result && (
        <>
          <ResultReadout
            verdict={result.verdict}
            isGood={!result.exceedsLimit}
            metrics={[
              { label: "Resistance (Ω / 1000 ft)", value: result.resistancePer1000Ft },
              { label: "% voltage drop", value: `${result.percentVoltageDrop}%` },
              { label: "Volts dropped", value: `${result.voltsDropped} V` },
              { label: "Max acceptable", value: `${result.maxAcceptablePercent}%` },
            ]}
          />
          <CoachingPanel scenarioType="voltageDrop" result={result} />

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
