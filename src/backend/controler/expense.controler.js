// controllers/expensesController.js

import connectDB from "@/utils/database";
import Expense from "../model/expense.model";

/**
 * Fetch all expenses, optionally filtered by category.
 */
export async function getExpenses() {
  await connectDB();

  const expenses = await Expense.find(query)
    .sort({ date: -1, createdAt: -1 })
    .lean();
  return expenses;
}

/**
 * Create a new expense
 */
export async function createExpense({ title, amount, category, date }) {
  await connectDB();

  const expense = await Expense.create({
    title: title.trim(),
    amount: amount,
    category,
    date: date,
  });

  return expense.toObject();
}

/**
 * Update an expense by ID
 */
export async function updateExpense(id, { title, amount, category, date }) {
  await connect();

  const updateData = {};
  if (title) {
    if (typeof title !== "string" || title.trim().length < 3) {
      const err = new Error("Title must be at least 3 characters.");
      err.status = 400;
      throw err;
    }
    updateData.title = title.trim();
  }

  if (amount !== undefined) {
    const nAmount = Number(amount);
    if (Number.isNaN(nAmount) || nAmount <= 0) {
      const err = new Error("Amount must be a number greater than 0.");
      err.status = 400;
      throw err;
    }
    updateData.amount = nAmount;
  }

  if (category) {
    if (typeof category !== "string") {
      const err = new Error("Category must be a string.");
      err.status = 400;
      throw err;
    }
    updateData.category = category;
  }

  if (date) {
    const parsedDate = new Date(date);
    if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime())) {
      const err = new Error("Date must be valid.");
      err.status = 400;
      throw err;
    }
    updateData.date = parsedDate;
  }

  const updated = await Expense.findByIdAndUpdate(id, updateData, {
    new: true,
  }).lean();
  if (!updated) {
    const err = new Error("Expense not found");
    err.status = 404;
    throw err;
  }

  return updated;
}

/**
 * Delete an expense by ID
 */
export async function deleteExpense(id) {
  await connect();
  const deleted = await Expense.findByIdAndDelete(id).lean();
  if (!deleted) {
    const err = new Error("Expense not found");
    err.status = 404;
    throw err;
  }
  return deleted;
}
