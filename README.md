# 🏦 Kodbank — Full Stack Fintech App

A premium dark fintech banking app with JWT authentication, Supabase PostgreSQL, and highly animated UI.

## 🚀 Quick Start (Any Machine)

### 1. Clone & Install

```bash
git clone https://github.com/anandpatil5115-droid/kodbankapp.git
cd kodbankapp
npm install
cd server && npm install && cd ..
```

### 2. Set Up Environment Variables

Create `server/.env`:
```
DATABASE_URL=your_supabase_postgresql_url
JWT_SECRET=your_jwt_secret
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Run (One Command)

```bash
npm run dev
```

This starts **both** the frontend (Vite) and backend (Express) together.

- Frontend → http://localhost:5173
- Backend  → http://localhost:3001

---

## 🌐 Production (Vercel)

Deploy to Vercel with env vars:
- `DATABASE_URL`
- `JWT_SECRET`

The `/api` folder runs as Vercel serverless functions — no separate backend needed.

---

## Tech Stack
- **Frontend**: React, Vite, Framer Motion, canvas-confetti
- **Backend**: Node.js, Express (dev) / Vercel Serverless (prod)
- **Database**: Supabase PostgreSQL
- **Auth**: JWT + bcrypt + httpOnly cookies
