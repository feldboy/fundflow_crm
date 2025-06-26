"""
Mock database for development when MongoDB is not available
"""
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid

class MockDatabase:
    def __init__(self):
        self.collections = {
            'plaintiffs': [],
            'law_firms': [],
            'employees': [],
            'communications': [],
            'documents': []
        }
        
    def __getattr__(self, name):
        """Allow accessing collections as attributes (e.g., db.plaintiffs)"""
        if name in self.collections:
            return MockCollection(self, name)
        raise AttributeError(f"'{self.__class__.__name__}' object has no attribute '{name}'")
        
    async def insert_one(self, collection_name: str, document: Dict[str, Any]) -> Dict[str, Any]:
        """Insert a document into a collection"""
        if collection_name not in self.collections:
            self.collections[collection_name] = []
        
        # Add ID and timestamps
        document['_id'] = str(uuid.uuid4())
        document['created_at'] = datetime.utcnow()
        document['updated_at'] = datetime.utcnow()
        
        self.collections[collection_name].append(document)
        return document
    
    async def find_one(self, collection_name: str, filter_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Find one document in a collection"""
        if collection_name not in self.collections:
            return None
        
        for doc in self.collections[collection_name]:
            if all(doc.get(key) == value for key, value in filter_dict.items()):
                return doc
        return None
    
    async def find(self, collection_name: str, filter_dict: Dict[str, Any] = None, limit: int = None) -> List[Dict[str, Any]]:
        """Find documents in a collection"""
        if collection_name not in self.collections:
            return []
        
        docs = self.collections[collection_name]
        
        if filter_dict:
            docs = [doc for doc in docs if all(doc.get(key) == value for key, value in filter_dict.items())]
        
        if limit:
            docs = docs[:limit]
        
        return docs
    
    async def update_one(self, collection_name: str, filter_dict: Dict[str, Any], update_dict: Dict[str, Any]) -> bool:
        """Update one document in a collection"""
        if collection_name not in self.collections:
            return False
        
        for doc in self.collections[collection_name]:
            if all(doc.get(key) == value for key, value in filter_dict.items()):
                doc.update(update_dict.get('$set', {}))
                doc['updated_at'] = datetime.utcnow()
                return True
        return False
    
    async def delete_one(self, collection_name: str, filter_dict: Dict[str, Any]) -> bool:
        """Delete one document from a collection"""
        if collection_name not in self.collections:
            return False
        
        for i, doc in enumerate(self.collections[collection_name]):
            if all(doc.get(key) == value for key, value in filter_dict.items()):
                del self.collections[collection_name][i]
                return True
        return False
    
    def get_collection(self, collection_name: str):
        """Get a collection (mock)"""
        return MockCollection(self, collection_name)

class MockCollection:
    def __init__(self, db: MockDatabase, collection_name: str):
        self.db = db
        self.collection_name = collection_name
    
    async def insert_one(self, document: Dict[str, Any]):
        result = await self.db.insert_one(self.collection_name, document.copy())
        return MockInsertResult(result['_id'])
    
    async def find_one(self, filter_dict: Dict[str, Any]):
        return await self.db.find_one(self.collection_name, filter_dict)
    
    def find(self, filter_dict: Dict[str, Any] = None):
        # Return a cursor that will fetch results lazily
        return MockCursor(self.db, self.collection_name, filter_dict or {})
    
    async def update_one(self, filter_dict: Dict[str, Any], update_dict: Dict[str, Any]):
        success = await self.db.update_one(self.collection_name, filter_dict, update_dict)
        return MockUpdateResult(success)
    
    async def delete_one(self, filter_dict: Dict[str, Any]):
        success = await self.db.delete_one(self.collection_name, filter_dict)
        return MockDeleteResult(success)
    
    async def count_documents(self, filter_dict: Dict[str, Any] = None):
        """Count documents in the collection"""
        results = await self.db.find(self.collection_name, filter_dict or {})
        return len(results)
    
    def aggregate(self, pipeline: List[Dict[str, Any]]):
        """Mock aggregate method for pipeline operations"""
        return MockAggregationCursor(self.db, self.collection_name, pipeline)

class MockInsertResult:
    def __init__(self, inserted_id: str):
        self.inserted_id = inserted_id

class MockUpdateResult:
    def __init__(self, success: bool):
        self.matched_count = 1 if success else 0
        self.modified_count = 1 if success else 0

class MockDeleteResult:
    def __init__(self, success: bool):
        self.deleted_count = 1 if success else 0

class MockCursor:
    def __init__(self, db_or_documents, collection_name=None, filter_dict=None):
        # Support both old and new initialization patterns
        if isinstance(db_or_documents, list):
            # Old pattern: MockCursor(documents)
            self.documents = db_or_documents
            self.db = None
            self.collection_name = None
            self.filter_dict = {}
        else:
            # New pattern: MockCursor(db, collection_name, filter_dict)
            self.db = db_or_documents
            self.collection_name = collection_name
            self.filter_dict = filter_dict or {}
            self.documents = None  # Will be loaded lazily
            
        self.index = 0
        self._sort_field = None
        self._sort_direction = 1
        self._skip_count = 0
        self._limit_count = None
    
    def sort(self, field: str, direction: int = 1):
        """Sort documents by field"""
        self._sort_field = field
        self._sort_direction = direction
        return self
    
    def skip(self, count: int):
        """Skip documents"""
        self._skip_count = count
        return self
    
    def limit(self, count: int):
        """Limit number of documents"""
        self._limit_count = count
        return self
    
    def __aiter__(self):
        return self
    
    async def __anext__(self):
        processed_docs = await self._get_processed_documents()
        if self.index >= len(processed_docs):
            raise StopAsyncIteration
        doc = processed_docs[self.index]
        self.index += 1
        return doc
    
    async def _get_processed_documents(self):
        """Apply sorting, skip, and limit to documents"""
        # Load documents if not already loaded
        if self.documents is None and self.db is not None:
            self.documents = await self.db.find(self.collection_name, self.filter_dict)
        
        docs = (self.documents or []).copy()
        
        # Apply sorting
        if self._sort_field:
            def sort_key(doc):
                value = doc.get(self._sort_field, "")
                # Handle datetime objects
                if hasattr(value, 'timestamp'):
                    return value.timestamp()
                return value
            
            docs.sort(key=sort_key, reverse=(self._sort_direction == -1))
        
        # Apply skip and limit
        if self._skip_count > 0:
            docs = docs[self._skip_count:]
        
        if self._limit_count is not None:
            docs = docs[:self._limit_count]
        
        return docs
    
    async def to_list(self, length=None):
        processed_docs = await self._get_processed_documents()
        if length is None:
            return processed_docs
        return processed_docs[:length]

class MockAggregationCursor:
    def __init__(self, db: MockDatabase, collection_name: str, pipeline: List[Dict[str, Any]]):
        self.db = db
        self.collection_name = collection_name
        self.pipeline = pipeline
    
    async def to_list(self, length=None):
        """Process aggregation pipeline and return results"""
        # Get all documents from the collection
        all_docs = await self.db.find(self.collection_name, {})
        
        # For now, implement basic $group aggregation for stage counting
        results = []
        if self.pipeline and len(self.pipeline) > 0:
            stage = self.pipeline[0]
            if "$group" in stage:
                group_stage = stage["$group"]
                if "_id" in group_stage and "count" in group_stage:
                    # Group by the specified field and count
                    field_name = group_stage["_id"].replace("$", "")
                    counts = {}
                    
                    for doc in all_docs:
                        value = doc.get(field_name, "unknown")
                        if value in counts:
                            counts[value] += 1
                        else:
                            counts[value] = 1
                    
                    # Convert to aggregation result format
                    for key, count in counts.items():
                        results.append({"_id": key, "count": count})
        
        if length is None:
            return results
        return results[:length]

# Global mock database instance
mock_db = MockDatabase()
