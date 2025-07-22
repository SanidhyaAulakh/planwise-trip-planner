import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import CreateTrip from "./pages/CreateTrip";
import "./index.css";
import TripPage from "./pages/TripPage";
import TripView from "./pages/TripView";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateTrip />} />
        <Route path="/trip/:id" element={<TripPage />}></Route>
        <Route path="/trip/:id/view" element={<TripView />} />
      </Routes>
    </BrowserRouter>
  );
}
