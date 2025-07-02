from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from typing import List
from datetime import datetime
from bson import ObjectId
import uuid
import aiofiles
from fastapi.responses import FileResponse
import os

from app.core.database import get_database
from app.models.document import DocumentCreate, DocumentUpdate, DocumentResponse, DocumentInDB

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

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(plaintiff_id: str, file: UploadFile = File(...), db=Depends(get_database)):
    """Upload a document and create a record"""
    
    # Generate a unique filename to avoid collisions
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"/Users/yaronfeldboy/Documents/rocketcopy/fundflow_crm/backend/uploads/{unique_filename}"
    
    # Save the file
    try:
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    # Create document record
    document_data = {
        "plaintiffId": plaintiff_id,
        "documentType": "Other", # Or determine from file type or user input
        "fileName": unique_filename,
        "originalName": file.filename,
        "storagePath": file_path,
        "contentType": file.content_type,
        "size": file.size,
        "status": "Received",
        "uploadTimestamp": datetime.utcnow(),
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    document = DocumentCreate(**document_data)
    result = await db.documents.insert_one(document.dict())
    created_document = await db.documents.find_one({"_id": result.inserted_id})

    if not created_document:
        raise HTTPException(status_code=500, detail="Failed to create document record")

    # Update plaintiff's documents list
    await db.plaintiffs.update_one(
        {"_id": ObjectId(plaintiff_id)},
        {"$push": {"documents": str(result.inserted_id)}}
    )

    created_document = convert_objectid(created_document)
    return DocumentResponse(**created_document)

@router.get("/{document_id}/download")
async def download_document(document_id: str, db=Depends(get_database)):
    """Download a document file"""
    try:
        document = await db.documents.find_one({"_id": ObjectId(document_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid document ID")

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = document.get("storagePath")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(path=file_path, filename=document.get("originalName"), media_type=document.get("contentType"))
