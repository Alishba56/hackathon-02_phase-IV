'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { TaskList } from '@/components/task/task-list';
import { TaskDialog } from '@/components/task/task-dialog';
import { EmptyState } from '@/components/task/empty-state';
import ChatbotIcon from '@/components/ChatbotIcon';
import ChatWindow from '@/components/ChatWindow';
import type { ChatMessage } from '@/types/chat';

export default function DashboardPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  // Load conversation ID from localStorage on mount
  useEffect(() => {
    const savedConversationId = localStorage.getItem('conversationId');
    if (savedConversationId) {
      setConversationId(savedConversationId);
    }
  }, []);

  // Save conversation ID to localStorage when it changes
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem('conversationId', conversationId);
    }
  }, [conversationId]);

  // Load conversation history when chat opens
  useEffect(() => {
    if (isChatOpen && conversationId && chatMessages.length === 0) {
      loadConversationHistory();
    }
  }, [isChatOpen, conversationId]);

  const loadConversationHistory = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId || !conversationId) {
        return;
      }

      const response = await fetch(
        `${apiUrl}/api/${userId}/conversations/${conversationId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load conversation history');
      }

      const data = await response.json();

      // Convert to ChatMessage format
      const messages: ChatMessage[] = data.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        toolCalls: msg.tool_calls ? JSON.parse(msg.tool_calls) : undefined
      }));

      setChatMessages(messages);
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Fetch tasks from backend
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No authentication token found');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    // Clear any previous errors
    setChatError(null);
    setLastFailedMessage(null);

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    setIsChatLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId'); // Assuming userId is stored

      if (!token || !userId) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${apiUrl}/api/${userId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: message
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to send message');
      }

      const data = await response.json();

      // Update conversation ID if new
      if (!conversationId) {
        setConversationId(data.conversation_id);
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        toolCalls: data.tool_calls
      };
      setChatMessages(prev => [...prev, assistantMessage]);

      // Refresh tasks if tools were called
      if (data.tool_calls && data.tool_calls.length > 0) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Store failed message for retry
      setLastFailedMessage(message);

      // Set user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Connection error. Please check your internet connection.';
      setChatError(errorMessage);

      // Remove the user message that failed
      setChatMessages(prev => prev.slice(0, -1));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSendMessage(lastFailedMessage);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 animate-fade-in-up">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <h1 className="text-5xl font-bold gradient-text">My Tasks</h1>
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-lg text-muted-foreground">
              Manage your tasks with ease and style
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setIsDialogOpen(true)}
            className="hidden md:flex bg-gradient-to-r from-primary to-accent hover:shadow-glow-lg transition-all duration-300 hover:scale-105 gap-2 whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            Add Task
          </Button>
        </div>

        {/* Task List or Empty State */}
        <div className="animate-fade-in-up animation-delay-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState onAddTask={() => setIsDialogOpen(true)} />
          ) : (
            <TaskList tasks={tasks} onTaskUpdate={setTasks} />
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <Button
        size="lg"
        onClick={() => setIsDialogOpen(true)}
        className="md:hidden fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-glow-lg bg-gradient-to-r from-primary to-accent hover:scale-110 transition-all duration-300 z-50"
      >
        <Plus className="h-7 w-7" />
      </Button>

      {/* Task Dialog */}
      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onTaskCreated={(newTask) => {
          setTasks([...tasks, newTask]);
          setIsDialogOpen(false);
        }}
      />

      {/* AI Chatbot - Phase III */}
      {isAuthenticated && (
        <>
          <ChatbotIcon
            onClick={() => setIsChatOpen(!isChatOpen)}
            hasNewMessages={false}
          />
          <ChatWindow
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            error={chatError}
            onRetry={handleRetry}
          />
        </>
      )}
    </div>
  );
}
