"use client";
import React, { useMemo, useState, useEffect } from "react";
import ExpenseTable from "../expenseTable/ExpenseTable";
import ExpenseModal from "../expenseModal/ExpenseModal";

// chart imports
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

const Expense = () => {
  const CATEGORIES = ["Food", "Transport", "Shopping", "Grocery"];
  const [deleteExpenses, setDeleteExpenses] = useState(false);
  const [addExpenses, setAddExpenses] = useState(false);
  const [updateExpenses, setUpdateExpenses] = useState(false);
  const [expensesDetails, setExpensesDetails] = useState({});

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [expensesList, setExpensesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await fetch("/api/expenses");
        if (!res.ok) throw new Error("Failed to fetch expenses");
        const data = await res.json();
        setExpensesList(data.data || []);
      } catch (err) {
        console.error("Error fetching expenses:", err.message);
        setExpensesList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [deleteExpenses, addExpenses, updateExpenses]);

  const handleResetFiltering = () => setCategoryFilter("All");

  const filtered = useMemo(() => {
    return expensesList.filter(
      (exp) =>
        categoryFilter === "All" || (exp.category || "") === categoryFilter
    );
  }, [expensesList, categoryFilter]);

  // ===== Totals (all + filtered) =====
  const totalSpendAll = useMemo(
    () => expensesList.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [expensesList]
  );
  const totalSpendFiltered = useMemo(
    () => filtered.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [filtered]
  );
  const totalCountAll = expensesList.length;
  const totalCountFiltered = filtered.length;

  const formatMoney = (n) =>
    `৳${Number(n || 0).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`;

  // ===== Chart: totals by category (all) =====
  const totalsByCategory = useMemo(() => {
    const map = new Map();
    for (const exp of expensesList) {
      const key = exp.category || "Uncategorized";
      const prev = map.get(key) || 0;
      map.set(key, prev + Number(exp.amount || 0));
    }
    const known = CATEGORIES.filter((c) => map.has(c));
    const others = [...map.keys()].filter((k) => !known.includes(k));
    const ordered = [...known, ...others];
    const values = ordered.map((k) => map.get(k));
    return { labels: ordered, values };
  }, [expensesList, CATEGORIES]);

  const categoryColor = (cat) =>
    cat === "Food"
      ? "#ef4444"
      : cat === "Transport"
      ? "#f59e0b"
      : cat === "Shopping"
      ? "#3b82f6"
      : cat === "Grocery"
      ? "#22c55e"
      : "#9ca3af";

  const doughnutData = useMemo(
    () => ({
      labels: totalsByCategory.labels,
      datasets: [
        {
          label: "Total Amount",
          data: totalsByCategory.values,
          backgroundColor: totalsByCategory.labels.map(categoryColor),
          borderWidth: 1,
        },
      ],
    }),
    [totalsByCategory]
  );

  const doughnutOptions = {
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatMoney(ctx.parsed)}`,
        },
      },
    },
  };

  return (
    <div className="max-w-screen-xl mx-auto  py-8 mt-16">
      {/* Top row: Chart (left) + Totals card (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Chart card */}
        <div className="card bg-base-100 shadow-sm lg:col-span-2">
          <div className="card-body">
            <h3 className="card-title text-base">Expenses by Category</h3>
            {loading ? (
              <p className="text-sm text-gray-500">Loading chart...</p>
            ) : totalsByCategory.values.length ? (
              <div className="w-80 h-76 max-w-md mx-auto">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            ) : (
              <p className="text-sm text-gray-500">No data to display</p>
            )}
          </div>
        </div>

        {/* Totals card (right) */}
        <div className="card bg-base-100 shadow-sm lg:col-span-1">
          <div className="card-body">
            <h3 className="card-title text-base">Totals</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-gray-500">Total Expenses (All)</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {totalCountAll}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-xs text-gray-500">Total Spend (All)</p>
                <p className="text-2xl font-semibold text-green-600">
                  {formatMoney(totalSpendAll)}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <p className="text-xs text-gray-500">
                  Total Expenses (Filtered)
                </p>
                <p className="text-2xl font-semibold text-purple-600">
                  {totalCountFiltered}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-gray-500">Total Spend (Filtered)</p>
                <p className="text-2xl font-semibold text-amber-600">
                  {formatMoney(totalSpendFiltered)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header + Filters + Add button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Expense Table</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <label htmlFor="category" className="sr-only">
              Category
            </label>
            <select
              id="category"
              name="category"
              className="select select-bordered"
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

          <button
            onClick={handleResetFiltering}
            type="button"
            className="btn btn-ghost"
          >
            Reset
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="btn btn-primary"
            type="button"
          >
            Add Expense
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="mt-6 text-center text-gray-500">Loading expenses...</p>
      ) : (
        <ExpenseTable
          filtered={filtered}
          setDeleteExpenses={setDeleteExpenses}
          setIsAddOpen={setIsAddOpen}
          setExpensesDetails={setExpensesDetails}
        />
      )}

      {/* Modal */}
      {isAddOpen && (
        <ExpenseModal
          isAddOpen={isAddOpen}
          setIsAddOpen={setIsAddOpen}
          setExpensesList={setExpensesList}
          CATEGORIES={CATEGORIES}
          setAddExpenses={setAddExpenses}
          setUpdateExpenses={setUpdateExpenses}
          expensesDetails={expensesDetails}
          setExpensesDetails={setExpensesDetails}
        />
      )}
    </div>
  );
};

export default Expense;
