import React, { useEffect, useRef, useState } from 'react';
import { Search, Bell, Calendar, Clock, Plus, Play, Pause, RotateCcw, Menu, Flag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { cn } from '../lib/utils';
import { Task } from '../types';
import { useSettings } from '../context/SettingsContext';
import { SearchBar } from './SearchBar';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const priorityConfig: Record<string, { dot: string; text: string; bg: string }> = {
  Low:    { dot: 'bg-sky-400',    text: 'text-sky-700',    bg: 'bg-sky-50' },
  Medium: { dot: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50' },
  High:   { dot: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50' },
  Urgent: { dot: 'bg-rose-500',   text: 'text-rose-700',   bg: 'bg-rose-50' },
};

/** Format a stored date string (any parseable) → "7 May 2025" */
const formatDate = (raw?: string): string => {
  if (!raw || raw === 'No Date') return 'No Date';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw; // return as-is if unparseable
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

// ─── Notification helpers ─────────────────────────────────────────────────────

interface Notification {
  id: string;
  type: 'completed' | 'approaching' | 'overdue';
  taskTitle: string;
  message: string;
  read: boolean;
}

const buildNotifications = (tasks: Task[]): Notification[] => {
  const now = new Date();
  const notes: Notification[] = [];

  tasks.forEach(task => {
    if (task.status === 'Completed') {
      notes.push({
        id: `completed-${task._id}`,
        type: 'completed',
        taskTitle: task.title,
        message: 'Task marked as completed.',
        read: false,
      });
    }

    const rawDate = task.dueDate || task.date;
    if (rawDate && rawDate !== 'No Date') {
      const due = new Date(rawDate);
      if (!isNaN(due.getTime())) {
        const diffMs = due.getTime() - now.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays < 0 && task.status !== 'Completed') {
          notes.push({
            id: `overdue-${task._id}`,
            type: 'overdue',
            taskTitle: task.title,
            message: `Overdue by ${Math.abs(Math.floor(diffDays))} day(s).`,
            read: false,
          });
        } else if (diffDays >= 0 && diffDays <= 2 && task.status !== 'Completed') {
          notes.push({
            id: `approaching-${task._id}`,
            type: 'approaching',
            taskTitle: task.title,
            message: diffDays < 1 ? 'Due today!' : `Due in ${Math.ceil(diffDays)} day(s).`,
            read: false,
          });
        }
      }
    }
  });

  return notes;
};

// ─── TaskCard ─────────────────────────────────────────────────────────────────

export const TaskCard: React.FC<{ task: Task; onClick: () => void; onDelete: () => void }> = ({ task, onClick, onDelete }) => {
  const pCfg = task.priority ? priorityConfig[task.priority] : null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 space-y-4 hover:shadow-xl transition-all cursor-pointer relative group flex flex-col justify-between h-full task-card shadow-sm hover:-translate-y-1"
    >
      <div className="space-y-4 flex-1">
          <div className="flex justify-between items-start">
          <span className={cn(
              "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
              task.status === 'In Progress' ? "bg-emerald-50 text-emerald-600" : 
              task.status === 'Pending' ? "bg-blue-50 text-blue-600" :
              task.status === 'Completed' ? "bg-slate-50 text-slate-400" :
              "bg-slate-100 text-slate-400"
          )}>
              <span className={cn("w-2 h-2 rounded-full", 
              task.status === 'In Progress' ? "bg-emerald-500" : 
              task.status === 'Pending' ? "bg-blue-500" :
              task.status === 'Completed' ? "bg-slate-400" :
              "bg-slate-300"
              )} />
              {task.status}
          </span>
          <button 
              className="text-[10px] font-bold uppercase tracking-widest text-[#006644] bg-emerald-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-100"
              onClick={(e) => {
                  e.stopPropagation();
                  onClick();
              }}
          >
              Details
          </button>
          </div>
          
          <div>
          <h3 className="font-bold text-slate-900 dark:text-white leading-snug text-lg">{task.title}</h3>
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed font-medium">{task.description}</p>
          </div>

          {/* Priority badge & Delete icon */}
          <div className="flex items-center justify-between">
            {pCfg && (
              <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", pCfg.bg, pCfg.text)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", pCfg.dot)} />
                {task.priority}
              </div>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this task?')) {
                  onDelete();
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
              title="Delete Task"
            >
              <Trash2 size={16} />
            </button>
          </div>
      </div>

      <div className="pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center mt-auto">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Clock size={14} />
            <span>{formatDate(task.dueDate || task.date)}</span>
          </div>
        </div>
        {task.assignee ? (
          <div className="flex items-center gap-2">
              {task.assignee.avatar ? (
                  <img src={task.assignee.avatar} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
              ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm ring-2 ring-white">
                      {task.assignee.initials}
                  </div>
              )}
          </div>
        ) : (
           <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white" />
        )}
      </div>
    </motion.div>
  );
};

// ─── Notification Panel ───────────────────────────────────────────────────────

const NotificationPanel: React.FC<{ notifications: Notification[]; onClose: () => void; onMarkRead: (id: string) => void }> = ({ notifications, onClose, onMarkRead }) => {
  const iconMap = {
    completed:  { emoji: '✅', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    approaching:{ emoji: '⏰', bg: 'bg-amber-50',   text: 'text-amber-600'  },
    overdue:    { emoji: '🔴', bg: 'bg-rose-50',    text: 'text-rose-600'   },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">Notifications</h4>
        <button onClick={onClose} className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-wider">Close</button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-slate-400 font-medium">No notifications</div>
        ) : (
          notifications.map(n => {
            const style = iconMap[n.type];
            return (
              <button
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className={cn("w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 flex items-start gap-3", !n.read && "bg-slate-50/60")}
              >
                <span className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0", style.bg)}>{style.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{n.taskTitle}</p>
                  <p className={cn("text-[10px] font-medium mt-0.5", style.text)}>{n.message}</p>
                </div>
                {!n.read && <span className="w-2 h-2 bg-rose-500 rounded-full mt-1 shrink-0" />}
              </button>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

// ─── Mini Time Tracker ────────────────────────────────────────────────────────

const MiniTimeTracker: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const [timeLeft, setTimeLeft] = useState(1500);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
  const [isTimeMenuOpen, setIsTimeMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const timeOptions = [
    { label: 'Pomodoro (25m)', value: 1500 },
    { label: 'Short Break (5m)', value: 300 },
    { label: 'Long Break (15m)', value: 900 },
    { label: 'Focus Session (50m)', value: 3000 },
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const activeTasks = tasks.filter(t => t.status !== 'Completed');

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-bold text-xs transition-all",
          timerActive
            ? "bg-[#0a2e1d] text-white border-transparent shadow-lg shadow-emerald-900/20"
            : "bg-white border-slate-100 text-slate-600 hover:border-slate-200 shadow-sm"
        )}
      >
        <Clock size={14} />
        <span className="font-mono">{formatTime(timeLeft)}</span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-12 w-64 bg-[#0a2e1d] rounded-2xl shadow-2xl z-50 p-5 space-y-4 overflow-hidden"
          >
            {/* Task selector */}
            <div className="relative">
              <button
                onClick={() => setIsTaskDropdownOpen(!isTaskDropdownOpen)}
                className="w-full text-left px-3 py-2 bg-white/10 rounded-xl text-[10px] font-bold text-emerald-100 uppercase tracking-wider hover:bg-white/20 transition-colors flex items-center justify-between"
              >
                <span className="truncate">{selectedTaskId ? activeTasks.find(t => t._id === selectedTaskId)?.title || 'Select task' : 'Select task'}</span>
                <Plus size={12} />
              </button>
              <AnimatePresence>
                {isTaskDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 top-10 w-full bg-white border border-slate-100 rounded-2xl shadow-xl z-20 p-2 overflow-hidden"
                  >
                    <div className="max-h-40 overflow-y-auto">
                      {activeTasks.map(task => (
                        <button
                          key={task._id}
                          onClick={() => { setSelectedTaskId(task._id); setIsTaskDropdownOpen(false); }}
                          className={cn("w-full text-left px-3 py-2.5 text-xs font-semibold rounded-xl transition-colors truncate block",
                            selectedTaskId === task._id ? "bg-emerald-50 text-emerald-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900")}
                        >
                          {task.title}
                        </button>
                      ))}
                      {activeTasks.length === 0 && (
                        <div className="px-3 py-4 text-center text-[10px] font-bold text-slate-400 uppercase">No active tasks</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Timer display */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <button
                  onClick={() => setIsTimeMenuOpen(!isTimeMenuOpen)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 text-emerald-100 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-white/20 transition-colors border border-white/10"
                >
                  <Clock size={10} /> Set Time
                </button>
                <AnimatePresence>
                  {isTimeMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-1/2 -translate-x-1/2 top-7 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 p-2 overflow-hidden"
                    >
                      {timeOptions.map(opt => (
                        <button
                          key={opt.label}
                          onClick={() => { setTimeLeft(opt.value); setTimerActive(false); setIsTimeMenuOpen(false); }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="text-4xl font-black text-white tracking-widest">{formatTime(timeLeft)}</div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <button
                onClick={() => { setTimerActive(false); setTimeLeft(1500); }}
                className="flex-1 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center border border-white/10"
              >
                <RotateCcw size={16} className="text-white" />
              </button>
              <button
                onClick={() => setTimerActive(!timerActive)}
                className={cn(
                  "flex-2 h-10 rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold text-xs shadow-lg",
                  timerActive ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                )}
              >
                {timerActive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                {timerActive ? 'Pause' : 'Start'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Tasks Component ─────────────────────────────────────────────────────

export const Tasks: React.FC<{ 
  tasks: Task[], 
  onNewTask: () => void, 
  onTaskClick: (task: Task) => void,
  onMenuClick: () => void,
  onSearch?: (query: string) => void,
  onDeleteTask: (id: string) => void
}> = ({ tasks, onNewTask, onTaskClick, onMenuClick, onSearch, onDeleteTask }) => {
  const { pushNotifications } = useSettings();
  const [statusFilter, setStatusFilter] = React.useState<string>('All');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Rebuild notifications whenever tasks change (only if push notifications enabled)
  useEffect(() => {
    if (pushNotifications) {
      setNotifications(buildNotifications(tasks));
    } else {
      setNotifications([]);
    }
  }, [tasks, pushNotifications]);

  useEffect(() => {
    if (containerRef.current) {
        gsap.fromTo(".task-card", 
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, stagger: 0.05, duration: 0.6, ease: "power2.out", clearProps: "all" }
        );
    }
  }, [statusFilter, tasks]);

  const filteredTasks = tasks.filter(task => {
    return statusFilter === 'All' || task.status === statusFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div className="space-y-10 pb-12" ref={containerRef}>

      {/* ── Custom Top Bar ── */}
      <header className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-between items-center">
        {/* Left: hamburger + search */}
        <div className="flex items-center gap-4 w-full lg:max-w-xl">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all active:scale-95"
          >
            <Menu size={24} />
          </button>
          {onSearch && (
            <SearchBar onSearch={onSearch} placeholder="Search tasks..." debounceMs={500} />
          )}
        </div>

        {/* Right: time tracker + notification bell */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <MiniTimeTracker tasks={tasks} />

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all relative"
            >
              <Bell size={20} strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              )}
            </button>
            <AnimatePresence>
              {isNotifOpen && (
                <NotificationPanel
                  notifications={notifications}
                  onClose={() => setIsNotifOpen(false)}
                  onMarkRead={markRead}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ── Filter row + Create button ── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
           <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm w-full md:w-auto overflow-x-auto custom-scrollbar">
             {['All', 'In Progress', 'Pending', 'Completed'].map(s => (
               <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex-1 md:flex-none whitespace-nowrap",
                  statusFilter === s ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "text-slate-400 hover:text-slate-900"
                )}
               >
                {s}
               </button>
             ))}
           </div>

           <div className="hidden lg:flex items-center gap-6 bg-white dark:bg-slate-800 p-3 px-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
             <div className="w-32 bg-slate-100 h-2 rounded-full relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-[#006644] rounded-full transition-all duration-500" style={{ width: filteredTasks.length > 0 ? `${(filteredTasks.filter(t => t.status === 'Completed').length / filteredTasks.length) * 100}%` : '0%' }} />
             </div>
             <span className="text-xs font-bold text-[#006644]">{filteredTasks.length > 0 ? Math.round((filteredTasks.filter(t => t.status === 'Completed').length / filteredTasks.length) * 100) : 0}% Done</span>
           </div>
        </div>

        <motion.button 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onNewTask}
          className="w-full md:w-auto px-8 py-3.5 bg-[#006644] text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-900/20 hover:bg-[#005236] transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Create Task
        </motion.button>
      </div>

      {/* ── Task Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredTasks.map(task => (
           <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} onDelete={() => onDeleteTask(task._id)} />
        ))}
        <motion.button 
          whileHover={{ scale: 0.98 }}
          onClick={onNewTask}
          className="bg-transparent border-2 border-dashed border-slate-200 p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-all min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
            <Plus size={24} />
          </div>
          <span className="font-semibold">Create New Task</span>
        </motion.button>
      </div>
    </div>
  );
};
