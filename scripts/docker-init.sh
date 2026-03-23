#!/bin/bash

# Docker initialization script for new developers
# This script sets up the entire development environment from scratch

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_header() { echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}═══════════════════════════════════════════${NC}\n"; }
print_step() { echo -e "${MAGENTA}▶ $1${NC}"; }

# ASCII Art Banner
print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║      PAPAYA TEST - DOCKER SETUP          ║"
    echo "║   Complete Development Environment       ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    local missing_tools=()

    # Check Docker
    print_step "Checking Docker..."
    if command -v docker &> /dev/null; then
        docker_version=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        print_success "Docker found (version $docker_version)"
    else
        missing_tools+=("Docker")
        print_error "Docker not found"
    fi

    # Check Docker Compose
    print_step "Checking Docker Compose..."
    if docker compose version &> /dev/null; then
        compose_version=$(docker compose version | cut -d' ' -f4)
        print_success "Docker Compose found (version $compose_version)"
    else
        missing_tools+=("Docker Compose")
        print_error "Docker Compose not found"
    fi

    # Check Git
    print_step "Checking Git..."
    if command -v git &> /dev/null; then
        git_version=$(git --version | cut -d' ' -f3)
        print_success "Git found (version $git_version)"
    else
        missing_tools+=("Git")
        print_error "Git not found"
    fi

    # Check if any tools are missing
    if [ ${#missing_tools[@]} -gt 0 ]; then
        print_error "\nMissing required tools: ${missing_tools[*]}"
        print_info "Please install the missing tools and run this script again."
        print_info "Visit https://docs.docker.com/get-docker/ for Docker installation"
        exit 1
    fi

    # Check if Docker daemon is running
    print_step "Checking Docker daemon..."
    if docker info &> /dev/null; then
        print_success "Docker daemon is running"
    else
        print_error "Docker daemon is not running"
        print_info "Please start Docker and run this script again"
        exit 1
    fi
}

# Setup environment files
setup_environment() {
    print_header "Setting Up Environment"

    # Check if .env exists
    if [ -f .env ]; then
        print_warning ".env file already exists"
        read -p "Do you want to override it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Keeping existing .env file"
        else
            print_step "Creating new .env file from template..."
            cp .env.example .env
            print_success ".env file created from template"
        fi
    else
        print_step "Creating .env file from template..."
        cp .env.example .env
        print_success ".env file created"
    fi

    # Generate secure auth secret
    print_step "Generating secure authentication secret..."
    if command -v openssl &> /dev/null; then
        AUTH_SECRET=$(openssl rand -hex 32)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/supersecretkey12345678901234567890changethisinproduction/$AUTH_SECRET/" .env
        else
            # Linux
            sed -i "s/supersecretkey12345678901234567890changethisinproduction/$AUTH_SECRET/" .env
        fi
        print_success "Secure authentication secret generated"
    else
        print_warning "OpenSSL not found, using default secret (change in production!)"
    fi
}

# Clean up existing containers and volumes
cleanup_existing() {
    print_header "Cleaning Up Existing Setup"

    print_step "Checking for existing containers..."
    if docker compose ps -q 2>/dev/null | grep -q .; then
        print_warning "Found existing containers"
        read -p "Stop and remove existing containers? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_step "Stopping containers..."
            docker compose down
            print_success "Containers stopped and removed"
        fi
    else
        print_info "No existing containers found"
    fi

    # Check for existing volumes
    print_step "Checking for existing volumes..."
    existing_volume=$(docker volume ls -q | grep -E "papaya-fleet.*postgres_data" || true)
    if [ -n "$existing_volume" ]; then
        print_warning "Found existing database volume"
        read -p "Delete existing database data? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose down -v
            print_success "Database volume deleted"
        else
            print_info "Keeping existing database data"
        fi
    fi
}

# Build Docker images
build_images() {
    print_header "Building Docker Images"

    print_step "Building development images..."
    print_info "This may take a few minutes on first run..."

    if docker compose -f docker-compose.yml -f docker-compose.dev.yml build; then
        print_success "Docker images built successfully"
    else
        print_error "Failed to build Docker images"
        exit 1
    fi
}

# Start services
start_services() {
    print_header "Starting Services"

    print_step "Starting PostgreSQL database..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres

    # Wait for database to be ready
    print_step "Waiting for database to be ready..."
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if docker compose exec postgres pg_isready -U postgres &>/dev/null; then
            print_success "Database is ready"
            break
        fi
        attempt=$((attempt + 1))
        if [ $attempt -eq $max_attempts ]; then
            print_error "Database failed to start"
            exit 1
        fi
        sleep 1
        printf "."
    done
    echo

    print_step "Starting server application..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d server

    print_step "Starting web application..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d web

    print_success "All services started"
}

# Setup database
setup_database() {
    print_header "Setting Up Database"

    print_step "Waiting for server to be ready..."
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:3101/health &>/dev/null 2>&1; then
            print_success "Server is ready"
            break
        fi
        attempt=$((attempt + 1))
        if [ $attempt -eq $max_attempts ]; then
            print_warning "Server health check not available, continuing..."
            break
        fi
        sleep 1
        printf "."
    done
    echo

    print_step "Running database migrations..."
    if docker compose exec server sh -c "cd /app && bun run db:push"; then
        print_success "Database migrations completed"
    else
        print_warning "Failed to run migrations, you may need to run them manually"
    fi

    # Ask about seeding
    read -p "Do you want to seed the database with sample data? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        print_step "Seeding database with sample data..."
        if docker compose exec server sh -c "cd /app && bun run db:seed"; then
            print_success "Database seeded with sample data"
        else
            print_warning "Failed to seed database, you can run 'bun run db:seed' manually"
        fi
    fi
}

# Verify installation
verify_installation() {
    print_header "Verifying Installation"

    local all_good=true

    # Check database
    print_step "Checking database connection..."
    if docker compose exec postgres pg_isready -U postgres &>/dev/null; then
        print_success "Database: ✓ Running on port 5440"
    else
        print_error "Database: ✗ Not responding"
        all_good=false
    fi

    # Check server
    print_step "Checking server..."
    if curl -f http://localhost:3101 &>/dev/null 2>&1; then
        print_success "Server: ✓ Running on http://localhost:3101"
    else
        print_warning "Server: ⚠ Not responding on http://localhost:3101 (may still be starting)"
    fi

    # Check web
    print_step "Checking web application..."
    if curl -f http://localhost:3100 &>/dev/null 2>&1; then
        print_success "Web App: ✓ Running on http://localhost:3100"
    else
        print_warning "Web App: ⚠ Not responding on http://localhost:3100 (may still be starting)"
    fi

    if [ "$all_good" = true ]; then
        print_success "\nAll services are running correctly!"
    else
        print_warning "\nSome services may need more time to start"
    fi
}

# Print next steps
print_next_steps() {
    print_header "Setup Complete! 🎉"

    echo -e "${GREEN}Your development environment is ready!${NC}\n"

    echo "📍 Service URLs:"
    echo "  • Web App:  http://localhost:3100"
    echo "  • API:      http://localhost:3101"
    echo "  • Database: localhost:5440"
    echo ""

    echo "🛠 Useful Commands:"
    echo "  • View logs:        bun run docker:dev:logs"
    echo "  • Stop services:    bun run docker:dev:down"
    echo "  • Restart services: ./scripts/docker-dev.sh restart"
    echo "  • Database studio:  bun run db:studio"
    echo "  • Run tests:        docker compose exec server bun test"
    echo ""

    echo "📚 Documentation:"
    echo "  • Docker Guide: ./docs/DOCKER.md"
    echo "  • Architecture: ./docs/architecture/ARCHITECTURE.md"
    echo "  • README:       ./README.md"
    echo ""

    echo "💡 Tips:"
    echo "  • Hot reload is enabled - changes to code will auto-refresh"
    echo "  • Database data persists between restarts"
    echo "  • Use './scripts/docker-dev.sh reset' to start fresh"
    echo ""

    print_info "Run 'bun run docker:dev:logs' to see application logs"
}

# Main execution
main() {
    clear
    print_banner

    echo "This script will set up your complete Docker development environment."
    echo "It will check prerequisites, configure environment, and start all services."
    echo ""
    read -p "Continue? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_info "Setup cancelled"
        exit 0
    fi

    check_prerequisites
    setup_environment
    cleanup_existing
    build_images
    start_services
    setup_database
    verify_installation
    print_next_steps
}

# Run main function
main "$@"