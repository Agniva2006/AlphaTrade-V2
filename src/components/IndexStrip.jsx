// src/components/IndexStrip.jsx

import React, { useEffect, useState } from "react";
import { getLiveSeries } from "../api";


const INDICES = [
  { symbol: "NIFTY", name: "Nifty 50", code: "^NSEI" },
  { symbol: "BANKNIFTY", name: "Bank Nifty", code: "^NSEBANK" },
  { symbol: "FINNIFTY", name: "Fin Nifty", code: "^NSEFIN" },
  { symbol: "SENSEX", name: "Sensex", code: "^BSESN" }
];


export default function IndexStrip() {

  const [indexData, setIndexData] = useState([]);


  async function load() {

    const out = [];

    for (const idx of INDICES) {

      try {

        const series = await getLiveSeries(idx.code);

        if (!series || series.length === 0) {

          out.push({
            symbol: idx.symbol,
            name: idx.name,
            price: null,
            change: null,
            pct: null
          });

          continue;

        }

        const last = series[series.length - 1];
        const prev = series.length > 1 ? series[series.length - 2] : last;

        const change = last.close - prev.close;

        const pct = prev.close
          ? ((change / prev.close) * 100).toFixed(2)
          : 0;

        out.push({
          symbol: idx.symbol,
          name: idx.name,
          price: last.close,
          change,
          pct
        });

      } catch {

        out.push({
          symbol: idx.symbol,
          name: idx.name,
          price: null,
          change: null,
          pct: null
        });

      }

    }

    setIndexData(out);

  }


  useEffect(() => {

    load();

    const id = setInterval(load, 15000);

    return () => clearInterval(id);

  }, []);


  return (

    <div
      className="index-strip"
      style={{
        display: "flex",
        gap: 12,
        overflowX: "auto"
      }}
    >

      {indexData.map((i) => (

        <div
          key={i.symbol}
          style={{
            minWidth: 160,
            padding: 10,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.06)"
          }}
        >

          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            {i.name}
          </div>

          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {i.price != null ? `₹${Number(i.price).toFixed(2)}` : "—"}
          </div>

          <div
            style={{
              fontSize: 12,
              color: (i.change || 0) >= 0 ? "#4ade80" : "#f87171"
            }}
          >
            {i.change == null
              ? "—"
              : `${i.change >= 0 ? "+" : ""}${Number(i.change).toFixed(2)} (${Number(i.pct).toFixed(2)}%)`}
          </div>

        </div>

      ))}

    </div>

  );

}