"use client";
import React, { useMemo, useState, useEffect } from "react";
import ExpenseTable from "../expenseTable/ExpenseTable";
import ExpenseModal from "../expenseModal/ExpenseModal";

const Expense = () => {
  const CATEGORIES = ["Food", "Transport", "Shopping", "Grocery"];

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [expensesList, setExpensesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch expenses from backend on mount
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await fetch("/api/expenses"); // Make sure this endpoint exists
        if (!res.ok) throw new Error("Failed to fetch expenses");
        const data = await res.json();
        console.log("Fetched expenses:", data);
        setExpensesList(data.data || []);
      } catch (err) {
        console.error("Error fetching expenses:", err.message);
        setExpensesList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const handleResetFiltering = () => {
    setCategoryFilter("All");
  };

  const filtered = useMemo(() => {
    return expensesList.filter(
      (exp) =>
        categoryFilter === "All" || (exp.category || "") === categoryFilter
    );
  }, [expensesList, categoryFilter]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Expense Table</h1>
          <p className="text-sm text-gray-500">
            Filter expenses by category only
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddOpen(true)}
            className="btn btn-primary"
            type="button"
          >
            Add Expense
          </button>
        </div>
      </div>

      {/* Category filter + Reset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        <div>
          <label htmlFor="category" className="sr-only">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="select select-bordered w-full"
            onChange={(e) => setCategoryFilter(e.target.value)}
            value={categoryFilter}
          >
            <option value="All">Category: All</option>
            {CATEGORIES.map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </select>
        </div>

        <div className="flex">
          <button
            onClick={handleResetFiltering}
            type="button"
            className="btn btn-ghost btn-block"
          >
            Reset filtering
          </button>
        </div>
      </div>

      {/* Expense Table */}
      {loading ? (
        <p className="mt-6 text-center text-gray-500">Loading expenses...</p>
      ) : (
        <ExpenseTable filtered={filtered} setExpensesList={setExpensesList} />
      )}

      {/* Add Expense Modal */}
      {isAddOpen && (
        <ExpenseModal
          isAddOpen={isAddOpen}
          setIsAddOpen={setIsAddOpen}
          setExpensesList={setExpensesList}
          CATEGORIES={CATEGORIES}
        />
      )}
    </div>
  );
};

export default Expense;
