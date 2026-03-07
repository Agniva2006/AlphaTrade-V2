// src/components/PriceChart.jsx

import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function PriceChart({ data = [], showForecast = true, height = 360 }) {

  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {

    if (!canvasRef.current || !data || data.length === 0) return;

    // ---------- SORT BY TIME ----------
    const sorted = [...data].sort((a, b) => {
      const da = new Date("2025-01-01 " + a.time);
      const db = new Date("2025-01-01 " + b.time);
      return da - db;
    });

    // ---------- CLEAN DATA ----------
    const clean = sorted
      .map(d => ({
        time: d.time,
        close: Number(d.close || 0)
      }))
      .filter(d => Number.isFinite(d.close) && d.close > 0);

    if (clean.length === 0) return;

    const labels = clean.map(d => d.time);
    const closes = clean.map(d => d.close);

    // ---------- FORECAST ----------
    const predicted = showForecast ? getPredictedSeries(clean) : [];
    const predValues = predicted.map(p => p.close);

    // destroy old chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");

    chartRef.current = new Chart(ctx, {

      type: "line",

      data: {
        labels,

        datasets: [

          {
            label: "Real Price",
            data: closes,
            borderColor: "#4ade80",
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.2
          },

          ...(predicted.length
            ? [
                {
                  label: "Model Forecast",
                  data: predValues,
                  borderColor: "#60a5fa",
                  borderDash: [6, 6],
                  borderWidth: 2,
                  pointRadius: 0,
                  tension: 0.25
                }
              ]
            : [])

        ]
      },

      options: {

        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            labels: {
              color: "#d1d5db"
            }
          }
        },

        scales: {

          x: {
            ticks: {
              color: "#9ca3af",
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 12
            },
            grid: {
              color: "rgba(255,255,255,0.05)"
            }
          },

          y: {
            ticks: {
              color: "#9ca3af"
            },
            grid: {
              color: "rgba(255,255,255,0.05)"
            },
            suggestedMin: Math.min(...closes) * 0.97,
            suggestedMax: Math.max(...closes) * 1.03
          }

        },

        interaction: {
          mode: "index",
          intersect: false
        }

      }

    });

    return () => chartRef.current?.destroy();

  }, [data, showForecast]);

  return (
    <div style={{ height }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );

}


// =====================================
// SIMPLE FORECAST (temporary placeholder)
// =====================================

function getPredictedSeries(data) {

  if (data.length === 0) return [];

  const last = data[data.length - 1].close;

  const forecast = [];

  for (let i = 1; i <= 10; i++) {

    forecast.push({
      time: "F+" + i,
      close: last + Math.sin(i / 2) * 2
    });

  }

  return forecast;

}