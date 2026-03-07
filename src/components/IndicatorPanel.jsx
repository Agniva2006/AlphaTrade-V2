// src/components/IndicatorPanel.jsx

import React from "react";

export default function IndicatorPanel({
  support,
  resistance,
  volatility,
  rsi,
  ma10,
  ma50,
  last,
}) {

  return (

    <div
      className="glass-panel"
      style={{
        padding: 14,
        marginTop: 14,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))",
        gap: 10
      }}
    >

      <IndicatorCard
        label="Last Price"
        value={formatPrice(last)}
        sub="Spot price"
      />

      <IndicatorCard
        label="Support"
        value={formatPrice(support)}
        sub="Short-term zone"
      />

      <IndicatorCard
        label="Resistance"
        value={formatPrice(resistance)}
        sub="Ceiling zone"
      />

      <IndicatorCard
        label="RSI"
        value={formatNumber(rsi,1)}
        sub={getRSILabel(rsi)}
        tone={getRSITone(rsi)}
      />

      <IndicatorCard
        label="Volatility"
        value={formatNumber(volatility,2)}
        sub="Std dev (10 bars)"
      />

      <IndicatorCard
        label="MA 10"
        value={formatPrice(ma10)}
        sub="Fast moving avg"
      />

      <IndicatorCard
        label="MA 50"
        value={formatPrice(ma50)}
        sub="Slow moving avg"
      />

    </div>

  );

}


/* =====================================
   CARD
===================================== */

function IndicatorCard({ label, value, sub, tone }) {

  let color = "#e5e7eb";

  if (tone === "up") color = "#4ade80";
  if (tone === "down") color = "#f97373";

  return (

    <div
      style={{
        borderRadius: 18,
        padding: "8px 10px",
        border: "1px solid rgba(148,163,184,0.35)",
        background:
          "linear-gradient(to bottom, rgba(15,23,42,0.96), rgba(2,6,23,0.96))"
      }}
    >

      <div
        style={{
          fontSize: 11,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: 4
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 17,
          fontWeight: 600,
          color,
          marginBottom: 2
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: 11,
          color: "#9ca3af"
        }}
      >
        {sub}
      </div>

    </div>

  );

}


/* =====================================
   HELPERS
===================================== */

function formatPrice(v) {
  if (v === undefined || v === null) return "—";
  return "₹" + Number(v).toFixed(2);
}

function formatNumber(v, digits = 2) {
  if (v === undefined || v === null) return "—";
  return Number(v).toFixed(digits);
}

function getRSILabel(rsi) {

  if (rsi === undefined || rsi === null) return "—";

  if (rsi > 70) return "Overbought";
  if (rsi < 30) return "Oversold";

  return "Neutral";

}

function getRSITone(rsi) {

  if (rsi > 70) return "down";
  if (rsi < 30) return "up";

  return "neutral";

}