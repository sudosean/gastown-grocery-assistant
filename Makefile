.DEFAULT_GOAL := help

.PHONY: help up down dev build logs ps migrate migrate-new db-shell api-shell frontend-shell install lint test clean seed

help: ## List all targets with descriptions
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Start all services in detached mode
	docker compose up -d

down: ## Stop all services
	docker compose down

dev: up ## Start all services and follow logs
	docker compose logs -f

build: ## Build all service images
	docker compose build

logs: ## Follow logs for all services
	docker compose logs -f

ps: ## Show service status
	docker compose ps

migrate: ## Run alembic upgrade head inside api container
	docker compose exec api alembic upgrade head

migrate-new: ## Create new alembic migration (usage: make migrate-new msg='add table')
	docker compose exec api alembic revision --autogenerate -m "$(msg)"

db-shell: ## Open psql shell into postgres container
	docker compose exec db psql -U $${POSTGRES_USER:-grocery} $${POSTGRES_DB:-grocery}

api-shell: ## Open bash shell into api container
	docker compose exec api bash

frontend-shell: ## Open bash shell into frontend container
	docker compose exec frontend sh

install: ## Install dependencies (frontend npm, backend pip)
	cd frontend && npm install
	cd backend && pip install -r requirements.txt

lint: ## Run eslint (frontend) and ruff (backend)
	cd frontend && npm run lint
	cd backend && ruff check .

test: ## Run pytest (backend) and vitest (frontend)
	cd backend && pytest
	cd frontend && npm run test

clean: ## Stop all services and remove volumes
	docker compose down -v

seed: ## Run seed script to populate dev data
	docker compose exec api python scripts/seed.py
