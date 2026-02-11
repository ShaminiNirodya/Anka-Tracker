# Anka Task & Time Tracker

A premium, full-stack productivity application designed to help you manage tasks and track time with precision. Built with a modern tech stack focusing on performance, aesthetics, and user experience.

## ✨ Features

- **Mark Tasks as Complete/Incomplete**: Quickly toggle task status with a single click. Includes visual feedback and confetti celebrations for completions.
- **Authentication**: Secure user registration and login powered by JWT (JSON Web Tokens).
- **Task Management**: Full CRUD (Create, Read, Update, Delete) capabilities with status, priority, and category tracking.
- **Precision Time Tracking**: Real-time stopwatch for active tasks with persistent logging and duration calculation.
- **Dual-Theme System**: Beautifully crafted Light and Dark modes with persistent user preference.
- **Productivity Dashboard**: Detailed analytics with bar charts for time distribution and pie charts for task priority breakdown.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop devices.
- **Keyboard Shortcuts**: Productivity-boosting shortcuts (Alt+N for new task, Ctrl+/ for search).
- **Data Export**: Export your tasks and time logs to CSV format.

## 🛠️ Technologies Used

### Frontend
- **Framework**: [React v19.2.0](https://react.dev/)
- **Build Tool**: [Vite v7.3.1](https://vitejs.dev/)
- **State Management**: [Zustand v5.0.11](https://github.com/pmndrs/zustand)
- **Data Fetching**: [React Query v5.90.20](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS v3.4.17](https://tailwindcss.com/)
- **Charts**: [Recharts v3.7.0](https://recharts.org/)
- **Icons**: [Lucide React v0.563.0](https://lucide.dev/)

### Backend
- **Framework**: [NestJS v11.0.1](https://nestjs.com/)
- **Language**: [TypeScript v5.7.3](https://www.typescriptlang.org/)
- **ORM**: [TypeORM v0.3.28](https://typeorm.io/)
- **Database**: [PostgreSQL v8.18.0](https://www.postgresql.org/)
- **Security**: [Passport.js](https://www.passportjs.org/) & [Bcrypt v6.0.0](https://github.com/kelektiv/node.bcrypt.js)
- **API Documentation**: [Swagger (OpenAPI v11.2.6)](https://swagger.io/)

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/download/) database
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 1. Database Setup
1. Create a new PostgreSQL database:
   ```sql
   CREATE DATABASE anka_task_tracker;
   ```

### 2. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables. Create a `.env` file in the `server` root:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_postgres_username
   DB_PASSWORD=your_postgres_password
   DB_NAME=anka_task_tracker
   JWT_SECRET=your_super_secret_key_change_me
   ```
4. Start the development server:
   ```bash
   npm run start:dev
   ```
   The backend will be running at `http://localhost:3000`. API documentation is available at `http://localhost:3000/api`.

### 3. Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 📡 API Documentation

Key endpoints (full documentation available via Swagger at `/api`):

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Login and receive JWT token | No |
| `GET` | `/tasks` | List all tasks with filters | Yes |
| `POST` | `/tasks` | Create a new task | Yes |
| `PATCH` | `/tasks/:id` | Update task (including status) | Yes |
| `DELETE` | `/tasks/:id` | Delete a task | Yes |
| `POST` | `/time-logs/start` | Start tracking time for a task | Yes |
| `POST` | `/time-logs/stop` | Stop active tracking | Yes |
| `GET` | `/dashboard/stats` | Get productivity metrics | Yes |

## 📁 Project Structure

```text
Anka/
├── client/                # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components (Dashboard, Tasks, Auth)
│   │   ├── services/      # API communication
│   │   └── store/         # Zustand state management
├── server/                # NestJS backend
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── tasks/         # Task management module
│   │   ├── time-logs/     # Time tracking module
│   │   └── dashboard/     # Analytics module
└── docker-compose.yml     # Containerization support (optional)
```

## ⚖️ License
This project is for demonstration purposes. License: MIT.
