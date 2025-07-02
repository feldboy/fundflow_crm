from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date as date_type
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
    OVERDUE = "Overdue"
    ON_HOLD = "On Hold"

class TaskPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"
    CRITICAL = "Critical"

class TaskCategory(str, Enum):
    DOCUMENT_REVIEW = "Document Review"
    FOLLOW_UP = "Follow Up"
    UNDERWRITING = "Underwriting"
    RISK_ASSESSMENT = "Risk Assessment"
    COMMUNICATION = "Communication"
    FUNDING_DISBURSEMENT = "Funding Disbursement"
    SETTLEMENT_TRACKING = "Settlement Tracking"
    COMPLIANCE = "Compliance"
    ADMINISTRATIVE = "Administrative"
    LEGAL_REVIEW = "Legal Review"

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    category: TaskCategory
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.PENDING
    
    # Assignments
    assignedToId: Optional[str] = None  # Employee ID
    assignedById: str  # Employee ID who assigned the task
    
    # Related entities
    plaintiffId: Optional[str] = None
    fundingId: Optional[str] = None
    documentId: Optional[str] = None
    settlementId: Optional[str] = None
    
    # Timeline
    dueDate: Optional[datetime] = None
    estimatedHours: Optional[float] = Field(None, gt=0)
    actualHours: Optional[float] = Field(None, ge=0)
    
    # Task details
    instructions: Optional[str] = None
    checklist: Optional[List[str]] = None
    completedItems: Optional[List[str]] = None
    
    # Automation
    isRecurring: bool = False
    recurringPattern: Optional[str] = None  # CRON-like pattern
    autoAssign: bool = False
    
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[TaskCategory] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    assignedToId: Optional[str] = None
    dueDate: Optional[datetime] = None
    estimatedHours: Optional[float] = Field(None, gt=0)
    actualHours: Optional[float] = Field(None, ge=0)
    instructions: Optional[str] = None
    checklist: Optional[List[str]] = None
    completedItems: Optional[List[str]] = None
    isRecurring: Optional[bool] = None
    recurringPattern: Optional[str] = None
    autoAssign: Optional[bool] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class TaskInDB(TaskBase):
    id: str = Field(..., alias="_id")
    createdAt: datetime
    updatedAt: datetime
    startedAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None
    comments: List[str] = []  # Comment IDs
    timeEntries: List[str] = []  # Time entry IDs

    class Config:
        populate_by_name = True

class TaskResponse(TaskInDB):
    pass

# Model for task comments/updates
class TaskCommentBase(BaseModel):
    taskId: str
    authorId: str  # Employee ID
    content: str = Field(..., min_length=1)
    isInternal: bool = True  # Internal comment vs client-visible
    attachments: Optional[List[str]] = None  # Document IDs

class TaskCommentCreate(TaskCommentBase):
    pass

class TaskCommentUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1)
    isInternal: Optional[bool] = None
    attachments: Optional[List[str]] = None

class TaskCommentInDB(TaskCommentBase):
    id: str = Field(..., alias="_id")
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True

class TaskCommentResponse(TaskCommentInDB):
    pass

# Model for time tracking
class TimeEntryBase(BaseModel):
    taskId: str
    employeeId: str
    hours: float = Field(..., gt=0)
    description: Optional[str] = None
    billable: bool = True
    date: date_type = Field(default_factory=lambda: datetime.now().date())

class TimeEntryCreate(TimeEntryBase):
    pass

class TimeEntryUpdate(BaseModel):
    hours: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    billable: Optional[bool] = None
    date: Optional[date_type] = None

class TimeEntryInDB(TimeEntryBase):
    id: str = Field(..., alias="_id")
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True

class TimeEntryResponse(TimeEntryInDB):
    pass

# Workflow templates for common processes
class WorkflowTemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    category: TaskCategory
    isActive: bool = True
    
    # Template tasks
    tasks: List[Dict[str, Any]] = []  # Task templates
    
    # Automation rules
    triggers: Optional[List[str]] = None  # When to auto-create this workflow
    assignmentRules: Optional[Dict[str, Any]] = None
    
    estimatedDays: Optional[int] = Field(None, gt=0)
    requiredDocuments: Optional[List[str]] = None

class WorkflowTemplateCreate(WorkflowTemplateBase):
    pass

class WorkflowTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    category: Optional[TaskCategory] = None
    isActive: Optional[bool] = None
    tasks: Optional[List[Dict[str, Any]]] = None
    triggers: Optional[List[str]] = None
    assignmentRules: Optional[Dict[str, Any]] = None
    estimatedDays: Optional[int] = Field(None, gt=0)
    requiredDocuments: Optional[List[str]] = None

class WorkflowTemplateInDB(WorkflowTemplateBase):
    id: str = Field(..., alias="_id")
    createdAt: datetime
    updatedAt: datetime
    createdById: str  # Employee ID
    usageCount: int = 0

    class Config:
        populate_by_name = True

class WorkflowTemplateResponse(WorkflowTemplateInDB):
    pass
