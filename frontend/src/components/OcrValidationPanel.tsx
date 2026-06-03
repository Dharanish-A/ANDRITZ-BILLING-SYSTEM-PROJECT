import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardTitle } from "./ui/Card";
import type { ExtractedReceipt, OcrValidation } from "../types";
import { cn } from "../utils/cn";

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle
};

const tones = {
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-red-600"
};

function confidenceTone(score: number) {
  if (score >= 85) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100";
  if (score >= 70) return "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100";
  return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-100";
}

export function OcrValidationPanel({ extracted }: { extracted: ExtractedReceipt | null }) {
  if (!extracted) return null;
  const validations: OcrValidation[] = extracted.validations ?? [];
  const score = Number(extracted.confidence ?? 0);

  return (
    <Card>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <CardTitle>AI Receipt Analysis</CardTitle>
        <span className={cn("w-fit rounded-full px-3 py-1 text-xs font-semibold", confidenceTone(score))}>
          OCR Confidence: {score || 0}%
        </span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {validations.map((item) => {
          const Icon = icons[item.status];
          return (
            <div key={item.label} className="flex items-start gap-2 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
              <Icon className={tones[item.status]} size={18} />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{item.label}</div>
                <div className="text-slate-500">{item.message}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
