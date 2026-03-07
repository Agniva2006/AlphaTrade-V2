import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { POPULAR_STOCKS } from "../data/stocks";
import { getLiveSeries } from "../api";

export default function StockGrid() {

  const [stocks, setStocks] = useState([]);
  const navigate = useNavigate();

  async function load() {

    const out = [];

    for (const s of POPULAR_STOCKS) {

      const series = await getLiveSeries(s.symbol);

      if (!series || series.length === 0) {
        out.push({ ...s, price: null, pct: null });
        continue;
      }

      const last = series[series.length - 1];
      const prev = series.length > 1 ? series[series.length - 2] : last;

      const change = last.close - prev.close;
      const pct = prev.close
        ? ((change / prev.close) * 100).toFixed(2)
        : 0;

      out.push({
        ...s,
        price: last.close,
        pct
      });

    }

    setStocks(out);

  }

  useEffect(() => {

    load();
    const id = setInterval(load, 30000);

    return () => clearInterval(id);

  }, []);

  return (

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
        gap: 12
      }}
    >

      {stocks.map((s) => (

        <div
          key={s.symbol}
          onClick={() => navigate(`/predict/${s.symbol}`)}
          style={{
            padding: 12,
            borderRadius: 10,
            cursor: "pointer",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)"
          }}
        >

          <div style={{ fontWeight: 700 }}>{s.symbol}</div>

          <div style={{ fontSize: 18, marginTop: 4 }}>
            {s.price ? `₹${s.price.toFixed(2)}` : "—"}
          </div>

          <div
            style={{
              fontSize: 12,
              color: s.pct >= 0 ? "#4ade80" : "#f87171"
            }}
          >
            {s.pct ? `${s.pct}%` : ""}
          </div>

        </div>

      ))}

    </div>

  );

}