import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function TripView() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [itinerary, setItinerary] = useState({});

  useEffect(() => {
    const trips = JSON.parse(localStorage.getItem("trips")) || [];
    const foundTrip = trips.find((t) => t.id === id);
    setTrip(foundTrip);

    const budget = localStorage.getItem(`budget-${id}`);
    const expenses = JSON.parse(localStorage.getItem(`expenses-${id}`)) || [];
    const itinerary = JSON.parse(localStorage.getItem(`itinerary-${id}`)) || {};

    setBudget(budget);
    setExpenses(expenses);
    setItinerary(itinerary);
  }, [id]);
  const totalSpent = expenses.reduce((acc, e) => acc + e.amount, 0);
  const remaining = budget ? (budget - totalSpent).toFixed(2) : "—";

  const getDateRange = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const dates = [];
    while (s <= e) {
      dates.push(s.toISOString().slice(0, 10));
      s.setDate(s.getDate() + 1);
    }
    return dates;
  };

  if (!trip) return <div className="p-6">Trip not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{trip.title} (Preview)</h1>
      <p className="text-gray-600">📍 {trip.cities.join(", ")}</p>
      <p className="text-gray-600 mb-4">
        🗓 {trip.startDate} → {trip.endDate}
      </p>

      {/* Budget Overview */}
      {budget && (
        <div className="mb-6 bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">💰 Budget</h2>
          <p>Total: ₹{budget}</p>
          <p>Spent: ₹{totalSpent.toFixed(2)}</p>
          <p>Remaining: ₹{remaining}</p>
        </div>
      )}

      {/* Expenses */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">🧾 Expenses</h2>
        <ul className="list-disc list-inside text-sm text-gray-800">
          {expenses.length === 0 && (
            <p className="text-gray-500">No expenses.</p>
          )}
          {expenses.map((e, i) => (
            <li key={i}>
              {e.desc} – ₹{e.amount.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      {/* Itinerary */}
      <div>
        <h2 className="text-xl font-semibold mb-2">🗓 Itinerary</h2>
        {getDateRange(trip.startDate, trip.endDate).map((date) => (
          <div key={date} className="mb-4">
            <h3 className="font-medium">{new Date(date).toDateString()}</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 ml-2">
              {(itinerary[date] || []).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
              {!(itinerary[date] || []).length && (
                <p className="text-gray-400 text-sm italic">No plan</p>
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
