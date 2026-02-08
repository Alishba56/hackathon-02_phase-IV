from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from models import PriorityEnum


class TaskCreate(BaseModel):
    """Schema for creating a new task"""
    title: str = Field(..., min_length=1, max_length=200, description="Task title (required)")
    description: Optional[str] = Field(None, max_length=1000, description="Optional detailed description")
    priority: Optional[PriorityEnum] = Field(None, description="Task priority level")
    due_date: Optional[datetime] = Field(None, description="Optional due date")


class TaskUpdate(BaseModel):
    """Schema for updating an existing task - all fields optional"""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Task title")
    description: Optional[str] = Field(None, max_length=1000, description="Task description")
    completed: Optional[bool] = Field(None, description="Task completion status")
    priority: Optional[PriorityEnum] = Field(None, description="Task priority level")
    due_date: Optional[datetime] = Field(None, description="Task due date")


class TaskResponse(BaseModel):
    """Schema for task API responses"""
    id: str
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    priority: Optional[PriorityEnum]
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
