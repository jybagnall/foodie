import { useState, useEffect } from "react";
import axios from "axios";
import MealItem from "./MealItem";

const API_BASE = "http://localhost:5000";

export default function Meals() {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    const fetchMeals = async () => {
      const res = await axios.get(`${API_BASE}/meals`);
      setMeals(res.data);
    };

    fetchMeals();
  }, []);

  useEffect(() => {
    document.title = "Menu | Foodie";
  }, []);

  return (
    <ul className="w-[80%] max-w-[1200px] list-none my-8 mx-auto p-4 grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {meals.map((m) => (
        <MealItem key={m.id} meal={m} />
      ))}
    </ul>
  );
}
