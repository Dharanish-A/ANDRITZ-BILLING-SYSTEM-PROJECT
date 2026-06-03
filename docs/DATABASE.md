# Database Design

The PostgreSQL schema lives at `backend/src/database/migrations/001_initial_schema.sql`.

## Core Tables

- `users`: login identity, role, password hash, refresh/reset token hashes
- `otp_verifications`: expiring one-time email verification records
- `employees`: HR profile, department, designation, country, cost center, manager
- `expenses`: approval state, currency, subtotal, tax total, grand total
- `travel_details`: travel type, origin, destination, country, dates, booking code
- `expense_categories`: flight, hotel, taxi, train, food, insurance, visa, miscellaneous, GST, VAT, service tax
- `receipts`: uploaded receipt metadata and OCR extracted JSON
- `approval_history`: manager/finance approvals and rejections
- `audit_logs`: security and business event trail
- `reports`: generated report metadata
- `notifications`: user notification records
- `currency_conversion_history`: original currency, original amount, INR conversion, rate, provider
- `assistant_messages`: user questions, assistant answers, detected intent, metadata

## Enhancement Columns

- `employees`: location, phone number, profile picture URL, notification preferences, dark mode preference
- `receipts`: OCR confidence and validation results
- `expenses`: original currency, original amount, converted amount, exchange rate

## Query Safety

The backend uses `pg` parameterized queries throughout controllers and services. Aggregations used by dashboards and reports are grouped in controller SQL and indexed on status, employee, submitted date, approvals, and audit actor.
