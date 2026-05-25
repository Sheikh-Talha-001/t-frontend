import React, { useState, useRef } from 'react';
import { UploadCloud, File as FileIcon, X, Loader2, Image as ImageIcon, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Task } from '../types';

interface AttachmentManagerProps {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
}

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({ task, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const attachments = task.attachments || [];

  const handleUpload = async (file: File) => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      // Must use multipart/form-data
      const { data } = await api.post(`/tasks/${task._id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUpdate(data);
      toast.success('File uploaded successfully');
    } catch (error: unknown) {
      console.error('Failed to upload file:', error);
      const msg = error instanceof Error && 'response' in error ? (error as any).response?.data?.message : 'Failed to upload file';
      toast.error(msg || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      const { data } = await api.delete(`/tasks/${task._id}/attachments/${attachmentId}`);
      onUpdate(data);
      toast.success('File removed');
    } catch (error: unknown) {
      console.error('Failed to delete file:', error);
      const msg = error instanceof Error && 'response' in error ? (error as any).response?.data?.message : 'Failed to remove file';
      toast.error(msg || 'Failed to remove file');
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <ImageIcon size={14} className="text-blue-500" />;
    if (['pdf', 'txt', 'doc', 'docx'].includes(ext || '')) return <FileText size={14} className="text-amber-500" />;
    return <FileIcon size={14} className="text-slate-500" />;
  };

  return (
    <div className="space-y-4">
      <div 
        className={cn(
          "w-full rounded-2xl border-2 border-dashed transition-all p-6 flex flex-col items-center justify-center gap-3 cursor-pointer relative overflow-hidden",
          isDragging 
            ? "border-[#006644] bg-emerald-50 dark:bg-[#006644]/10" 
            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600",
          isUploading ? "opacity-50 pointer-events-none" : ""
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileSelect}
        />
        
        {isUploading ? (
          <>
            <Loader2 size={24} className="text-[#006644] animate-spin" />
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Uploading...</span>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-400 dark:text-slate-300">
              <UploadCloud size={20} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Click to upload or drag & drop</p>
              <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG, PDF or TXT</p>
            </div>
          </>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {attachments.map((att) => (
            <div 
              key={att._id} 
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm group hover:border-[#006644]/30 transition-colors"
            >
              <a 
                href={att.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3 flex-1 overflow-hidden"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  {getFileIcon(att.filename)}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate hover:text-[#006644] transition-colors">
                  {att.filename}
                </span>
              </a>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(att._id);
                }}
                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2"
                title="Remove attachment"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
