# Bank Deposit Management Dashboard

Modern full-stack web application for tracking bank-wise account holders and deposit records with live totals, search, filters, PDF exports, pagination, and responsive glassmorphism UI.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS v4, Zustand, React Router, React Icons, jsPDF
- Backend: Node.js, Express.js, Mongoose
- Database: MongoDB

## Project Structure

```text
Deposit/
  client/
    src/
      api/
      components/ui/
      pages/
      store/
      utils/
      App.jsx
      main.jsx
      index.css
    .env.example
  server/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
      app.js
      server.js
    .env.example
  README.md
```

## Features Implemented

- Dashboard with:
  - Total Banks
  - Total Account Holders
  - Total Deposited Amount
  - Bank cards with totals
  - Bank search and pagination
  - Add/Delete bank
  - Dashboard PDF export
- Bank Details with:
  - Bank summary cards
  - Holder search and pagination
  - Add/Delete account holder
  - Bank PDF export
- Account Holder Details with:
  - Holder info + stats cards
  - Deposit table sorted newest first
  - Search deposits by date/amount
  - Date filters: Today, This Week, This Month, Custom
  - Add/Delete deposits
  - Holder PDF export
- UX:
  - Confirmation before delete
  - Toast notifications
  - Loading states
  - Empty states
  - Responsive layout/table
  - INR currency formatting
  - Glassmorphism theme with animation

## Database Models

### Bank

- _id
- bankName
- createdAt
- updatedAt

### AccountHolder

- _id
- bankId
- name
- phoneNumber
- createdAt
- updatedAt

### Deposit

- _id
- holderId
- depositDate
- amount
- createdAt
- updatedAt

## API Endpoints

### Dashboard

- GET /api/dashboard?search=&page=&limit=

### Banks

- POST /api/banks
- DELETE /api/banks/:bankId
- GET /api/banks/:bankId?search=&page=&limit=
- POST /api/banks/:bankId/holders

### Holders and Deposits

- GET /api/holders/:holderId?search=&range=&startDate=&endDate=&page=&limit=
- POST /api/holders/:holderId/deposits
- DELETE /api/holders/:holderId
- DELETE /api/holders/deposits/:depositId

## Setup Instructions

## 1) Prerequisites

- Node.js 18+
- MongoDB (local or cloud URI)

## 2) Backend Setup

```bash
cd server
cp .env.example .env
```

Edit .env and set:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bank_deposit_dashboard
CLIENT_ORIGIN=http://localhost:5173
DNS_SERVERS=1.1.1.1,8.8.8.8
```

Install and run backend:

```bash
npm install
npm run dev
```

## 3) Frontend Setup

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Optional frontend env:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 4) Production Build

Frontend:

```bash
cd client
npm run build
npm run preview
```

Backend:

```bash
cd server
npm start
```

## Deploying on Vercel

This repository is configured for a single Vercel project.

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Set the following environment variable in Vercel:

```env
MONGO_URI=your-mongodb-connection-string
```

4. Leave `CLIENT_ORIGIN` unset unless you need a custom cross-origin domain.
5. Set the project root to the repository root, not `client/`.
6. Deploy with the repository root as the project root.

Vercel will:

- build the React client from `client/`
- expose the Express API through `/api/index.js`
- serve the SPA from the Vite production output

## Notes

- Totals refresh after create/delete actions by refetching relevant datasets.
- Search and filters are API-backed.
- PDF exports are generated in-browser via jsPDF.
