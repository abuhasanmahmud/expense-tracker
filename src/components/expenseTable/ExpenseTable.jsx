"use client";
import React, { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * ExpenseTable (category-only filtering with react-hook-form + datepicker)
 *
 * Fixed categories: Food, Transport, Shopping, Grocery
 */
const ExpenseTable = ({ initialExpenses = [] }) => {
  // fixed categories
  const CATEGORIES = ["Food", "Transport", "Shopping", "Grocery"];

  const [categoryFilter, setCategoryFilter] = useState("All");

  // local editable list of expenses (initialized from prop)
  const [expensesList, setExpensesList] = useState(() =>
    (initialExpenses || []).map((e, i) => ({
      ...e,
      id: e.id ?? `tmp-${i}`,
      // normalize date to ISO string if Date passed
      date: e.date instanceof Date ? e.date.toISOString() : e.date ?? null,
    }))
  );

  const [isAddOpen, setIsAddOpen] = useState(false);

  // react-hook-form setup
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      amount: "",
      category: CATEGORIES[0],
      date: null,
    },
  });

  const handleResetFiltering = () => {
    setCategoryFilter("All");
  };

  const onSubmit = (data) => {
    // data.date will be a Date object from Controller
    const newExp = {
      id: Date.now().toString(),
      title: String(data.title).trim(),
      amount: Number(data.amount),
      category: data.category || "Uncategorized",
      date:
        data.date instanceof Date
          ? data.date.toISOString()
          : new Date().toISOString(),
    };
    setExpensesList((s) => [newExp, ...s]);
    reset({
      title: "",
      amount: "",
      category: CATEGORIES[0],
      date: null,
    });
    setIsAddOpen(false);
  };

  const handleDelete = (id) => {
    setExpensesList((s) => s.filter((x) => x.id !== id));
  };

  // filtering by category only
  const filtered = useMemo(() => {
    return expensesList.filter((exp) => {
      return (
        categoryFilter === "All" || (exp.category || "") === categoryFilter
      );
    });
  }, [expensesList, categoryFilter]);

  const totalFilteredAmount = useMemo(
    () => filtered.reduce((s, e) => s + Number(e.amount || 0), 0),
    [filtered]
  );

  // helper to format date (falls back to blank)
  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

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
      <div className="mt-8 card bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <div className="overflow-x-auto rounded-box">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>Sr</th>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6">
                      No expenses found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((exp, idx) => (
                    <tr key={exp.id} className="hover">
                      <th>{idx + 1}</th>
                      <td>{exp.title}</td>
                      <td>
                        <span className="font-medium">৳{exp.amount}</span>
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {exp.category}
                        </span>
                      </td>
                      <td>{formatDate(exp.date)}</td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button className="btn btn-ghost btn-xs">View</button>
                          <button className="btn btn-ghost btn-xs">Edit</button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="btn btn-error btn-xs text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer summary */}
          <div className="px-4 py-3 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="text-sm">
              Showing <strong>{filtered.length}</strong> of{" "}
              <strong>{expensesList.length}</strong> expenses
            </div>
            <div className="text-sm">
              Total amount:{" "}
              <strong>
                ৳
                {Number.isFinite(totalFilteredAmount) ? totalFilteredAmount : 0}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal (react-hook-form + react-datepicker) */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Expense</h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  reset();
                }}
                className="btn btn-ghost btn-sm"
                aria-label="Close"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {/* Title */}
              <div>
                <label className="block text-sm">Title</label>
                <input
                  {...register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 3,
                      message: "Title must be at least 3 characters",
                    },
                  })}
                  className={`input input-bordered w-full ${
                    errors.title ? "input-error" : ""
                  }`}
                  placeholder="e.g. Breakfast"
                />
                {errors.title && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm">Amount</label>
                <input
                  {...register("amount", {
                    required: "Amount is required",
                    valueAsNumber: true,
                    validate: (v) => {
                      const n = Number(v);
                      if (Number.isNaN(n)) return "Amount must be a number";
                      if (n <= 0) return "Amount must be greater than 0";
                      return true;
                    },
                  })}
                  type="number"
                  step="any"
                  min="0"
                  className={`input input-bordered w-full ${
                    errors.amount ? "input-error" : ""
                  }`}
                  placeholder="e.g. 50"
                />
                {errors.amount && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              {/* Category select */}
              <div>
                <label className="block text-sm">Category</label>
                <select
                  {...register("category", { required: true })}
                  className="select select-bordered w-full"
                >
                  {CATEGORIES.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date picker (Controller) */}
              <div>
                <label className="block text-sm">Date</label>
                <Controller
                  control={control}
                  name="date"
                  rules={{
                    required: "Date is required",
                    validate: (value) => {
                      if (!(value instanceof Date)) return "Date must be valid";
                      if (Number.isNaN(value.getTime()))
                        return "Date must be valid";
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <DatePicker
                      placeholderText="Select date"
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      dateFormat="yyyy-MM-dd"
                      className={`input input-bordered w-full ${
                        errors.date ? "input-error" : ""
                      }`}
                    />
                  )}
                />
                {errors.date && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    reset();
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTable;
