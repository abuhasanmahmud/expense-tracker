import Expense from "@/backend/model/expense.model";
import connectDB from "@/utils/database";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  const { id } = params;

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
