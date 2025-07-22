import { useEffect, useState } from "react";
import { useEffect as useEffectAI, useState as useStateAI } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePlacesSearch } from "../hooks/usePlacesSearch.js";
export default function TripPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [newPlan, setNewPlan] = useState("");
  const [itinerary, setItinerary] = useState({});

  // Load trip and associated data from localStorage
  useEffect(() => {
    const trips = JSON.parse(localStorage.getItem("trips")) || [];
    const foundTrip = trips.find((t) => t.id === id);
    if (!foundTrip) {
      setTrip(null);
      return;
    }
    setTrip(foundTrip);
    const savedBudget = localStorage.getItem(`budget-${id}`);
    if (savedBudget) setBudget(savedBudget);
    const savedExpenses = JSON.parse(localStorage.getItem(`expenses-${id}`));
    if (savedExpenses) setExpenses(savedExpenses);
    const savedItinerary = JSON.parse(localStorage.getItem(`itinerary-${id}`));
    if (savedItinerary) setItinerary(savedItinerary);
    else {
      // Initialize itinerary with empty arrays for each date in range
      if (foundTrip.startDate && foundTrip.endDate) {
        const start = new Date(foundTrip.startDate);
        const end = new Date(foundTrip.endDate);
        let d = new Date(start);
        const initial = {};
        while (d <= end) {
          const dateStr = d.toISOString().split("T")[0];
          initial[dateStr] = [];
          d.setDate(d.getDate() + 1);
        }
        setItinerary(initial);
      }
    }
  }, [id]);

  // Don't call usePlacesSearch before trip is set

  // Save itinerary to localStorage whenever it changes
  useEffect(() => {
    if (trip && itinerary) {
      localStorage.setItem(`itinerary-${id}`, JSON.stringify(itinerary));
    }
  }, [itinerary, id, trip]);

  // Budget/Expense logic
  const addExpense = () => {
    if (!expenseName || !expenseAmount) {
      alert("Please enter expense name and amount");
      return;
    }
    const amountNum = parseFloat(expenseAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Please enter a valid positive amount");
      return;
    }
    const newExpense = { name: expenseName, amount: amountNum };
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    localStorage.setItem(`expenses-${id}`, JSON.stringify(updatedExpenses));
    setExpenseName("");
    setExpenseAmount("");
  };

  const deleteExpense = (idx) => {
    const updatedExpenses = expenses.filter((_, i) => i !== idx);
    setExpenses(updatedExpenses);
    localStorage.setItem(`expenses-${id}`, JSON.stringify(updatedExpenses));
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget =
    budget && !isNaN(parseFloat(budget))
      ? parseFloat(budget) - totalExpenses
      : null;
  const budgetProgress =
    budget && parseFloat(budget) > 0
      ? Math.min((totalExpenses / parseFloat(budget)) * 100, 100)
      : 0;

  // Itinerary logic
  const getDateRange = () => {
    if (!trip || !trip.startDate || !trip.endDate) return [];
    const range = [];
    let d = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    while (d <= end) {
      range.push(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }
    return range;
  };

  const savePlan = () => {
    if (!selectedDate || !newPlan) return;
    const dayPlans = itinerary[selectedDate]
      ? [...itinerary[selectedDate]]
      : [];
    dayPlans.push(newPlan);
    const updated = { ...itinerary, [selectedDate]: dayPlans };
    setItinerary(updated);
    setNewPlan("");
  };

  const deleteItineraryItem = (date, idx) => {
    const dayPlans = itinerary[date] ? [...itinerary[date]] : [];
    dayPlans.splice(idx, 1);
    const updated = { ...itinerary, [date]: dayPlans };
    setItinerary(updated);
  };

  const [hotels, setHotels] = useState([]);
  const [hotelName, setHotelName] = useState("");
  const [hotelDate, setHotelDate] = useState("");
  const [hotelCost, setHotelCost] = useState("");
  const [hotelLink, setHotelLink] = useState("");

  const [aiTips, setAiTips] = useStateAI("");
  const [loadingTips, setLoadingTips] = useStateAI(false);

  useEffectAI(() => {
    if (!trip || !trip.title || !trip.startDate || !trip.endDate || !trip.cities?.[0]) return;

    const fetchAITips = async () => {
      setLoadingTips(true);
      try {
        const duration =
          (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
          (1000 * 60 * 60 * 24) + 1;
        const prompt = `Suggest packing tips, local customs, and activities for a trip to ${trip.cities[0]} lasting ${duration} days. Also consider basic climate-based suggestions.`;

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
          }),
        });

        const data = await res.json();
        console.log("OpenAI Response:", data);
        if (data.error) {
          console.error("OpenAI API Error:", data.error);
          setAiTips("Failed to load AI tips. API error: " + data.error.message);
          return;
        }
        const result =
          data.choices && data.choices.length > 0
            ? data.choices[0].message.content
            : "";
        if (result) {
          setAiTips(result);
        } else {
          setAiTips("No tips were returned by the AI.");
        }
      } catch (err) {
        setAiTips("Failed to load AI tips.");
        console.error(err);
      } finally {
        setLoadingTips(false);
      }
    };

    fetchAITips();
  }, [trip]);

  useEffect(() => {
    const storedHotels = JSON.parse(localStorage.getItem(`hotels-${id}`));
    if (storedHotels) setHotels(storedHotels);
  }, [id]);

  const addHotel = () => {
    if (!hotelName || !hotelDate || !hotelCost) {
      alert("Please fill all fields");
      return;
    }
    const newHotel = {
      name: hotelName,
      date: hotelDate,
      cost: parseFloat(hotelCost),
      link: hotelLink,
    };
    const updated = [...hotels, newHotel];
    setHotels(updated);
    localStorage.setItem(`hotels-${id}`, JSON.stringify(updated));
    setHotelName("");
    setHotelDate("");
    setHotelCost("");
    setHotelLink("");
  };

  const deleteHotel = (index) => {
    const updated = hotels.filter((_, i) => i !== index);
    setHotels(updated);
    localStorage.setItem(`hotels-${id}`, JSON.stringify(updated));
  };

  // Always call usePlacesSearch in the same order, even if trip is null
  const city = trip?.cities?.[0] || "";
  const placesResults = usePlacesSearch(city) || [];
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (!city) return;

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
        );
        const data = await res.json();
        if (data && data.list) setWeather(data);
      } catch (err) {
        console.error("Weather fetch error:", err);
      }
    };

    fetchWeather();
  }, [city]);
  // Removed duplicate return block and extraneous console.log statements.

  // Insert conditional block for loading and not found
  if (trip === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-xl font-medium">
        Trip not found.
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg font-medium">
        Loading trip details...
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#fff0ec] via-white to-[#f6f8fa] bg-opacity-90 z-0 pointer-events-none"></div>
        {/* Decorative blurred circles */}
        <div className="absolute w-72 h-72 bg-[#ffebee] rounded-full blur-3xl opacity-30 top-[-5rem] left-[-5rem] z-0"></div>
        <div className="absolute w-96 h-96 bg-[#e1f5fe] rounded-full blur-3xl opacity-30 bottom-[-5rem] right-[-5rem] z-0"></div>
        <div className="relative z-10 px-4 py-12 min-h-screen">
          <div>
            {/* Weather Widget - 5-day forecast */}
            {weather && weather.list && (
              <div className="rounded-3xl border border-gray-200 bg-white/80 shadow-xl p-6 md:p-8 backdrop-blur-sm transition-all hover:shadow-2xl mb-6">
                <h2 className="text-2xl font-bold mb-4 text-[#333] tracking-tight">
                  🌤️ 5-Day Weather Forecast for {weather.city.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm text-gray-700 font-medium">
                  {weather.list
                    .filter((_, i) => i % 8 === 0)
                    .map((day, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center bg-white rounded-xl p-3 shadow hover:shadow-md transition-all"
                      >
                        <div className="text-sm font-semibold mb-1">
                          {new Date(day.dt_txt).toLocaleDateString(undefined, {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                        <img
                          src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                          alt={day.weather[0].description}
                          className="w-12 h-12"
                        />
                        <div className="text-xs">{day.weather[0].main}</div>
                        <div className="text-xs">🌡️ {day.main.temp.toFixed(1)}°C</div>
                        <div className="text-xs">💧 {day.main.humidity}%</div>
                        <div className="text-xs">🌬️ {day.wind.speed} m/s</div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2 text-[#333] tracking-tight">{trip.title}</h1>
        <div className="text-gray-600 mb-1">
          Dates: <span className="font-medium">{trip.startDate}</span> -{" "}
          <span className="font-medium">{trip.endDate}</span>
        </div>
        <div className="text-gray-600 mb-2">
          Cities to visit:{" "}
          <span className="font-medium">{trip.cities.join(", ")}</span>
        </div>
      </div>

      {/* Budget & Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="rounded-3xl border border-gray-200 bg-white/80 shadow-xl p-6 md:p-8 backdrop-blur-sm transition-all hover:shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-4 text-[#333] tracking-tight">Budget & Expenses</h2>
        <div className="mb-2">
          <label className="block mb-1 font-medium">Total Budget</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => {
              setBudget(e.target.value);
              localStorage.setItem(`budget-${id}`, e.target.value);
            }}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-[#fefefe] focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] text-sm"
            placeholder="Enter your total budget"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1 font-medium">Add Expense</label>
          <input
            type="text"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            placeholder="Expense name"
            className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-[#fefefe] focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] text-sm mb-2"
          />
          <input
            type="number"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            placeholder="Amount"
            className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-[#fefefe] focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] text-sm mb-2"
          />
          <button
            onClick={addExpense}
            className="bg-[#FF5A5F] hover:bg-[#ff6b6f] transition-all duration-200 text-white font-semibold py-2 px-4 rounded-full shadow hover:shadow-lg text-sm"
          >
            Add Expense
          </button>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-4 text-[#333] tracking-tight">Expenses:</h3>
          {expenses.length === 0 && (
            <p className="text-gray-500">No expenses added yet.</p>
          )}
          <ul className="list-disc list-inside">
            {expenses.map((e, i) => (
              <li
                key={i}
                className="flex items-center justify-between bg-[#f9f9f9] px-3 py-1 rounded-lg mb-1 shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1"
              >
                <span>
                  {e.name}: ₹{e.amount.toFixed(2)}
                </span>
                <button
                  className="bg-[#FF5A5F] hover:bg-[#ff6b6f] transition-all duration-200 text-white font-semibold py-2 px-4 rounded-full shadow hover:shadow-lg text-sm"
                  onClick={() => deleteExpense(i)}
                  aria-label="Delete expense"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          {budget && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded h-4 mb-1 overflow-hidden">
                <div
                  className={`h-4 rounded ${
                    budgetProgress < 90 ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${budgetProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Total: ₹{totalExpenses.toFixed(2)}</span>
                <span>
                  Remaining: ₹
                  {remainingBudget !== null
                    ? remainingBudget.toFixed(2)
                    : "N/A"}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Itinerary Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="rounded-3xl border border-gray-200 bg-white/80 shadow-xl p-6 md:p-8 backdrop-blur-sm transition-all hover:shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-4 text-[#333] tracking-tight">Trip Itinerary</h2>
        {getDateRange().map((date) => (
          <div key={date} className="mb-4">
            <div className="font-semibold text-lg mb-1">{date}</div>
            <ul className="list-disc list-inside mb-2">
              {(itinerary[date] || []).length === 0 && (
                <li className="text-gray-400 italic">No plans yet.</li>
              )}
              {(itinerary[date] || []).map((plan, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between bg-[#f9f9f9] px-3 py-1 rounded-lg mb-1 shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1"
                >
                  <span>{plan}</span>
                  <button
                    className="bg-[#FF5A5F] hover:bg-[#ff6b6f] transition-all duration-200 text-white font-semibold py-2 px-4 rounded-full shadow hover:shadow-lg text-sm"
                    onClick={() => deleteItineraryItem(date, idx)}
                    aria-label="Delete plan"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex space-x-2">
              <input
                type="text"
                className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-[#fefefe] focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] text-sm flex-1"
                placeholder="Add plan for this day"
                value={selectedDate === date ? newPlan : ""}
                onChange={(e) => {
                  setSelectedDate(date);
                  setNewPlan(e.target.value);
                }}
                onFocus={() => setSelectedDate(date)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && selectedDate === date && newPlan) {
                    savePlan();
                  }
                }}
              />
              <button
                className="bg-[#FF5A5F] hover:bg-[#ff6b6f] transition-all duration-200 text-white font-semibold py-2 px-4 rounded-full shadow hover:shadow-lg text-sm"
                onClick={() => {
                  setSelectedDate(date);
                  if (newPlan) savePlan();
                }}
                disabled={!newPlan || selectedDate !== date}
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="rounded-3xl border border-gray-200 bg-white/80 shadow-xl p-6 md:p-8 backdrop-blur-sm transition-all hover:shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-[#333] tracking-tight flex items-center gap-2">
          🏨 <span>Hotel Bookings</span>
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <input
            type="text"
            placeholder="Hotel Name"
            value={hotelName}
            onChange={(e) => setHotelName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] text-sm shadow-sm"
          />
          <input
            type="date"
            value={hotelDate}
            onChange={(e) => setHotelDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] text-sm shadow-sm"
          />
          <input
            type="number"
            placeholder="Cost"
            value={hotelCost}
            onChange={(e) => setHotelCost(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] text-sm shadow-sm"
          />
          <input
            type="url"
            placeholder="Booking Link (optional)"
            value={hotelLink}
            onChange={(e) => setHotelLink(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] text-sm shadow-sm"
          />
        </div>

        <button
          onClick={addHotel}
          className="bg-[#FF5A5F] hover:bg-[#ff6b6f] text-white font-semibold py-2 px-6 rounded-full shadow hover:shadow-lg transition-all duration-200 mb-6"
        >
          ➕ Add Hotel
        </button>

        {hotels.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No hotel bookings added yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel, i) => (
              <div
                key={i}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-[#333]">{hotel.name}</h3>
                  <p className="text-sm text-gray-600">
                    📅 {hotel.date} | 💰 ₹{hotel.cost.toFixed(2)}
                  </p>
                  {hotel.link && (
                    <p className="text-sm mt-1">
                      🔗{" "}
                      <a
                        href={hotel.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View Booking
                      </a>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteHotel(i)}
                  className="bg-[#FF5A5F] hover:bg-[#ff6b6f] text-white font-semibold py-1.5 px-4 rounded-full shadow text-sm hover:shadow-md transition-all"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="rounded-3xl border border-gray-200 bg-white/80 shadow-xl p-6 md:p-8 backdrop-blur-sm transition-all hover:shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-[#333] tracking-tight">AI Recommendations</h2>
        {placesResults.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {placesResults.map((place, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-300 bg-white/80 backdrop-blur-sm overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1"
              >
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3 text-sm font-medium">
                  {place.name}
                  <div className="text-gray-500 text-xs">{place.address}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">Loading recommendations...</p>
        )}
      </div>


      <div className="rounded-3xl border border-gray-200 bg-white/80 shadow-xl p-6 md:p-8 backdrop-blur-sm transition-all hover:shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-[#333] tracking-tight">🧠 AI Travel Tips</h2>
        {loadingTips ? (
          <p className="text-gray-500 italic">Generating smart tips based on your trip...</p>
        ) : (
          <div className="text-sm whitespace-pre-line text-gray-700 font-medium">{aiTips}</div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center mt-8 flex flex-col items-center gap-4"
      >
        <button
          onClick={() => {
            const confirmDelete = window.confirm(
              "Are you sure you want to delete this trip?"
            );
            if (!confirmDelete) return;
            const allTrips = JSON.parse(localStorage.getItem("trips")) || [];
            const updatedTrips = allTrips.filter((t) => t.id !== id);
            localStorage.setItem("trips", JSON.stringify(updatedTrips));
            localStorage.removeItem(`budget-${id}`);
            localStorage.removeItem(`expenses-${id}`);
            localStorage.removeItem(`itinerary-${id}`);
            window.location.href = "/";
          }}
          className="bg-[#FF5A5F] hover:bg-[#ff6b6f] transition-all duration-200 text-white font-semibold py-2 px-4 rounded-full shadow hover:shadow-lg text-sm"
        >
          🗑️ Delete This Trip
        </button>
        <Link
          to="/"
          className="inline-block border border-gray-200 bg-white/80 backdrop-blur-sm text-[#FF5A5F] px-6 py-2 rounded-full shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 font-semibold"
        >
          Back to Trips
        </Link>
      </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
