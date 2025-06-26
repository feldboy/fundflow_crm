import motor.motor_asyncio
import os
from typing import Optional
from app.core.mock_database import mock_db  # noqa: E402

# MongoDB connection
client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
database = None
use_mock_db = False

async def init_database():
    global client, database, use_mock_db
    
    mongodb_url = os.getenv("MONGODB_URL")
    database_name = os.getenv("DATABASE_NAME", "pre_settlement_crm")
    
    if not mongodb_url:
        print("MONGODB_URL not found, using mock database")
        use_mock_db = True
        database = mock_db
        return
    
    client = motor.motor_asyncio.AsyncIOMotorClient(mongodb_url)
    database = client[database_name]
    
    # Test connection
    try:
        await client.admin.command('ping')
        print(f"Successfully connected to MongoDB database: {database_name}")
        use_mock_db = False
    except Exception as e:  # Using broad exception for database connection issues
        print(f"Failed to connect to MongoDB: {e}")
        print("Warning: Falling back to mock database. Data will not persist.")
        use_mock_db = True
        database = mock_db

async def get_database():
    return database

async def close_database():
    if client:
        client.close()
