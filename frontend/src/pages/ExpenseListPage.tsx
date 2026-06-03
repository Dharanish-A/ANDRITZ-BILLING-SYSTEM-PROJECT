import { useQuery } from "@tanstack/react-query";
import { Card, CardTitle } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/Badge";
import { getExpenses } from "../services/data";
import { currency, shortDate } from "../utils/format";

export function ExpenseListPage() {
  const expenses = useQuery({ queryKey: ["expenses"], queryFn: getExpenses });

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Expenses</h1>
        <p className="text-sm text-slate-500">Submitted claims with travel details and approval status.</p>
      </div>
      <Card>
        <CardTitle>Expense Records</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr>
                <th className="py-3">Employee</th>
                <th>Department</th>
                <th>Route</th>
                <th>Submitted</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.data?.map((expense) => (
                <tr key={expense.id}>
                  <td className="py-4 font-semibold">{expense.full_name}</td>
                  <td>{expense.department}</td>
                  <td>{expense.travel?.origin ?? "-"} to {expense.travel?.destination ?? "-"}</td>
                  <td>{shortDate(expense.submitted_at)}</td>
                  <td>{currency(expense.total_amount, expense.currency)}</td>
                  <td><StatusBadge status={expense.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
