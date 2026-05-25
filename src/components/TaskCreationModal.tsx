import React, { useState } from 'react';
import { X, Calendar, Plus, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Status, Task } from '../types';
import toast from 'react-hot-toast';

type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: Omit<Task, '_id'>) => void;
}

const priorityConfig: Record<Priority, { dot: string; text: string; bg: string; border: string; activeBg: string; activeBorder: string; activeText: string }> = {
  Low:    { dot: 'bg-sky-400',    text: 'text-sky-600',    bg: 'bg-white',   border: 'border-slate-200', activeBg: 'bg-sky-50',   activeBorder: 'border-sky-400',   activeText: 'text-sky-700' },
  Medium: { dot: 'bg-amber-400',  text: 'text-amber-600',  bg: 'bg-white',   border: 'border-slate-200', activeBg: 'bg-amber-50', activeBorder: 'border-amber-400', activeText: 'text-amber-700' },
  High:   { dot: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-white',   border: 'border-slate-200', activeBg: 'bg-orange-50',activeBorder: 'border-orange-500',activeText: 'text-orange-700' },
  Urgent: { dot: 'bg-rose-500',   text: 'text-rose-600',   bg: 'bg-white',   border: 'border-slate-200', activeBg: 'bg-rose-50',  activeBorder: 'border-rose-500',  activeText: 'text-rose-700' },
};

export const TaskCreationModal: React.FC<TaskCreationModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<Status>('Pending');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showError, setShowError] = useState(false);

  // Format a date string (yyyy-mm-dd) to "Day Month Year"
  const formatDateDisplay = (raw: string) => {
    if (!raw) return '';
    const d = new Date(raw + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setShowError(true);
      toast.error('Task title is required');
      return;
    }
    
    setShowError(false);

    onCreate({
      title,
      status: status as Task['status'],
      priority,
      description,
      dueDate: dueDate ? formatDateDisplay(dueDate) : 'No Date',
      assignee: { name: 'Me', initials: 'JD' },
    });

    // Reset fields
    setTitle('');
    setStatus('Pending');
    setPriority('Medium');
    setDescription('');
    setDueDate('');
  };

  const statusColors: Record<string, string> = {
    'Completed':   'bg-emerald-500',
    'Pending':     'bg-[#006644]',
    'In Progress': 'bg-blue-500',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-100"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-white z-101 shadow-2xl overflow-y-auto flex flex-col rounded-l-[40px]"
          >
            <div className="p-8 border-b border-slate-50 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Task Creation</h2>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-medium">Add new entry to system</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-300 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 p-8 space-y-8">
              {/* Title */}
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-900 ml-1">Task Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (showError) setShowError(false);
                  }}
                  placeholder="e.g., Update primary navigation"
                  className={cn(
                    "w-full px-4 py-4 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-300",
                    showError ? "border-rose-300 focus:ring-rose-500/10 focus:border-rose-500" : "border-slate-200 focus:ring-[#006644]/5 focus:border-[#006644]"
                  )}
                />
              </div>

              {/* Status */}
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-900 ml-1">Status</label>
                <div className="flex flex-wrap gap-3">
                  {(['Pending', 'In Progress', 'Completed'] as Status[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={cn(
                          "px-5 py-2.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-2",
                          status === s 
                              ? "bg-emerald-50 border-[#006644] text-[#006644]" 
                              : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full", statusColors[s] || 'bg-slate-300')} />
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-900 ml-1 flex items-center gap-2">
                  <Flag size={12} />
                  Priority
                </label>
                <div className="flex flex-wrap gap-3">
                  {(Object.keys(priorityConfig) as Priority[]).map((p) => {
                    const cfg = priorityConfig[p];
                    const isActive = priority === p;
                    return (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={cn(
                          "px-5 py-2.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-2",
                          isActive ? `${cfg.activeBg} ${cfg.activeBorder} ${cfg.activeText}` : `${cfg.bg} ${cfg.border} text-slate-400 hover:border-slate-300`
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the requirements and acceptance criteria..."
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006644]/5 focus:border-[#006644] transition-all placeholder:text-slate-300 min-h-[120px] resize-none custom-scrollbar"
                />
              </div>

              {/* Due Date — native date picker */}
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-900 ml-1">Due Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006644]/5 focus:border-[#006644] transition-all text-slate-700 appearance-none"
                  />
                </div>
                {dueDate && (
                  <p className="text-xs text-slate-400 font-medium ml-1">
                    Selected: <span className="text-slate-700 font-semibold">{formatDateDisplay(dueDate)}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-slate-50">
               <button 
                  onClick={handleSubmit}
                  className="w-full bg-[#006644] hover:bg-[#005236] text-white py-4 rounded-2xl font-semibold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  Create Task
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
