import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { Download, FilePlus2, FileSpreadsheet, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardTitle } from "../components/ui/Card";
import { Input, Label, Select } from "../components/ui/Input";
import { getCategoryAnalytics, getCharts, getEmployees, getOverview } from "../services/data";
import { currency } from "../utils/format";
import { downloadFile } from "../api/client";

const colors = ["#0075BE", "#003B5C", "#16A34A", "#F59E0B", "#EF4444"];

export function DashboardPage() {
  const [filters, setFilters] = useState({ month: "", department: "", employeeId: "" });
  const overview = useQuery({ queryKey: ["overview"], queryFn: getOverview });
  const charts = useQuery({ queryKey: ["charts"], queryFn: getCharts });
  const employees = useQuery({ queryKey: ["employees"], queryFn: getEmployees });
  const categories = useQuery({ queryKey: ["categoryAnalytics", filters], queryFn: () => getCategoryAnalytics(filters) });
  const cards = [
    ["Total Trips", overview.data?.total_trips ?? 0],
    ["Pending Trips", overview.data?.pending_trips ?? 0],
    ["Approved Trips", overview.data?.approved_trips ?? 0],
    ["Rejected Trips", overview.data?.rejected_trips ?? 0],
    ["Monthly Expenses", currency(overview.data?.monthly_expenses)]
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500">Travel spend, approval health, and export-ready reporting.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="inline-flex h-10 items-center gap-2 rounded-md bg-andritz-blue px-4 text-sm font-semibold text-white hover:bg-[#00629f]" to="/expenses/new">
            <FilePlus2 size={16} />
            New Expense
          </Link>
          <button onClick={() => void downloadFile("/api/export/excel", "andritz-travel-expenses.xlsx")} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-andritz-dark">
            <FileSpreadsheet size={16} />
            Export Excel
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value]) => (
          <Card key={label.toString()}>
            <div className="text-sm font-medium text-slate-500">{label}</div>
            <div className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{value}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardTitle>Monthly Expense Chart</CardTitle>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.data?.monthly ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0075BE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle>Department Expense Chart</CardTitle>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="value" data={charts.data?.department ?? []} outerRadius={110} label nameKey="label">
                  {(charts.data?.department ?? []).map((_entry, index) => (
                    <Cell key={index} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <CardTitle>Expense Category Breakdown</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Interactive category spend with month, department, and employee filters.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[680px]">
            <div>
              <Label>Month</Label>
              <Input type="month" value={filters.month} onChange={(event) => setFilters({ ...filters, month: event.target.value })} />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={filters.department} onChange={(event) => setFilters({ ...filters, department: event.target.value })}>
                <option value="">All departments</option>
                {[...new Set(employees.data?.map((employee) => employee.department) ?? [])].map((department) => (
                  <option key={department}>{department}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Employee</Label>
              <Select value={filters.employeeId} onChange={(event) => setFilters({ ...filters, employeeId: event.target.value })}>
                <option value="">All employees</option>
                {employees.data?.map((employee) => (
                  <option key={employee.id} value={employee.id}>{employee.full_name}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div className="mt-4 h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="value" data={categories.data ?? []} outerRadius={135} label nameKey="label">
                {(categories.data ?? []).map((_entry, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => currency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle>Quick Actions</CardTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Link className="rounded-md border border-slate-200 p-4 font-semibold hover:bg-slate-50 dark:border-slate-800" to="/expenses/new">
            <FilePlus2 className="mb-3 text-andritz-blue" /> New Expense
          </Link>
          <Link className="rounded-md border border-slate-200 p-4 font-semibold hover:bg-slate-50 dark:border-slate-800" to="/expenses/new">
            <Upload className="mb-3 text-andritz-blue" /> Upload Receipt
          </Link>
          <Link className="rounded-md border border-slate-200 p-4 font-semibold hover:bg-slate-50 dark:border-slate-800" to="/reports">
            <Download className="mb-3 text-andritz-blue" /> Generate Report
          </Link>
          <button className="rounded-md border border-slate-200 p-4 text-left font-semibold hover:bg-slate-50 dark:border-slate-800" onClick={() => void downloadFile("/api/export/excel", "andritz-travel-expenses.xlsx")}>
            <FileSpreadsheet className="mb-3 text-andritz-blue" /> Export Excel
          </button>
        </div>
      </Card>
    </div>
  );
}
