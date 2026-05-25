import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Bell, X, Check, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  type: 'TASK_SHARED' | 'STATUS_UPDATED';
  message: string;
  isRead: boolean;
  createdAt: string;
  task?: unknown;
  sender?: unknown;
}

export const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        // Backend might return { success: true, data: [...] } or just [...]
        const notifs = data.data || data;
        if (Array.isArray(notifs)) {
          setNotifications(notifs);
          setUnreadCount(notifs.filter(n => !n.isRead).length);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();

    // Initialize Socket.io
    const userStr = localStorage.getItem('user');
    let userId = '';
    if (userStr) {
      try {
        userId = JSON.parse(userStr)._id || JSON.parse(userStr).id;
      } catch (e) { }
    }

    // Connect to backend (using the same base URL as our API instance)
    const backendUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:5001';
    
    socketRef.current = io(backendUrl, {
      query: { userId }
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to real-time notification service');
    });

    socketRef.current.on('notification', (newNotif: Notification) => {
      toast.success(newNotif.message, { icon: '🔔' });
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from real-time service');
    });

    // Close panel on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 flex flex-col max-h-[80vh]"
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell size={16} className="text-emerald-600" />
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md transition-colors"
                  >
                    <Check size={12} />
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell size={20} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-medium">You're all caught up!</p>
                  <p className="text-xs mt-1 opacity-70">No new notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map(notif => (
                    <div 
                      key={notif._id}
                      className={cn(
                        "p-3 rounded-2xl transition-colors cursor-default relative overflow-hidden group",
                        notif.isRead 
                          ? "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50" 
                          : "bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20"
                      )}
                    >
                      {!notif.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                      )}
                      <div className="flex gap-3 items-start pl-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                          {notif.type === 'TASK_SHARED' ? '🤝' : '🔄'}
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <p className={cn(
                            "text-sm", 
                            notif.isRead ? "text-slate-600 dark:text-slate-300 font-medium" : "text-slate-900 dark:text-white font-bold"
                          )}>
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <Clock size={10} />
                            {formatTime(notif.createdAt)}
                          </div>
                        </div>
                        {!notif.isRead && (
                          <button 
                            onClick={() => markAsRead(notif._id)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                            title="Mark as read"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
