/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/DashboardOverview';
import { Tasks } from './components/Tasks';
import { Analytics } from './components/Analytics';
import { Team } from './components/Team';
import { Settings } from './components/Settings';
import { Help } from './components/Help';
import { Auth } from './components/Auth';
import { TaskCreationModal } from './components/TaskCreationModal';
import { TaskDetails } from './components/TaskDetails';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from './types';
import api from './lib/api';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationPanel } from './components/NotificationPanel';
import { ErrorBoundary } from './components/ErrorBoundary';

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }

    const handleAuthError = () => {
      setIsAuthenticated(false);
      navigate('/auth');
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, [navigate]);

  const fetchTasks = async (search = '') => {
    try {
      const { data } = await api.get('/tasks', { params: { search } });
      setTasks(data);
    } catch (error) {
      if (axios.isCancel(error)) return; // Ignore canceled requests
      console.error("Failed to fetch tasks:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks(globalSearchQuery);
    }
  }, [isAuthenticated, globalSearchQuery]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsSidebarOpen(false);
    navigate('/auth');
  };

  const handleCreateTask = async (newTask: Omit<Task, '_id'>) => {
    try {
      const { data } = await api.post('/tasks', newTask);
      setTasks(prev => [data, ...prev]);
      setIsNewTaskModalOpen(false);
      navigate('/tasks');
      toast.success('Task created successfully');
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      const { data } = await api.put(`/tasks/${updatedTask._id}`, updatedTask);
      setTasks(prev => prev.map(t => t._id === updatedTask._id ? data : t));
      setSelectedTask(null);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error('Failed to delete task');
    }
  };

  if (!isAuthenticated && location.pathname !== '/auth') {
    return <Navigate to="/auth" replace />;
  }

  if (isAuthenticated && location.pathname === '/auth') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <ThemeProvider>
    <SettingsProvider>
    <div className="flex bg-[#f8fafc] dark:bg-slate-900 min-h-screen font-sans selection:bg-emerald-600/10 selection:text-emerald-600 overflow-x-hidden transition-colors duration-300">
      <Sidebar 
        onNewTask={() => {
          setIsNewTaskModalOpen(true);
          setIsSidebarOpen(false);
        }}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        taskCount={tasks.length}
      />
      
      <main className="flex-1 lg:ml-72 p-4 md:p-10 max-w-[1440px] mx-auto w-full transition-all relative">
        <div className="absolute top-4 right-4 md:top-10 md:right-10 z-50">
          <NotificationPanel />
        </div>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<PageWrapper><ErrorBoundary name="Dashboard"><Dashboard tasks={tasks} onMenuClick={() => setIsSidebarOpen(true)} /></ErrorBoundary></PageWrapper>} />
            <Route path="/tasks" element={
              <PageWrapper>
                <ErrorBoundary name="Tasks">
                  <Tasks 
                    tasks={tasks} 
                    onNewTask={() => setIsNewTaskModalOpen(true)} 
                    onTaskClick={setSelectedTask} 
                    onMenuClick={() => setIsSidebarOpen(true)}
                    onSearch={setGlobalSearchQuery}
                    onDeleteTask={handleDeleteTask}
                  />
                </ErrorBoundary>
              </PageWrapper>
            } />
            <Route path="/analytics" element={<PageWrapper><ErrorBoundary name="Analytics"><Analytics tasks={tasks} onMenuClick={() => setIsSidebarOpen(true)} /></ErrorBoundary></PageWrapper>} />
            <Route path="/team" element={<PageWrapper><ErrorBoundary name="Team"><Team tasks={tasks} onMenuClick={() => setIsSidebarOpen(true)} /></ErrorBoundary></PageWrapper>} />
            <Route path="/settings" element={<PageWrapper><ErrorBoundary name="Settings"><Settings onLogout={handleLogout} onMenuClick={() => setIsSidebarOpen(true)} /></ErrorBoundary></PageWrapper>} />
            <Route path="/help" element={<PageWrapper><ErrorBoundary name="Help"><Help onMenuClick={() => setIsSidebarOpen(true)} /></ErrorBoundary></PageWrapper>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      <TaskCreationModal 
        isOpen={isNewTaskModalOpen} 
        onClose={() => setIsNewTaskModalOpen(false)}
        onCreate={handleCreateTask}
      />

      <AnimatePresence>
        {selectedTask && (
          <TaskDetails 
            task={selectedTask} 
            onClose={() => setSelectedTask(null)} 
            onUpdate={handleUpdateTask}
          />
        )}
      </AnimatePresence>

      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#fff',
            color: '#0f172a',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            fontWeight: 600,
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' }
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#fff' }
          }
        }} 
      />
    </div>
    </SettingsProvider>
    </ThemeProvider>
  );
}

