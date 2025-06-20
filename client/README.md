# Collaborative Real-Time Notes App (Frontend)

A Google Keep-style collaborative note-taking app with real-time editing, sharing, and live presence indicators.

## Features

- User authentication (sign up, login, logout)
- Dashboard: view all your notes (grid/list toggle, infinite scroll)
- Create, edit, and delete notes
- Real-time collaboration: see edits and typing indicators live
- Share notes with other users by email
- Responsive, modern UI (TailwindCSS + MUI)
- Global success/error notifications
- Dark mode toggle
- Auto-save notes (debounced and timer-based)

## Tech Stack

- React + TypeScript
- Redux Toolkit (for global state)
- React Query (for API calls)
- React Router DOM (routing)
- TailwindCSS + MUI (styling)
- Socket.IO (real-time updates)
- Vite (build tool)

## Getting Started

### 1. Install dependencies

```bash
cd client
npm install
```

### 2. Start the development server

```bash
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000) by default.

### 3. Connect to the backend

- Make sure the backend server is running (see `../server/README.md`).
- By default, the frontend expects the backend at `http://localhost:5000`.
- You can change API URLs in the code if needed.

## Usage

- Register a new account or log in.
- Create, edit, and share notes in real time.
- See who is editing a note live.
- Use the logout button in the header to sign out.

## Running Tests

```bash
npm test
```

## Backend/API

See [`../server/README.md`](../server/README.md) for backend setup, API endpoints, and environment variables.

## Credits

- Built with React, TypeScript, TailwindCSS, MUI, and Socket.IO.
- Starter template: Vite + React
