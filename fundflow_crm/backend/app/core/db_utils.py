"""
Database utility functions to work with both MongoDB and mock database
"""
from typing import Dict, Any, List, Optional
from app.core.database import use_mock_db
from bson import ObjectId

def is_mock_database() -> bool:
    """Check if we're using the mock database"""
    return use_mock_db

def convert_query_for_mock(query: Dict[str, Any]) -> Dict[str, Any]:
    """Convert MongoDB query to work with mock database"""
    if not query:
        return {}
    
    mock_query = {}
    for key, value in query.items():
        if key == "$or":
            # For mock database, we'll handle OR queries differently
            # For now, we'll just ignore them and return all results
            continue
        elif isinstance(value, dict) and "$regex" in value:
            # Convert regex queries to simple contains checks
            regex_value = value["$regex"]
            mock_query[f"{key}__contains"] = regex_value.lower()
        else:
            mock_query[key] = value
    
    return mock_query

def convert_objectid_for_query(query: Dict[str, Any]) -> Dict[str, Any]:
    """Convert ObjectId in query for proper comparison"""
    converted = {}
    for key, value in query.items():
        if key == "_id" and isinstance(value, ObjectId):
            converted[key] = str(value)
        else:
            converted[key] = value
    return converted

async def find_documents(collection, query: Dict[str, Any], skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    """Universal find function that works with both MongoDB and mock database"""
    if is_mock_database():
        # Handle mock database
        mock_query = convert_query_for_mock(query)
        all_docs = await collection.find({})
        results = await all_docs.to_list()
        
        # Apply manual filtering for complex queries
        if "$or" in query:
            or_conditions = query["$or"]
            filtered_results = []
            for doc in results:
                for condition in or_conditions:
                    for field, criteria in condition.items():
                        if isinstance(criteria, dict) and "$regex" in criteria:
                            field_value = str(doc.get(field, "")).lower()
                            search_value = criteria["$regex"].lower()
                            if search_value in field_value:
                                filtered_results.append(doc)
                                break
                    else:
                        continue
                    break
            results = filtered_results
        
        # Apply other filters
        for key, value in query.items():
            if key != "$or":
                results = [doc for doc in results if doc.get(key) == value]
        
        # Apply skip and limit
        return results[skip:skip + limit]
    else:
        # Handle real MongoDB
        cursor = collection.find(query).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

async def find_one_document(collection, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Universal find_one function that works with both MongoDB and mock database"""
    if is_mock_database():
        query = convert_objectid_for_query(query)
    
    return await collection.find_one(query)
