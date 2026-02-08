// Shared type definitions for the application

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type Theme = 'light' | 'dark';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}