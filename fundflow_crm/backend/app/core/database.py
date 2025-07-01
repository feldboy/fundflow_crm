import motor.motor_asyncio
import os
import logging
from typing import Optional
from app.core.mock_database import mock_db  # noqa: E402

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
client = None
database = None
use_mock_db = False

async def init_database():
    global client, database, use_mock_db
    
    mongodb_url = os.getenv("MONGODB_URL")
    database_name = os.getenv("DATABASE_NAME", "fundflow_crm")
    
    logger.info(f"Attempting to connect to MongoDB...")
    logger.info(f"Database name: {database_name}")
    logger.info(f"MongoDB URL configured: {'Yes' if mongodb_url else 'No'}")
    logger.info(f"MONGODB_URL: {mongodb_url}")
    logger.info(f"DATABASE_NAME: {database_name}")
    
    if not mongodb_url:
        logger.warning("MONGODB_URL not found in environment variables")
        logger.warning("Falling back to mock database - data will not persist!")
        use_mock_db = True
        database = mock_db
        return
    
    try:
        client = motor.motor_asyncio.AsyncIOMotorClient(mongodb_url)
        database = client[database_name]
        
        # Test connection with timeout
        await client.admin.command('ping')
        logger.info(f"✅ Successfully connected to MongoDB Atlas!")
        logger.info(f"✅ Database: {database_name}")
        use_mock_db = False
        
        # List collections to verify connection
        collections = await database.list_collection_names()
        logger.info(f"📁 Available collections: {collections}")
        
    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        logger.warning("⚠️  Falling back to mock database - data will not persist!")
        logger.warning("⚠️  Check your MongoDB Atlas connection string and network access settings")
        use_mock_db = True
        database = mock_db
        
        if client:
            client.close()
            client = None

async def get_database():
    return database

async def get_database_status():
    """Get the current database connection status"""
    return {
        "using_mock_db": use_mock_db,
        "database_name": os.getenv("DATABASE_NAME", "fundflow_crm"),
        "mongodb_configured": bool(os.getenv("MONGODB_URL")),
        "connection_active": client is not None and not use_mock_db
    }

async def close_database():
    global client
    if client:
        client.close()
        client = None
