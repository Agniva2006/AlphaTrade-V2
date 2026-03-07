// ===============================
//    src/pages/Prediction.jsx
// ===============================

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PriceChart from "../components/PriceChart";
import SearchBar from "../components/SearchBar";
import { getLiveSeries } from "../api";

export default function PredictionPage() {

  const { symbol } = useParams();
  const navigate = useNavigate();

  const [series, setSeries] = useState([]);
  const [features, setFeatures] = useState(null);
  const [signal, setSignal] = useState("NEUTRAL");
  const [loading, setLoading] = useState(true);

  // ======================================
  // LOAD DATA
  // ======================================

  useEffect(() => {

    let mounted = true;

    async function load() {

      setLoading(true);

      try {

        const s = await getLiveSeries(symbol);

        if (!mounted) return;

        setSeries(s);

        const feats = extractFeatures(s);
        setFeatures(feats);

        const sig = computeSignal(feats);
        setSignal(sig);

      } catch (err) {

        console.log("Prediction page error:", err);

      } finally {

        if (mounted) setLoading(false);

      }

    }

    load();

    const id = setInterval(load, 30000);

    return () => {
      mounted = false;
      clearInterval(id);
    };

  }, [symbol]);



  // ======================================
  // FEATURE EXTRACTION
  // ======================================

  function extractFeatures(data) {

    if (!data || data.length === 0) return null;

    const closes = data.map(d => d.close);

    const close = closes[closes.length - 1];

    const ma10 = avg(closes.slice(-10));
    const ma50 = avg(closes.slice(-50));

    const ema20 = ema(closes, 20);
    const ema50 = ema(closes, 50);

    const high = Math.max(...closes.slice(-20));
    const low = Math.min(...closes.slice(-20));

    const support = low;
    const resistance = high;

    const rsi = computeRSI(closes, 14);

    const volatility = std(closes.slice(-20));

    return {
      close,
      ma10,
      ma50,
      ema20,
      ema50,
      support,
      resistance,
      rsi,
      volatility
    };

  }



  // ======================================
  // SIGNAL LOGIC
  // ======================================

  function computeSignal(f) {

    if (!f) return "NEUTRAL";

    let score = 0;

    if (f.rsi < 30) score += 2;
    if (f.rsi > 70) score -= 2;

    if (f.ma10 > f.ma50) score += 1;
    if (f.ma10 < f.ma50) score -= 1;

    if (f.ema20 > f.ema50) score += 1;
    if (f.ema20 < f.ema50) score -= 1;

    if (f.close <= f.support * 1.015) score += 1;
    if (f.close >= f.resistance * 0.985) score -= 1;

    if (score >= 2) return "BUY";
    if (score <= -2) return "SELL";

    return "NEUTRAL";

  }



  // ======================================
  // RENDER
  // ======================================

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  return (

    <div style={{ padding: 18 }}>

      {/* HEADER */}

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>

          <div style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: "linear-gradient(90deg,#10b981,#22c55e)"
          }} />

          <div>

            <div style={{ fontSize: 22, fontWeight: 800 }}>
              {symbol} — Live View
            </div>

            <div style={{ color: "#9ca3af" }}>
              Realtime intraday • ML Comparison
            </div>

          </div>

        </div>

        <button onClick={() => navigate(`/predict/${symbol}`)} style={btnStyle}>
          Refresh
        </button>

      </div>



      {/* MAIN GRID */}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 330px", gap: 20 }}>


        {/* LEFT */}

        <div>

          <div style={{ marginBottom: 12, display: "flex", gap: 12 }}>

            <MiniCard title="Last Price" value={formatPrice(features?.close)} />
            <MiniCard title="Support" value={formatPrice(features?.support)} />
            <MiniCard title="Resistance" value={formatPrice(features?.resistance)} />

            <div style={{ marginLeft: "auto", fontWeight: 800 }}>
              Trading Signal:

              <span style={{
                marginLeft: 6,
                color:
                  signal === "BUY" ? "#10b981" :
                  signal === "SELL" ? "#ef4444" :
                  "#d1d5db"
              }}>
                {signal}
              </span>

            </div>

          </div>


          {/* CHART */}

          <div className="glass-panel" style={{ padding: 16 }}>
            <PriceChart data={series} height={420} />
          </div>


          {/* INDICATORS */}

          <div style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 12
          }}>

            <SmallInd title="MA10" value={features?.ma10} />
            <SmallInd title="MA50" value={features?.ma50} />
            <SmallInd title="EMA20" value={features?.ema20} />
            <SmallInd title="EMA50" value={features?.ema50} />
            <SmallInd title="RSI" value={features?.rsi} />
            <SmallInd title="Volatility" value={features?.volatility} />

          </div>

        </div>


        {/* RIGHT */}

        <aside>

          <div style={{ padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>

            <div style={{ fontWeight: 800 }}>Stocks</div>

            <div style={{ marginTop: 8 }}>
              <SearchBar />
            </div>

          </div>

        </aside>

      </div>

    </div>

  );

}


// ======================================
// UI HELPERS
// ======================================

function MiniCard({ title, value }) {

  return (
    <div style={{
      padding: 10,
      borderRadius: 10,
      background: "rgba(255,255,255,0.03)"
    }}>
      <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
    </div>
  );

}

function SmallInd({ title, value }) {

  return (
    <div style={{
      padding: 10,
      borderRadius: 10,
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.04)"
    }}>
      <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 16, marginTop: 4, fontWeight: 800 }}>
        {value ? Number(value).toFixed(2) : "—"}
      </div>
    </div>
  );

}


// ======================================
// MATH UTILS
// ======================================

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a,b)=>a+b,0) / arr.length;
}

function ema(data, period) {

  if (data.length < period) return avg(data);

  const k = 2 / (period + 1);

  let ema = data[data.length - period];

  for (let i = data.length - period + 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }

  return ema;

}

function std(arr) {

  const mean = avg(arr);
  const variance = avg(arr.map(x => (x-mean)**2));

  return Math.sqrt(variance);

}

function computeRSI(prices, period=14) {

  if (prices.length < period+1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length-period; i < prices.length; i++) {

    const diff = prices[i] - prices[i-1];

    if (diff >= 0) gains += diff;
    else losses -= diff;

  }

  if (losses === 0) return 100;

  const rs = gains / losses;

  return 100 - (100/(1+rs));

}

function formatPrice(p) {
  if (!p) return "—";
  return "₹" + Number(p).toFixed(2);
}


const btnStyle = {
  background: "rgba(34,197,94,0.06)",
  border: "1px solid rgba(255,255,255,0.04)",
  padding: "6px 10px",
  borderRadius: 8,
  cursor: "pointer",
  color: "#e6eef6",
  fontWeight: 700
};