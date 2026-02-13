# QuickTask - Personal Task Management Application

A full-stack task management app built with the MERN stack and a Python analytics microservice.

![Tech Stack](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)

## Overview

QuickTask helps users manage their daily tasks with:
- **Secure Authentication** — Register/login with JWT stored in HTTP-only cookies
- **Full Task CRUD** — Create, read, update, and delete tasks
- **Filtering & Search** — Filter by status/priority, search by title, sort by date/priority
- **Dashboard Analytics** — Visual charts for task distribution and completion rates
- **Python Microservice** — Separate analytics service for productivity trends

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite), Chart.js, React Router, Axios |
| Backend | Node.js, Express.js, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT (HTTP-only cookies) |
| Analytics | Python, FastAPI, PyMongo |
| Styling | Custom CSS (dark theme) |

## Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.9
- **MongoDB** (Atlas cloud or local)

## Project Structure

```
QuickTask/
├── backend/             # Node.js + Express API
│   ├── config/db.js     # MongoDB connection
│   ├── middleware/auth.js
│   ├── models/          # User & Task schemas
│   ├── routes/          # Auth & Task endpoints
│   ├── seed.js          # Sample data seeder
│   └── server.js
├── frontend/            # React (Vite) app
│   └── src/
│       ├── api/         # Axios config
│       ├── components/  # Navbar, ProtectedRoute
│       ├── context/     # AuthContext
│       └── pages/       # Login, Register, Dashboard, Tasks
├── analytics-service/   # Python FastAPI
│   └── main.py
└── README.md
```

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd QuickTask
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (see `.env.example`):

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
JWT_SECRET=your_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm start
```

**Seed sample data (optional):**

```bash
npm run seed
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_ANALYTICS_URL=http://localhost:8000/api/analytics
```

Start the frontend:

```bash
npm run dev
```

### 4. Python Analytics Service

```bash
cd analytics-service
pip install -r requirements.txt
```

Create a `.env` file:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
PORT=8000
```

Start the service:

```bash
python main.py
```

## API Documentation

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout user | No |

### Task Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/tasks` | Get all user tasks | Yes |
| POST | `/api/tasks` | Create a task | Yes |
| PUT | `/api/tasks/:id` | Update a task | Yes |
| DELETE | `/api/tasks/:id` | Delete a task | Yes |

**Query Parameters for GET /api/tasks:**

| Param | Values | Example |
|-------|--------|---------|
| `status` | Todo, In Progress, Completed | `?status=Todo` |
| `priority` | Low, Medium, High | `?priority=High` |
| `search` | any string | `?search=design` |
| `sortBy` | createdAt, dueDate, priority | `?sortBy=dueDate` |
| `order` | asc, desc | `?order=asc` |

### Analytics Endpoints (Python Service)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/stats/{user_id}` | User aggregate stats |
| GET | `/api/analytics/productivity/{user_id}?days=30` | Completion trends |

## Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `PORT` | Backend / Analytics | Server port |
| `MONGO_URI` | Backend / Analytics | MongoDB connection string |
| `JWT_SECRET` | Backend | JWT signing key |
| `CLIENT_URL` | Backend | Frontend URL for CORS |
| `VITE_API_URL` | Frontend | Backend API base URL |
| `VITE_ANALYTICS_URL` | Frontend | Analytics service base URL |

## Demo Credentials

After running `npm run seed`:

- **Email:** demo@quicktask.com
- **Password:** password123

## Features

- ✅ User registration & login with JWT cookies
- ✅ Create, edit, delete tasks
- ✅ Task status (Todo / In Progress / Completed)
- ✅ Task priority (Low / Medium / High)
- ✅ Due dates with overdue highlighting
- ✅ Search tasks by title
- ✅ Filter by status and priority
- ✅ Sort by date, priority, or creation date
- ✅ Dashboard with stat cards
- ✅ Doughnut charts (status & priority distribution)
- ✅ Productivity bar chart (from Python service)
- ✅ Responsive design (mobile-friendly)
- ✅ Dark theme with modern UI

## Known Limitations

- No password reset / forgot password flow
- No real-time updates (uses polling on page load)
- Analytics service requires user ObjectId (obtained after login)
