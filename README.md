# Radius Chat Application

A production-grade, real-time chat application built as a Take-Home Assignment for Radius.

## Overview

This application provides a lightweight chat feature where users can instantly communicate. It features:
- **Real-time bidirectional communication** via WebSockets
- **Persistent Chat History** powered by SQLite and SQLAlchemy
- **Identity System** requiring users to pick a display name before joining
- **AI Integration (Bonus Feature)**: Mentioning `@ai` anywhere in your message triggers a simulated intelligent bot that responds in the chat room.

## Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI**: Chosen for its fast, async-first nature, making it perfect for handling WebSockets and an AI-driven background tasks workflow.
- **SQLAlchemy (Async)** & aiosqlite: ORM for Database persistence.
- **Pytest**: Used for strict Test-Driven Development (TDD).

### Frontend
- **React 18** + **Vite**
- **TypeScript**: Ensures type safety across the application.
- **Tailwind CSS 4**: Used for a premium, modern, glassmorphic UI.
- **Vitest & React Testing Library**: Used for TDD.

## Architecture & Design Decisions

### 1. Test-Driven Development (TDD)
The application was written following strict TDD. Tests were created before the respective business logics were implemented. 
- *Backend tests* simulate connected agents and push assertions.
- *Frontend tests* assert behavior and state transitions.

### 2. Dependency Injection
FastAPI's dependency injection system was leveraged (e.g., `db: AsyncSession = Depends(get_db)`) to easily mock components and keep the codebase decoupled. 

### 3. Separation of Concerns (UI vs Logic)
In the frontend, the `useChat` custom hook encapsulates all WebSocket communication and state management. The `ChatRoom.tsx` acts purely as a presentational layer for this state, making both components extremely easy to test and alter.

### 4. Why the @ai Feature?
The Radius job description specifically highlighted experience in building "AI/LLM-powered systems (agents, tool calling, workflows)". Allowing users to mention `@ai` transforms an idle chat room into an active, intelligent workspace agent capable of assisting the user dynamically. Wait times are simulated correctly to mimic a genuine LLM payload delay.

## Local Setup

### 1. Backend

Navigate to backend directory and use your virtual environment:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The server will run on `http://127.0.0.1:8000`.

### 2. Frontend

Open a new terminal session, navigate to the frontend folder, install dependencies and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`. 
The Vite proxy handles routing any `/api/*` and `/ws/*` calls to the FastAPI backend automatically.

## Running Tests

**Backend:**
```bash
cd backend
source venv/bin/activate
export PYTHONPATH=.
export TESTING=1
pytest -v
```

**Frontend:**
```bash
cd frontend
npm run test
```
