"""
MCP (Model Context Protocol) tool executor framework.
Implements all tools for AI chatbot task management and user profile queries.
"""
from typing import Dict, Any, Optional
from sqlmodel import Session, select
from models import Task, User
from datetime import datetime
import uuid


class MCPToolExecutor:
    """Executor for MCP tools with user_id validation and ownership enforcement"""

    def __init__(self, session: Session, user_id: str):
        """
        Initialize tool executor with database session and user context.

        Args:
            session: SQLModel database session
            user_id: Authenticated user ID (from JWT)
        """
        self.session = session
        self.user_id = user_id

    def execute_tool(self, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a tool by name with given parameters.

        Args:
            tool_name: Name of the tool to execute
            parameters: Tool parameters

        Returns:
            Dict with success status, data, and optional error message
        """
        tool_map = {
            "add_task": self.add_task,
            "list_tasks": self.list_tasks,
            "complete_task": self.complete_task,
            "delete_task": self.delete_task,
            "update_task": self.update_task,
            "get_user_profile": self.get_user_profile
        }

        if tool_name not in tool_map:
            return {
                "success": False,
                "error": f"Unknown tool: {tool_name}"
            }

        try:
            return tool_map[tool_name](**parameters)
        except Exception as e:
            return {
                "success": False,
                "error": f"Tool execution failed: {str(e)}"
            }

    def add_task(self, title: str, description: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a new task for the authenticated user.

        Args:
            title: Task title
            description: Optional task description

        Returns:
            Dict with success status and task data
        """
        try:
            task = Task(
                id=str(uuid.uuid4()),
                user_id=self.user_id,
                title=title,
                description=description,
                completed=False
            )
            self.session.add(task)
            self.session.commit()
            self.session.refresh(task)

            return {
                "success": True,
                "data": {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "created_at": task.created_at.isoformat()
                }
            }
        except Exception as e:
            self.session.rollback()
            return {
                "success": False,
                "error": f"Failed to create task: {str(e)}"
            }

    def list_tasks(self, status: Optional[str] = None) -> Dict[str, Any]:
        """
        List tasks for the authenticated user with optional status filter.

        Args:
            status: Optional filter - 'pending', 'completed', or None for all

        Returns:
            Dict with success status and markdown-formatted task table
        """
        try:
            query = select(Task).where(Task.user_id == self.user_id)

            if status == "pending":
                query = query.where(Task.completed == False)
            elif status == "completed":
                query = query.where(Task.completed == True)

            tasks = self.session.exec(query).all()

            if not tasks:
                return {
                    "success": True,
                    "data": "No tasks found."
                }

            # Create markdown table format (AI models preserve tables better)
            table_lines = ["```"]
            table_lines.append("ID       | Title                    | Status")
            table_lines.append("---------|--------------------------|----------")

            for task in tasks:
                task_id = task.id[:8]
                task_title = task.title[:24].ljust(24)  # Truncate and pad to 24 chars
                task_status = "Completed" if task.completed else "Pending  "
                table_lines.append(f"{task_id} | {task_title} | {task_status}")

            table_lines.append("```")

            # Return markdown table
            return {
                "success": True,
                "data": "\n".join(table_lines)
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to list tasks: {str(e)}"
            }

    def complete_task(self, task_id: str) -> Dict[str, Any]:
        """
        Mark a task as completed.

        Args:
            task_id: Task UUID

        Returns:
            Dict with success status and updated task data
        """
        try:
            task = self.session.get(Task, task_id)

            if not task:
                return {
                    "success": False,
                    "error": "Task not found. Please check the task ID."
                }

            if task.user_id != self.user_id:
                return {
                    "success": False,
                    "error": "You don't have permission to access this task."
                }

            task.completed = True
            task.updated_at = datetime.utcnow()
            self.session.commit()
            self.session.refresh(task)

            return {
                "success": True,
                "data": {
                    "id": task.id,
                    "title": task.title,
                    "completed": task.completed,
                    "updated_at": task.updated_at.isoformat()
                }
            }
        except Exception as e:
            self.session.rollback()
            return {
                "success": False,
                "error": f"Failed to complete task: {str(e)}"
            }

    def delete_task(self, task_id: str) -> Dict[str, Any]:
        """
        Delete a task permanently.

        Args:
            task_id: Task UUID

        Returns:
            Dict with success status and deleted task info
        """
        try:
            task = self.session.get(Task, task_id)

            if not task:
                return {
                    "success": False,
                    "error": "Task not found. Please check the task ID."
                }

            if task.user_id != self.user_id:
                return {
                    "success": False,
                    "error": "You don't have permission to access this task."
                }

            title = task.title
            self.session.delete(task)
            self.session.commit()

            return {
                "success": True,
                "data": {
                    "id": task_id,
                    "title": title
                }
            }
        except Exception as e:
            self.session.rollback()
            return {
                "success": False,
                "error": f"Failed to delete task: {str(e)}"
            }

    def update_task(
        self,
        task_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        completed: Optional[bool] = None
    ) -> Dict[str, Any]:
        """
        Update task fields.

        Args:
            task_id: Task UUID
            title: New title (optional)
            description: New description (optional)
            completed: New completion status (optional)

        Returns:
            Dict with success status and updated task data
        """
        try:
            task = self.session.get(Task, task_id)

            if not task:
                return {
                    "success": False,
                    "error": "Task not found. Please check the task ID."
                }

            if task.user_id != self.user_id:
                return {
                    "success": False,
                    "error": "You don't have permission to access this task."
                }

            if title is not None:
                task.title = title
            if description is not None:
                task.description = description
            if completed is not None:
                task.completed = completed

            task.updated_at = datetime.utcnow()
            self.session.commit()
            self.session.refresh(task)

            return {
                "success": True,
                "data": {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "updated_at": task.updated_at.isoformat()
                }
            }
        except Exception as e:
            self.session.rollback()
            return {
                "success": False,
                "error": f"Failed to update task: {str(e)}"
            }

    def get_user_profile(self) -> Dict[str, Any]:
        """
        Get authenticated user's profile information.

        Returns:
            Dict with success status and user profile data
        """
        try:
            user = self.session.get(User, self.user_id)

            if not user:
                return {
                    "success": False,
                    "error": "User not found."
                }

            return {
                "success": True,
                "data": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "created_at": user.created_at.isoformat()
                }
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get user profile: {str(e)}"
            }
