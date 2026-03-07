// src/components/Navbar.jsx

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {

  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = location.pathname === "/";
  const isPrediction = location.pathname.startsWith("/predict");

  return (

    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(148,163,184,0.25)",
        background:
          "linear-gradient(to right, rgba(15,23,42,0.92), rgba(2,6,23,0.92))"
      }}
    >

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >

        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer"
          }}
        >

          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              background:
                "radial-gradient(circle at 20% 20%, #4ade80, #22c55e)",
              boxShadow: "0 0 18px rgba(34,197,94,0.7)"
            }}
          />

          <div>

            <div style={{ fontWeight: 700, fontSize: 15 }}>
              AlphaTrade
            </div>

            <div style={{ fontSize: 11, color: "#9ca3af" }}>
              Live indices • AI predictions
            </div>

          </div>

        </div>


        {/* NAVIGATION */}
        <div
          style={{
            display: "flex",
            gap: 12
          }}
        >

          <NavChip
            label="Dashboard"
            active={isDashboard}
            onClick={() => navigate("/")}
          />

          <NavChip
            label="Prediction"
            active={isPrediction}
            onClick={() => navigate("/predict/RELIANCE")}
          />

        </div>

      </div>

    </header>

  );

}


/* ============================
   NAV CHIP COMPONENT
============================ */

function NavChip({ label, active, onClick }) {

  return (

    <button
      onClick={onClick}
      style={{
        padding: "6px 12px",
        fontSize: 12,
        borderRadius: 999,
        cursor: "pointer",
        border: "1px solid rgba(148,163,184,0.35)",
        background: active
          ? "rgba(34,197,94,0.15)"
          : "transparent",
        color: active
          ? "#bbf7d0"
          : "#9ca3af",
        transition: "all 0.2s"
      }}
    >

      {label}

    </button>

  );

}