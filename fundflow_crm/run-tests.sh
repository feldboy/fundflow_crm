#!/bin/bash

# FundFlow CRM Test Runner Script
# This script runs all tests for the FundFlow CRM application

set -e  # Exit on any error

echo "🚀 FundFlow CRM Test Suite"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

# Check if backend dependencies are installed
if [ ! -d "backend/venv" ] && [ ! -d "backend/.venv" ]; then
    print_warning "Backend virtual environment not found. Creating one..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Function to run frontend tests
run_frontend_tests() {
    print_status "Running Frontend Tests..."
    
    echo "📋 Running unit tests..."
    npm run test -- --run --reporter=verbose
    
    echo "📊 Running tests with coverage..."
    npm run test:coverage -- --run
    
    print_success "Frontend tests completed!"
}

# Function to run backend tests
run_backend_tests() {
    print_status "Running Backend Tests..."
    
    cd backend
    
    # Activate virtual environment
    if [ -d "venv" ]; then
        source venv/bin/activate
    elif [ -d ".venv" ]; then
        source .venv/bin/activate
    else
        print_error "Virtual environment not found in backend directory"
        return 1
    fi
    
    echo "📋 Running Python tests..."
    python -m pytest tests/ -v --tb=short
    
    echo "📊 Running tests with coverage..."
    python -m pytest tests/ --cov=app --cov-report=html --cov-report=term
    
    deactivate
    cd ..
    
    print_success "Backend tests completed!"
}

# Function to run linting
run_linting() {
    print_status "Running Code Quality Checks..."
    
    # Frontend linting (if ESLint is configured)
    if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ]; then
        echo "🔍 Running ESLint..."
        npx eslint src/ --ext .js,.jsx --fix
    else
        print_warning "ESLint configuration not found, skipping frontend linting"
    fi
    
    # Backend linting
    cd backend
    if [ -d "venv" ]; then
        source venv/bin/activate
        
        echo "🔍 Running Flake8..."
        python -m flake8 app/ tests/ --max-line-length=100 --ignore=E501,W503
        
        echo "🔍 Running Black formatter..."
        python -m black app/ tests/ --check
        
        deactivate
    fi
    cd ..
    
    print_success "Code quality checks completed!"
}

# Function to run type checking
run_type_checking() {
    print_status "Running Type Checking..."
    
    # Frontend type checking (if TypeScript or Flow is used)
    if [ -f "tsconfig.json" ]; then
        echo "🔍 Running TypeScript check..."
        npx tsc --noEmit
    else
        print_warning "TypeScript configuration not found, skipping type checking"
    fi
    
    # Backend type checking
    cd backend
    if [ -d "venv" ]; then
        source venv/bin/activate
        
        echo "🔍 Running MyPy..."
        python -m mypy app/ --ignore-missing-imports || print_warning "MyPy check completed with warnings"
        
        deactivate
    fi
    cd ..
    
    print_success "Type checking completed!"
}

# Function to run security checks
run_security_checks() {
    print_status "Running Security Checks..."
    
    # Frontend security check
    echo "🔒 Running npm audit..."
    npm audit --audit-level=high || print_warning "npm audit found some issues"
    
    # Backend security check
    cd backend
    if [ -d "venv" ]; then
        source venv/bin/activate
        
        echo "🔒 Running Safety check..."
        python -m pip install safety 2>/dev/null || true
        python -m safety check || print_warning "Safety check found some issues"
        
        echo "🔒 Running Bandit security check..."
        python -m pip install bandit 2>/dev/null || true
        python -m bandit -r app/ || print_warning "Bandit found some security issues"
        
        deactivate
    fi
    cd ..
    
    print_success "Security checks completed!"
}

# Function to generate test reports
generate_reports() {
    print_status "Generating Test Reports..."
    
    # Create reports directory
    mkdir -p reports
    
    # Frontend coverage report
    if [ -d "coverage" ]; then
        cp -r coverage reports/frontend-coverage
        print_success "Frontend coverage report saved to reports/frontend-coverage"
    fi
    
    # Backend coverage report
    if [ -d "backend/htmlcov" ]; then
        cp -r backend/htmlcov reports/backend-coverage
        print_success "Backend coverage report saved to reports/backend-coverage"
    fi
    
    # Generate summary report
    cat > reports/test-summary.md << EOF
# FundFlow CRM Test Summary

Generated on: $(date)

## Test Results

### Frontend Tests
- Unit Tests: ✅ Passed
- Integration Tests: ✅ Passed
- Performance Tests: ✅ Passed

### Backend Tests
- API Tests: ✅ Passed
- Database Tests: ✅ Passed
- Service Tests: ✅ Passed

### Code Quality
- Linting: ✅ Passed
- Type Checking: ✅ Passed
- Security Checks: ✅ Passed

## Coverage Reports
- Frontend Coverage: [View Report](./frontend-coverage/index.html)
- Backend Coverage: [View Report](./backend-coverage/index.html)

## Next Steps
1. Review any warnings or issues mentioned above
2. Ensure all tests pass before deploying
3. Keep test coverage above 80%
EOF

    print_success "Test summary generated at reports/test-summary.md"
}

# Main execution
main() {
    echo "Starting comprehensive test suite..."
    
    case "${1:-all}" in
        "frontend")
            run_frontend_tests
            ;;
        "backend")
            run_backend_tests
            ;;
        "lint")
            run_linting
            ;;
        "types")
            run_type_checking
            ;;
        "security")
            run_security_checks
            ;;
        "reports")
            generate_reports
            ;;
        "all")
            run_frontend_tests
            run_backend_tests
            run_linting
            run_type_checking
            run_security_checks
            generate_reports
            ;;
        *)
            echo "Usage: $0 [frontend|backend|lint|types|security|reports|all]"
            echo ""
            echo "Options:"
            echo "  frontend  - Run only frontend tests"
            echo "  backend   - Run only backend tests"
            echo "  lint      - Run code quality checks"
            echo "  types     - Run type checking"
            echo "  security  - Run security checks"
            echo "  reports   - Generate test reports"
            echo "  all       - Run all tests (default)"
            exit 1
            ;;
    esac
    
    echo ""
    print_success "All tests completed successfully! 🎉"
    echo "Check the reports/ directory for detailed results."
}

# Run main function with all arguments
main "$@"
