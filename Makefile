# Makefile for Commerzbank Docker Management

.PHONY: help build up down restart logs clean dev prod test migrate backup restore

# Default target
help:
	@echo "Commerzbank Docker Management"
	@echo "============================="
	@echo ""
	@echo "Available commands:"
	@echo "  dev         - Start development environment"
	@echo "  prod        - Start production environment"
	@echo "  build       - Build all Docker images"
	@echo "  up          - Start all services"
	@echo "  down        - Stop all services"
	@echo "  restart     - Restart all services"
	@echo "  logs        - View logs for all services"
	@echo "  logs-backend - View backend logs"
	@echo "  logs-db     - View database logs"
	@echo "  migrate     - Run database migrations"
	@echo "  backup      - Backup database"
	@echo "  restore     - Restore database from backup"
	@echo "  clean       - Clean up containers and volumes"
	@echo "  test        - Run tests"
	@echo "  shell-backend - Access backend container shell"
	@echo "  shell-db    - Access database shell"
	@echo ""

# Development environment
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "Backend: http://localhost:3001"
	@echo "Database: localhost:5432"

# Production environment
prod:
	@echo "Starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "Production environment started!"
	@echo "Application: http://localhost:8080"

# Build images
build:
	@echo "Building Docker images..."
	docker-compose build
	@echo "Images built successfully!"

# Start services
up:
	@echo "Starting services..."
	docker-compose up -d
	@echo "Services started!"

# Stop services
down:
	@echo "Stopping services..."
	docker-compose down
	@echo "Services stopped!"

# Restart services
restart:
	@echo "Restarting services..."
	docker-compose restart
	@echo "Services restarted!"

# View logs
logs:
	docker-compose logs -f

# View backend logs
logs-backend:
	docker-compose logs -f backend

# View database logs
logs-db:
	docker-compose logs -f postgres

# Run database migrations
migrate:
	@echo "Running database migrations..."
	docker-compose exec backend npx prisma migrate deploy
	@echo "Migrations completed!"

# Backup database
backup:
	@echo "Creating database backup..."
	docker-compose exec postgres pg_dump -U commcomm_user commcomm_db > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup created!"

# Restore database
restore:
	@echo "Restoring database from backup..."
	@read -p "Enter backup filename: " backup_file; \
	docker-compose exec -T postgres psql -U commcomm_user commcomm_db < $$backup_file
	@echo "Database restored!"

# Clean up
clean:
	@echo "Cleaning up containers and volumes..."
	docker-compose down -v
	docker system prune -f
	@echo "Cleanup completed!"

# Run tests
test:
	@echo "Running tests..."
	docker-compose exec backend npm test
	@echo "Tests completed!"

# Access backend shell
shell-backend:
	docker-compose exec backend sh

# Access database shell
shell-db:
	docker-compose exec postgres psql -U commcomm_user -d commcomm_db

# Health check
health:
	@echo "Checking service health..."
	@docker-compose ps
	@echo ""
	@echo "Testing API health endpoint..."
	@curl -s http://localhost:3001/api/health || echo "API not responding"

# Install dependencies
install:
	@echo "Installing dependencies..."
	docker-compose exec backend npm install
	@echo "Dependencies installed!"

# Generate Prisma client
prisma-generate:
	@echo "Generating Prisma client..."
	docker-compose exec backend npx prisma generate
	@echo "Prisma client generated!"

# Open Prisma Studio
prisma-studio:
	@echo "Opening Prisma Studio..."
	docker-compose exec backend npx prisma studio

# Reset database
db-reset:
	@echo "Resetting database..."
	docker-compose exec backend npx prisma migrate reset
	@echo "Database reset completed!"

# Show service status
status:
	@echo "Service Status:"
	@echo "==============="
	@docker-compose ps
	@echo ""
	@echo "Volume Usage:"
	@echo "============="
	@docker volume ls | grep commerzbank
	@echo ""
	@echo "Network Usage:"
	@echo "=============="
	@docker network ls | grep commerzbank
