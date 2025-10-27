#!/bin/bash

# Commerzbank Docker Quick Start Script
# This script helps you quickly set up and run the Commerzbank application with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env() {
    if [ ! -f ".env.production" ]; then
        print_warning ".env.production file not found. Creating from template..."
        if [ -f "env.production" ]; then
            cp env.production .env.production
            print_status "Created .env.production from template"
        else
            print_error "env.production template not found"
            exit 1
        fi
    else
        print_status ".env.production file exists"
    fi
}

# Build Docker images
build_images() {
    print_header "Building Docker Images"
    docker-compose build
    print_status "Docker images built successfully"
}

# Start services
start_services() {
    print_header "Starting Services"
    docker-compose up -d
    print_status "Services started successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_header "Waiting for Services to be Ready"
    
    # Wait for database
    print_status "Waiting for database to be ready..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec postgres pg_isready -U commcomm_user -d commcomm_db &> /dev/null; then
            print_status "Database is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Database failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for backend
    print_status "Waiting for backend to be ready..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -s http://localhost:3001/api/health &> /dev/null; then
            print_status "Backend is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Backend failed to start within 60 seconds"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"
    docker-compose exec backend npx prisma migrate deploy
    print_status "Database migrations completed"
}

# Show service status
show_status() {
    print_header "Service Status"
    docker-compose ps
    echo ""
    print_status "Application URLs:"
    echo "  Frontend: http://localhost:3002"
    echo "  Backend API: http://localhost:3001"
    echo "  Database: localhost:5432"
    echo ""
    print_status "Admin Panel: http://localhost:3002/admin"
    print_warning "Default admin password: COMMTAN@123"
}

# Main function
main() {
    print_header "Commerzbank Docker Quick Start"
    
    # Check prerequisites
    check_docker
    check_env
    
    # Build and start
    build_images
    start_services
    wait_for_services
    run_migrations
    
    # Show final status
    show_status
    
    print_header "Setup Complete!"
    print_status "Your Commerzbank application is now running with Docker!"
    print_status "Use 'make logs' to view logs or 'make down' to stop services"
}

# Handle script arguments
case "${1:-}" in
    "dev")
        print_header "Starting Development Environment"
        docker-compose -f docker-compose.dev.yml up -d
        print_status "Development environment started!"
        ;;
    "prod")
        print_header "Starting Production Environment"
        docker-compose -f docker-compose.prod.yml up -d
        print_status "Production environment started!"
        ;;
    "stop")
        print_header "Stopping Services"
        docker-compose down
        print_status "Services stopped!"
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "clean")
        print_header "Cleaning Up"
        docker-compose down -v
        docker system prune -f
        print_status "Cleanup completed!"
        ;;
    "help"|"-h"|"--help")
        echo "Commerzbank Docker Quick Start Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (no args)  - Start production environment (default)"
        echo "  dev        - Start development environment"
        echo "  prod       - Start production environment"
        echo "  stop       - Stop all services"
        echo "  logs       - View service logs"
        echo "  clean      - Clean up containers and volumes"
        echo "  help       - Show this help message"
        ;;
    *)
        main
        ;;
esac
