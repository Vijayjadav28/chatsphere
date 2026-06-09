# 💬 ChatSphere — Real-time Chat Application

A full-stack real-time chat app built with **Java Spring Boot** + **React**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2, Spring WebSocket (STOMP), Spring Security, JWT |
| Database | MySQL 8 |
| Frontend | React 18, Vite, Axios, STOMP.js, SockJS |

## Features

- ✅ JWT Authentication (Register / Login)
- ✅ Real-time 1-to-1 messaging via WebSocket
- ✅ Chat history stored in MySQL
- ✅ Online / Offline status indicators
- ✅ Typing indicators ("User is typing…")
- ✅ Read receipts (✓ sent, ✓✓ seen)
- ✅ User search
- ✅ Premium dark-mode UI with animations

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8 running on localhost:3306

### 1. Database Setup

MySQL will auto-create the `chatsphere` database on first run (via `createDatabaseIfNotExist=true`).

If you want to create it manually:
```sql
CREATE DATABASE chatsphere;
```

### 2. Start the Backend

```powershell
cd backend
mvn spring-boot:run
```

Backend starts on **http://localhost:8080**

### 3. Start the Frontend

```powershell
cd frontend
npm run dev
```

Frontend starts on **http://localhost:5173**

---

## Project Structure

```
chatApplication/
├── backend/
│   └── src/main/java/com/chatsphere/
│       ├── config/          ← WebSocket, Security, Event Listener
│       ├── controller/      ← Auth, User, Chat (REST + WebSocket)
│       ├── dto/             ← Data Transfer Objects
│       ├── model/           ← User, Message entities
│       ├── repository/      ← JPA repositories
│       ├── security/        ← JWT util, filter, UserDetailsService
│       └── service/         ← Auth, User, Message services
└── frontend/
    └── src/
        ├── api/             ← Axios API functions
        ├── components/      ← Auth, Sidebar, Chat UI components
        ├── context/         ← Auth & Chat React contexts
        ├── hooks/           ← useWebSocket hook
        └── pages/           ← Login, Register, Chat pages
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login, get JWT |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/users` | JWT | All users |
| GET | `/api/users/search?q=` | JWT | Search users |
| GET | `/api/messages/{userId}` | JWT | Chat history |
| WS | `/ws` | JWT | WebSocket endpoint |

## WebSocket Topics

| Direction | Destination | Purpose |
|-----------|------------|---------|
| Send | `/app/chat` | Send message |
| Send | `/app/typing` | Typing indicator |
| Send | `/app/read` | Mark as read |
| Receive | `/user/queue/messages` | New messages |
| Receive | `/user/queue/typing` | Typing events |
| Receive | `/user/queue/read` | Read receipts |
| Receive | `/topic/status` | Online/offline status |
