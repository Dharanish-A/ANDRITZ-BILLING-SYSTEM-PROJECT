import { api } from "../api/client";
import type { ChartPoint, CurrencyConversion, DashboardOverview, Employee, Expense, ExtractedReceipt, ProfileSummary } from "../types";

export function getOverview() {
  return api<DashboardOverview>("/api/dashboard/overview");
}

export function getCharts() {
  return api<{ monthly: ChartPoint[]; department: ChartPoint[]; country: ChartPoint[] }>("/api/dashboard/charts");
}

export function getCategoryAnalytics(filters: { month?: string; department?: string; employeeId?: string }) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
  return api<ChartPoint[]>(`/api/dashboard/categories?${params.toString()}`);
}

export function getExpenses() {
  return api<Expense[]>("/api/expenses");
}

export function createExpense(payload: unknown) {
  return api<Expense>("/api/expenses", { method: "POST", body: JSON.stringify(payload) });
}

export function uploadReceipt(file: File, expenseId?: string) {
  const form = new FormData();
  form.append("receipt", file);
  if (expenseId) form.append("expenseId", expenseId);
  return api<{ id: string; extracted_data: ExtractedReceipt; ocr_confidence?: string; validation_results?: ExtractedReceipt["validations"] }>(
    "/api/receipts/upload",
    { method: "POST", body: form }
  );
}

export function getEmployees() {
  return api<Employee[]>("/api/employees");
}

export function getPendingApprovals() {
  return api<Expense[]>("/api/approvals/pending");
}

export function approveExpense(expenseId: string, comments?: string) {
  return api<Expense>("/api/approvals/approve", { method: "POST", body: JSON.stringify({ expenseId, comments }) });
}

export function rejectExpense(expenseId: string, comments?: string) {
  return api<Expense>("/api/approvals/reject", { method: "POST", body: JSON.stringify({ expenseId, comments }) });
}

export function getReport(kind: "monthly" | "employee" | "department" | "country" | "cost-center") {
  return api<Record<string, unknown>[]>(`/api/reports/${kind}`);
}

export function convertCurrency(amount: number, currency: string) {
  return api<CurrencyConversion>("/api/currency/convert", {
    method: "POST",
    body: JSON.stringify({ amount, currency })
  });
}

export function getProfile() {
  return api<ProfileSummary>("/api/profile/me");
}

export function updateProfile(payload: unknown) {
  return api<ProfileSummary>("/api/profile/me", { method: "PUT", body: JSON.stringify(payload) });
}

export function askAssistant(message: string) {
  return api<{ answer: string; intent: string; metadata: Record<string, unknown> }>("/api/assistant/chat", {
    method: "POST",
    body: JSON.stringify({ message })
  });
}
