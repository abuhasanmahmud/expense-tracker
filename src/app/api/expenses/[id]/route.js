import Expense from "@/backend/model/expense.model";
import connectDB from "@/utils/database";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  const { id } = params;
  // console.log(`Deleting expense with ID in route: ${id}`);

  try {
    await connectDB();
    const deleted = await Expense.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Expense not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = params;

  try {
    await connectDB();
    const data = await request.json();

    const updated = await Expense.findByIdAndUpdate(
      id,
      {
        title: data.title,
        amount: data.amount,
        category: data.category,
        date: data.date,
      },
      { new: true, runValidators: true } // returns updated doc and runs schema validation
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Expense not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Expense updated successfully",
      expense: updated,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
