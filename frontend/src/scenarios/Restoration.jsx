/**
 * Restoration.jsx
 * -----------------
 * UI for the storm restoration scenario. Trainee builds a list of affected
 * sites (name, customers affected, repair time, critical facility flag),
 * submits it, and sees the ranked restoration order.
 *
 * Includes InfoTooltip on each field and a "Show the math" button that
 * breaks down the priority score calculation for every non-critical site.
 */
import { useState } from "react";
import { evaluateScenario } from "../api";
import CoachingPanel from "../components/CoachingPanel";
import InfoTooltip from "../components/InfoTooltip";
import MathBreakdown from "../components/MathBreakdown";
import { inputStyle, primaryButtonStyle, secondaryButtonStyle, removeButtonStyle } from "../components/formStyles";

const labelStyle = {
  display: "block",
  fontSize: "0.85rem",
  color: "var(--text-dim)",
  marginBottom: "6px",
};

const EMPTY_SITE = { name: "", customersAffected: "", estimatedRepairTimeHours: "", isCriticalFacility: false };

export default function Restoration() {
  const [sites, setSites] = useState([{ ...EMPTY_SITE }, { ...EMPTY_SITE }]);
  const [result, setResult] = useState(null);
  const [showMath, setShowMath] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function updateSite(index, field, value) {
    const next = [...sites];
    next[index] = { ...next[index], [field]: value };
    setSites(next);
  }

  function addSite() {
    setSites([...sites, { ...EMPTY_SITE }]);
  }

  function removeSite(index) {
    setSites(sites.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setError(null);
    setResult(null);
    setShowMath(false);
    setLoading(true);
    try {
      const payload = {
        sites: sites.map((s) => ({
          name: s.name,
          customersAffected: Number(s.customersAffected),
          estimatedRepairTimeHours: Number(s.estimatedRepairTimeHours),
          isCriticalFacility: s.isCriticalFacility,
        })),
      };
      const evaluated = await evaluateScenario("restoration", payload);
      setResult(evaluated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // One math step per site: critical facilities get a plain-English note,
  // everyone else gets the actual division that produced their priority score.
  function buildMathSteps() {
    if (!result) return [];
    return result.map((site) => ({
      label: `${site.name}${site.isCriticalFacility ? " (critical facility)" : ""}`,
      formula: site.isCriticalFacility
        ? "Critical facilities skip the scoring — always restored first."
        : `${site.customersAffected} customers ÷ ${site.estimatedRepairTimeHours} hrs = ${site.priorityScore} customers/hr → rank #${site.rank}`,
    }));
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "6px" }}>
        Storm Restoration Prioritization
      </h2>
      <p style={{ color: "var(--text-dim)", marginTop: 0, marginBottom: "24px" }}>
        A storm has knocked out multiple sites at once. Rank the order crews should restore power.
      </p>

      {sites.map((site, i) => (
        <div
          key={i}
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "16px",
            marginBottom: "12px",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <label style={labelStyle}>
              Site name
              <InfoTooltip text="A label for this site — e.g. a feeder or substation name. Doesn't affect the math, just identifies the row." />
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                value={site.name}
                onChange={(e) => updateSite(i, "name", e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              {sites.length > 1 && (
                <button onClick={() => removeSite(i)} style={removeButtonStyle}>
                  Remove
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "160px" }}>
              <label style={labelStyle}>
                Customers affected
                <InfoTooltip text="How many customers lost power at this site." />
              </label>
              <input
                type="number"
                value={site.customersAffected}
                onChange={(e) => updateSite(i, "customersAffected", e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
              />
            </div>
            <div style={{ flex: 1, minWidth: "160px" }}>
              <label style={labelStyle}>
                Estimated repair time (hrs)
                <InfoTooltip text="How many hours a crew needs to fix this site." />
              </label>
              <input
                type="number"
                value={site.estimatedRepairTimeHours}
                onChange={(e) => updateSite(i, "estimatedRepairTimeHours", e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-dim)" }}>
                <input
                  type="checkbox"
                  checked={site.isCriticalFacility}
                  onChange={(e) => updateSite(i, "isCriticalFacility", e.target.checked)}
                />
                Critical facility
                <InfoTooltip text="Hospitals, water treatment plants, 911 centers, etc. These are always restored first, regardless of customer count." />
              </label>
            </div>
          </div>
        </div>
      ))}

      <button onClick={addSite} style={secondaryButtonStyle}>
        + Add another site
      </button>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleSubmit} disabled={loading} style={primaryButtonStyle}>
          {loading ? "Calculating…" : "Rank restoration order"}
        </button>
      </div>

      {error && <p style={{ color: "var(--fail)", marginTop: "14px" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "24px" }}>
          {result.map((site) => (
            <div
              key={site.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--panel-2)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "14px 18px",
                marginBottom: "8px",
              }}
            >
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.9rem" }}>
                  #{site.rank} — {site.name}
                </div>
                <div style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginTop: "4px" }}>
                  {site.reason}
                </div>
              </div>
            </div>
          ))}
          <CoachingPanel scenarioType="restoration" result={result} />

          {!showMath && (
            <button onClick={() => setShowMath(true)} style={{ ...secondaryButtonStyle, marginTop: "12px" }}>
              Show the math
            </button>
          )}
          {showMath && <MathBreakdown steps={buildMathSteps()} />}
        </div>
      )}
    </div>
  );
}
