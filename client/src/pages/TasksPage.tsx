import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { Task, TimeLog } from '../types';
import { Plus, Trash2, Edit2, Play, Circle, CheckCircle, Clock, CheckSquare, Download, Search, ArrowUpDown, X, Sparkles, ChevronDown, ChevronUp, Timer, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

const CATEGORIES = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'Shopping', 'Other'] as const;

// Zod Schema for robust validation
const taskSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    category: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

function formatDuration(totalSeconds: number): string {
    if (!totalSeconds || totalSeconds <= 0) return '0s';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
}

export default function TasksPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Filter & Sort State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('DESC');

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // ALT + N for New Task
            if (e.altKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                handleCreate();
            }
            // CMD/CTRL + / to Focus Search
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                document.getElementById('task-search')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

    const { data: tasks, isLoading } = useQuery<Task[]>({
        queryKey: ['tasks', search, statusFilter, priorityFilter, categoryFilter, sortBy, sortOrder],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);
            if (priorityFilter) params.append('priority', priorityFilter);
            if (categoryFilter) params.append('category', categoryFilter);
            params.append('sortBy', sortBy);
            params.append('sortOrder', sortOrder);
            const res = await api.get(`/tasks?${params.toString()}`);
            return res.data;
        },
    });

    const { data: activeTimer, refetch: refetchTimer } = useQuery<any>({
        queryKey: ['activeTimer'],
        queryFn: async () => {
            const res = await api.get('/time-logs/active');
            return res.data;
        }
    });

    const { data: timeTotals } = useQuery<Record<string, number>>({
        queryKey: ['timeTotals'],
        queryFn: async () => {
            const res = await api.get('/time-logs/totals');
            return res.data;
        }
    });

    const deleteTaskMutation = useMutation({
        mutationFn: async (id: string) => { await api.delete(`/tasks/${id}`); },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['timeTotals'] });
            showToast('Task deleted successfully');
        },
    });

    const handleDelete = (id: string) => {
        setConfirmDeleteId(id);
    };

    const startTimerMutation = useMutation({
        mutationFn: async (taskId: string) => { await api.post('/time-logs/start', { taskId }); },
        onSuccess: () => {
            refetchTimer();
            showToast('Timer started');
        }
    });

    const stopTimerMutation = useMutation({
        mutationFn: async () => { await api.post('/time-logs/stop'); },
        onSuccess: () => {
            refetchTimer();
            queryClient.invalidateQueries({ queryKey: ['timeTotals'] });
            queryClient.invalidateQueries({ queryKey: ['timeLogs'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            showToast('Timer stopped and logged');
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => { await api.patch(`/tasks/${id}`, { status }); },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            if (variables.status === 'DONE') {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#34d399', '#10b981', '#059669', '#ffffff']
                });
                showToast('Fantastic! Task completed! 🎉');
            } else {
                showToast('Status updated');
            }
        }
    });

    const handleEdit = (task: Task) => { setEditingTask(task); setIsModalOpen(true); };
    const handleCreate = () => { setEditingTask(null); setIsModalOpen(true); };
    const toggleTaskExpand = (taskId: string) => { setExpandedTaskId(prev => prev === taskId ? null : taskId); };

    const exportCSV = () => {
        if (!tasks) return;
        const headers = ['Title', 'Description', 'Status', 'Priority', 'Category', 'Total Time', 'Created At'];
        const rows = tasks.map(t => [
            `"${t.title}"`,
            `"${(t.description || '').replace(/"/g, '""')}"`,
            t.status, t.priority, t.category || '',
            formatDuration(timeTotals?.[t.id] || 0),
            t.createdAt
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "tasks_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('CSV exported');
    };

    const hasActiveFilters = search || statusFilter || priorityFilter || categoryFilter;
    const clearFilters = () => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setCategoryFilter(''); };

    if (isLoading) return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse" />
                <div className="h-10 w-32 bg-white/5 rounded-xl animate-pulse" />
            </div>
            <div className="h-16 w-full bg-white/5 rounded-2xl animate-pulse mb-8" />
            {[1, 2, 3, 4, 5].map(i => <TaskSkeleton key={i} />)}
        </div>
    );

    return (
        <div className="animate-fade-in space-y-6 relative">
            {/* Toast Notification */}
            {toast && (
                <div className={cn(
                    "fixed top-6 right-6 z-[60] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-slide-in-right",
                    toast.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-medium">{toast.message}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Tasks</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {tasks?.length || 0} tasks · {tasks?.filter(t => t.status === 'DONE').length || 0} completed
                    </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <button onClick={exportCSV} className="btn-ghost flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm" title="Export CSV">
                        <Download size={16} />
                        <span className="inline">Export</span>
                    </button>
                    <button onClick={handleCreate} className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm shadow-lg shadow-brand-500/20">
                        <Plus size={16} />
                        <span>New Task</span>
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="glass-card rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                    <input
                        id="task-search"
                        type="text" placeholder="Search tasks... (Ctrl + /)" value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-surface-800/60 border border-gray-200 dark:border-white/5 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/30 outline-none text-sm transition-all shadow-sm dark:shadow-none"
                    />
                </div>
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-surface-800/60 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 cursor-pointer transition-all hover:bg-gray-200 dark:hover:bg-surface-800 shadow-sm dark:shadow-none">
                        <option value="">All Status</option>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                    <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
                        className="px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-surface-800/60 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 cursor-pointer transition-all hover:bg-gray-200 dark:hover:bg-surface-800 shadow-sm dark:shadow-none">
                        <option value="">All Priority</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-surface-800/60 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 cursor-pointer transition-all hover:bg-gray-200 dark:hover:bg-surface-800 shadow-sm dark:shadow-none flex-1 sm:flex-none">
                        <option value="">All Categories</option>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div className="flex gap-2 col-span-2 sm:col-auto">
                        <button onClick={() => setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC')}
                            className="flex-1 sm:flex-none p-2.5 rounded-xl bg-gray-100 dark:bg-surface-800/60 border border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/20 transition-all active:scale-95 flex items-center justify-center shadow-sm dark:shadow-none"
                            title={`Sort ${sortOrder === 'ASC' ? 'Descending' : 'Ascending'}`}>
                            <ArrowUpDown size={16} />
                        </button>
                        {hasActiveFilters && (
                            <button onClick={clearFilters}
                                className="flex-1 sm:flex-none p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-500/20 transition-all active:scale-95 flex items-center justify-center"
                                title="Clear filters">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Timer Stopwatch */}
            {activeTimer && (
                <StopwatchBanner
                    startTime={activeTimer.startTime}
                    taskTitle={activeTimer.task?.title || 'Active task'}
                    onStop={() => stopTimerMutation.mutate()}
                />
            )}

            {/* Tasks List Grouped by Date */}
            <div className="space-y-8">
                {(() => {
                    const groups = tasks?.reduce((acc: Record<string, Task[]>, task) => {
                        const date = format(new Date(task.createdAt), 'yyyy-MM-dd');
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(task);
                        return acc;
                    }, {}) || {};

                    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

                    return sortedDates.map((date, groupIndex) => {
                        const isToday = date === format(new Date(), 'yyyy-MM-dd');
                        const isYesterday = date === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
                        const dateLabel = isToday ? '📅 Today' : isYesterday ? '📅 Yesterday' : format(new Date(date + 'T00:00:00'), 'MMMM d, yyyy');

                        return (
                            <div key={date} className="animate-fade-in" style={{ animationDelay: `${groupIndex * 100}ms` }}>
                                <div className="flex items-center gap-4 mb-4">
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap">{dateLabel}</h2>
                                    <div className="h-px w-full bg-gray-200 dark:bg-white/5" />
                                </div>
                                <div className="space-y-3">
                                    {groups[date].map((task, taskIndex) => (
                                        <div key={task.id} className="glass-card rounded-2xl overflow-hidden animate-slide-up group/card" style={{ animationDelay: `${taskIndex * 50}ms` }}>
                                            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between group gap-4 cursor-pointer" onClick={() => toggleTaskExpand(task.id)}>
                                                <div className="flex items-start gap-3 sm:gap-4">
                                                    <button onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ id: task.id, status: task.status === 'DONE' ? 'TODO' : 'DONE' }); }}
                                                        className={cn("text-gray-400 dark:text-gray-500 hover:text-brand-500 dark:hover:text-brand-400 transition-all duration-200 mt-0.5 active:scale-90", task.status === 'DONE' && "text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300")}>
                                                        {task.status === 'DONE' ? <CheckCircle size={22} /> : <Circle size={22} />}
                                                    </button>
                                                    <div className="min-w-0">
                                                        <h3 className={cn("font-semibold text-gray-800 dark:text-gray-100 text-base group-hover/card:text-brand-600 dark:group-hover/card:text-white transition-colors", task.status === 'DONE' && "line-through text-gray-400 dark:text-gray-500 group-hover/card:text-gray-500 dark:group-hover/card:text-gray-400")}>{task.title}</h3>
                                                        {task.description && <p className="text-gray-500 dark:text-gray-500 text-sm mt-0.5 line-clamp-1">{task.description}</p>}
                                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                                            <span className={cn("px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tight",
                                                                task.status === 'TODO' && "bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500/10",
                                                                task.status === 'IN_PROGRESS' && "bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20",
                                                                task.status === 'DONE' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                                            )}>
                                                                {task.status === 'IN_PROGRESS' ? 'In Progress' : task.status === 'DONE' ? 'Done' : 'To Do'}
                                                            </span>
                                                            <span className={cn("px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tight",
                                                                task.priority === 'HIGH' && "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
                                                                task.priority === 'MEDIUM' && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                                                                task.priority === 'LOW' && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                                            )}>
                                                                {task.priority || 'MEDIUM'}
                                                            </span>
                                                            {task.category && (
                                                                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">{task.category}</span>
                                                            )}
                                                            <span className="text-[11px] text-gray-400 dark:text-gray-600 font-medium tabular-nums">{format(new Date(task.createdAt), 'h:mm a')}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right side: total time + actions */}
                                                <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
                                                    {(timeTotals?.[task.id] || 0) > 0 && (
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/10 dark:border-violet-500/20">
                                                            <Timer size={14} className="text-violet-500 dark:text-violet-400" />
                                                            <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-300 tabular-nums">{formatDuration(timeTotals?.[task.id] || 0)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="text-gray-400 dark:text-gray-600 group-hover/card:text-brand-500 dark:group-hover/card:text-gray-400 transition-colors mr-2">{expandedTaskId === task.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
                                                        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 scale-90 sm:scale-100" onClick={e => e.stopPropagation()}>
                                                            {activeTimer?.taskId === task.id ? (
                                                                <button disabled className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 cursor-not-allowed"><CheckSquare size={16} /></button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => startTimerMutation.mutate(task.id)}
                                                                    disabled={task.status === 'DONE'}
                                                                    className={cn(
                                                                        "p-2 rounded-xl transition-all active:scale-90",
                                                                        task.status === 'DONE'
                                                                            ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                                                                            : "text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10"
                                                                    )}
                                                                    title={task.status === 'DONE' ? "Cannot track time for completed tasks" : "Start Timer"}
                                                                >
                                                                    <Play size={16} />
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleEdit(task)} className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 transition-all active:scale-90"><Edit2 size={16} /></button>
                                                            <button onClick={() => handleDelete(task.id)} className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-90"><Trash2 size={16} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Time Logs */}
                                            {expandedTaskId === task.id && <TaskTimeLogs taskId={task.id} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    });
                })()}      {tasks?.length === 0 && (
                    <div className="text-center py-16 animate-fade-in bg-surface-800/10 rounded-3xl border border-white/5 border-dashed">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/10 mb-4">
                            <Sparkles size={28} className="text-brand-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-200">No tasks found</h3>
                        <p className="text-gray-500 mt-1 text-sm">{hasActiveFilters ? 'Try adjusting your filters' : 'Create your first task to get started'}</p>
                        {!hasActiveFilters && (
                            <button onClick={handleCreate} className="btn-primary mt-6 text-sm"><Plus size={16} className="inline mr-1" />Create Task</button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} task={editingTask} onToast={showToast} />}

            {/* Custom Confirm Dialog */}
            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={() => {
                    if (confirmDeleteId) deleteTaskMutation.mutate(confirmDeleteId);
                    setConfirmDeleteId(null);
                }}
                message="Are you sure you want to delete this task? This action is permanent and cannot be undone."
            />
        </div>
    );
}

/* ──────────────── Custom Confirm Dialog ──────────────── */

function ConfirmDialog({ isOpen, onClose, onConfirm, message }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; message: string }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-fade-in" onClick={onClose}>
            <div className="glass-card rounded-3xl shadow-glow-lg w-full max-w-sm overflow-hidden animate-scale-in border-gray-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
                <div className="p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <AlertCircle className="text-red-500 dark:text-red-400" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Confirm Deletion</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{message}</p>
                </div>
                <div className="flex border-t border-gray-200 dark:border-white/5">
                    <button onClick={onClose} className="flex-1 px-6 py-5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all border-r border-gray-200 dark:border-white/5">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="flex-1 px-6 py-5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-600/10 transition-all">
                        Delete Forever
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ──────────────── Time Logs Panel ──────────────── */

function TaskTimeLogs({ taskId }: { taskId: string }) {
    const { data: logs, isLoading } = useQuery<TimeLog[]>({
        queryKey: ['timeLogs', taskId],
        queryFn: async () => {
            const res = await api.get(`/time-logs/task/${taskId}`);
            return res.data;
        },
    });

    const totalSeconds = logs?.reduce((acc, log) => acc + (log.duration || 0), 0) || 0;

    // Calculate today's seconds
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySeconds = logs?.reduce((acc, log) => {
        const logDate = new Date(log.startTime);
        if (logDate >= today) return acc + (log.duration || 0);
        return acc;
    }, 0) || 0;

    // Group logs by date
    const groupedLogs = logs?.reduce((groups: Record<string, TimeLog[]>, log) => {
        const dateKey = format(new Date(log.startTime), 'yyyy-MM-dd');
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(log);
        return groups;
    }, {}) || {};

    const sortedDateKeys = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

    return (
        <div className="border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-surface-800/30 p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Clock size={14} className="text-brand-500 dark:text-brand-400" />
                    Time Logs
                </h4>
                <div className="flex items-center gap-2">
                    {todaySeconds > 0 && todaySeconds !== totalSeconds && (
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                            Today: {formatDuration(todaySeconds)}
                        </span>
                    )}
                    {totalSeconds > 0 && (
                        <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 bg-violet-500/5 dark:bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-100 dark:border-violet-500/20">
                            Total: {formatDuration(totalSeconds)}
                        </span>
                    )}
                </div>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-6">
                    <div className="w-5 h-5 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                </div>
            )}

            {!isLoading && logs && logs.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl">
                    <p className="text-xs text-gray-400 dark:text-gray-600 italic">No time logged for this task yet</p>
                </div>
            )}

            {!isLoading && sortedDateKeys.length > 0 && (
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {sortedDateKeys.map(dateKey => {
                        const dateLogs = groupedLogs[dateKey];
                        const dayTotal = dateLogs.reduce((acc, log) => acc + (log.duration || 0), 0);
                        const isToday = dateKey === format(new Date(), 'yyyy-MM-dd');
                        return (
                            <div key={dateKey} className="group/day">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 group-hover/day:text-brand-500 transition-colors">
                                        {isToday ? '📅 Today' : format(new Date(dateKey + 'T00:00:00'), 'MMM d, yyyy')}
                                    </span>
                                    <span className="text-[11px] font-mono font-bold text-gray-500">
                                        {formatDuration(dayTotal)}
                                    </span>
                                </div>
                                <div className="space-y-1.5">
                                    {dateLogs.map((log) => (
                                        <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-3 rounded-xl bg-white dark:bg-surface-800/40 text-xs border border-gray-100 dark:border-white/[0.02] hover:border-brand-500/30 transition-all shadow-sm dark:shadow-none">
                                            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    log.endTime ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-amber-500 animate-pulse"
                                                )} />
                                                <div className="flex items-center gap-1.5 tabular-nums font-medium">
                                                    <span>{format(new Date(log.startTime), 'h:mm:ss a')}</span>
                                                    {log.endTime && (
                                                        <>
                                                            <span className="text-gray-300 dark:text-gray-600">→</span>
                                                            <span>{format(new Date(log.endTime), 'h:mm:ss a')}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="font-mono font-black text-gray-700 dark:text-gray-300 tabular-nums mt-1 sm:mt-0 ml-4 sm:ml-0">
                                                {log.duration ? formatDuration(log.duration) : (
                                                    <span className="text-amber-500 text-[10px] uppercase tracking-wider animate-pulse font-black">running...</span>
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ──────────────── Task Modal ──────────────── */

function TaskModal({ isOpen, onClose, task, onToast }: { isOpen: boolean; onClose: () => void; task: Task | null; onToast: (m: string, t?: 'success' | 'error') => void }) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: task?.title || '',
            description: task?.description || '',
            status: (task?.status as any) || 'TODO',
            priority: (task?.priority as any) || 'MEDIUM',
            category: task?.category || ''
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: Partial<Task>) => {
            if (task) {
                await api.patch(`/tasks/${task.id}`, data);
            } else {
                await api.post('/tasks', data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
            onToast(task ? 'Task updated' : 'Task created');
            onClose();
            reset();
        },
        onError: () => onToast('An error occurred', 'error')
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="glass-card rounded-3xl shadow-glow-lg w-full max-w-md overflow-hidden animate-scale-in border-gray-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-5 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/[0.02]">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{task ? 'Edit Task' : 'New Task'}</h2>
                    <button onClick={onClose} className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/5 transition-all outline-none"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Title <span className="text-red-500">*</span></label>
                        <input {...register('title')} className={cn("input-field", errors.title && "border-red-500/50 focus:ring-red-500/20")} placeholder="What needs to be done?" />
                        {errors.title && <p className="text-[11px] text-red-500 dark:text-red-400 mt-1.5 ml-1 font-medium">{errors.title.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea {...register('description')} className="input-field resize-none min-h-[100px]" placeholder="Add more details..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                            <select {...register('status')} className="input-field cursor-pointer">
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                            <select {...register('priority')} className="input-field cursor-pointer">
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                        <select {...register('category')} className="input-field cursor-pointer">
                            <option value="">No Category</option>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                        <button type="button" onClick={onClose} className="btn-ghost px-6 py-2.5 text-sm font-semibold">Cancel</button>
                        <button type="submit" disabled={mutation.isPending} className="btn-primary px-8 py-2.5 text-sm font-bold shadow-lg shadow-brand-500/20 disabled:opacity-50">
                            {mutation.isPending ? 'Saving...' : (task ? 'Save Changes' : 'Create Task')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ──────────────── Stopwatch Banner ──────────────── */

function StopwatchBanner({ startTime, taskTitle, onStop }: { startTime: string; taskTitle: string; onStop: () => void }) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const start = new Date(startTime).getTime();
        const tick = () => { setElapsed(Math.floor((Date.now() - start) / 1000)); };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    const formatStopwatch = useCallback((totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return {
            hours: String(hrs).padStart(2, '0'),
            minutes: String(mins).padStart(2, '0'),
            seconds: String(secs).padStart(2, '0'),
        };
    }, []);

    const time = formatStopwatch(elapsed);

    return (
        <div className="rounded-3xl overflow-hidden animate-scale-in shadow-xl dark:shadow-2xl shadow-emerald-500/5 dark:shadow-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 animate-pulse" />
            <div className="bg-white dark:bg-emerald-500/[0.04] backdrop-blur-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="relative">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Clock className="text-emerald-500 dark:text-emerald-400" size={24} />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 animate-pulse border-[3px] border-white dark:border-surface-900" />
                        </div>
                        <div>
                            <div className="flex items-baseline gap-0.5 font-mono">
                                <span className="text-2xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-300 tabular-nums tracking-tighter">{time.hours}</span>
                                <span className="text-xl sm:text-3xl font-black text-emerald-500/30 mx-0.5">:</span>
                                <span className="text-2xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-300 tabular-nums tracking-tighter">{time.minutes}</span>
                                <span className="text-xl sm:text-3xl font-black text-emerald-500/30 mx-0.5">:</span>
                                <span className="text-2xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-300 tabular-nums tracking-tighter">{time.seconds}</span>
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400/80 mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                                <span className="opacity-80">Tracking:</span>
                                <span className="font-bold truncate max-w-[120px] sm:max-w-xs">{taskTitle}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onStop}
                        className="w-full sm:w-auto px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-red-500/10 group">
                        <div className="w-3.5 h-3.5 rounded-sm bg-red-500 dark:bg-red-400 group-hover:scale-110 transition-transform" />
                        Stop Timer
                    </button>
                </div>
            </div>
        </div>
    );
}
/* ──────────────── Skeleton Loader ──────────────── */

function TaskSkeleton() {
    return (
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between animate-pulse border-white/5">
            <div className="flex items-center gap-4 flex-1">
                <div className="w-6 h-6 rounded-full bg-white/5" />
                <div className="space-y-2 flex-1 max-w-md">
                    <div className="h-4 w-1/3 bg-white/5 rounded" />
                    <div className="h-3 w-2/3 bg-white/5 rounded" />
                    <div className="flex gap-2">
                        <div className="h-5 w-16 bg-white/5 rounded-lg" />
                        <div className="h-5 w-16 bg-white/5 rounded-lg" />
                    </div>
                </div>
            </div>
            <div className="flex gap-3">
                <div className="w-20 h-8 bg-white/5 rounded-lg" />
                <div className="w-8 h-8 bg-white/5 rounded-lg" />
            </div>
        </div>
    );
}
