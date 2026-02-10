import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Clock, CheckCircle, ListTodo, TrendingUp, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Task } from '../types';

function formatDuration(totalSeconds: number): string {
    if (!totalSeconds || totalSeconds <= 0) return '0s';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
}

export default function Dashboard() {
    const { data: stats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/dashboard/stats');
            return res.data;
        },
    });

    const { data: tasks } = useQuery<Task[]>({
        queryKey: ['all-tasks'],
        queryFn: async () => {
            const res = await api.get('/tasks');
            return res.data;
        }
    });

    // Category distribution
    const categoryData = tasks?.reduce((acc: any[], task) => {
        const category = task.category || 'Uncategorized';
        const existing = acc.find(item => item.name === category);
        if (existing) {
            existing.value++;
        } else {
            acc.push({ name: category, value: 1 });
        }
        return acc;
    }, []) || [];

    // Priority distribution
    const priorityData = [
        { name: 'High', value: tasks?.filter(t => t.priority === 'HIGH').length || 0, color: '#ef4444' },
        { name: 'Medium', value: tasks?.filter(t => t.priority === 'MEDIUM').length || 0, color: '#f59e0b' },
        { name: 'Low', value: tasks?.filter(t => t.priority === 'LOW').length || 0, color: '#6366f1' },
    ].filter(d => d.value > 0);

    const COLORS = ['#6366f1', '#a78bfa', '#818cf8', '#4f46e5', '#7c3aed'];

    // We still use hours for the chart to keep a reasonable scale
    const timeData = [
        { name: 'Today', hours: Math.round(((stats?.totalSecondsToday || 0) / 3600) * 100) / 100 },
        { name: 'This Week', hours: Math.round(((stats?.totalSecondsWeek || 0) / 3600) * 100) / 100 },
        { name: 'All Time', hours: Math.round(((stats?.totalSecondsAll || 0) / 3600) * 100) / 100 },
    ];

    const completionRate = stats?.totalTasks
        ? Math.round(((stats?.completedTasks || 0) / stats.totalTasks) * 100)
        : 0;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 mt-1">Your productivity at a glance</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Total Tasks"
                    value={stats?.totalTasks || 0}
                    icon={ListTodo}
                    gradient="from-brand-500 to-brand-700"
                    iconBg="bg-brand-500/10"
                    delay={0}
                />
                <StatCard
                    title="Completed"
                    value={stats?.completedTasks || 0}
                    icon={CheckCircle}
                    gradient="from-emerald-400 to-emerald-600"
                    iconBg="bg-emerald-500/10"
                    delay={1}
                />
                <StatCard
                    title="Today's Time"
                    value={formatDuration(stats?.totalSecondsToday || 0)}
                    icon={Clock}
                    gradient="from-violet-400 to-violet-600"
                    iconBg="bg-violet-500/10"
                    delay={2}
                />
                <StatCard
                    title="Completion Rate"
                    value={`${completionRate}%`}
                    icon={TrendingUp}
                    gradient="from-amber-400 to-amber-600"
                    iconBg="bg-amber-500/10"
                    delay={3}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Time Distribution */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">Time Distribution (Hours)</h2>
                        <Zap size={18} className="text-brand-400" />
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={timeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} />
                                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    formatter={(value: number | undefined) => [formatDuration(Math.round((value || 0) * 3600)), 'Logged Time']}
                                    contentStyle={{
                                        backgroundColor: 'rgba(15,23,42,0.9)',
                                        borderColor: 'rgba(99,102,241,0.2)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        boxShadow: '0 0 20px rgba(99,102,241,0.1)'
                                    }}
                                    itemStyle={{ color: '#a5b4fc' }}
                                />
                                <Bar dataKey="hours" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#818cf8" />
                                        <stop offset="100%" stopColor="#4f46e5" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tasks by Category */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">Tasks by Category</h2>
                    </div>
                    <div className="h-72 flex items-center justify-center">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        innerRadius={40}
                                        fill="#8884d8"
                                        dataKey="value"
                                        stroke="rgba(15,23,42,1)"
                                        strokeWidth={2}
                                    >
                                        {categoryData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15,23,42,0.9)',
                                            borderColor: 'rgba(99,102,241,0.2)',
                                            borderRadius: '12px',
                                            color: '#fff',
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-gray-500 text-center">
                                <ListTodo size={40} className="mx-auto mb-3 text-gray-600" />
                                <p className="text-sm">No categorised tasks yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Priority Breakdown */}
            {priorityData.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6">Priority Breakdown</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {priorityData.map((item) => {
                            const total = tasks?.length || 1;
                            const pct = Math.round((item.value / total) * 100);
                            return (
                                <div key={item.name}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-300">{item.name}</span>
                                        <span className="text-xs text-gray-500">{item.value} tasks</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${pct}%`, backgroundColor: item.color }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{pct}%</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ElementType;
    gradient: string;
    iconBg: string;
    delay: number;
}

function StatCard({ title, value, icon: Icon, gradient, iconBg, delay }: StatCardProps) {
    return (
        <div
            className="glass-card rounded-2xl p-5 group animate-slide-up"
            style={{ animationDelay: `${delay * 100}ms` }}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-400 font-medium">{title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{value}</p>
                </div>
                <div className={cn("p-3 rounded-xl", iconBg)}>
                    <Icon size={22} className={cn("bg-gradient-to-r bg-clip-text", gradient)} style={{ color: 'white' }} />
                </div>
            </div>
            <div className={cn("h-1 rounded-full mt-4 bg-gradient-to-r opacity-40 group-hover:opacity-70 transition-opacity", gradient)} />
        </div>
    );
}
