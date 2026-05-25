import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Clock, Check, X, Menu, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { Task } from '../types';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const Team: React.FC<{ tasks: Task[], onMenuClick: () => void }> = ({ tasks, onMenuClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    description: '',
  });

  // Load real user data from localStorage on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setProfile({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        description: user.description || '',
      });
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name: profile.name,
        role: profile.role,
        description: profile.description,
      });
      // Update localStorage so changes persist across page reloads
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Build activity from real task data
  const activity = useMemo(() => {
    const items: { title: string; detail: string; date: string; color: string }[] = [];

    // Completed tasks
    tasks.filter(t => t.status === 'Completed').forEach(t => {
      items.push({
        title: `Completed "${t.title}"`,
        detail: 'Moved to Completed',
        date: t.dueDate || t.date || 'Recently',
        color: 'bg-emerald-500',
      });
    });

    // In Progress tasks
    tasks.filter(t => t.status === 'In Progress').forEach(t => {
      items.push({
        title: `Working on "${t.title}"`,
        detail: 'In Progress',
        date: t.dueDate || t.date || 'Recently',
        color: 'bg-blue-500',
      });
    });

    // Pending tasks (recently created)
    tasks.filter(t => t.status === 'Pending').forEach(t => {
      items.push({
        title: `Created "${t.title}"`,
        detail: 'New task added',
        date: t.dueDate || t.date || 'Recently',
        color: 'bg-amber-400',
      });
    });

    return items.slice(0, 6);
  }, [tasks]);

  // Professional stats from real data
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, completionRate };
  }, [tasks]);

  // Weekly goal: % of tasks completed this week
  const weeklyProgress = useMemo(() => {
    const total = tasks.length;
    if (total === 0) return 0;
    return Math.round((stats.completed / total) * 100);
  }, [tasks, stats]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all active:scale-95"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Manage your professional identity and activity.</p>
        </div>
      </div>

      {/* Profile Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-[32px] md:rounded-[40px] p-6 md:p-10 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10"
      >
        <div className="absolute top-0 left-0 w-full h-24 md:h-32 bg-linear-to-r from-emerald-50 to-blue-50 dark:from-slate-700 dark:to-slate-700 opacity-60 z-0" />
        
        {/* Avatar */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 md:border-8 border-white shadow-xl z-10 shrink-0 bg-emerald-500 flex items-center justify-center">
          <span className="text-5xl md:text-6xl font-bold text-white">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </span>
        </div>

        <div className="flex-1 text-center md:text-left z-10 pt-2 md:pt-6">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div 
                key="editing"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight bg-white/50 border-2 border-emerald-500/20 rounded-2xl px-4 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                  <input 
                    type="email" 
                    value={profile.email}
                    disabled
                    className="w-full font-semibold text-sm text-slate-400 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Role / Title</label>
                  <div className="flex items-center gap-2">
                    <Briefcase size={18} className="text-emerald-700 shrink-0" />
                    <input 
                      type="text" 
                      value={profile.role}
                      onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                      placeholder="e.g., Full Stack Developer"
                      className="w-full font-semibold text-sm bg-white/50 border-2 border-emerald-500/20 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Bio</label>
                  <textarea 
                    value={profile.description}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    placeholder="Write something about yourself…"
                    className="w-full text-slate-500 leading-relaxed text-sm bg-white/50 border-2 border-emerald-500/20 rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all resize-none h-32 md:h-24 placeholder:text-slate-300"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#006644] text-white rounded-full font-bold shadow-lg shadow-emerald-900/10 hover:bg-[#005236] transition-all disabled:opacity-50"
                  >
                    <Save size={18} />
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-full font-bold hover:bg-slate-50 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="viewing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{profile.name || 'User'}</h2>
                <p className="text-sm text-slate-400 font-medium mt-1">{profile.email}</p>
                {profile.role && (
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-3 text-emerald-700">
                    <Briefcase size={18} />
                    <span className="font-semibold text-sm">{profile.role}</span>
                  </div>
                )}
                {profile.description && (
                  <p className="text-slate-500 max-w-2xl mt-4 leading-relaxed text-sm">{profile.description}</p>
                )}
                <div className="mt-8 flex justify-center md:justify-start">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-8 py-3.5 bg-[#006644] text-white rounded-full font-bold shadow-lg shadow-emerald-900/20 hover:scale-105 transition-transform active:scale-95"
                  >
                    Edit Profile
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Recent Activity</h3>
          <div className="relative border-l-2 border-slate-50 ml-2 md:ml-4 space-y-10">
            {activity.length > 0 ? activity.map((item, i) => (
              <div key={i} className="relative pl-8">
                <div className={cn("absolute left-[-9px] top-1 w-4 h-4 rounded-full ring-4 ring-white", item.color)} />
                <div className="mb-1">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</span>
                </div>
                <div className="text-xs text-slate-500 mb-2">{item.detail}</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1">
                  <Clock size={12} />
                  {item.date}
                </div>
              </div>
            )) : (
              <p className="text-slate-400 text-sm italic pl-4">No activity yet. Create some tasks!</p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="space-y-8">
          <div className="bg-[#15171a] p-10 rounded-[40px] text-white">
            <h3 className="text-xl font-bold mb-8">Professional Stats</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <span className="text-4xl font-bold">{stats.total}</span>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Total Tasks</p>
              </div>
              <div className="space-y-2">
                <span className="text-4xl font-bold text-emerald-400">{stats.completed}</span>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Completed</p>
              </div>
              <div className="space-y-2">
                <span className="text-4xl font-bold text-blue-400">{stats.inProgress}</span>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">In Progress</p>
              </div>
              <div className="space-y-2">
                <span className="text-4xl font-bold text-amber-400">{stats.completionRate}%</span>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">On Time</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-10 rounded-[40px] border border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Weekly Goal</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {tasks.length - stats.completed} tasks remaining
                </p>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center">
                 <svg className="w-full h-full -rotate-90">
                    <circle 
                        cx="32" cy="32" r="28" 
                        stroke="#f1f5f9" strokeWidth="6" fill="none" 
                    />
                    <circle 
                        cx="32" cy="32" r="28" 
                        stroke="#006644" strokeWidth="6" fill="none" 
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - weeklyProgress / 100)}
                        strokeLinecap="round"
                    />
                 </svg>
                 <span className="absolute text-xs font-bold text-[#006644]">{weeklyProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
