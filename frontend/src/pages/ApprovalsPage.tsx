import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardTitle } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/Badge";
import { approveExpense, getPendingApprovals, rejectExpense } from "../services/data";
import { currency } from "../utils/format";
import { useToast } from "../components/ui/Toast";

export function ApprovalsPage() {
  const approvals = useQuery({ queryKey: ["approvals"], queryFn: getPendingApprovals });
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["approvals"] }),
      queryClient.invalidateQueries({ queryKey: ["overview"] })
    ]);
  };
  const approve = useMutation({ mutationFn: (expenseId: string) => approveExpense(expenseId), onSuccess: refresh, onError: (e) => notify(e instanceof Error ? e.message : "Approval failed") });
  const reject = useMutation({ mutationFn: (expenseId: string) => rejectExpense(expenseId), onSuccess: refresh, onError: (e) => notify(e instanceof Error ? e.message : "Rejection failed") });

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Approval Workflow</h1>
        <p className="text-sm text-slate-500">Manager and finance review queue for pending travel expenses.</p>
      </div>
      <div className="grid gap-4">
        {approvals.data?.map((expense) => (
          <Card key={expense.id}>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <CardTitle>{expense.full_name}</CardTitle>
                <p className="mt-1 text-sm text-slate-500">{expense.department} | {expense.travel_purpose}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <StatusBadge status={expense.status} />
                  <span>{currency(expense.total_amount, expense.currency)}</span>
                  <span>{expense.travel?.origin ?? "-"} to {expense.travel?.destination ?? "-"}</span>
                  <span>Expense ID: {expense.id}</span>
                </div>
                <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                  <div>
                    <div className="text-xs font-semibold uppercase text-slate-500">Travel Details</div>
                    <div className="mt-1 text-slate-700 dark:text-slate-200">
                      {expense.travel?.travel_type ?? "-"} | {expense.travel?.start_date ?? "-"} to {expense.travel?.end_date ?? "-"}
                    </div>
                    <div className="text-slate-500">Booking: {expense.travel?.booking_code ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase text-slate-500">Cost Breakdown</div>
                    <div className="mt-1 text-slate-700 dark:text-slate-200">
                      Flight {currency(expense.categories?.flight_cost, expense.currency)} | Hotel {currency(expense.categories?.hotel_cost, expense.currency)}
                    </div>
                    <div className="text-slate-500">
                      Taxi {currency(expense.categories?.taxi_cost, expense.currency)} | Taxes {currency(Number(expense.categories?.gst ?? 0) + Number(expense.categories?.vat ?? 0) + Number(expense.categories?.service_tax ?? 0), expense.currency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase text-slate-500">Receipt</div>
                    {expense.receipts?.[0]?.storage_url ? (
                      <a className="mt-1 inline-block font-semibold text-andritz-blue" href={expense.receipts[0].storage_url} target="_blank" rel="noreferrer">
                        {expense.receipts[0].file_name}
                      </a>
                    ) : (
                      <div className="mt-1 text-slate-500">No receipt linked</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => reject.mutate(expense.id)}>
                  <X size={16} /> Reject
                </Button>
                <Button onClick={() => approve.mutate(expense.id)}>
                  <Check size={16} /> Approve
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
