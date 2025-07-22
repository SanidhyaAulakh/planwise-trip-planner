import { useEffect, useRef, useState } from "react";

const AIRecommendations = ({ cityName }) => {
  const [results, setResults] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.google || !cityName) return;

    const service = new window.google.maps.places.PlacesService(mapRef.current);

    const request = {
      query: `Top tourist attractions in ${cityName}`,
      fields: ["name", "formatted_address", "place_id"],
    };

    service.textSearch(request, (res, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setResults(res);
      }
    });
  }, [cityName]);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-2">🧠 AI Recommendations</h2>
      <ul className="list-disc pl-6 text-sm">
        {results.map((place) => (
          <li key={place.place_id}>
            <strong>{place.name}</strong>{" "}
            <span className="text-gray-500">({place.formatted_address})</span>
          </li>
        ))}
      </ul>

      {/* Required dummy div to initialize PlacesService */}
      <div ref={mapRef} style={{ display: "none" }} />
    </div>
  );
};

export default AIRecommendations;
