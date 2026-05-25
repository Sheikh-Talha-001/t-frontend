import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Gauge,
  Menu,
  Package,
  PieChart as PieChartIcon,
  RefreshCw,
  Sprout,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Task } from '../types';
import api from '../lib/api';

type AnalyticsRange = 7 | 30;
type StatusName = 'Pending' | 'In Progress' | 'Completed';

interface StatusBreakdownItem {
  name: StatusName;
  value: number;
  percentage: number;
}

interface AnalyticsOverview {
  range: AnalyticsRange | 'all';
  totalTasks: number;
  completionPercentage: number;
  statusCounts: Record<StatusName, number>;
  statusBreakdown: StatusBreakdownItem[];
}

interface TrendPoint {
  label: string;
  completed: number;
  overdue: number;
}

interface AnalyticsTrends {
  range: AnalyticsRange;
  bucketType: 'daily' | 'weekly';
  trends: TrendPoint[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const emptyOverview = (range: AnalyticsRange): AnalyticsOverview => ({
  range,
  totalTasks: 0,
  completionPercentage: 0,
  statusCounts: {
    Pending: 0,
    'In Progress': 0,
    Completed: 0,
  },
  statusBreakdown: [
    { name: 'Pending', value: 0, percentage: 0 },
    { name: 'In Progress', value: 0, percentage: 0 },
    { name: 'Completed', value: 0, percentage: 0 },
  ],
});

const statusColors: Record<StatusName, string> = {
  Pending: '#94a3b8',
  'In Progress': '#10b981',
  Completed: '#006644',
};

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  change: string;
  icon: React.ElementType;
  color: 'green' | 'emerald' | 'rose';
  trend: 'up' | 'down' | 'neutral';
}

const MetricCard = ({ title, value, unit, change, icon: Icon, color, trend }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors"
  >
    <div className={cn(
      "absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity",
      color === 'green' ? "bg-[#006644]" : color === 'emerald' ? "bg-emerald-600" : "bg-rose-600"
    )} />

    <div className="flex items-center gap-2 mb-4">
      <div className={cn(
        "p-2 rounded-lg",
        color === 'green' ? "bg-emerald-50 text-[#006644]" : color === 'emerald' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
      )}>
        <Icon size={18} />
      </div>
      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{title}</h3>
    </div>

    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-slate-900 dark:text-white">{value}</span>
      {unit && <span className="text-slate-400 text-sm font-medium">{unit}</span>}
    </div>

    <div className={cn(
      "flex items-center gap-1 mt-2 text-xs font-bold",
      trend === 'up' ? "text-emerald-600" : trend === 'down' ? "text-rose-600" : "text-slate-400"
    )}>
      {trend === 'up' ? <ArrowUpRight size={14} /> : trend === 'down' ? <ArrowDownRight size={14} /> : null}
      {change}
    </div>
  </motion.div>
);

const NoDataPanel = ({ title, detail }: { title: string; detail: string }) => (
  <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center rounded-[24px] border border-dashed border-emerald-100 dark:border-slate-700 bg-emerald-50/40 dark:bg-slate-900/30 p-6">
    <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 shadow-sm flex items-center justify-center mb-4">
      <Sprout className="text-[#006644]" size={28} />
    </div>
    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
    <p className="text-xs text-slate-400 max-w-xs mt-2 leading-relaxed">{detail}</p>
  </div>
);

export const Analytics: React.FC<{
  tasks: Task[];
  onMenuClick: () => void;
}> = ({ onMenuClick }) => {
  const [range, setRange] = useState<AnalyticsRange>(7);
  const [overview, setOverview] = useState<AnalyticsOverview>(emptyOverview(7));
  const [trends, setTrends] = useState<AnalyticsTrends>({
    range: 7,
    bucketType: 'daily',
    trends: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    let userId = '';
    if (userStr) {
      try {
        userId = JSON.parse(userStr)._id || JSON.parse(userStr).id;
      } catch (e) { }
    }
    const backendUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:5001';
    
    const socket = io(backendUrl, { query: { userId } });

    socket.on('notification', (notif: { type: string; [key: string]: unknown }) => {
      if (notif.type === 'STATUS_UPDATED' || notif.type === 'TASK_SHARED') {
        setRefetchTrigger(prev => prev + 1);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [overviewResponse, trendsResponse] = await Promise.all([
          api.get<ApiResponse<AnalyticsOverview>>('/analytics/overview', { params: { range } }),
          api.get<ApiResponse<AnalyticsTrends>>('/analytics/trends', { params: { range } }),
        ]);

        if (!isMounted) return;

        setOverview(overviewResponse.data.data);
        setTrends(trendsResponse.data.data);
      } catch (error: unknown) {
        if (!isMounted || (error instanceof Error && error.name === 'CanceledError')) return;

        console.error('Failed to fetch analytics:', error);
        setOverview(emptyOverview(range));
        setTrends({ range, bucketType: range === 7 ? 'daily' : 'weekly', trends: [] });
        const errMsg = error instanceof Error && 'response' in error ? (error as any).response?.data?.message : 'Unable to load analytics right now.';
        setErrorMessage(errMsg || 'Unable to load analytics right now.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, [range, refetchTrigger]);

  const metrics = useMemo(() => {
    const completed = overview.statusCounts.Completed;
    const pending = overview.statusCounts.Pending;
    const inProgress = overview.statusCounts['In Progress'];
    const velocity = range > 0 ? +(completed / range).toFixed(1) : 0;

    return {
      total: overview.totalTasks,
      completed,
      pending,
      inProgress,
      efficiency: overview.completionPercentage,
      velocity,
    };
  }, [overview, range]);

  const hasOverviewData = overview.totalTasks > 0;
  const hasTrendData = trends.trends.some((item) => item.completed > 0 || item.overdue > 0);

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      range: `Last ${range} days`,
      overview,
      trends,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all active:scale-95"
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics Intelligence</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Owner-only reporting powered by live aggregation data.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-2">
            {[
              { label: 'Last 7 Days', val: 7 as AnalyticsRange },
              { label: 'Last 30 Days', val: 30 as AnalyticsRange },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => setRange(opt.val)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  range === opt.val
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            disabled={isLoading}
            className="px-5 py-2 bg-[#006644] disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold hover:bg-[#005236] transition-colors shadow-md shadow-emerald-200 flex items-center gap-2"
          >
            {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            Export JSON
          </button>
        </div>
      </header>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl px-5 py-4 text-sm font-semibold flex items-center gap-3">
          <AlertTriangle size={18} />
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Completion Rate"
          value={isLoading ? '...' : metrics.efficiency}
          unit="%"
          change={metrics.efficiency >= 50 ? 'On track' : 'Needs attention'}
          icon={Zap}
          color="green"
          trend={metrics.efficiency >= 50 ? 'up' : 'down'}
        />
        <MetricCard
          title="Completed"
          value={isLoading ? '...' : metrics.completed}
          unit={`of ${metrics.total}`}
          change={`${metrics.pending} pending`}
          icon={Package}
          color="emerald"
          trend={metrics.completed > metrics.pending ? 'up' : 'down'}
        />
        <MetricCard
          title="Velocity"
          value={isLoading ? '...' : metrics.velocity}
          unit="tasks/day"
          change={`Over ${range} days`}
          icon={Gauge}
          color="green"
          trend={metrics.velocity >= 1 ? 'up' : 'neutral'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Activity Trends</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.completed}</span>
                <span className="text-sm text-slate-400 font-medium">completed</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <TrendingUp size={12} /> {trends.bucketType}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-[#006644]"><span className="w-2 h-2 rounded-full bg-[#006644]" />Completed</span>
              <span className="flex items-center gap-1.5 text-rose-500"><span className="w-2 h-2 rounded-full bg-rose-500" />Overdue</span>
            </div>
          </div>
          <div className="h-[320px] w-full">
            {isLoading ? (
              <NoDataPanel title="Loading analytics" detail="Building your reporting snapshot from MongoDB aggregation pipelines." />
            ) : hasTrendData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="completed" stroke="#006644" strokeWidth={3} dot={{ r: 4, fill: '#006644' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="overdue" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <NoDataPanel title="No trend data yet" detail="Completed or overdue tasks in this date range will appear here automatically." />
            )}
          </div>
        </div>

        <div className="bg-linear-to-br from-[#006644] to-[#004e33] p-8 rounded-[32px] text-white flex flex-col justify-between shadow-xl shadow-emerald-200/50">
          <div>
            <h4 className="text-xl font-bold mb-3 leading-tight">Quick Summary</h4>
            <p className="text-emerald-100/70 text-sm leading-relaxed">
              You own <span className="text-white font-bold">{metrics.total}</span> tasks in this range.
              <span className="text-white font-bold"> {metrics.completed}</span> completed,
              <span className="text-white font-bold"> {metrics.inProgress}</span> in progress, and
              <span className="text-white font-bold"> {metrics.pending}</span> pending.
            </p>
          </div>
          <div className="space-y-4 mt-6">
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all duration-700" style={{ width: `${metrics.efficiency}%` }} />
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-200">{metrics.efficiency}% completion rate</p>
            <button
              onClick={handleExport}
              disabled={isLoading}
              className="w-full bg-white disabled:bg-white/60 text-[#006644] py-4 rounded-2xl font-bold hover:bg-slate-50 transition-colors shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col mb-8">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Status Breakdown</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.total}</span>
              <span className="text-sm text-slate-400 font-medium">owned tasks</span>
            </div>
          </div>
          <div className="h-[280px] w-full">
            {isLoading ? (
              <NoDataPanel title="Loading breakdown" detail="Preparing your status percentages." />
            ) : hasOverviewData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overview.statusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={96}
                    paddingAngle={4}
                  >
                    {overview.statusBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={statusColors[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, _name: string, item: any) => [
                      `${value} tasks (${item.payload.percentage}%)`,
                      item.payload.name,
                    ]}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <NoDataPanel title="No data to chart" detail="Create your first task to see status percentages here." />
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <div className="flex flex-col mb-8">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Status Counts</h3>
            <div className="flex items-center gap-2 mt-1">
              <PieChartIcon size={18} className="text-[#006644]" />
              <span className="text-sm text-slate-400 font-medium">Database-backed aggregation</span>
            </div>
          </div>
          <div className="h-[280px] w-full">
            {isLoading ? (
              <NoDataPanel title="Loading counts" detail="Counting each status directly in MongoDB." />
            ) : hasOverviewData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.statusBreakdown} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                  <Bar dataKey="value" radius={[12, 12, 4, 4]} barSize={50}>
                    {overview.statusBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={statusColors[entry.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoDataPanel title="Nothing counted yet" detail="Owned tasks will be grouped into Pending, In Progress, and Completed." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
