# ANDRITZ Travel Expense & Billing Management System

Production-oriented enterprise travel expense application for employees, managers, finance teams, and administrators.

## What Is Included

- React 19, TypeScript, Tailwind CSS, ShadCN-style local UI components, Framer Motion, React Query, React Router
- Node.js, Express.js, TypeScript REST API
- PostgreSQL schema and migration runner
- JWT access tokens, refresh-token cookies, OTP email verification, bcrypt password hashing
- Role-based access control for Employee, Manager, Finance, and Admin
- Receipt upload with local/S3-ready storage abstraction
- Receipt preview with PDF/image rendering, zoom, fullscreen, download, and removal controls
- OCR extraction and AI validation abstraction with confidence scoring and provider hooks for Google Vision, AWS Textract, or Azure Form Recognizer
- Expense submission, automatic totals, approval workflow, audit logs
- Dashboard analytics with monthly, department, country, and expense-category breakdown charts
- Currency conversion prepared for INR base currency with INR, USD, EUR, GBP, AED, SGD, and JPY
- Employee profile page with preferences and travel history
- Floating Enterprise Copilot assistant for natural-language expense questions
- Reports, Excel export via ExcelJS, PDF export via PDFKit
- Docker Compose for PostgreSQL, backend, and frontend

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

In another terminal, start PostgreSQL with Docker and run migrations:

```bash
docker compose up -d postgres
npm run migrate --workspace backend
psql "$DATABASE_URL" -f backend/src/database/seeders/001_demo.sql
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000/api/health

Demo users use `Password123!`:

- `exampleemployee@andritz.example`
- `manager@andritz.example`
- `finance@andritz.example`
- `admin@andritz.example`

## Docker

```bash
cp .env.example .env
docker compose up --build
```

The PostgreSQL container automatically applies files in `backend/src/database/migrations`.

## Security Controls

- JWT access token authorization with refresh token rotation-ready storage
- HTTP-only refresh token cookie
- bcrypt password hashing
- OTP generation and verification table with expiry and one-time consumption
- RBAC middleware by route family
- Helmet headers, CORS allowlist, rate limiting, CSRF protection
- Parameterized PostgreSQL queries
- Audit logs for authentication, expenses, receipts, employees, and approvals
- HTTPS-ready cookie and proxy configuration

## Key API Groups

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/profile`
- `/api/employees`
- `/api/expenses`
- `/api/receipts/upload`
- `/api/approvals/approve`
- `/api/approvals/reject`
- `/api/approvals/pending`
- `/api/reports/monthly`
- `/api/reports/employee`
- `/api/reports/department`
- `/api/reports/country`
- `/api/reports/cost-center`
- `/api/export/excel`
- `/api/export/pdf`
- `/api/dashboard/overview`
- `/api/dashboard/charts`
- `/api/dashboard/categories`
- `/api/currency`
- `/api/currency/convert`
- `/api/currency/history`
- `/api/profile/me`
- `/api/assistant/chat`

## OCR And Email Providers

The default `.env.example` uses:

- `OCR_PROVIDER=mock`
- `EMAIL_PROVIDER=nodemailer`
- local storage for receipt files

For production, wire provider-specific implementation inside:

- `backend/src/services/ocrService.ts`
- `backend/src/services/emailService.ts`
- `backend/src/services/storageService.ts`

The interfaces are already isolated so Google Vision, AWS Textract, Azure Form Recognizer, SendGrid, AWS SES, S3, or Supabase Storage can be added without changing controllers.

## Local Demo Mode

If the backend is not running, the frontend falls back to local demo data so UI work can continue. Demo login still works with:

- `admin@andritz.example`
- `Password123!`

OTP demo mode accepts `123456`.

## Project Structure

```text
frontend/
  src/components/
  src/pages/
  src/layouts/
  src/hooks/
  src/services/
  src/api/
  src/utils/
  src/styles/
backend/
  src/controllers/
  src/routes/
  src/middlewares/
  src/services/
  src/models/
  src/config/
  src/database/migrations/
  src/database/seeders/
shared/
docs/
```

## Production Checklist

- Replace all JWT secrets with high-entropy values.
- Use HTTPS and set `NODE_ENV=production`.
- Configure SMTP, SendGrid, or AWS SES.
- Configure S3 or Supabase Storage.
- Replace mock OCR with a production OCR provider.
- Run database migrations through your release pipeline.
- Add observability, backups, and CI/CD secret management.
