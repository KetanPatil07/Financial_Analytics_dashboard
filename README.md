# Financial Analytics Dashboard (Penta)

Full-stack dashboard for searching, filtering, visualizing, and exporting the 300-row `transactions.json` dataset.

## Stack

- **Frontend:** React + Vite + Recharts
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **Auth:** JWT + bcrypt

## Features

- Login / register with protected APIs
- KPI cards: Balance, Revenue, Expenses, Savings
- Monthly income vs expenses chart
- Recent transfers
- Paginated transaction table with search, date range, category, status, user, and sort
- CSV / Excel export with selectable columns
- Analytics: paid vs pending and category × status breakdown

## Setup

1. Put your real Atlas password into `backend/.env` by replacing `<db_password>` in `MONGO_URI`.
2. Install and seed:

```bash
npm install
npm run install:all
npm run seed
npm run dev
```

- App: http://localhost:5173
- API: http://localhost:5000

Demo login: `admin@penta.com` / `Admin@123`

## API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | no | Create account |
| POST | `/api/auth/login` | no | Login |
| GET | `/api/auth/profile` | yes | Current user |
| GET | `/api/transactions` | yes | Filter, sort, paginate |
| GET | `/api/transactions/stats` | yes | Dashboard KPIs and charts |
| GET | `/api/transactions/recent` | yes | Latest transfers |
| GET | `/api/transactions/filters` | yes | Filter options |
| GET | `/api/transactions/export` | yes | CSV |
| GET | `/api/transactions/export/excel` | yes | Excel |
