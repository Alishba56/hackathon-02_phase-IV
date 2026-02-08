'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { TaskDialog } from './task-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Task } from '@/types';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onToggleComplete, onDelete, onEdit }: TaskItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const priorityColors = {
    low: 'bg-accent/10 text-accent border-accent/30',
    medium: 'bg-primary/10 text-primary border-primary/30',
    high: 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/40',
  };

  return (
    <>
      <Card className={cn(
        'p-4 transition-all duration-300 hover:shadow-glow border-primary/20 bg-card/50 backdrop-blur-sm animate-fade-in-up',
        task.completed && 'opacity-60'
      )}>
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="pt-1">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggleComplete(task.id)}
              className="h-5 w-5"
            />
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className={cn(
                'text-lg font-medium transition-all duration-300',
                task.completed && 'line-through text-muted-foreground'
              )}>
                {task.title}
              </h3>

              {/* Priority Badge */}
              {task.priority && (
                <Badge
                  variant="outline"
                  className={cn('capitalize', priorityColors[task.priority])}
                >
                  {task.priority}
                </Badge>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p className={cn(
                'text-sm text-muted-foreground mb-3',
                task.completed && 'line-through'
              )}>
                {task.description}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="h-8 px-2 hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <TaskDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onTaskCreated={(updatedTask) => {
          onEdit(updatedTask);
          setIsEditDialogOpen(false);
        }}
        task={task}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border-primary/20 bg-card/95 backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="gradient-text">Delete Task</AlertDialogTitle>
            <AlertDialogDescription className="text-white">
              Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-primary/10 text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(task.id);
                setIsDeleteDialogOpen(false);
              }}
              className="bg-destructive text-white  hover:bg-destructive/90 hover:shadow-glow transition-all duration-300"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
