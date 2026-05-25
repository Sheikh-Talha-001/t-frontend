import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { ArrowUpRight, CheckCircle2, RefreshCw, Clock, MoreHorizontal, Plus, RotateCcw, Play, Pause, Download, Mail, Bell, Search, Video, Calendar, Flag, LayoutDashboard, CheckSquare, Users, BarChart3, Settings, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { cn } from '../lib/utils';
import { Task } from '../types';
import { ProgressBar } from './ProgressBar';
import api from '../lib/api';
interface StatCardProps {
  title: string;
  value: number | string;
  change: string;
  color: 'green' | 'white';
  trend: 'up' | 'down' | 'neutral';
  icon?: React.ElementType;
  onClick?: () => void;
  hideArrow?: boolean;
}

const StatCard = ({ title, value, change, color, trend, icon: Icon, onClick, hideArrow }: StatCardProps) => (
  <motion.div 
    onClick={onClick}
    className={cn(
      "p-6 rounded-[32px] relative overflow-hidden flex flex-col justify-between h-44 shadow-sm group border transition-all duration-500",
      color === 'green' 
        ? "bg-linear-to-br from-[#1b5e40] to-[#0a2e1d] text-white border-transparent" 
        : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50",
      onClick && "cursor-pointer"
    )}
  >
    <div className="flex justify-between items-start">
      <div className="space-y-4">
        <h4 className={cn("text-sm font-semibold", color === 'green' ? "text-emerald-100/80" : "text-slate-500")}>
          {title}
        </h4>
        <div className="text-5xl font-extrabold tracking-tighter">{value}</div>
      </div>
      <div className={cn(
        "p-2.5 rounded-full border transition-colors",
        color === 'green' ? "bg-white/10 border-white/20 text-white" : "bg-slate-50 border-slate-100 text-slate-400 group-hover:text-slate-900",
        hideArrow && "opacity-0"
      )}>
        <ArrowUpRight size={20} />
      </div>
    </div>
    <div className="flex items-center gap-2 mt-4">
      <div className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
        color === 'green' ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
      )}>
        {!hideArrow && trend === 'up' && <ArrowUpRight size={10} />}
        <span>{trend === 'up' ? '5' : '2'}</span>
      </div>
      <span className={cn("text-[11px] font-medium", color === 'green' ? "text-emerald-100/60" : "text-slate-400")}>
        {change}
      </span>
    </div>
    {color === 'green' && (
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl"></div>
    )}
  </motion.div>
);

export const Dashboard: React.FC<{ tasks: Task[], onMenuClick: () => void }> = ({ tasks, onMenuClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [analyticsProgress, setAnalyticsProgress] = useState({
    totalTasks: 0,
    completedTasks: 0,
    completionPercentage: 0,
  });

  // Time Tracker State
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
  const [isTimeMenuOpen, setIsTimeMenuOpen] = useState(false);

  const timeOptions = [
    { label: 'Pomodoro (25m)', value: 1500 },
    { label: 'Short Break (5m)', value: 300 },
    { label: 'Long Break (15m)', value: 900 },
    { label: 'Focus Session (50m)', value: 3000 },
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(".dashboard-item", 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchProgressOverview = async () => {
      try {
        const { data } = await api.get('/analytics/overview');

        if (!isMounted) return;

        setAnalyticsProgress({
          totalTasks: data.data.totalTasks,
          completedTasks: data.data.statusCounts.Completed,
          completionPercentage: data.data.completionPercentage,
        });
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'CanceledError') return;

        console.error('Failed to fetch dashboard analytics overview:', error);
      }
    };

    fetchProgressOverview();

    return () => {
      isMounted = false;
    };
  }, [tasks]);

  // Stats calculations
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasksCount = tasks.filter(t => t.status === 'In Progress').length;
  const pendingTasksCount = tasks.filter(t => t.status === 'Pending').length;
  const overallPercentage = analyticsProgress.completionPercentage;

  const productivityData = [
    { name: 'S', value: 45, type: 'striped' },
    { name: 'M', value: 85, type: 'solid' },
    { name: 'T', value: 65, type: 'solid-light' },
    { name: 'W', value: overallPercentage, type: 'solid-dark' }, // Using current overall % as a proxy for today's performance
    { name: 'T', value: 55, type: 'striped' },
    { name: 'F', value: 40, type: 'striped' },
    { name: 'S', value: 50, type: 'striped' },
  ];

  return (
    <div className="pb-12 space-y-10" ref={containerRef}>
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 dashboard-item pt-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0 w-full md:w-auto">
          <button 
             onClick={onMenuClick}
             className="lg:hidden p-3 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all active:scale-95"
           >
             <Menu size={24} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">Dashboard</h1>
            <p className="text-slate-400 mt-2 font-medium truncate">Plan, prioritize, and accomplish your tasks with ease.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/tasks')}
            className="px-6 py-3.5 min-h-[44px] bg-[#0a2e1d] hover:bg-[#1b5e40] text-white rounded-2xl flex items-center gap-2.5 font-bold transition-all shadow-xl shadow-emerald-900/10 active:scale-95"
          >
            <Plus size={20} strokeWidth={2.5} />
            Add Task
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 dashboard-item">
        <StatCard title="Total Tasks" value={totalTasks} change="Increased from last month" color="green" trend="up" onClick={() => navigate('/tasks')} />
        <StatCard title="Completed" value={completedTasksCount} change="Increased from last month" color="white" trend="up" hideArrow={true} />
        <StatCard title="In Progress" value={inProgressTasksCount} change="Increased from last month" color="white" trend="up" hideArrow={true} />
        <StatCard title="Pending" value={pendingTasksCount} change="Direct attention" color="white" trend="up" hideArrow={true} />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 dashboard-item">
        
        {/* Left Section (Project Analytics and Team) - 2 cols */}
        <div className="lg:col-span-2 space-y-8">
            {/* Project Analytics Card */}
            <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Task Completion Progress</h3>
                <div className="px-3 py-1 bg-slate-50 dark:bg-slate-700 text-slate-400 text-[10px] font-bold rounded-full border border-slate-100 dark:border-slate-600">WEEKLY</div>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productivityData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <pattern id="pattern-stripe" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <rect width="12" height="12" fill="#f8fafc" />
                        <rect width="6" height="12" fill="#e2e8f0" />
                      </pattern>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#0a2e1d] text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg">
                              {payload[0].value}%
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[30, 30, 30, 30]} 
                      barSize={45}
                    >
                      {productivityData.map((entry, index) => {
                        if (entry.type === 'striped') {
                          return <Cell key={`cell-${index}`} fill="url(#pattern-stripe)" />;
                        }
                        
                        let color = '#f1f5f9';
                        if (entry.type === 'solid') color = '#059669';
                        if (entry.type === 'solid-light') color = '#6ee7b7';
                        if (entry.type === 'solid-dark') color = '#004d33';
                        
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Tasks</h3>
                  <button onClick={() => navigate('/tasks')} className="text-[#0a2e1d] text-xs font-bold uppercase tracking-wider hover:underline">
                    View All
                  </button>
                </div>
                <div className="space-y-6">
                  {tasks.length > 0 ? (
                    tasks.slice(0, 4).map((task, i) => (
                      <div key={i} onClick={() => navigate('/tasks')} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-11 h-11 rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-2",
                            task.status === 'Completed' ? "ring-emerald-50 bg-emerald-50 text-emerald-600" : "ring-slate-50 bg-slate-50 text-slate-400"
                          )}>
                            {task.status === 'Completed' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">{task.title}</h5>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-sm">{task.description}</p>
                          </div>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest",
                          task.status === 'Completed' ? "bg-emerald-50 text-emerald-600" :
                          task.status === 'In Progress' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {task.status}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-sm font-medium">
                      No tasks found. Start by creating one!
                    </div>
                  )}
                </div>
            </div>
        </div>

        {/* Right Section (Gauge and Timer) - 1 col */}
        <div className="lg:col-span-1 space-y-8">
            {/* Overall Progress Gauge */}
            <ProgressBar
              tasks={tasks}
              percentageOverride={analyticsProgress.completionPercentage}
              totalOverride={analyticsProgress.totalTasks}
              completedOverride={analyticsProgress.completedTasks}
            />

            {/* Time Tracker */}
            <div className="bg-[#0a2e1d] p-8 rounded-[32px] relative overflow-hidden group min-h-[350px] flex flex-col">
              <div className="absolute top-0 right-0 h-full w-full opacity-10">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0 50 Q 25 25 50 50 T 100 50" fill="none" stroke="white" strokeWidth="2" />
                  <path d="M0 60 Q 25 35 50 60 T 100 60" fill="none" stroke="white" strokeWidth="2" opacity="0.6" />
                  <path d="M0 70 Q 25 45 50 70 T 100 70" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
                </svg>
              </div>
              <div className="relative z-10 flex flex-col items-center h-full">
                <div className="w-full flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Time Tracker</h4>
                    <p className="text-[10px] text-emerald-100/50 uppercase mt-1">
                      {selectedTaskId ? tasks.find(t => t._id === selectedTaskId)?.title : "Select a task"}
                    </p>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setIsTaskDropdownOpen(!isTaskDropdownOpen)}
                      className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10"
                    >
                      <Plus size={16} className="text-white" />
                    </button>
                    <AnimatePresence>
                      {isTaskDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 top-11 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden p-2 z-20 border border-slate-100"
                        >
                          <div className="max-h-48 overflow-y-auto custom-scrollbar">
                            {tasks.filter(t => t.status !== 'Completed').map(task => (
                              <button 
                                key={task._id}
                                onClick={() => {
                                  setSelectedTaskId(task._id);
                                  setIsTaskDropdownOpen(false);
                                }}
                                className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors truncate block"
                              >
                                {task.title}
                              </button>
                            ))}
                            {tasks.filter(t => t.status !== 'Completed').length === 0 && (
                              <div className="px-3 py-4 text-center text-[10px] font-bold text-slate-400 uppercase">No active tasks</div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center relative w-full">
                  <div className="relative mb-2">
                    <button 
                      onClick={() => setIsTimeMenuOpen(!isTimeMenuOpen)}
                      className="inline-flex min-h-[44px] items-center gap-1.5 px-3 py-1 bg-white/10 text-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-colors border border-white/10"
                    >
                      <Clock size={12} />
                      Set Time
                    </button>
                    <AnimatePresence>
                      {isTimeMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute left-1/2 -translate-x-1/2 top-8 w-40 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 p-2 overflow-hidden"
                        >
                          {timeOptions.map(opt => (
                            <button
                              key={opt.label}
                              onClick={() => {
                                setTimeLeft(opt.value);
                                setTimerActive(false);
                                setIsTimeMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="text-6xl font-black text-white tracking-widest">{formatTime(timeLeft)}</div>
                </div>

                <div className="flex gap-4 mt-8 w-full">
                   <button 
                    onClick={() => {
                      setTimerActive(false);
                      setTimeLeft(1500);
                    }}
                    className="flex-1 h-14 min-h-[44px] min-w-[44px] rounded-2xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center border border-white/10 active:scale-95"
                   >
                     <RotateCcw size={20} className="text-white" />
                   </button>
                   <button 
                    onClick={() => setTimerActive(!timerActive)}
                    className={cn(
                      "flex-2 h-14 rounded-2xl transition-all flex items-center justify-center gap-2 font-bold shadow-lg active:scale-95",
                      timerActive ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-900/40" : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/40"
                    )}
                   >
                     {timerActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                     <span>{timerActive ? 'Pause' : 'Start'}</span>
                   </button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
