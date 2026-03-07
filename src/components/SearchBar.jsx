// src/components/SearchBar.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLiveSeries } from "../api";


export const POPULAR_STOCKS = [

{ symbol: "RELIANCE", name: "Reliance Industries" },
{ symbol: "TCS", name: "Tata Consultancy Services" },
{ symbol: "INFY", name: "Infosys" },
{ symbol: "HDFCBANK", name: "HDFC Bank" },
{ symbol: "ICICIBANK", name: "ICICI Bank" },
{ symbol: "SBIN", name: "State Bank of India" },
{ symbol: "LT", name: "Larsen & Toubro" },
{ symbol: "KOTAKBANK", name: "Kotak Mahindra Bank" },
{ symbol: "AXISBANK", name: "Axis Bank" },
{ symbol: "ITC", name: "ITC Ltd" },
{ symbol: "BHARTIARTL", name: "Bharti Airtel" },
{ symbol: "ASIANPAINT", name: "Asian Paints" },
{ symbol: "MARUTI", name: "Maruti Suzuki" },
{ symbol: "BAJFINANCE", name: "Bajaj Finance" },
{ symbol: "HCLTECH", name: "HCL Technologies" },
{ symbol: "WIPRO", name: "Wipro" },
{ symbol: "TITAN", name: "Titan Company" },
{ symbol: "ULTRACEMCO", name: "UltraTech Cement" },
{ symbol: "ONGC", name: "Oil & Natural Gas Corp" },
{ symbol: "POWERGRID", name: "Power Grid Corp" },
{ symbol: "ADANIENT", name: "Adani Enterprises" },
{ symbol: "ADANIPORTS", name: "Adani Ports" },
{ symbol: "DRREDDY", name: "Dr Reddy's Labs" },
{ symbol: "CIPLA", name: "Cipla" },
{ symbol: "GRASIM", name: "Grasim Industries" }

];

export default function SearchBar() {

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();


  useEffect(() => {

    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lower = query.toLowerCase();

    const filtered = POPULAR_STOCKS.filter(
      s =>
        s.symbol.toLowerCase().includes(lower) ||
        s.name.toLowerCase().includes(lower)
    );

    loadPrices(filtered);

  }, [query]);


  async function loadPrices(list) {

    const out = [];

    for (const s of list) {

      try {

        const series = await getLiveSeries(s.symbol);

        if (!series || series.length === 0) {

          out.push({
            symbol: s.symbol,
            name: s.name,
            price: null,
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
          symbol: s.symbol,
          name: s.name,
          price: last.close,
          pct
        });

      } catch {

        out.push({
          symbol: s.symbol,
          name: s.name,
          price: null,
          pct: null
        });

      }

    }

    setResults(out);

  }


  function go(sym) {

    navigate(`/predict/${sym}`);
    setQuery("");
    setOpen(false);

  }


  return (

    <div style={{ position: "relative" }}>

      <input
        type="text"
        placeholder="Search stocks..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.2)",
          color: "#fff"
        }}
      />


      {open && results.length > 0 && (

        <div
          style={{
            position: "absolute",
            width: "100%",
            top: 45,
            zIndex: 20,
            padding: 8,
            borderRadius: 10,
            background: "#0f172a"
          }}
        >

          {results.map((s) => (

            <div
              key={s.symbol}
              onClick={() => go(s.symbol)}
              style={{
                padding: "10px 12px",
                display: "flex",
                justifyContent: "space-between",
                cursor: "pointer"
              }}
            >

              <div>

                <div style={{ fontWeight: 700 }}>
                  {s.symbol}
                </div>

                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  {s.name}
                </div>

              </div>

              <div style={{ textAlign: "right" }}>

                <div style={{ fontWeight: 700 }}>
                  {s.price !== null ? `₹${Number(s.price).toFixed(2)}` : "—"}
                </div>

                <div style={{ fontSize: 12 }}>
                  {s.pct !== null ? `${s.pct}%` : "—"}
                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}