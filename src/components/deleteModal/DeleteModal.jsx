import React, { useState } from "react";

const DeleteModal = ({ isOpen, onClose, title, id, setDeleteExpenses }) => {
  if (!isOpen) return null;
  const [loading, setLoading] = useState(false);

  const handleDeleteExpense = async (id) => {
    setDeleteExpenses(false);
    setLoading(true);
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
        setLoading(false);
      }
      setDeleteExpenses(true);
      setLoading(false);
      onClose();

      console.log(`Deleted expense with ID: ${id}`);
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
        <p className="mb-6">Are you sure you want to delete this {title}?</p>
        <div>
          <div>{loading && <>Expenses deleting.....</>}</div>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={() => handleDeleteExpense(id)}
              className="btn btn-error text-white"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
