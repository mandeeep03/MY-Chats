# Chat App

A real-time chat application built with the MERN stack, Socket.io, and Tailwind CSS.

## What's in here

- Real-time messaging with Socket.io
- JWT authentication with refresh on reconnect
- Direct messages and group chats
- Typing indicators
- Online/offline presence
- Edit and delete messages (reflected live for all users in the room)
- Message pagination (load older messages)
- User search
- Rate limiting, helmet security headers, input validation
- Winston logging with file output
- Graceful shutdown handling

## Project layout

```
chat-app/
  server/         Express + Socket.io backend
  client/         React + Vite + Tailwind frontend
```

## Getting started

### 1. Clone and install

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Set up environment variables

Copy the example file and fill it in:

```bash
cd server
cp .env.example .env
```

You need:
- A running MongoDB instance (local or Atlas)
- A JWT secret — just make it something long and random

### 3. Run both servers

In two separate terminals:

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

The API runs on port 5000 and the frontend on port 5173. Vite proxies `/api` requests to the backend so you don't have to worry about CORS in dev.

## API overview

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in |
| GET | /api/auth/me | Get current user |
| PATCH | /api/auth/profile | Update bio / avatar |
| PATCH | /api/auth/password | Change password |
| GET | /api/rooms | Get your rooms |
| POST | /api/rooms/direct | Start a direct message |
| POST | /api/rooms/group | Create a group |
| GET | /api/rooms/:id | Get room details |
| POST | /api/rooms/:id/members | Add member to group |
| DELETE | /api/rooms/:id/leave | Leave a group |
| GET | /api/rooms/:id/messages | Get messages (paginated) |
| POST | /api/rooms/:id/messages | Send a message |
| PATCH | /api/rooms/:id/messages/:msgId | Edit a message |
| DELETE | /api/rooms/:id/messages/:msgId | Delete a message |
| GET | /api/rooms/:id/messages/search | Search messages |
| GET | /api/users/search | Search users |
| GET | /api/users/:id | Get user profile |

## Socket events

The client sends:

- `message:send` — send a message to a room
- `message:edit` — edit your message
- `message:delete` — delete your message
- `typing:start` / `typing:stop` — typing indicator
- `room:join` — join a room socket channel
- `room:read` — mark room as read

The server emits:

- `message:new` — new message in a room
- `message:edited` — a message was edited
- `message:deleted` — a message was deleted
- `typing:update` — someone started or stopped typing
- `user:online` — a user came online or went offline
- `room:read_update` — someone read the messages

## Tech choices worth noting

The backend uses `express-validator` for all input validation so nothing dirty ever reaches the database. Rate limiting is split — auth routes get a stricter limiter (10 req/15min) than the rest (200 req/15min). Mongoose middleware handles password hashing before save and populates sender info automatically on message queries. Socket.io uses JWT auth in the handshake so the same token flow works for both HTTP and WebSocket.
