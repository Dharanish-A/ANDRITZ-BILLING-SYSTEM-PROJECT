# API Reference

All mutating requests require a CSRF token from `GET /api/csrf-token` sent as `X-CSRF-Token`. Protected routes require `Authorization: Bearer <accessToken>`.

## Authentication

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create user and optional employee profile |
| POST | `/api/auth/login` | Password login and JWT issuance |
| POST | `/api/auth/send-otp` | Generate and email OTP |
| POST | `/api/auth/verify-otp` | Verify OTP and issue JWT |
| POST | `/api/auth/logout` | Clear refresh session |
| POST | `/api/auth/forgot-password` | Send reset token |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/profile` | Current user profile |

## Expense Workflow

| Method | Path | Role |
| --- | --- | --- |
| POST | `/api/expenses` | Employee, Manager, Finance, Admin |
| GET | `/api/expenses` | Authenticated users |
| GET | `/api/expenses/:id` | Authenticated users |
| PUT | `/api/expenses/:id` | Employee, Manager, Finance, Admin |
| DELETE | `/api/expenses/:id` | Employee, Manager, Finance, Admin |
| POST | `/api/receipts/upload` | Authenticated users |
| POST | `/api/approvals/approve` | Manager, Finance, Admin |
| POST | `/api/approvals/reject` | Manager, Finance, Admin |
| GET | `/api/approvals/pending` | Manager, Finance, Admin |

## Reporting

| Method | Path |
| --- | --- |
| GET | `/api/reports/monthly` |
| GET | `/api/reports/employee` |
| GET | `/api/reports/department` |
| GET | `/api/reports/country` |
| GET | `/api/reports/cost-center` |
| GET | `/api/export/excel` |
| GET | `/api/export/pdf` |
| GET | `/api/dashboard/overview` |
| GET | `/api/dashboard/charts` |
| GET | `/api/dashboard/categories` |

## Currency

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/currency` | List supported currencies |
| POST | `/api/currency/convert` | Convert original amount to INR |
| GET | `/api/currency/history` | Recent conversion history |

## Profile

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/profile/me` | Employee profile, summaries, travel history |
| PUT | `/api/profile/me` | Update employee profile and preferences |

## Assistant

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/assistant/chat` | Natural-language expense assistant |
