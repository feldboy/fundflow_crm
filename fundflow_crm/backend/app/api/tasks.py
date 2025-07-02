from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..models.task import (
    TaskCreate, TaskUpdate, TaskResponse,
    TaskCommentCreate, TaskCommentUpdate, TaskCommentResponse,
    TimeEntryCreate, TimeEntryUpdate, TimeEntryResponse,
    WorkflowTemplateCreate, WorkflowTemplateUpdate, WorkflowTemplateResponse
)
from ..core.database import get_database
from ..core.auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.post("/", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Create a new task"""
    task_dict = task.dict()
    task_dict["createdAt"] = datetime.utcnow()
    task_dict["updatedAt"] = datetime.utcnow()
    task_dict["comments"] = []
    task_dict["timeEntries"] = []
    
    result = db.tasks.insert_one(task_dict)
    task_dict["_id"] = str(result.inserted_id)
    
    return TaskResponse(**task_dict)

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    assigned_to_id: Optional[str] = Query(None),
    plaintiff_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    overdue_only: Optional[bool] = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get tasks with optional filtering"""
    query = {}
    if assigned_to_id:
        query["assignedToId"] = assigned_to_id
    if plaintiff_id:
        query["plaintiffId"] = plaintiff_id
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    if category:
        query["category"] = category
    if overdue_only:
        query["dueDate"] = {"$lt": datetime.utcnow()}
        query["status"] = {"$nin": ["Completed", "Cancelled"]}
    
    cursor = db.tasks.find(query).skip(skip).limit(limit).sort("dueDate", 1)
    tasks = []
    
    for task in cursor:
        task["_id"] = str(task["_id"])
        tasks.append(TaskResponse(**task))
    
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get a specific task"""
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    task = db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task["_id"] = str(task["_id"])
    return TaskResponse(**task)

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Update a task"""
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    update_data = {k: v for k, v in task_update.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    # Set completion timestamp if status is changing to completed
    if update_data.get("status") == "Completed":
        update_data["completedAt"] = datetime.utcnow()
    elif update_data.get("status") == "In Progress" and "startedAt" not in update_data:
        current_task = db.tasks.find_one({"_id": ObjectId(task_id)})
        if current_task and not current_task.get("startedAt"):
            update_data["startedAt"] = datetime.utcnow()
    
    result = db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    updated_task = db.tasks.find_one({"_id": ObjectId(task_id)})
    updated_task["_id"] = str(updated_task["_id"])
    
    return TaskResponse(**updated_task)

@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Delete a task"""
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    result = db.tasks.delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": "Task deleted successfully"}

# Task Comments endpoints
@router.post("/{task_id}/comments", response_model=TaskCommentResponse)
async def create_task_comment(
    task_id: str,
    comment: TaskCommentCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Add a comment to a task"""
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    # Verify task exists
    task = db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    comment_dict = comment.dict()
    comment_dict["createdAt"] = datetime.utcnow()
    comment_dict["updatedAt"] = datetime.utcnow()
    
    result = db.task_comments.insert_one(comment_dict)
    comment_dict["_id"] = str(result.inserted_id)
    
    # Add comment ID to task record
    db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$push": {"comments": str(result.inserted_id)}}
    )
    
    return TaskCommentResponse(**comment_dict)

@router.get("/{task_id}/comments", response_model=List[TaskCommentResponse])
async def get_task_comments(
    task_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get all comments for a task"""
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    cursor = db.task_comments.find({"taskId": task_id}).sort("createdAt", -1)
    comments = []
    
    for comment in cursor:
        comment["_id"] = str(comment["_id"])
        comments.append(TaskCommentResponse(**comment))
    
    return comments

# Time Entry endpoints
@router.post("/{task_id}/time", response_model=TimeEntryResponse)
async def create_time_entry(
    task_id: str,
    time_entry: TimeEntryCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Add a time entry to a task"""
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    # Verify task exists
    task = db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    time_entry_dict = time_entry.dict()
    time_entry_dict["createdAt"] = datetime.utcnow()
    time_entry_dict["updatedAt"] = datetime.utcnow()
    
    result = db.time_entries.insert_one(time_entry_dict)
    time_entry_dict["_id"] = str(result.inserted_id)
    
    # Add time entry ID to task record
    db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$push": {"timeEntries": str(result.inserted_id)}}
    )
    
    # Update actual hours on task
    total_hours = sum([entry["hours"] for entry in db.time_entries.find({"taskId": task_id})])
    db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"actualHours": total_hours}}
    )
    
    return TimeEntryResponse(**time_entry_dict)

@router.get("/{task_id}/time", response_model=List[TimeEntryResponse])
async def get_task_time_entries(
    task_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get all time entries for a task"""
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    cursor = db.time_entries.find({"taskId": task_id}).sort("date", -1)
    time_entries = []
    
    for entry in cursor:
        entry["_id"] = str(entry["_id"])
        time_entries.append(TimeEntryResponse(**entry))
    
    return time_entries

# Workflow Template endpoints
@router.post("/templates", response_model=WorkflowTemplateResponse)
async def create_workflow_template(
    template: WorkflowTemplateCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Create a new workflow template"""
    template_dict = template.dict()
    template_dict["createdAt"] = datetime.utcnow()
    template_dict["updatedAt"] = datetime.utcnow()
    template_dict["createdById"] = current_user["id"]
    template_dict["usageCount"] = 0
    
    result = db.workflow_templates.insert_one(template_dict)
    template_dict["_id"] = str(result.inserted_id)
    
    return WorkflowTemplateResponse(**template_dict)

@router.get("/templates", response_model=List[WorkflowTemplateResponse])
async def get_workflow_templates(
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Get workflow templates"""
    query = {}
    if category:
        query["category"] = category
    if is_active is not None:
        query["isActive"] = is_active
    
    cursor = db.workflow_templates.find(query)
    templates = []
    
    for template in cursor:
        template["_id"] = str(template["_id"])
        templates.append(WorkflowTemplateResponse(**template))
    
    return templates

@router.post("/templates/{template_id}/create-tasks")
async def create_tasks_from_template(
    template_id: str,
    plaintiff_id: str,
    assigned_to_id: Optional[str] = None,
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    """Create tasks from a workflow template"""
    if not ObjectId.is_valid(template_id):
        raise HTTPException(status_code=400, detail="Invalid template ID")
    
    template = db.workflow_templates.find_one({"_id": ObjectId(template_id)})
    if not template:
        raise HTTPException(status_code=404, detail="Workflow template not found")
    
    created_tasks = []
    for task_template in template.get("tasks", []):
        task_data = {
            "title": task_template.get("title"),
            "description": task_template.get("description"),
            "category": template["category"],
            "priority": task_template.get("priority", "Medium"),
            "plaintiffId": plaintiff_id,
            "assignedToId": assigned_to_id or task_template.get("assignedToId"),
            "assignedById": current_user["id"],
            "estimatedHours": task_template.get("estimatedHours"),
            "instructions": task_template.get("instructions"),
            "checklist": task_template.get("checklist"),
            "completedItems": [],
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "comments": [],
            "timeEntries": []
        }
        
        # Set due date based on template
        if task_template.get("daysFromStart"):
            from datetime import timedelta
            task_data["dueDate"] = datetime.utcnow() + timedelta(days=task_template["daysFromStart"])
        
        result = db.tasks.insert_one(task_data)
        task_data["_id"] = str(result.inserted_id)
        created_tasks.append(task_data)
    
    # Increment template usage count
    db.workflow_templates.update_one(
        {"_id": ObjectId(template_id)},
        {"$inc": {"usageCount": 1}}
    )
    
    return {"message": f"Created {len(created_tasks)} tasks from template", "tasks": created_tasks}
