## 🌟 Overview

**BALLOT** is a high-trust digital voting platform designed for universities, student bodies, residential associations, corporate boards, clubs, and governance committees.

Unlike public survey tools that accept anonymous unverified inputs or complex enterprise election software requiring rigid voter account creation, BALLOT operates on a strict yet frictionless security model:

> *"Anyone may discover or access the BALLOT portal, but casting a vote in any election is strictly restricted to the pre-accredited electorate list configured by that poll's organizer."*

Voters never need to register accounts or remember passwords. They simply enter their accredited email, receive a one-time verification code (OTP) via Gmail SMTP, and cast an anonymous ballot with atomic double-vote prevention.


# 🗳️ BALLOT — Secure Online Voting & Poll Management Platform

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://ballot-1syt.onrender.com)
[![React](https://img.shields.io/badge/React%2018-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![WebSockets](https://img.shields.io/badge/Real--time-Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **A modern, eligibility-based polling and election system featuring passwordless email OTP verification, cryptographic secret ballot privacy, atomic double-vote prevention, reusable voter groups, and real-time WebSocket tallies.**

🔗 **Live Deployment**: [https://ballot-1syt.onrender.com](https://ballot-1syt.onrender.com)

---
## 🛠️ Tech Stack

### Frontend Client
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Real-time Client**: [Socket.io Client](https://socket.io/docs/v4/client-api/)

### Backend Server
- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Server Framework**: [Express 5](https://expressjs.com/)
- **Database & ODM**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/) (with automatic `mongodb-memory-server` local fallback)
- **WebSockets**: [Socket.io](https://socket.io/)
- **Security & Tokens**: `bcryptjs`, `jsonwebtoken` (JWT), `express-rate-limit`
- **Mail Dispatch**: [Nodemailer](https://nodemailer.com/) (Gmail SMTP with local console fallback)

---

## 📂 Project Structure

```
Ballot/
├── ballot/                      # React 18 + Vite Frontend Application
│   ├── public/                  # Static assets & icons
│   ├── src/
│   │   ├── components/          # Reusable UI components & layouts (AppLayout, MarketingLayout)
│   │   ├── context/             # Authentication & global application state
│   │   ├── pages/               # Views (Landing, VotingPage, CreatePoll, Dashboard, Results, Admin)
│   │   ├── services/            # Axios API clients & Socket.io service
│   │   ├── index.css            # Tailwind directives & design system tokens
│   │   └── main.jsx             # React entry point & routing configuration
│   ├── package.json             # Frontend dependencies & build scripts
│   ├── tailwind.config.js       # Tailwind design tokens & font configuration
│   └── vite.config.js           # Vite dev server & proxy settings
│
├── server/                      # Express 5 REST API & WebSocket Backend
│   ├── config/                  # DB connection (Atlas / Memory) & Super Admin initialization
│   ├── controllers/             # Business logic (auth, voter, poll, group, admin)
│   ├── middleware/              # JWT authorization, rate limiters, error handlers
│   ├── models/                  # Mongoose models (User, Poll, VotingAuthorization, Ballot, AuditEvent)
│   ├── routes/                  # API routes (/api/auth, /api/polls, /api/voter, /api/admin, etc.)
│   ├── services/                # Nodemailer Gmail SMTP & email template generator
│   ├── package.json             # Backend dependencies & startup scripts
│   └── server.js                # Express & Socket.io server bootstrap + static client serving
│
├── package.json                 # Unified monorepo orchestration (Render build & start scripts)
└── README.md                    # Project documentation
```