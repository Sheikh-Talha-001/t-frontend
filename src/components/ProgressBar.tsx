import React from 'react';
import { Task } from '../types';

interface ProgressBarProps {
  tasks: Task[];
  percentageOverride?: number;
  totalOverride?: number;
  completedOverride?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  tasks,
  percentageOverride,
  totalOverride,
  completedOverride,
}) => {
  const totalTasks = totalOverride ?? tasks.length;
  const completedTasks = completedOverride ?? tasks.filter(t => t.status === 'Completed').length;
  const calculatedPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const percentage = percentageOverride ?? calculatedPercentage;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 p-8 shadow-sm flex flex-col items-center w-full" data-testid="progress-bar-container">
      <div className="w-full text-left mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Overall Progress</h3>
      </div>
      <div className="relative w-48 h-48 flex items-center justify-center mt-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" data-testid="progress-svg">
          <path 
            d="M 10 70 A 40 40 0 0 1 90 70" 
            fill="none" 
            stroke="#f1f5f9" 
            strokeWidth="12" 
            strokeLinecap="round" 
          />
          <path 
            d="M 10 70 A 40 40 0 0 1 90 70" 
            fill="none" 
            stroke="#1b5e40" 
            strokeWidth="12" 
            strokeLinecap="round" 
            strokeDasharray="125.6"
            strokeDashoffset={125.6 * (1 - percentage / 100)}
            className="transition-all duration-1000 ease-in-out"
            data-testid="progress-path"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center pt-8">
          <span className="text-5xl font-black text-slate-900 dark:text-white" data-testid="progress-percentage">{percentage}%</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total Completed</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full mt-auto">
         <div className="flex items-center gap-1.5">
           <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
           <span className="text-[10px] text-slate-500 font-bold">Completed {completedTasks}</span>
         </div>
         <div className="flex items-center gap-1.5">
           <div className="w-2.5 h-2.5 bg-[#0a2e1d] rounded-full"></div>
           <span className="text-[10px] text-slate-500 font-bold">Total {totalTasks}</span>
         </div>
      </div>
    </div>
  );
};
