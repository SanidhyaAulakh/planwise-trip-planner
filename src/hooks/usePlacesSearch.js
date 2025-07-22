import { useEffect, useState } from "react";

export function usePlacesSearch(city) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!city || !window.google) return;

    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    const request = {
      query: `Top attractions in ${city}`,
      fields: ["name", "formatted_address", "photos"],
    };

    service.textSearch(request, (res, status) => {
      if (
        status === window.google.maps.places.PlacesServiceStatus.OK &&
        Array.isArray(res)
      ) {
        const mapped = res.map((place) => ({
          name: place.name,
          address: place.formatted_address,
          image:
            place.photos?.[0]?.getUrl() ||
            "https://via.placeholder.com/300x200?text=No+Image",
        }));

        setResults(mapped);
      } else {
        console.warn("Places search failed:", status);
        setResults([]);
      }
    });
  }, [city]);

  return results;
}
