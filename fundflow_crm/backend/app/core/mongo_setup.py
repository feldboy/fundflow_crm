"""
MongoDB database setup and seeding utilities.
"""
from datetime import datetime
import logging
from .database import get_database

logger = logging.getLogger(__name__)

async def initialize_collections():
    """Initialize MongoDB collections with proper indexes."""
    try:
        db = await get_database()
        
        # Create collections if they don't exist
        collections = await db.list_collection_names()
        
        if "law_firms" not in collections:
            await db.create_collection("law_firms")
            await db.law_firms.create_index("name", unique=True)
            logger.info("Created law_firms collection with indexes")
            
        if "plaintiffs" not in collections:
            await db.create_collection("plaintiffs")
            await db.plaintiffs.create_index([("firstName", 1), ("lastName", 1)])
            await db.plaintiffs.create_index("email")
            logger.info("Created plaintiffs collection with indexes")
            
        if "cases" not in collections:
            await db.create_collection("cases")
            await db.cases.create_index("plaintiffId")
            logger.info("Created cases collection with indexes")
            
        logger.info("Database initialization completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error initializing collections: {e}")
        return False

async def seed_sample_data():
    """Seed the database with sample data for testing."""
    try:
        db = await get_database()
        
        # Clear existing data
        await db.law_firms.delete_many({})
        await db.plaintiffs.delete_many({})
        await db.cases.delete_many({})
        
        # Sample law firms
        law_firms = [
            {
                "name": "Anderson & Associates",
                "address": "123 Legal Ave, Los Angeles, CA 90210",
                "phone": "(555) 123-4567",
                "email": "info@andersonlaw.com",
                "specialties": ["Personal Injury", "Medical Malpractice"],
                "createdAt": datetime.utcnow()
            },
            {
                "name": "Carter Legal Group",
                "address": "456 Justice Blvd, San Francisco, CA 94102",
                "phone": "(555) 987-6543",
                "email": "contact@carterlegal.com",
                "specialties": ["Employment Law", "Civil Rights"],
                "createdAt": datetime.utcnow()
            },
            {
                "name": "Rodriguez & Partners",
                "address": "789 Court St, San Diego, CA 92101",
                "phone": "(555) 456-7890",
                "email": "info@rodriguezpartners.com",
                "specialties": ["Personal Injury", "Workers Compensation"],
                "createdAt": datetime.utcnow()
            }
        ]
        
        # Insert law firms
        law_firm_result = await db.law_firms.insert_many(law_firms)
        law_firm_ids = law_firm_result.inserted_ids
        logger.info(f"Inserted {len(law_firm_ids)} law firms")
        
        # Sample plaintiffs
        plaintiffs = [
            {
                "firstName": "John",
                "lastName": "Smith",
                "email": "john.smith@email.com",
                "phone": "(555) 111-2222",
                "address": "123 Main St, Los Angeles, CA 90210",
                "dateOfBirth": datetime(1985, 5, 15),
                "caseType": "Personal Injury",
                "incidentDate": datetime(2024, 1, 15),
                "requestedAmount": 75000,
                "currentStage": "Initial Review",
                "caseNotes": "Client injured in car accident. Suffered back injuries and lost wages. Strong case with good documentation.",
                "documents": [
                    {"title": "Medical Records", "type": "medical", "uploadDate": datetime.utcnow()},
                    {"title": "Police Report", "type": "legal", "uploadDate": datetime.utcnow()},
                    {"title": "Insurance Claim", "type": "financial", "uploadDate": datetime.utcnow()}
                ],
                "lawFirmId": law_firm_ids[0],
                "aiScore": 85,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "firstName": "Maria",
                "lastName": "Garcia",
                "email": "maria.garcia@email.com",
                "phone": "(555) 333-4444",
                "address": "456 Oak Ave, San Francisco, CA 94102",
                "dateOfBirth": datetime(1978, 11, 23),
                "caseType": "Medical Malpractice",
                "incidentDate": datetime(2024, 2, 8),
                "requestedAmount": 125000,
                "currentStage": "Discovery",
                "caseNotes": "Misdiagnosis led to delayed treatment and complications. Strong medical evidence of malpractice.",
                "documents": [
                    {"title": "Hospital Records", "type": "medical", "uploadDate": datetime.utcnow()},
                    {"title": "Expert Medical Opinion", "type": "expert", "uploadDate": datetime.utcnow()},
                    {"title": "Treatment History", "type": "medical", "uploadDate": datetime.utcnow()}
                ],
                "lawFirmId": law_firm_ids[1],
                "aiScore": 92,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "firstName": "David",
                "lastName": "Johnson",
                "email": "david.johnson@email.com",
                "phone": "(555) 555-6666",
                "address": "789 Pine St, San Diego, CA 92101",
                "dateOfBirth": datetime(1990, 3, 10),
                "caseType": "Workers Compensation",
                "incidentDate": datetime(2024, 3, 20),
                "requestedAmount": 45000,
                "currentStage": "Active Litigation",
                "caseNotes": "Workplace injury due to unsafe conditions. Clear liability and good witness testimony.",
                "documents": [
                    {"title": "Incident Report", "type": "legal", "uploadDate": datetime.utcnow()},
                    {"title": "Medical Assessment", "type": "medical", "uploadDate": datetime.utcnow()}
                ],
                "lawFirmId": law_firm_ids[2],
                "aiScore": 78,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "firstName": "Sarah",
                "lastName": "Williams",
                "email": "sarah.williams@email.com",
                "phone": "(555) 777-8888",
                "address": "321 Elm St, Los Angeles, CA 90210",
                "dateOfBirth": datetime(1982, 7, 5),
                "caseType": "Employment Law",
                "incidentDate": datetime(2024, 1, 30),
                "requestedAmount": 95000,
                "currentStage": "Mediation",
                "caseNotes": "Wrongful termination case with discrimination claims. Strong documentation of company policy violations.",
                "documents": [
                    {"title": "Employment Contract", "type": "legal", "uploadDate": datetime.utcnow()},
                    {"title": "HR Communications", "type": "communication", "uploadDate": datetime.utcnow()},
                    {"title": "Performance Reviews", "type": "employment", "uploadDate": datetime.utcnow()}
                ],
                "lawFirmId": law_firm_ids[1],
                "aiScore": 88,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "firstName": "Michael",
                "lastName": "Brown",
                "email": "michael.brown@email.com",
                "phone": "(555) 999-0000",
                "address": "654 Maple Dr, San Francisco, CA 94102",
                "dateOfBirth": datetime(1975, 12, 18),
                "caseType": "Personal Injury",
                "incidentDate": datetime(2024, 4, 12),
                "requestedAmount": 185000,
                "currentStage": "Settlement Negotiation",
                "caseNotes": "Severe injuries from construction accident. Multiple surgeries required. High settlement potential.",
                "documents": [
                    {"title": "Surgery Reports", "type": "medical", "uploadDate": datetime.utcnow()},
                    {"title": "Safety Violation Report", "type": "legal", "uploadDate": datetime.utcnow()},
                    {"title": "Lost Wages Documentation", "type": "financial", "uploadDate": datetime.utcnow()},
                    {"title": "Expert Engineering Report", "type": "expert", "uploadDate": datetime.utcnow()}
                ],
                "lawFirmId": law_firm_ids[2],
                "aiScore": 94,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
        ]
        
        # Insert plaintiffs
        plaintiff_result = await db.plaintiffs.insert_many(plaintiffs)
        logger.info(f"Inserted {len(plaintiff_result.inserted_ids)} plaintiffs")
        
        logger.info("Database seeded successfully with sample data")
        return True
        
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        return False

async def check_database_health():
    """Check database connection and basic health."""
    try:
        db = await get_database()
        
        # Simple ping test
        await db.command("ping")
        
        # Count documents in collections
        law_firms_count = await db.law_firms.count_documents({})
        plaintiffs_count = await db.plaintiffs.count_documents({})
        cases_count = await db.cases.count_documents({})
        
        health_info = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "collections": {
                "law_firms": law_firms_count,
                "plaintiffs": plaintiffs_count,
                "cases": cases_count
            }
        }
        
        logger.info(f"Database health check passed: {health_info}")
        return health_info
        
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

async def reset_database():
    """Reset database by clearing all data and re-seeding."""
    try:
        logger.info("Resetting database...")
        
        # Initialize collections
        init_success = await initialize_collections()
        if not init_success:
            return False
            
        # Seed with sample data
        seed_success = await seed_sample_data()
        if not seed_success:
            return False
            
        logger.info("Database reset completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error resetting database: {e}")
        return False
