# Anka Task & Time Tracker

A full-stack productivity application built with NestJS (Backend) and React + Vite (Frontend). This project allows users to manage tasks, track time, and view productivity analytics.

## Features

- **Authentication**: Secure user registration and login with JWT.
- **Task Management**: Create, read, update, and delete tasks. Status tracking (Todo, In Progress, Done).
- **Time Tracking**: Start and stop timers for tasks.
- **Dashboard**: Visual analytics of time spent and tasks completed.
- **Responsive Design**: Modern UI built with Tailwind CSS.

## Tech Stack

- **Backend**: NestJS, TypeScript, PostgreSQL (via TypeORM), Passport (JWT).
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Zustand (State Management), React Query, Recharts, Lucide React.

## Prerequisites

- Node.js (v18+)
- PostgreSQL installed and running.

## Setup Instructions

### 1. Database Setup

Ensure PostgreSQL is running. Create a database named `anka_task_tracker` (or update `.env` in server).

### 2. Backend Setup

1.  Navigate to `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment:
    Create a `.env` file in `server` root (copy from `.env.example` if available) with:
    ```env
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=yourpassword
    DB_NAME=anka_task_tracker
    JWT_SECRET=your_secret_key
    ```
4.  Start the server:
    ```bash
    npm run start:dev
    ```
    The server runs on `http://localhost:3000`. API docs available at `http://localhost:3000/api`.

### 3. Frontend Setup

1.  Navigate to `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The app runs on `http://localhost:5173`.

## usage

1.  Register a new account.
2.  Login to access the dashboard.
3.  Go to **Tasks** to create tasks.
4.  Click the **Play** button on a task to start tracking time.
5.  Click **Stop Timer** (top of page or in task list possibly) to stop tracking.
6.  View stats on the **Dashboard**.

## Project Structure

- `server/`: NestJS backend source code.
- `client/`: React frontend source code.
