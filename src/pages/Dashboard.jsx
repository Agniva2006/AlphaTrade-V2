// src/pages/Dashboard.jsx

import React from "react";
import SearchBar from "../components/SearchBar";
import StockGrid from "../components/StockGrid";

import MarketChart from "../assets/market-chart.png";
import StocksSide from "../assets/stocks-side.png";


export default function Dashboard() {

  return (

    <div className="dashboard-wrapper">


      {/* ================= HERO SECTION ================= */}

      <section className="hero-section">

        <div className="hero-left">

          <h1 className="hero-title">
            Live Indian Stock Market
          </h1>

          <p className="hero-subtitle">
            Track real-time prices, trends & expert analytics
          </p>

        </div>


        <div className="hero-image">

          <img
            src={MarketChart}
            alt="Market chart"
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 10
            }}
          />

        </div>

      </section>



      {/* ================= MAIN CONTENT ================= */}

      <section className="main-layout">


        {/* STOCK GRID */}

        <div className="stock-area">

          <h2 className="section-title">
            Top Stocks
          </h2>

          <StockGrid />

        </div>



        {/* SIDEBAR */}

        <aside className="side-panel">

          <h2 className="section-title small">
            Search Stocks
          </h2>

          <SearchBar />


          <img
            src={StocksSide}
            alt="Stocks"
            className="side-img"
            style={{
              width: "100%",
              marginTop: 16,
              borderRadius: 10
            }}
          />

        </aside>


      </section>


    </div>

  );

}