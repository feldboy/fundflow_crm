from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from typing import List
from datetime import datetime
from bson import ObjectId
import uuid

from app.core.database import get_database
from app.models.document import DocumentCreate, DocumentUpdate, DocumentResponse

router = APIRouter()

def convert_objectid(item):
    if isinstance(item, dict):
        for key, value in item.items():
            if isinstance(value, ObjectId):
                item[key] = str(value)
            elif isinstance(value, dict):
                convert_objectid(value)
            elif isinstance(value, list):
                for i, v in enumerate(value):
                    if isinstance(v, ObjectId):
                        value[i] = str(v)
                    elif isinstance(v, dict):
                        convert_objectid(v)
    return item

@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(document: DocumentCreate, db=Depends(get_database)):
    """Create a new document record"""
    document_dict = document.dict()
    document_dict["uploadTimestamp"] = datetime.utcnow()
    document_dict["createdAt"] = datetime.utcnow()
    document_dict["updatedAt"] = datetime.utcnow()
    
    result = await db.documents.insert_one(document_dict)
    created_document = await db.documents.find_one({"_id": result.inserted_id})
    
    if not created_document:
        raise HTTPException(status_code=500, detail="Failed to create document")
    
    # Update plaintiff's documents list
    if document.plaintiffId:
        await db.plaintiffs.update_one(
            {"_id": ObjectId(document.plaintiffId)},
            {"$push": {"documents": str(result.inserted_id)}}
        )
    
    created_document = convert_objectid(created_document)
    return DocumentResponse(**created_document)

@router.get("/", response_model=List[DocumentResponse])
async def get_documents(
    skip: int = 0, 
    limit: int = 100,
    plaintiff_id: str = None,
    status_filter: str = None,
    db=Depends(get_database)
):
    """Get documents with optional filtering"""
    query = {}
    
    if plaintiff_id:
        query["plaintiffId"] = plaintiff_id
    
    if status_filter:
        query["status"] = status_filter
    
    cursor = db.documents.find(query).sort("uploadTimestamp", -1).skip(skip).limit(limit)
    documents = await cursor.to_list(length=limit)
    
    return [DocumentResponse(**convert_objectid(doc)) for doc in documents]

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str, db=Depends(get_database)):
    """Get a specific document by ID"""
    try:
        document = await db.documents.find_one({"_id": ObjectId(document_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid document ID")
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    document = convert_objectid(document)
    return DocumentResponse(**document)

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(document_id: str, document_update: DocumentUpdate, db=Depends(get_database)):
    """Update a document"""
    try:
        object_id = ObjectId(document_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid document ID")
    
    update_data = {k: v for k, v in document_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updatedAt"] = datetime.utcnow()
    
    result = await db.documents.update_one(
        {"_id": object_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    
    updated_document = await db.documents.find_one({"_id": object_id})
    updated_document = convert_objectid(updated_document)
    return DocumentResponse(**updated_document)

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: str, db=Depends(get_database)):
    """Delete a document"""
    try:
        object_id = ObjectId(document_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid document ID")
    
    # Get the document first to remove from plaintiff's documents list
    document = await db.documents.find_one({"_id": object_id})
    if document and document.get("plaintiffId"):
        await db.plaintiffs.update_one(
            {"_id": ObjectId(document["plaintiffId"])},
            {"$pull": {"documents": document_id}}
        )
    
    result = await db.documents.delete_one({"_id": object_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    plaintiff_id: str = None, 
    document_type: str = "Other",
    db=Depends(get_database)
):
    """Upload a file and create document record"""
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")
    
    # Validate file size (10MB limit)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    file_size = 0
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, 
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Reset file pointer
    await file.seek(0)
    
    try:
        # For now, we'll store file info in database and return success
        # In production, this would upload to S3/Google Cloud Storage
        
        import uuid
        file_id = str(uuid.uuid4())
        
        # Create document record
        document_data = {
            "filename": file.filename,
            "originalName": file.filename,
            "contentType": file.content_type,
            "size": file_size,
            "fileId": file_id,
            "documentType": document_type,
            "plaintiffId": plaintiff_id,
            "status": "uploaded",
            "uploadTimestamp": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            # For demo purposes, we'll store a hash instead of actual file
            "storageMethod": "local_demo",
            "notes": "File uploaded successfully - Demo mode (file not actually stored)"
        }
        
        # Insert document record
        result = await db.documents.insert_one(document_data)
        document_data["_id"] = str(result.inserted_id)
        
        # Update plaintiff's documents list if plaintiff_id provided
        if plaintiff_id:
            from app.core.database import use_mock_db
            from bson import ObjectId
            
            if use_mock_db:
                plaintiff = await db.plaintiffs.find_one({"_id": plaintiff_id})
            else:
                try:
                    plaintiff = await db.plaintiffs.find_one({"_id": ObjectId(plaintiff_id)})
                except:
                    # Invalid ObjectId format
                    pass
            
            if plaintiff:
                if use_mock_db:
                    await db.plaintiffs.update_one(
                        {"_id": plaintiff_id},
                        {"$push": {"documents": str(result.inserted_id)}}
                    )
                else:
                    await db.plaintiffs.update_one(
                        {"_id": ObjectId(plaintiff_id)},
                        {"$push": {"documents": str(result.inserted_id)}}
                    )
        
        return {
            "success": True,
            "message": "File uploaded successfully",
            "document": convert_objectid(document_data),
            "file_info": {
                "filename": file.filename,
                "content_type": file.content_type,
                "size": file_size,
                "file_id": file_id
            }
        }
        
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file: {str(e)}"
        )
