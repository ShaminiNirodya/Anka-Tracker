import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, CheckSquare, LogOut, Timer, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout() {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    ];

    return (
        <div className="flex h-screen bg-surface-900 text-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-72 glass flex flex-col animate-slide-in-right">
                {/* Brand Header */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
                            <Timer size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold gradient-text">AnkaTracker</h1>
                            <p className="text-xs text-gray-500">Productivity Suite</p>
                        </div>
                    </div>
                </div>

                {/* User Card */}
                <div className="px-4 py-4">
                    <div className="glass-light rounded-xl p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-200 truncate">{user?.username}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <Sparkles size={14} className="text-brand-400 animate-pulse-soft" />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-2 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-brand-500/10 text-brand-400 shadow-glow"
                                        : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                                )}
                            >
                                <Icon size={20} className={cn(
                                    "transition-transform duration-200",
                                    isActive ? "text-brand-400" : "group-hover:scale-110"
                                )} />
                                <span className="font-medium text-sm">{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-soft" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 group"
                    >
                        <LogOut size={20} className="group-hover:scale-110 transition-transform duration-200" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8 max-w-7xl mx-auto animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
