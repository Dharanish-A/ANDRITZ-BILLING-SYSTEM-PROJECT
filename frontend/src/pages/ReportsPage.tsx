import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileSpreadsheet } from "lucide-react";
import { Card, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select, Label, Input } from "../components/ui/Input";
import { downloadFile } from "../api/client";
import { getReport } from "../services/data";

const reports = ["monthly", "employee", "department", "country", "cost-center"] as const;
type ReportKind = (typeof reports)[number];

export function ReportsPage() {
  const [report, setReport] = useState<ReportKind>("monthly");
  const data = useQuery({ queryKey: ["report", report], queryFn: () => getReport(report) });

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Reports</h1>
        <p className="text-sm text-slate-500">Employee, department, monthly, country, and cost center reporting.</p>
      </div>

      <Card>
        <CardTitle>Filters</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div>
            <Label>Report Type</Label>
            <Select value={report} onChange={(event) => setReport(event.target.value as ReportKind)}>
              {reports.map((item) => (
                <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)} Report</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Date From</Label>
            <Input type="date" />
          </div>
          <div>
            <Label>Date To</Label>
            <Input type="date" />
          </div>
          <div className="flex items-end gap-2">
            <button className="inline-flex h-10 items-center gap-2 rounded-md bg-andritz-blue px-4 text-sm font-semibold text-white" onClick={() => void downloadFile("/api/export/excel", "andritz-travel-expenses.xlsx")}>
              <FileSpreadsheet size={16} /> Excel
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-andritz-dark" onClick={() => void downloadFile("/api/export/pdf", "andritz-travel-expenses.pdf")}>
              <Download size={16} /> PDF
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Report Preview</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr>
                {Object.keys(data.data?.[0] ?? { report: "No data" }).map((key) => (
                  <th key={key} className="py-3">{key.replaceAll("_", " ")}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.data?.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, valueIndex) => (
                    <td key={valueIndex} className="py-3">{String(value ?? "-")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button className="mt-5" onClick={() => void data.refetch()}>Generate Report</Button>
      </Card>
    </div>
  );
}
