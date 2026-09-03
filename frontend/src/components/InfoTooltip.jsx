/**
 * InfoTooltip.jsx
 * -----------------
 * A small "?" button that toggles an explanation popover open/closed.
 * Closes automatically if you click ANYWHERE else on the page — this is
 * done by listening for clicks on the whole document and checking whether
 * the click happened inside this component's own DOM node (via a ref).
 * If it didn't, we close the popover.
 *
 * USAGE:
 *   <label>Rated capacity (kVA) <InfoTooltip text="..." /></label>
 *
 * Reusable across any scenario/field — not specific to Load Capacity Check.
 */
import { useState, useRef, useEffect } from "react";

export default function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Runs on every render where `open` changes — only need the listener
    // while the popover is actually open, but attaching/removing it
    // unconditionally in the effect body is simplest and still correct.
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <span ref={containerRef} style={{ position: "relative", display: "inline-block", marginLeft: "6px" }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="More info"
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          border: "1px solid var(--text-dim)",
          background: open ? "var(--accent)" : "transparent",
          color: open ? "var(--bg)" : "var(--text-dim)",
          fontSize: "0.7rem",
          fontWeight: 700,
          lineHeight: 1,
          padding: 0,
          verticalAlign: "middle",
        }}
      >
        ?
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "26px",
            left: 0,
            zIndex: 20,
            width: "230px",
            background: "var(--panel)",
            border: "1px solid var(--accent)",
            borderRadius: "6px",
            padding: "12px 14px",
            fontSize: "0.8rem",
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            color: "var(--text)",
            lineHeight: 1.45,
            boxShadow: "0 8px 24px -4px rgba(0,0,0,0.5)",
          }}
        >
          {text}
        </div>
      )}
    </span>
  );
}
