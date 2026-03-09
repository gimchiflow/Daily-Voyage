# My Voyage — Daily Planner

A full-stack daily planner app with web and native mobile support.

## Structure

```
Daily-Voyage/
├── backend/    Express API (Node.js + SQLite + JWT auth)
├── web/        React + Vite web app
└── mobile/     Expo React Native app (iOS & Android)
```

## Getting Started

### Backend
```bash
cd backend
npm install
node server.js
# Runs on http://localhost:4000
```

### Web
```bash
cd web
npm install
npm run dev
# Runs on http://localhost:5173
```

### Mobile
```bash
cd mobile
npm install
npx expo start
# Scan QR with Expo Go app
```

> **Note:** For physical device testing, update `mobile/src/api.js` — replace `localhost` with your server's local IP.
