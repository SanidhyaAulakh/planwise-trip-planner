import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const savedTrips = JSON.parse(localStorage.getItem("trips")) || [];
    setTrips(savedTrips);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9fafb] to-[#e0f2fe] py-16 px-6 sm:px-10">
      <h1 className="text-4xl font-semibold text-gray-800 mb-10 tracking-tight font-sans">Your Trips</h1>
      <Link
        to="/create"
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition mb-10 text-lg font-medium"
      >
        ➕ Create New Trip
      </Link>

      {trips.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <img src="/bg/empty-trip.svg" alt="No trips" className="mx-auto w-48 mb-4 opacity-80" />
          <p>No trips yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:scale-[1.02] cursor-pointer"
            >
              <div className="mb-3">
                <h2 className="text-xl font-semibold text-gray-900 capitalize">{trip.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {trip.cities.join(", ")} | {trip.startDate} → {trip.endDate}
                </p>
              </div>
              <Link
                to={`/trip/${trip.id}`}
                className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm transition"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
