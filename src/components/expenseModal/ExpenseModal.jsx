"use client";
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";

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
  } = useForm();

  // Prefill form if updating
  useEffect(() => {
    if (expensesDetails) {
      setValue("title", expensesDetails.title);
      setValue("amount", expensesDetails.amount);
      setValue("category", expensesDetails.category);
      setValue(
        "date",
        expensesDetails.date ? new Date(expensesDetails.date) : new Date()
      );
    } else {
      reset({
        title: "",
        amount: "",
        category: CATEGORIES[0],
        date: null,
      });
    }
  }, [expensesDetails, setValue, reset, CATEGORIES]);

  const onSubmit = async (data) => {
    // Prepare expense object
    const expensePayload = {
      title: String(data.title).trim(),
      amount: Number(data.amount),
      category: data.category || "Uncategorized",
      date:
        data.date instanceof Date
          ? data.date.toISOString()
          : new Date().toISOString(),
    };

    try {
      let response, result;

      if (expensesDetails?._id) {
        setUpdateExpenses(false);
        // Update existing expense
        response = await fetch(`/api/expenses/${expensesDetails._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expensePayload),
        });
        result = await response.json();

        if (!response.ok) throw new Error(result.error || "Failed to update");

        setUpdateExpenses(true); // trigger parent refresh
      } else {
        // Add new expense
        setAddExpenses(false);
        response = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expensePayload),
        });
        result = await response.json();

        if (!response.ok) throw new Error(result.error || "Failed to create");

        setAddExpenses(true); // trigger parent refresh
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
            {expensesDetails ? "Update" : "Add"} Expense
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
                ? expensesDetails
                  ? "Updating..."
                  : "Adding..."
                : expensesDetails
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
