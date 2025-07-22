import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateTrip() {
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();
  const handleCreate = () => {
    const newTrip = {
      id: crypto.randomUUID(),
      title,
      cities: [city],
      startDate,
      endDate,
    };
    const existingTrips = JSON.parse(localStorage.getItem("trips")) || [];
    localStorage.setItem("trips", JSON.stringify([...existingTrips, newTrip]));
    navigate("/");
  };
  return (
    <div className="p-8 max-w-xl mx-auto bg-gradient-to-br from-white via-blue-50 to-blue-100 shadow-md rounded-lg">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-800">🛫 Plan a New Trip</h2>
      <input
        type="text"
        placeholder="Trip Title"
        className="w-full p-3 border rounded-md shadow-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="City"
        className="w-full p-3 border rounded-md shadow-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <input
        type="date"
        className="w-full p-3 border rounded-md shadow-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <input
        type="date"
        className="w-full p-3 border rounded-md shadow-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <button
        onClick={handleCreate}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold shadow-md transition duration-200 w-full"
      >
        ✈️ Save Trip
      </button>
    </div>
  );
}
