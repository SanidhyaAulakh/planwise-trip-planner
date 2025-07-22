import React from "react";
import { LoadScript } from "@react-google-maps/api";

// Store your API key in `.env`
const libraries = ["places"];

const GoogleMapsProvider = ({ children }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      {children}
    </LoadScript>
  );
};

export default GoogleMapsProvider;
