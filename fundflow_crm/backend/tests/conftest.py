import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from main import app
from app.core.database import init_database, close_database

# Test configuration
TEST_DATABASE_URL = "mongodb://localhost:27017/test_fundflow_crm"

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def test_app():
    """Create test application instance."""
    # Override database URL for testing
    with patch.dict('os.environ', {'DATABASE_URL': TEST_DATABASE_URL}):
        async with AsyncClient(app=app, base_url="http://test") as ac:
            yield ac

@pytest.fixture(scope="session")
async def test_client():
    """Create test client for FastAPI app."""
    with TestClient(app) as client:
        yield client

@pytest.fixture(autouse=True)
async def setup_test_database():
    """Setup and teardown test database for each test."""
    # Setup
    await init_database()
    yield
    # Teardown
    await close_database()

@pytest.fixture
def mock_plaintiff_data():
    """Mock plaintiff data for testing."""
    return {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "555-1234",
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "dateOfBirth": "1990-01-01",
        "caseType": "personal-injury",
        "incidentDate": "2023-01-01",
        "estimatedSettlement": 100000,
        "requestedAmount": 10000
    }

@pytest.fixture
def mock_law_firm_data():
    """Mock law firm data for testing."""
    return {
        "name": "Smith & Associates",
        "contactPerson": "Jane Smith",
        "email": "jane@smithlaw.com",
        "phone": "555-5678",
        "address": "456 Legal Ave",
        "city": "New York",
        "state": "NY",
        "zipCode": "10002",
        "barNumber": "NY123456",
        "verified": True
    }

@pytest.fixture
def mock_communication_data():
    """Mock communication data for testing."""
    return {
        "plaintiffId": "test-plaintiff-id",
        "type": "email",
        "subject": "Case Update",
        "content": "Your case has been updated.",
        "direction": "outbound",
        "channel": "email",
        "priority": "normal"
    }

@pytest.fixture
def mock_document_data():
    """Mock document data for testing."""
    return {
        "plaintiffId": "test-plaintiff-id",
        "name": "medical_records.pdf",
        "type": "medical",
        "size": 1024000,
        "mimeType": "application/pdf",
        "category": "medical-records",
        "description": "Medical records from incident"
    }

@pytest.fixture
def auth_headers():
    """Mock authorization headers for testing."""
    return {"Authorization": "Bearer test-token"}

class MockObjectId:
    """Mock ObjectId for testing."""
    def __init__(self, value="507f1f77bcf86cd799439011"):
        self.value = value
    
    def __str__(self):
        return self.value
    
    def __repr__(self):
        return f"ObjectId('{self.value}')"
