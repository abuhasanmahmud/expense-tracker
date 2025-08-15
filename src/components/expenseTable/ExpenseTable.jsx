"use client";
import React, { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaTrash, FaPencilAlt } from "react-icons/fa";
import DeleteModal from "../deleteModal/DeleteModal";

/**
 * ExpenseTable (category-only filtering with react-hook-form + datepicker)
 *
 * Fixed categories: Food, Transport, Shopping, Grocery
 */
const ExpenseTable = ({
  filtered,
  setDeleteExpenses,
  setIsAddOpen,
  setExpensesDetails,
}) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
    <>
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
                    <tr key={exp._id} className="hover">
                      <th>{idx + 1}</th>
                      <td>{exp.title}</td>
                      <td>
                        <span className="font-medium">৳{exp.amount}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            exp.category === "Food"
                              ? "badge-error" // red
                              : exp.category === "Transport"
                              ? "badge-warning" // yellow
                              : exp.category === "Shopping"
                              ? "badge-info" // blue
                              : exp.category === "Grocery"
                              ? "badge-success" // green
                              : "badge-neutral" // default gray
                          }`}
                        >
                          {exp.category}
                        </span>
                      </td>

                      <td>{formatDate(exp.date)}</td>
                      <td>
                        <div className="flex gap-3 justify-center">
                          {/* Edit */}
                          <button
                            onClick={() => {
                              setExpensesDetails(exp), setIsAddOpen(true);
                            }}
                            className="btn btn-ghost btn-xs p-1"
                            title="Edit"
                          >
                            <FaPencilAlt className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setIsDeleteOpen(true)}
                            className="btn btn-error btn-xs p-1"
                            title="Delete"
                          >
                            <FaTrash className="w-4 h-4 text-white" />
                          </button>
                        </div>

                        <DeleteModal
                          isOpen={isDeleteOpen}
                          onClose={() => setIsDeleteOpen(false)}
                          title={exp.title}
                          id={exp._id}
                          setDeleteExpenses={setDeleteExpenses}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpenseTable;
