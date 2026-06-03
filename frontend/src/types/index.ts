export type Role = "EMPLOYEE" | "MANAGER" | "FINANCE" | "ADMIN";
export type Status = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export type User = {
  id: string;
  email: string;
  role: Role;
  full_name?: string;
  employee_id?: string;
  employee_code?: string;
  department?: string;
};

export type DashboardOverview = {
  total_trips: number;
  pending_trips: number;
  approved_trips: number;
  rejected_trips: number;
  monthly_expenses: string;
};

export type ChartPoint = {
  label: string;
  value: string;
};

export type OcrValidation = {
  label: string;
  status: "success" | "warning" | "danger";
  message: string;
};

export type ExtractedReceipt = {
  sellerName?: string;
  sellerAddress?: string;
  gstNumber?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  bookingCode?: string;
  travelDates?: string;
  taxAmount?: number;
  totalAmount?: number;
  currency?: string;
  confidence?: number;
  validations?: OcrValidation[];
};

export type Expense = {
  id: string;
  full_name: string;
  employee_code: string;
  department: string;
  status: Status;
  currency: string;
  travel_purpose: string;
  subtotal: string;
  tax_total: string;
  total_amount: string;
  original_currency?: string;
  original_amount?: string;
  converted_amount?: string;
  exchange_rate?: string;
  submitted_at: string;
  travel?: {
    origin?: string;
    destination?: string;
    travel_type?: string;
    country?: string;
    start_date?: string;
    end_date?: string;
    booking_code?: string;
  };
  categories?: {
    flight_cost?: string;
    hotel_cost?: string;
    taxi_cost?: string;
    train_cost?: string;
    food_cost?: string;
    insurance_cost?: string;
    visa_cost?: string;
    miscellaneous_cost?: string;
    gst?: string;
    vat?: string;
    service_tax?: string;
  };
  receipts?: Array<{ id: string; file_name: string; storage_url?: string }>;
  approval_id?: string;
  approval_status?: Status;
  approval_comments?: string;
};

export type Employee = {
  id: string;
  employee_code: string;
  full_name: string;
  department: string;
  designation: string;
  country: string;
  cost_center?: string;
  manager_name?: string;
  manager_email?: string;
  department_head?: string;
  location?: string;
  phone_number?: string;
  profile_picture_url?: string;
  profile_photo_crop?: {
    zoom: number;
    x: number;
    y: number;
  };
  notification_preferences?: {
    email: boolean;
    approvals: boolean;
    reports: boolean;
  };
  dark_mode_preference?: boolean;
};

export type ProfileSummary = Employee & {
  user_id: string;
  email: string;
  role: Role;
  last_login_at?: string;
  is_email_verified?: boolean;
  total_trips: number;
  approved_trips: number;
  pending_trips: number;
  rejected_trips: number;
  total_expenses: string;
  monthly_expenses: string;
  yearly_expenses: string;
  average_trip_cost: string;
  travelHistory: Array<{
    trip_id: string;
    date: string;
    destination: string;
    expense_amount: string;
    currency: string;
    status: Status;
    travel_purpose?: string;
    origin?: string;
    start_date?: string;
    end_date?: string;
    travel_type?: string;
  }>;
  expenseHistory: Array<{
    id: string;
    travel_purpose: string;
    status: Status;
    currency: string;
    subtotal: string;
    tax_total: string;
    total_amount: string;
    submitted_at: string;
    reviewed_at?: string;
    destination?: string;
  }>;
  approvalHistory: Array<{
    id: string;
    expense_id: string;
    approver_name: string;
    status: Status;
    comments?: string;
    created_at: string;
  }>;
  documents: Array<{
    id: string;
    file_name: string;
    file_type: string;
    file_size: number | string;
    ocr_status: string;
    created_at: string;
    storage_url?: string;
    travel_purpose?: string;
  }>;
  activityTimeline: Array<{
    type: string;
    title: string;
    date: string;
    description: string;
  }>;
  security: {
    otp_enabled: boolean;
    active_sessions: number;
    last_login_at?: string;
    login_history: Array<{
      action: string;
      created_at: string;
      ip_address?: string;
      user_agent?: string;
    }>;
  };
};

export type CurrencyConversion = {
  originalAmount: number;
  originalCurrency: string;
  baseCurrency: "INR";
  convertedAmount: number;
  exchangeRate: number;
  provider: string;
};
