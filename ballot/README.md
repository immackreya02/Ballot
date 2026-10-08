# BALLOT — Secure Online Voting & Poll Management System

A production-style React/Vite frontend prototype based on the supplied BALLOT PDF visual reference.

## IMPORTANT: Run it this way

1. Install Node.js 18+ (Node.js 20 LTS is recommended).
2. Extract this ZIP completely.
3. Open the extracted folder in VS Code.
4. Open a terminal in that folder.
5. Run:

```bash
npm install
npm run dev
```

6. Open the `http://localhost:5173` address printed by Vite.

### Windows shortcut
Double-click `START.bat`.

### Do NOT use Live Server
This is a Vite application. Do not run `index.html` through VS Code Live Server.

## If you double-click index.html
The root `index.html` contains a self-contained BALLOT preview/fallback so it will still show a designed landing screen. For the full React application, use Vite as described above.

## Routes included

Marketing: `/`, `/how-it-works`, `/transparency`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`

Voting: `/vote/:id`, `/vote-confirmation/:id`, `/already-voted/:id`, `/closed-poll/:id`, `/results/:id`, `/results/:id/closed`

Application: `/dashboard`, `/polls`, `/active`, `/drafts`, `/create`, `/edit/:id`, `/preview/:id`, `/publish-confirmation`, `/share/:id`, `/poll/:id`, `/manage/:id`

Archive: `/archive`, `/archive/search`, `/archive/filtered`, `/archive/empty`, `/archive/:id`

Account: `/profile`, `/settings`, `/settings/security`, `/settings/notifications`, `/settings/privacy`

System states: `/state/loading`, `/state/skeleton`, `/state/error`, `/state/network`, `/state/unauthorized`, `/state/forbidden`, `/state/validation`, `/state/unsaved`, `/not-found`

## Stack

- React 18
- Vite 5
- React Router 6
- Tailwind CSS 3
- Recharts
- Socket.io-client
- JavaScript / JSX

The UI uses the supplied BALLOT palette and editorial/civic visual language. Mock data is intentionally kept in `src/data/polls.js` so it can later be replaced with Express/MongoDB REST API responses and Socket.io events.
