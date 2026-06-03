import { cn } from "../../utils/cn";
import type { Status } from "../../types";

const styles: Record<Status, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100",
  UNDER_REVIEW: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-100",
  APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-100"
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", styles[status])}>{status.replace("_", " ")}</span>;
}
