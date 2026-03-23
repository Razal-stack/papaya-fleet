#!/bin/bash

# CI Checks Script - Runs all validation checks
# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[CI]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Track failures
FAILED_CHECKS=()

# Start CI checks
echo ""
print_status "Starting CI checks..."
echo ""

# 1. Type checking
print_status "Running type checks..."
if bun run check-types; then
    print_success "Type checking passed"
else
    print_error "Type checking failed"
    FAILED_CHECKS+=("Type checking")
fi
echo ""

# 2. Biome lint check (not fix, just check)
print_status "Running lint checks..."
if bun run lint; then
    print_success "Lint checks passed"
else
    print_error "Lint checks failed"
    FAILED_CHECKS+=("Linting")
fi
echo ""

# 3. Biome format check (not fix, just check)
print_status "Running format checks..."
if biome format --check .; then
    print_success "Format checks passed"
else
    print_error "Format checks failed"
    FAILED_CHECKS+=("Formatting")
fi
echo ""

# 4. Unit tests
print_status "Running unit tests..."
if bun run test; then
    print_success "Unit tests passed"
else
    print_error "Unit tests failed"
    FAILED_CHECKS+=("Unit tests")
fi
echo ""

# 5. E2E tests (only if explicitly enabled or in CI environment)
if [[ "$RUN_E2E" == "true" ]] || [[ "$CI" == "true" ]] || [[ "$1" == "--e2e" ]]; then
    print_status "Running E2E tests..."
    if bun run test:e2e; then
        print_success "E2E tests passed"
    else
        print_error "E2E tests failed"
        FAILED_CHECKS+=("E2E tests")
    fi
else
    print_warning "Skipping E2E tests (use --e2e flag or set RUN_E2E=true to include)"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ ${#FAILED_CHECKS[@]} -eq 0 ]; then
    print_success "All CI checks passed! 🎉"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 0
else
    print_error "CI checks failed:"
    for check in "${FAILED_CHECKS[@]}"; do
        echo "  • $check"
    done
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 1
fi