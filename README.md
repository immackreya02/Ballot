# 🗳️ BALLOT — Secure Online Voting & Poll Management System

> **A general-purpose, eligibility-based polling platform featuring passwordless email OTP verification, secret ballot privacy, atomic double-vote prevention, and real-time Socket.io tallies.**

---

## 🌟 Overview

**BALLOT** is a high-trust civic polling system built for organizations, associations, clubs, residential communities, faculty groups, and committees. 

Unlike open public survey tools or generic election software, BALLOT operates on a strict security principle:
> *"Anyone may discover or access the BALLOT portal, but voting in a restricted poll is allowed strictly to the accredited electorate defined by that poll's organizer."*

---

## 🔒 Core Security & System Architecture

BALLOT implements industry-standard cryptographic and database controls to guarantee election integrity:

### 1. Secret Ballot Privacy (Identity-Vote Decoupling)
- Voter authorizations (`VotingAuthorization` / electorate emails) and cast ballots (`Ballots`) are stored in **two completely decoupled database collections**.
- No database index, foreign key, or tracking token links a voter's email to their specific candidate selection.

### 2. Atomic Concurrency Lock (Zero Duplicate Votes)
- State transitions enforce one-person-one-vote using MongoDB atomic conditions:
  ```javascript
  VotingAuthorization.findOneAndUpdate(
    { pollId, voterEmail, isUsed: false },
    { $set: { isUsed: true } }
  )
  ```
- Parallel concurrent requests from the same user result in **exactly 1 accepted vote**, rejecting duplicates with `HTTP 409 Conflict`.

### 3. Locked Electorate & Passwordless Email OTP
- Once an organizer publishes a poll, the electorate list is permanently locked.
- Voters authenticate via **6-digit time-limited OTP codes** sent to their authorized email (No passwords or account creation needed for voters).

### 4. Real-Time Result Synchronization
- Live vote tallies update in real time via **Socket.io WebSockets**, respecting the organizer's visibility settings (`LIVE`, `AFTER_VOTE`, or `AFTER_CLOSE`).

### 5. Verifiable Audit Trail
- System state changes (`POLL_CREATED`, `ELECTORATE_LOCKED`, `POLL_PUBLISHED`, `OTP_VERIFIED`, `VOTE_ACCEPTED`, `POLL_CLOSED`) create immutable, time-stamped `AuditEvent` logs.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons, React Router v6, Socket.io-client
- **Backend**: Node.js, Express.js 5, Socket.io
- **Database**: MongoDB & Mongoose (with `mongodb-memory-server` zero-setup fallback)
- **Authentication**: JWT (JSON Web Tokens), Bcryptjs, Email OTP
- **Email Dispatch**: Nodemailer (SMTP with Development Terminal Fallback)

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Optional: System falls back to MongoMemoryServer automatically if local MongoDB is not running)

### 2. Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/your-username/ballot-voting-system.git
cd ballot-voting-system

# Install server dependencies
cd server
npm install

# Install frontend dependencies
cd ../ballot
npm install
```

### 3. Configure Environment Variables

Create `.env` inside the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ballot_db
JWT_SECRET=your_secure_random_jwt_secret_key_2026
NODE_ENV=development
OTP_EXPIRY_MINUTES=5
```

---

## 🖥️ Running the Application

### Option A: Run Both Frontend & Backend Simultaneously (Root)

From the root directory, run:

```bash
npx -y concurrently "npm start --prefix server" "npm run dev --prefix ballot"
```

### Option B: Run Separately in Two Terminal Windows

**Terminal 1 (Backend Server)**:
```bash
cd server
npm run dev
# Express API running on http://localhost:5000
```

**Terminal 2 (Frontend Client)**:
```bash
cd ballot
npm run dev
# Vite React App running on http://localhost:5173
```

---

## 🎯 Demo & Database Commands

The repository includes pre-built seeder scripts for live presentation and testing.

### 1. Seed Presentation Demo Scenario

```bash
cd server
npm run seed:demo
```
Creates a pristine demo scenario with preloaded data:
- **Organizer Credentials**: `demo.organizer@ballot.org` / `DemoOrganizer2026!`
- **Demo Poll**: *"Community Event Venue"* (Poll Code: `BLT-2026`)
- **Unvoted Test Voter**: `jordan.lee@community.org` (Ready for live OTP voting demo)

### 2. Full Database Reset Command

```bash
cd server
npm run db:reset
```
Wipes all MongoDB collections clean and re-seeds the clean presentation demo environment in 1 second.

---

## 📑 System Roles & Workspaces

| Role | Access Level | Workspaces |
| :--- | :--- | :--- |
| **Voter** | Passwordless (Email OTP) | Public Homepage (`/`), Voter Portal (`/vote`), Live Results (`/results/:id`) |
| **Poll Organizer** | Email + Password (JWT) | Poll Creation (`/app/polls/create`), Voter Groups (`/app/voter-groups`), Electorate Lock, Poll Management & Audit Logs (`/app/audit-logs`) |
| **System Administrator** | Email + Password (JWT Admin) | Admin Dashboard (`/app/admin`), User Management (`/app/admin/users`), Global Poll Oversight (`/app/admin/polls`) |

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
