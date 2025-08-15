import {
  createExpense,
  getExpenses,
} from "@/backend/controler/expense.controler";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const expenses = await getExpenses();
    return NextResponse.json({ success: true, data: expenses });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const created = await createExpense(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 400 }
    );
  }
}
