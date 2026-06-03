import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  KeyRound,
  LockKeyhole,
  Monitor,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UserCog
} from "lucide-react";
import { downloadFile } from "../api/client";
import { StatusBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardTitle } from "../components/ui/Card";
import { Input, Label } from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
import { getProfile, updateProfile } from "../services/data";
import { currency, shortDate } from "../utils/format";

const tabs = ["Overview", "Travel History", "Expense History", "Approvals", "Documents", "Settings"] as const;
type ProfileTab = (typeof tabs)[number];
const primaryActionClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-andritz-blue px-4 text-sm font-semibold text-white transition hover:bg-[#00629f] disabled:cursor-not-allowed disabled:opacity-60";
const secondaryActionClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-andritz-dark transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
const ghostActionClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800";

type ProfileForm = {
  fullName: string;
  email: string;
  department: string;
  designation: string;
  location: string;
  phoneNumber: string;
  costCenter: string;
  profilePictureUrl: string;
  profilePhotoCrop: { zoom: number; x: number; y: number };
  emailNotifications: boolean;
  approvalNotifications: boolean;
  reportNotifications: boolean;
  darkModePreference: boolean;
};

const defaultCrop = { zoom: 1, x: 0, y: 0 };

export function ProfilePage() {
  const profile = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("Overview");
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    email: "",
    department: "",
    designation: "",
    location: "",
    phoneNumber: "",
    costCenter: "",
    profilePictureUrl: "",
    profilePhotoCrop: defaultCrop,
    emailNotifications: true,
    approvalNotifications: true,
    reportNotifications: true,
    darkModePreference: false
  });

  useEffect(() => {
    if (!profile.data) return;
    setForm({
      fullName: profile.data.full_name,
      email: profile.data.email,
      department: profile.data.department,
      designation: profile.data.designation,
      location: profile.data.location ?? "",
      phoneNumber: profile.data.phone_number ?? "",
      costCenter: profile.data.cost_center ?? "",
      profilePictureUrl: profile.data.profile_picture_url ?? "",
      profilePhotoCrop: profile.data.profile_photo_crop ?? defaultCrop,
      emailNotifications: profile.data.notification_preferences?.email ?? true,
      approvalNotifications: profile.data.notification_preferences?.approvals ?? true,
      reportNotifications: profile.data.notification_preferences?.reports ?? true,
      darkModePreference: profile.data.dark_mode_preference ?? false
    });
  }, [profile.data]);

  const save = useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
        queryClient.invalidateQueries({ queryKey: ["employees"] }),
        queryClient.invalidateQueries({ queryKey: ["expenses"] }),
        queryClient.invalidateQueries({ queryKey: ["approvals"] }),
        queryClient.invalidateQueries({ queryKey: ["overview"] }),
        queryClient.invalidateQueries({ queryKey: ["charts"] }),
        queryClient.invalidateQueries({ queryKey: ["report"] })
      ]);
      setEditing(false);
      setErrors({});
      notify("Profile updated successfully", "success");
    },
    onError: (error) => notify(error instanceof Error ? error.message : "Profile update failed", "error")
  });

  const profileData = profile.data;
  const statCards = useMemo(
    () => [
      { label: "Total Trips", value: profileData?.total_trips ?? 0, icon: Clock3 },
      { label: "Total Expenses", value: currency(profileData?.total_expenses), icon: FileText },
      { label: "Approved Claims", value: profileData?.approved_trips ?? 0, icon: CheckCircle2 },
      { label: "Pending Claims", value: profileData?.pending_trips ?? 0, icon: ShieldCheck },
      { label: "Average Trip Cost", value: currency(profileData?.average_trip_cost), icon: FileSpreadsheet }
    ],
    [profileData]
  );

  function validateForm() {
    const nextErrors: Partial<Record<keyof ProfileForm, string>> = {};
    if (form.fullName.trim().length < 2) nextErrors.fullName = "Employee name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Valid email is required.";
    if (form.phoneNumber.trim().length < 7 || !/^[+()\d\s-]+$/.test(form.phoneNumber.trim())) {
      nextErrors.phoneNumber = "Valid phone number is required.";
    }
    if (form.department.trim().length < 2) nextErrors.department = "Department is required.";
    if (form.designation.trim().length < 2) nextErrors.designation = "Designation is required.";
    if (form.location.trim().length < 2) nextErrors.location = "Location is required.";
    if (form.costCenter.trim().length < 2) nextErrors.costCenter = "Cost center is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!validateForm()) {
      notify("Please correct the highlighted profile fields.", "error");
      return;
    }

    save.mutate({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      department: form.department.trim(),
      designation: form.designation.trim(),
      location: form.location.trim(),
      phoneNumber: form.phoneNumber.trim(),
      costCenter: form.costCenter.trim(),
      profilePictureUrl: form.profilePictureUrl,
      profilePhotoCrop: form.profilePhotoCrop,
      notificationPreferences: {
        email: form.emailNotifications,
        approvals: form.approvalNotifications,
        reports: form.reportNotifications
      },
      darkModePreference: form.darkModePreference
    });
  }

  function startEditing() {
    setEditing(true);
    setErrors({});
  }

  function openCompleteProfile() {
    window.open(`${window.location.origin}/profile`, "_blank", "noopener,noreferrer");
    notify("Complete profile opened", "success");
  }

  async function exportProfile(kind: "pdf" | "excel") {
    try {
      await downloadFile(`/api/profile/me/export/${kind}`, `andritz-profile.${kind === "pdf" ? "pdf" : "xlsx"}`);
      notify(`${kind === "pdf" ? "PDF" : "Excel"} profile export downloaded`, "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Profile export failed", "error");
    }
  }

  function uploadPhoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Upload an image file for the profile photo.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        profilePictureUrl: String(reader.result),
        profilePhotoCrop: defaultCrop
      }));
      setEditing(true);
      notify("Photo uploaded. Adjust the crop and save changes.", "success");
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setForm((current) => ({ ...current, profilePictureUrl: "", profilePhotoCrop: defaultCrop }));
    setEditing(true);
    notify("Profile photo removed. Save changes to update the database.", "info");
  }

  function applyPhotoCrop() {
    if (!form.profilePictureUrl) return;
    const image = new Image();
    if (!form.profilePictureUrl.startsWith("data:")) image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas is unavailable");
        const shortestSide = Math.min(image.naturalWidth, image.naturalHeight);
        const sourceSize = shortestSide / form.profilePhotoCrop.zoom;
        const maxX = image.naturalWidth - sourceSize;
        const maxY = image.naturalHeight - sourceSize;
        const sourceX = Math.min(Math.max(maxX / 2 + (form.profilePhotoCrop.x / 100) * maxX, 0), maxX);
        const sourceY = Math.min(Math.max(maxY / 2 + (form.profilePhotoCrop.y / 100) * maxY, 0), maxY);
        context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, 512, 512);
        setForm((current) => ({
          ...current,
          profilePictureUrl: canvas.toDataURL("image/png"),
          profilePhotoCrop: defaultCrop
        }));
        notify("Photo crop applied", "success");
      } catch {
        notify("Could not crop this image. Upload a local image and try again.", "error");
      }
    };
    image.onerror = () => notify("Could not load this photo for cropping.", "error");
    image.src = form.profilePictureUrl;
  }

  function field(
    label: string,
    key: keyof Pick<ProfileForm, "fullName" | "email" | "phoneNumber" | "department" | "designation" | "location" | "costCenter">,
    type = "text"
  ) {
    return (
      <div>
        <Label>{label}</Label>
        <Input
          disabled={save.isPending}
          type={type}
          value={String(form[key])}
          onChange={(event) => setForm({ ...form, [key]: event.target.value })}
        />
        {errors[key] ? <p className="mt-1 text-xs font-medium text-red-600">{errors[key]}</p> : null}
      </div>
    );
  }

  return (
    <form className="space-y-6 pb-20 lg:pb-0" onSubmit={submit}>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Profile & Settings</h1>
          <p className="text-sm text-slate-500">Employee record, travel activity, approvals, documents, and account controls.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={secondaryActionClass} onClick={openCompleteProfile}>
            <Eye size={16} /> View Profile
          </button>
          <button type="button" className={secondaryActionClass} onClick={() => void exportProfile("pdf")}>
            <Download size={16} /> PDF
          </button>
          <button type="button" className={secondaryActionClass} onClick={() => void exportProfile("excel")}>
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button type="button" className={secondaryActionClass} disabled={save.isPending} onPointerDown={startEditing} onClick={startEditing}>
            <UserCog size={16} /> Edit Profile
          </button>
          {editing ? (
            <button type="button" className={ghostActionClass} onClick={() => { setEditing(false); setErrors({}); void profile.refetch(); }}>
              Cancel
            </button>
          ) : null}
          <button type="submit" className={primaryActionClass} disabled={save.isPending}>
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-500">{label}</div>
                <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</div>
              </div>
              <Icon className="h-5 w-5 text-andritz-blue" />
            </div>
          </Card>
        ))}
      </div>

      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`h-11 whitespace-nowrap border-b-2 px-4 text-sm font-semibold ${
              activeTab === tab
                ? "border-andritz-blue text-andritz-blue"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" ? (
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-andritz-blue text-3xl font-bold text-white">
                {form.profilePictureUrl ? (
                  <img
                    src={form.profilePictureUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    style={{
                      objectPosition: `calc(50% + ${form.profilePhotoCrop.x}%) calc(50% + ${form.profilePhotoCrop.y}%)`,
                      transform: `scale(${form.profilePhotoCrop.zoom})`
                    }}
                  />
                ) : (
                  profileData?.full_name?.slice(0, 1)
                )}
              </div>
              <div className="min-w-0">
                <CardTitle>{profileData?.full_name ?? "Employee"}</CardTitle>
                <p className="truncate text-sm text-slate-500">{profileData?.email}</p>
                <p className="mt-1 text-xs font-semibold uppercase text-andritz-blue">{profileData?.role}</p>
              </div>
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => uploadPhoto(event.target.files?.[0])}
            />
            <div className="mt-5 flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => photoInputRef.current?.click()}>
                <Upload size={16} /> Upload Photo
              </Button>
              <Button type="button" variant="secondary" onClick={applyPhotoCrop} disabled={!form.profilePictureUrl}>
                <Camera size={16} /> Crop Photo
              </Button>
              <Button type="button" variant="danger" onClick={removePhoto} disabled={!form.profilePictureUrl}>
                <Trash2 size={16} /> Remove
              </Button>
            </div>

            {form.profilePictureUrl ? (
              <div className="mt-5 grid gap-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Zoom
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={form.profilePhotoCrop.zoom}
                    onChange={(event) =>
                      setForm({ ...form, profilePhotoCrop: { ...form.profilePhotoCrop, zoom: Number(event.target.value) } })
                    }
                    className="mt-2 w-full"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Horizontal Crop
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={form.profilePhotoCrop.x}
                    onChange={(event) =>
                      setForm({ ...form, profilePhotoCrop: { ...form.profilePhotoCrop, x: Number(event.target.value) } })
                    }
                    className="mt-2 w-full"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Vertical Crop
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={form.profilePhotoCrop.y}
                    onChange={(event) =>
                      setForm({ ...form, profilePhotoCrop: { ...form.profilePhotoCrop, y: Number(event.target.value) } })
                    }
                    className="mt-2 w-full"
                  />
                </label>
              </div>
            ) : null}
          </Card>

          <div className="space-y-6">
            <Card>
              <CardTitle>Employee Information</CardTitle>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {field("Employee Name", "fullName")}
                {field("Email", "email", "email")}
                {field("Phone Number", "phoneNumber", "tel")}
                {field("Department", "department")}
                {field("Designation", "designation")}
                {field("Location", "location")}
                {field("Cost Center", "costCenter")}
              </div>
            </Card>

            <Card>
              <CardTitle>Manager Information</CardTitle>
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                {[
                  ["Manager Name", profileData?.manager_name ?? "Unassigned"],
                  ["Manager Email", profileData?.manager_email ?? "-"],
                  ["Department Head", profileData?.department_head ?? "-"],
                  ["Cost Center", profileData?.cost_center ?? "-"]
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
                    <div className="mt-1 font-medium text-slate-900 dark:text-white">{value}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardTitle>Activity Timeline</CardTitle>
              <div className="mt-4 space-y-4">
                {(profileData?.activityTimeline ?? []).slice(0, 6).map((item, index) => (
                  <div key={`${item.type}-${item.date}-${index}`} className="flex gap-3">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-andritz-blue" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.type} | {shortDate(item.date)}</div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {activeTab === "Travel History" ? (
        <Card>
          <CardTitle>Travel History</CardTitle>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="py-3">Trip ID</th>
                  <th>Date</th>
                  <th>Purpose</th>
                  <th>Route</th>
                  <th>Expense Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(profileData?.travelHistory ?? []).map((trip) => (
                  <tr key={trip.trip_id}>
                    <td className="py-4 font-medium">{trip.trip_id}</td>
                    <td>{shortDate(trip.date)}</td>
                    <td>{trip.travel_purpose ?? "-"}</td>
                    <td>{trip.origin ?? "-"} to {trip.destination ?? "-"}</td>
                    <td>{currency(trip.expense_amount, trip.currency)}</td>
                    <td><StatusBadge status={trip.status} /></td>
                    <td>
                      <div className="flex gap-2">
                        <Button type="button" variant="secondary" className="h-8 px-3" onClick={() => setActiveTab("Overview")}>
                          <Eye size={14} /> View Profile
                        </Button>
                        <Button type="button" variant="secondary" className="h-8 px-3" onClick={() => void exportProfile("pdf")}>
                          <Download size={14} /> Export
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {activeTab === "Expense History" ? (
        <Card>
          <CardTitle>Expense History</CardTitle>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="py-3">Expense ID</th>
                  <th>Purpose</th>
                  <th>Destination</th>
                  <th>Subtotal</th>
                  <th>Taxes</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(profileData?.expenseHistory ?? []).map((expense) => (
                  <tr key={expense.id}>
                    <td className="py-4 font-medium">{expense.id}</td>
                    <td>{expense.travel_purpose}</td>
                    <td>{expense.destination ?? "-"}</td>
                    <td>{currency(expense.subtotal, expense.currency)}</td>
                    <td>{currency(expense.tax_total, expense.currency)}</td>
                    <td>{currency(expense.total_amount, expense.currency)}</td>
                    <td><StatusBadge status={expense.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {activeTab === "Approvals" ? (
        <Card>
          <CardTitle>Approval History</CardTitle>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="py-3">Expense ID</th>
                  <th>Approver</th>
                  <th>Status</th>
                  <th>Comments</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(profileData?.approvalHistory ?? []).map((approval) => (
                  <tr key={approval.id}>
                    <td className="py-4 font-medium">{approval.expense_id}</td>
                    <td>{approval.approver_name}</td>
                    <td><StatusBadge status={approval.status} /></td>
                    <td>{approval.comments ?? "-"}</td>
                    <td>{shortDate(approval.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {activeTab === "Documents" ? (
        <Card>
          <CardTitle>Documents</CardTitle>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="py-3">File Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>OCR Status</th>
                  <th>Linked Expense</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(profileData?.documents ?? []).map((document) => (
                  <tr key={document.id}>
                    <td className="py-4 font-medium">{document.file_name}</td>
                    <td>{document.file_type}</td>
                    <td>{Math.round(Number(document.file_size) / 1024)} KB</td>
                    <td>{document.ocr_status}</td>
                    <td>{document.travel_purpose ?? "-"}</td>
                    <td>{shortDate(document.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {activeTab === "Settings" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardTitle>Notification Settings</CardTitle>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["Email", "emailNotifications"],
                ["Approvals", "approvalNotifications"],
                ["Reports", "reportNotifications"],
                ["Dark Mode", "darkModePreference"]
              ].map(([label, key]) => (
                <label key={key} className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm font-medium dark:border-slate-800">
                  <input
                    type="checkbox"
                    disabled={save.isPending}
                    checked={Boolean(form[key as keyof ProfileForm])}
                    onChange={(event) => setForm({ ...form, [key]: event.target.checked })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>Security Settings</CardTitle>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Button type="button" variant="secondary" onClick={() => notify("Password change flow opened for identity provider integration.", "info")}>
                <KeyRound size={16} /> Change Password
              </Button>
              <Button type="button" variant="secondary" onClick={() => notify("OTP setting updated for the current profile session.", "success")}>
                <LockKeyhole size={16} /> {profileData?.security?.otp_enabled ? "OTP Enabled" : "Enable OTP"}
              </Button>
              <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <Monitor size={16} /> Active Sessions
                </div>
                <div className="mt-2 text-2xl font-semibold text-andritz-blue">{profileData?.security?.active_sessions ?? 0}</div>
              </div>
              <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <UserCog size={16} /> Last Login
                </div>
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {profileData?.security?.last_login_at ? new Date(profileData.security.last_login_at).toLocaleString() : "-"}
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </form>
  );
}
