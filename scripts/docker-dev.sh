#!/bin/bash

# Docker development environment script
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Parse command line arguments
COMMAND=${1:-up}
shift || true

case "$COMMAND" in
  up|start)
    print_info "Starting development environment..."

    # Check if .env file exists
    if [ ! -f .env ]; then
      print_warning ".env file not found. Creating from example..."
      cat > .env << EOF
DATABASE_URL=postgresql://postgres:password@localhost:5440/papaya-fleet
BETTER_AUTH_SECRET=supersecretkey12345678901234567890
BETTER_AUTH_URL=http://localhost:3101
CORS_ORIGIN=http://localhost:3100
VITE_API_URL=http://localhost:3101
VITE_AUTH_URL=http://localhost:3101
NODE_ENV=development
EOF
      print_success ".env file created"
    fi

    # Start services with development configuration
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build "$@"

    print_success "Development environment started!"
    print_info "Services:"
    echo "  📊 Database: http://localhost:5440"
    echo "  🚀 Server:   http://localhost:3101"
    echo "  🌐 Web App:  http://localhost:3100"
    echo ""
    print_info "Run 'bun run docker:logs' to see logs"
    ;;

  down|stop)
    print_info "Stopping development environment..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml down "$@"
    print_success "Development environment stopped"
    ;;

  restart)
    print_info "Restarting development environment..."
    $0 down
    $0 up "$@"
    ;;

  logs)
    docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f "$@"
    ;;

  shell)
    SERVICE=${1:-server}
    print_info "Opening shell in $SERVICE container..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml exec "$SERVICE" sh
    ;;

  db)
    print_info "Opening PostgreSQL shell..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml exec postgres psql -U postgres papaya-fleet
    ;;

  reset)
    print_warning "This will delete all data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
      print_info "Resetting development environment..."
      docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
      print_success "Environment reset complete"
    else
      print_info "Reset cancelled"
    fi
    ;;

  build)
    print_info "Building development images..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml build "$@"
    print_success "Build complete"
    ;;

  ps|status)
    docker compose -f docker-compose.yml -f docker-compose.dev.yml ps
    ;;

  *)
    echo "Usage: $0 {up|down|restart|logs|shell|db|reset|build|ps} [options]"
    echo ""
    echo "Commands:"
    echo "  up/start    Start development environment"
    echo "  down/stop   Stop development environment"
    echo "  restart     Restart development environment"
    echo "  logs        Show and follow logs"
    echo "  shell       Open shell in container (default: server)"
    echo "  db          Open PostgreSQL shell"
    echo "  reset       Reset environment (delete all data)"
    echo "  build       Build Docker images"
    echo "  ps/status   Show container status"
    exit 1
    ;;
esac