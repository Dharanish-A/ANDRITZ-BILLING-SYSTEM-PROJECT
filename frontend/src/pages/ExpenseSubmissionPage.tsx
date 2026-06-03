import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CloudUpload, FileCheck2, Save } from "lucide-react";
import { Card, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Label, Select, Textarea } from "../components/ui/Input";
import { convertCurrency, createExpense, getEmployees, uploadReceipt } from "../services/data";
import { currency } from "../utils/format";
import { useToast } from "../components/ui/Toast";
import { ReceiptPreviewPanel } from "../components/ReceiptPreviewPanel";
import { OcrValidationPanel } from "../components/OcrValidationPanel";
import type { CurrencyConversion, ExtractedReceipt } from "../types";

const categoryFields = [
  ["flightCost", "Flight Cost"],
  ["hotelCost", "Hotel Cost"],
  ["taxiCost", "Taxi Cost"],
  ["trainCost", "Train Cost"],
  ["foodCost", "Food Cost"],
  ["insuranceCost", "Insurance Cost"],
  ["visaCost", "Visa Cost"],
  ["miscellaneousCost", "Miscellaneous Cost"],
  ["gst", "GST"],
  ["vat", "VAT"],
  ["serviceTax", "Service Tax"]
] as const;

const initialCategories = Object.fromEntries(categoryFields.map(([key]) => [key, 0])) as Record<(typeof categoryFields)[number][0], number>;

export function ExpenseSubmissionPage() {
  const employees = useQuery({ queryKey: ["employees"], queryFn: getEmployees });
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [extracted, setExtracted] = useState<ExtractedReceipt | null>(null);
  const [conversion, setConversion] = useState<CurrencyConversion | null>(null);
  const [form, setForm] = useState({
    employeeId: "",
    travelPurpose: "",
    currency: "INR",
    travelType: "Domestic",
    origin: "",
    destination: "",
    country: "India",
    startDate: "",
    endDate: "",
    bookingCode: "",
    categories: initialCategories
  });

  const totals = useMemo(() => {
    const subtotal = Object.entries(form.categories)
      .filter(([key]) => !["gst", "vat", "serviceTax"].includes(key))
      .reduce((sum, [, value]) => sum + Number(value || 0), 0);
    const taxes = Number(form.categories.gst) + Number(form.categories.vat) + Number(form.categories.serviceTax);
    return { subtotal, taxes, total: subtotal + taxes };
  }, [form.categories]);

  useEffect(() => {
    void convertCurrency(totals.total, form.currency).then(setConversion);
  }, [form.currency, totals.total]);

  const save = useMutation({
    mutationFn: createExpense,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["expenses"] }),
        queryClient.invalidateQueries({ queryKey: ["approvals"] }),
        queryClient.invalidateQueries({ queryKey: ["overview"] }),
        queryClient.invalidateQueries({ queryKey: ["charts"] }),
        queryClient.invalidateQueries({ queryKey: ["report"] }),
        queryClient.invalidateQueries({ queryKey: ["profile"] })
      ]);
      notify("Expense submitted for approval", "success");
    },
    onError: (error) => notify(error instanceof Error ? error.message : "Expense submission failed", "error")
  });

  async function handleReceipt(file: File) {
    if (receiptUrl) URL.revokeObjectURL(receiptUrl);
    setReceiptFile(file);
    setReceiptUrl(URL.createObjectURL(file));
    setPreviewZoom(1);
    setReceiptName(file.name);
    try {
      const receipt = await uploadReceipt(file);
      const data = {
        ...(receipt.extracted_data ?? {}),
        confidence: Number(receipt.ocr_confidence ?? receipt.extracted_data?.confidence ?? 0),
        validations: receipt.validation_results ?? receipt.extracted_data?.validations ?? []
      };
      setReceiptId(receipt.id);
      setExtracted(data);
      setForm((value) => ({
        ...value,
        bookingCode: typeof data.bookingCode === "string" ? data.bookingCode : value.bookingCode,
        currency: typeof data.currency === "string" ? data.currency : value.currency,
        startDate: typeof data.invoiceDate === "string" && !value.startDate ? data.invoiceDate : value.startDate,
        categories: {
          ...value.categories,
          gst: typeof data.taxAmount === "number" ? data.taxAmount : value.categories.gst
        }
      }));
      notify("Receipt processed with OCR", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Receipt upload failed", "error");
    }
  }

  function removeReceipt() {
    if (receiptUrl) URL.revokeObjectURL(receiptUrl);
    setReceiptFile(null);
    setReceiptUrl(null);
    setReceiptName(null);
    setReceiptId(null);
    setExtracted(null);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate({
      employeeId: form.employeeId || employees.data?.[0]?.id,
      receiptId: receiptId ?? undefined,
      travelPurpose: form.travelPurpose,
      currency: form.currency,
      travel: {
        travelType: form.travelType,
        origin: form.origin,
        destination: form.destination,
        country: form.country,
        startDate: form.startDate,
        endDate: form.endDate,
        bookingCode: form.bookingCode
      },
      categories: form.categories
    });
  }

  return (
    <form className="space-y-6 pb-20 lg:pb-0" onSubmit={submit}>
      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Expense Submission</h1>
        <p className="text-sm text-slate-500">Upload a receipt, validate extracted fields, and submit travel costs for approval.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="grid gap-6 2xl:grid-cols-2">
            <Card>
              <CardTitle>Upload Receipt</CardTitle>
              <label
                className="mt-4 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-andritz-blue dark:border-slate-700 dark:bg-slate-950"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const file = event.dataTransfer.files[0];
                  if (file) void handleReceipt(file);
                }}
              >
                <CloudUpload className="mb-3 text-andritz-blue" size={34} />
                <span className="font-semibold text-slate-900 dark:text-white">{receiptName ?? "Drop PDF, JPG, JPEG, or PNG receipt"}</span>
                <span className="mt-1 text-sm text-slate-500">OCR will extract seller, GST, invoice, booking, taxes, and totals.</span>
                <input className="hidden" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => event.target.files?.[0] && void handleReceipt(event.target.files[0])} />
              </label>
              {extracted && (
                <div className="mt-4 grid gap-3 rounded-md bg-slate-50 p-4 text-sm dark:bg-slate-950 sm:grid-cols-2">
                  {Object.entries(extracted)
                    .filter(([key]) => !["validations"].includes(key))
                    .map(([key, value]) => (
                      <div key={key}>
                        <div className="text-xs font-semibold uppercase text-slate-500">{key}</div>
                        <div className="truncate text-slate-900 dark:text-white">{String(value ?? "-")}</div>
                      </div>
                    ))}
                </div>
              )}
            </Card>
            <ReceiptPreviewPanel file={receiptFile} url={receiptUrl} zoom={previewZoom} onZoomChange={setPreviewZoom} onRemove={removeReceipt} />
          </div>

          <OcrValidationPanel extracted={extracted} />

          <Card>
            <CardTitle>Employee Information</CardTitle>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <Label>Employee</Label>
                <Select value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })}>
                  <option value="">Select employee</option>
                  {employees.data?.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.full_name} ({employee.employee_code})
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Travel Purpose</Label>
                <Textarea value={form.travelPurpose} onChange={(event) => setForm({ ...form, travelPurpose: event.target.value })} required />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Travel Information</CardTitle>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <Label>Travel Type</Label>
                <Select value={form.travelType} onChange={(event) => setForm({ ...form, travelType: event.target.value })}>
                  <option>Domestic</option>
                  <option>International</option>
                </Select>
              </div>
              <div>
                <Label>From</Label>
                <Input value={form.origin} onChange={(event) => setForm({ ...form, origin: event.target.value })} required />
              </div>
              <div>
                <Label>To</Label>
                <Input value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} required />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} required />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} required />
              </div>
              <div>
                <Label>Booking Code</Label>
                <Input value={form.bookingCode} onChange={(event) => setForm({ ...form, bookingCode: event.target.value })} />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Expense Categories & Taxes</CardTitle>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <Label>Currency</Label>
                <Select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })}>
                  {["INR", "USD", "EUR", "GBP", "AED", "SGD", "JPY"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </div>
              {categoryFields.map(([key, label]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.categories[key]}
                    onChange={(event) =>
                      setForm({ ...form, categories: { ...form.categories, [key]: Number(event.target.value) } })
                    }
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="h-fit xl:sticky xl:top-24">
          <CardTitle>Automatic Expense Calculation</CardTitle>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><strong>{currency(totals.subtotal, form.currency)}</strong></div>
            <div className="flex justify-between"><span>Taxes</span><strong>{currency(totals.taxes, form.currency)}</strong></div>
            <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <div className="flex justify-between text-lg"><span>Total Expense</span><strong>{currency(totals.total, form.currency)}</strong></div>
            </div>
            {conversion && form.currency !== "INR" && (
              <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
                <div className="flex justify-between"><span>Exchange Rate</span><strong>{conversion.exchangeRate}</strong></div>
                <div className="mt-2 flex justify-between"><span>Converted INR</span><strong>{currency(conversion.convertedAmount)}</strong></div>
              </div>
            )}
          </div>
          <Button className="mt-6 w-full" disabled={save.isPending}>
            <Save size={16} />
            Submit for Approval
          </Button>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <FileCheck2 size={15} />
            Employee to Manager to Finance workflow
          </div>
        </Card>
      </div>
    </form>
  );
}
