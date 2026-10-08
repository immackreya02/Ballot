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

## 📑 System Roles & Workspaces

| Role | Access Level | Workspaces |
| :--- | :--- | :--- |
| **Voter** | Passwordless (Email OTP) | Public Homepage (`/`), Voter Portal (`/vote`), Live Results (`/results/:id`) |
| **Poll Organizer** | Email + Password (JWT) | Poll Creation (`/app/polls/create`), Voter Groups (`/app/voter-groups`), Electorate Lock, Poll Management & Audit Logs (`/app/audit-logs`) |
| **System Administrator** | Email + Password (JWT Admin) | Admin Dashboard (`/app/admin`), User Management (`/app/admin/users`), Global Poll Oversight (`/app/admin/polls`) |

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
