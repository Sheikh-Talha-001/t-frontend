import React, { useState } from 'react';
import { X, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface TaskShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onShared?: () => void;
}

export const TaskShareModal: React.FC<TaskShareModalProps> = ({ isOpen, onClose, taskId, onShared }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    setIsLoading(true);
    try {
      await api.put(`/tasks/${taskId}/share`, { email });
      toast.success('Task shared successfully');
      setEmail('');
      onShared?.();
      onClose();
    } catch (error: unknown) {
      console.error('Failed to share task:', error);
      const msg = error instanceof Error && 'response' in error ? (error as any).response?.data?.message : 'Failed to share task';
      toast.error(msg || 'Failed to share task');
    } finally {
      setIsLoading(false);
    }
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-800 z-[151] shadow-2xl rounded-3xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 size={20} className="text-[#006644]" />
                  Share Task
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Collaborate with your team</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-700 rounded-full shadow-sm transition-colors border border-slate-200 dark:border-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 ml-1">
                  User Email
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006644] focus:border-transparent transition-all placeholder:text-slate-400 dark:text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleShare()}
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
               <button 
                  onClick={onClose}
                  className="px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm"
                >
                  Cancel
               </button>
               <button 
                  onClick={handleShare}
                  disabled={isLoading}
                  className={cn(
                    "px-5 py-2.5 bg-[#006644] text-white rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2 text-sm",
                    isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#005236] hover:shadow-lg hover:shadow-emerald-900/20 active:scale-95"
                  )}
                >
                  {isLoading ? 'Sharing...' : 'Share Now'}
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
