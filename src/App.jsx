// src/App.jsx

import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import Prediction from "./pages/Prediction.jsx";

import Navbar from "./components/Navbar.jsx";
import LoginOverlay from "./components/LoginOverlay.jsx";


export default function App() {

  const [loggedIn, setLoggedIn] = useState(false);


  // ---------- LOGIN SCREEN ----------
  if (!loggedIn) {
    return (
      <div className="app-root">
        <LoginOverlay onLogin={() => setLoggedIn(true)} />
      </div>
    );
  }


  // ---------- MAIN APP ----------
  return (

    <div className="app-root">

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/predict/:symbol"
          element={<Prediction />}
        />

      </Routes>

    </div>

  );

}