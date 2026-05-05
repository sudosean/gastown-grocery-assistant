# Grocery Assistant

An AI-powered meal planning and grocery management app. Set your household preferences, generate a weekly meal plan, track your pantry, and get a smart shopping list that subtracts what you already have.

## Features

- **AI Meal Planning** — Generate a personalized 7-day meal plan based on household size, dietary restrictions, budget, and cooking time
- **Meal Swaps** — Swap individual meals and the app learns your preferences over time
- **Pantry Tracking** — Add items via natural language (AI parses them into structured entries)
- **Smart Shopping Lists** — Auto-generated from your meal plan, with pantry items already subtracted

## Tech Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript (frontend)
- [FastAPI](https://fastapi.tiangolo.com/) (Python backend)
- [PostgreSQL](https://www.postgresql.org/) (database)
- [Docker Compose](https://docs.docker.com/compose/) (local dev stack)
- [Tailwind CSS](https://tailwindcss.com/)
- [Anthropic Claude](https://www.anthropic.com/) (meal plan generation, pantry parsing)

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

That's it. No local Node or Python installation required to run the app.

## Quickstart

```bash
cp .env.example .env
make up
```

Open [http://localhost:3000](http://localhost:3000).

## Makefile Reference

| Target | Description |
|--------|-------------|
| `make up` | Start all services in detached mode |
| `make down` | Stop all services |
| `make dev` | Start all services and follow logs |
| `make build` | Build all service images |
| `make logs` | Follow logs for all services |
| `make ps` | Show service status |
| `make migrate` | Run alembic upgrade head inside api container |
| `make migrate-new msg='...'` | Create a new alembic migration |
| `make db-shell` | Open psql shell into postgres container |
| `make api-shell` | Open bash shell into api container |
| `make frontend-shell` | Open bash shell into frontend container |
| `make install` | Install dependencies (frontend npm, backend pip) |
| `make lint` | Run eslint (frontend) and ruff (backend) |
| `make test` | Run pytest (backend) and vitest (frontend) |
| `make clean` | Stop all services and remove volumes |
| `make seed` | Populate dev data via seed script |

## Local Development (without Docker)

For contributors who want hot-reload without containers:

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

You'll also need a local PostgreSQL instance. Set `DATABASE_URL` in `backend/.env` to point to it.

## Environment Variables

Copy `.env.example` to `.env` and edit as needed:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `POSTGRES_USER` | PostgreSQL username (default: `grocery`) |
| `POSTGRES_PASSWORD` | PostgreSQL password (default: `grocery`) |
| `POSTGRES_DB` | PostgreSQL database name (default: `grocery`) |
| `DATABASE_URL` | Full connection string used by the API container |
| `SECRET_KEY` | Secret key for JWT signing — change in production |
| `ANTHROPIC_API_KEY` | Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com/) |
| `ALLOWED_ORIGINS` | CORS allowed origins (default: `http://localhost:3000`) |
| `VITE_API_URL` | API base URL used by the frontend (default: `http://localhost:8000`) |

## Project Structure

```
frontend/         # Vite + React + TypeScript app
  src/
    components/   # Shared React components
    pages/        # Route-level page components
    lib/          # API client, utilities
    types/        # TypeScript types
  package.json

backend/          # FastAPI Python app
  app/
    routers/      # API route handlers
    models.py     # SQLAlchemy ORM models
    schemas.py    # Pydantic request/response schemas
    database.py   # DB session setup
    auth.py       # Authentication helpers
    main.py       # FastAPI app entrypoint
  migrations/     # Alembic migrations
  requirements.txt
  Dockerfile

docker-compose.yml  # Defines frontend, api, and db services
Makefile            # Dev workflow shortcuts
.env.example        # Environment variable template
```
