import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <section
      className={cn("rounded-lg border border-slate-200 bg-white p-5 shadow-enterprise dark:border-slate-800 dark:bg-slate-900", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("text-base font-semibold text-slate-900 dark:text-white", className)}>{children}</h2>;
}
