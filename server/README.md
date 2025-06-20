# Collaborative Real-Time Notes App (Backend)

Backend for a Google Keep-style collaborative note-taking app with real-time editing, sharing, and live presence indicators.

## Features

- REST API for notes and authentication
- JWT authentication (access + refresh tokens)
- Session storage (Redis or in-memory)
- Real-time collaboration with Socket.IO
- Modular controller-service-repository structure
- Input validation with Joi
- Mongoose + MongoDB for data storage
- Logging with Winston

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- Redis (optional, for sessions)
- Joi (validation)
- Jest (testing)

## Getting Started

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Set up environment variables

Create a `.env` file in the `server` directory with:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/notes-app
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379 # (optional)
```

### 3. Start the backend server

```bash
npm run dev
```

The server runs at [http://localhost:5000](http://localhost:5000) by default.

## API Endpoints

- `POST   /api/auth/signup` – Create user
- `POST   /api/auth/login` – Authenticate user, return JWT
- `GET    /api/notes` – Get user notes
- `POST   /api/notes` – Create a new note
- `PUT    /api/notes/:id` – Update a note
- `DELETE /api/notes/:id` – Delete a note
- `POST   /api/notes/:id/collaborators` – Share note with user
- `GET    /api/notes/:id/collaborators` – List collaborators

## Real-Time Collaboration

- Socket.IO events for live note updates and typing indicators.
- All changes are broadcast to connected clients in the same note room.

## Running Tests

```bash
npm test
```

## Connecting with the Frontend

- Make sure the frontend is running (see `../client/README.md`).
- CORS and cookies are enabled for local development.

## Credits

- Built with Node.js, Express, MongoDB, Socket.IO, and Redis.
