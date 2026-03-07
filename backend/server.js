import express from "express";
import cors from "cors";
import YahooFinance from "yahoo-finance2";
import { spawn } from "child_process";

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"]
  })
);

const yf = new YahooFinance();

/* =========================================
   LIVE CANDLE DATA
========================================= */

app.get("/api/candles", async (req, res) => {

  const symbol = req.query.symbol || "RELIANCE.NS";

  try {

    // Yahoo requires unix timestamps
    const now = Math.floor(Date.now() / 1000);
    const start = now - (60 * 60 * 24*3);

    const result = await yf.chart(symbol, {
      period1: start,
      period2: now,
      interval: "5m"
    });

    if (!result || !result.quotes) {
      return res.json({ candles: [] });
    }

    const candles = result.quotes
      .filter(q => q.close !== null)
      .map(q => ({
        time: q.date,
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close,
        volume: q.volume
      }));

    res.json({ candles });

  } catch (error) {

    console.log("Yahoo API error:", error);
    res.status(500).json({ error: "Failed to fetch candles" });

  }

});


/* =========================================
   ML PREDICTION
========================================= */

app.get("/api/predict", (req, res) => {

  const symbol = req.query.symbol || "RELIANCE.NS";

  const py = spawn("python", ["../ml/predict_live.py", symbol]);

  let output = "";
  let errorOutput = "";

  py.stdout.on("data", (data) => {
    output += data.toString();
  });

  py.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  py.on("close", () => {

    if (errorOutput) {
      console.log("Python error:", errorOutput);
      return res.status(500).json({ error: "Python model failed" });
    }

    try {

      const result = JSON.parse(output);
      res.json(result);

    } catch (err) {

      console.log("JSON parse error:", err);
      res.status(500).json({ error: "Invalid model response" });

    }

  });

});


/* =========================================
   START SERVER
========================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});