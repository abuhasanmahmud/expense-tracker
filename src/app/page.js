import Expense from "@/components/expense/Expense";
import ExpenseTable from "@/components/expenseTable/ExpenseTable";
import Navbar from "@/components/navbar/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <Expense />
    </>
  );
}
