"use client";
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ExpenseModal = ({
  isAddOpen,
  setIsAddOpen,
  CATEGORIES,
  setAddExpenses,
  setUpdateExpenses,
  expensesDetails,
  setExpensesDetails,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      amount: "",
      category: CATEGORIES[0],
      date: null,
    },
  });

  // Prefill form if updating; otherwise reset to defaults
  useEffect(() => {
    // consider update mode only when we have an actual expense object (check _id)
    if (expensesDetails && expensesDetails._id) {
      setValue("title", expensesDetails.title ?? "");
      setValue("amount", expensesDetails.amount ?? "");
      setValue("category", expensesDetails.category ?? CATEGORIES[0]);
      // if there's a valid date string or Date, set Date object; otherwise null
      const d =
        expensesDetails.date &&
        !Number.isNaN(new Date(expensesDetails.date).getTime())
          ? new Date(expensesDetails.date)
          : null;
      setValue("date", d);
    } else {
      // Add mode or cleared details
      reset({
        title: "",
        amount: "",
        category: CATEGORIES[0],
        date: null,
      });
    }
  }, [expensesDetails, setValue, reset, CATEGORIES]);

  const onSubmit = async (data) => {
    const expensePayload = {
      title: String(data.title).trim(),
      amount: Number(data.amount),
      category: data.category || "Uncategorized",
      date: data.date instanceof Date ? data.date.toISOString() : null,
    };

    try {
      if (expensesDetails && expensesDetails._id) {
        setUpdateExpenses(false);
        const res = await fetch(`/api/expenses/${expensesDetails._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expensePayload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to update");
        setUpdateExpenses(true);
      } else {
        setAddExpenses(false);
        const res = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expensePayload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to create");
        setAddExpenses(true);
      }

      reset();
      setIsAddOpen(false);
      setExpensesDetails(null);
    } catch (err) {
      console.error("Error:", err.message);
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {expensesDetails && expensesDetails._id ? "Update" : "Add"} Expense
          </h3>
          <button
            onClick={() => {
              setIsAddOpen(false);
              reset();
              setExpensesDetails(null);
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
                minLength: { value: 3, message: "Minimum 3 characters" },
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

          {/* Category */}
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

          {/* Date */}
          <div>
            <label className="block text-sm">Date</label>
            <Controller
              control={control}
              name="date"
              rules={{
                required: "Date is required",
                validate: (value) => {
                  if (value === null) return "Date is required";
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
              <p className="text-xs text-red-600 mt-1">{errors.date.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                reset();
                setExpensesDetails(null);
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
              {isSubmitting
                ? expensesDetails && expensesDetails._id
                  ? "Updating..."
                  : "Adding..."
                : expensesDetails && expensesDetails._id
                ? "Update"
                : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
