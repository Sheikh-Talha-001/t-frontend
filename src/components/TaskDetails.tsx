import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Flag, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  FileText, 
  ListTodo,
  Share2,
  Paperclip
} from 'lucide-react';
import { Task, SubTask, Status } from '../types';
import { cn } from '../lib/utils';
import { TaskShareModal } from './TaskShareModal';
import { AttachmentManager } from './AttachmentManager';

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({ task, onClose, onUpdate }) => {
  const [editedTask, setEditedTask] = useState<Task>({ ...task });
  const [newSubtask, setNewSubtask] = useState('');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const statuses: Status[] = ['To Do', 'In Progress', 'Pending', 'Completed', 'Backlog', 'Active', 'Blocked'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'] as const;

  const handleUpdate = () => {
    onUpdate(editedTask);
    onClose();
  };

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = editedTask.subtasks?.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    ) || [];
    setEditedTask({ ...editedTask, subtasks: updatedSubtasks });
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    const ns: SubTask = {
      id: Math.random().toString(36).substr(2, 9),
      title: newSubtask,
      completed: false
    };
    setEditedTask({
      ...editedTask,
      subtasks: [...(editedTask.subtasks || []), ns]
    });
    setNewSubtask('');
  };

  const removeSubtask = (subtaskId: string) => {
    setEditedTask({
      ...editedTask,
      subtasks: editedTask.subtasks?.filter(st => st.id !== subtaskId)
    });
  };

  const completedCount = editedTask.subtasks?.filter(st => st.completed).length || 0;
  const totalCount = editedTask.subtasks?.length || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto"
    >
      <div className="p-10 space-y-10">
        <header className="space-y-6">
          <div className="flex flex-wrap gap-4 justify-between items-start md:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                >
                  <Clock size={14} />
                  {editedTask.status}
                </button>
                <AnimatePresence>
                  {isStatusOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 top-10 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 p-2 overflow-hidden"
                    >
                      {statuses.map(s => (
                        <button
                          key={s}
                          onClick={() => {
                            setEditedTask({ ...editedTask, status: s as Task['status'] });
                            setIsStatusOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 rounded-xl text-xs font-semibold transition-colors",
                            editedTask.status === s ? "bg-emerald-50 text-emerald-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button 
                  onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors",
                    editedTask.priority === 'High' || editedTask.priority === 'Urgent' 
                      ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  )}
                >
                  <Flag size={14} />
                  {editedTask.priority || 'Medium'}
                </button>
                <AnimatePresence>
                  {isPriorityOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 top-10 w-40 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 p-2 overflow-hidden"
                    >
                      {priorities.map(p => (
                        <button
                          key={p}
                          onClick={() => {
                            setEditedTask({ ...editedTask, priority: p as Task['priority'] });
                            setIsPriorityOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 rounded-xl text-xs font-semibold transition-colors",
                            editedTask.priority === p ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"
              >
                <Share2 size={16} />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="px-6 py-4 border-2 border-[#006644] rounded-3xl bg-emerald-50/5 shadow-inner">
            <input 
              type="text"
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="w-full text-4xl font-extrabold text-slate-900 tracking-tight border-none p-0 focus:ring-0 placeholder:text-slate-200 bg-transparent"
              placeholder="Task Title"
            />
          </div>
        </header>

        <div className="space-y-8">
            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={16} />
                Description
              </h2>
              <div className="border-2 border-[#006644] rounded-3xl p-2 bg-emerald-50/5">
                <textarea 
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  className="w-full text-slate-600 text-sm font-medium leading-relaxed p-4 bg-transparent border-none focus:ring-0 min-h-[140px] resize-none custom-scrollbar"
                  placeholder="Describe this task..."
                />
              </div>
            </div>

            {/* Subtasks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ListTodo size={16} />
                  Subtasks
                </h2>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {completedCount}/{totalCount} Completed
                </span>
              </div>
              
              <div className="space-y-3 pl-2">
                {editedTask.subtasks?.map((st) => (
                  <div key={st.id} className="flex items-center gap-4 group">
                    <button 
                      onClick={() => toggleSubtask(st.id)}
                      className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        st.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {st.completed && <CheckCircle2 size={14} />}
                    </button>
                    <input 
                      type="text"
                      value={st.title}
                      onChange={(e) => {
                        const updated = editedTask.subtasks?.map(s => s.id === st.id ? { ...s, title: e.target.value } : s);
                        setEditedTask({ ...editedTask, subtasks: updated });
                      }}
                      className={cn(
                        "flex-1 text-sm bg-transparent border-none p-0 focus:ring-0 transition-all",
                        st.completed ? "text-slate-400 line-through" : "text-slate-900 font-medium"
                      )}
                    />
                    <button 
                      onClick={() => removeSubtask(st.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-4 mt-6">
                  <div className="w-6 h-6 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                    <Plus size={14} />
                  </div>
                  <input 
                    type="text" 
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
                    placeholder="Add a new subtask..."
                    className="flex-1 text-sm bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300 font-medium"
                  />
                  <button 
                    onClick={addSubtask}
                    className="p-1 px-4 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-colors"
                  >
                    ADD
                  </button>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-8">
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Due Date</h3>
                        <div className="flex items-center gap-3">
                            <Clock size={16} className="text-slate-400" />
                            <input 
                                type="text"
                                value={editedTask.dueDate || editedTask.date || ''}
                                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                                className="text-sm font-bold text-slate-900 border-none p-0 focus:ring-0 w-32"
                                placeholder="E.g. Oct 25"
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Attachments Section */}
            <div className="space-y-4 pt-8 border-t border-slate-50">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <Paperclip size={16} />
                  Attachments
                </h2>
                <AttachmentManager 
                  task={editedTask} 
                  onUpdate={(updated) => {
                    setEditedTask(updated);
                    onUpdate(updated);
                  }} 
                />
            </div>
        </div>

        {/* Footer Actions */}
        <footer className="pt-10 border-t border-slate-100 mt-auto">
           <div className="flex gap-4">
             <button 
                onClick={onClose}
                className="flex-1 px-8 py-4 border border-slate-200 rounded-[20px] font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm"
             >
               Cancel
             </button>
             <button 
                onClick={handleUpdate}
                className="flex-[2] px-8 py-4 bg-[#006644] text-white rounded-[20px] font-bold hover:bg-[#005236] transition-all text-sm shadow-xl shadow-emerald-900/20"
             >
               Save Changes
             </button>
           </div>
        </footer>
      </div>
      
      <TaskShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        taskId={editedTask._id} 
      />
    </motion.div>
  );
};
