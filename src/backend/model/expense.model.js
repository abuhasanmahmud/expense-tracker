// models/Expense.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const ExpenseSchema = new Schema(
  {
    title: { type: String, required: true, minlength: 3 },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

// Avoid model overwrite in dev/hot reload
const Expense =
  mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

export default Expense;
