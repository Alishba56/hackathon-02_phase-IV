'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Task } from '@/types';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: (task: Task) => void;
  task?: Task;
}

export function TaskDialog({ open, onOpenChange, onTaskCreated, task }: TaskDialogProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task?.priority || 'medium');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      if (task) {
        // Update existing task
        const response = await fetch(`${apiUrl}/api/tasks/${task.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            priority,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update task');
        }

        const updatedTask = await response.json();
        onTaskCreated(updatedTask);
      } else {
        // Create new task
        const response = await fetch(`${apiUrl}/api/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            priority,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create task');
        }

        const newTask = await response.json();
        onTaskCreated(newTask);
      }

      setIsLoading(false);

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-primary/20 bg-card/95 backdrop-blur-sm animate-fade-in-up">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription className="text-white">
            {task ? 'Update your task details below.' : 'Add a new task to your list. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2 animate-fade-in-up animation-delay-100">
              <Label htmlFor="title" className="text-sm text-white font-medium">Title</Label>
              <Input
                id="title"
                placeholder="Enter task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
                className="text-black focus-visible:ring-primary border-primary/20"
              />
            </div>

            <div className="grid gap-2 animate-fade-in-up animation-delay-200">
              <Label htmlFor="description" className="text-sm text-white font-medium">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Add more details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-black focus-visible:ring-primary border-primary/20"
              />
            </div>

            <div className="grid gap-2 animate-fade-in-up animation-delay-300">
              <Label htmlFor="priority" className="text-sm text-white font-medium">Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger id="priority" className="focus:ring-primary  border-primary/20">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="border-primary/20 text-white bg-card/95 backdrop-blur-sm">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 animate-fade-in-up animation-delay-400">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="hover:bg-primary/10 text-white border-primary/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="bg-gradient-to-r text-white from-primary to-accent hover:shadow-glow-lg transition-all duration-300 hover:scale-105"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </span>
              ) : (
                task ? 'Update Task' : 'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
