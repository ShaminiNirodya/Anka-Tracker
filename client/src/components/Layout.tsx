import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { LayoutDashboard, CheckSquare, LogOut, Timer, Sparkles, Sun, Moon, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout() {
    const { logout, user } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    ];

    const SidebarContent = () => (
        <>
            {/* Brand Header */}
            <div className="p-6 border-b border-gray-200 dark:border-white/5">
                <div className="flex items-center justify-between">
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
            </div>

            {/* User Card */}
            <div className="px-4 py-4">
                <div className="bg-gray-100 dark:bg-surface-700/50 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{user?.username}</p>
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
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-sm dark:shadow-glow"
                                    : "text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                            )}
                        >
                            <Icon size={20} className={cn(
                                "transition-transform duration-200",
                                isActive ? "text-brand-600 dark:text-brand-400" : "group-hover:scale-110"
                            )} />
                            <span className="font-medium text-sm">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400 animate-pulse-soft" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-white/5 space-y-2">
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200 group"
                >
                    {theme === 'light' ? (
                        <>
                            <Moon size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-sm">Dark Mode</span>
                        </>
                    ) : (
                        <>
                            <Sun size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-sm">Light Mode</span>
                        </>
                    )}
                </button>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all duration-200 group"
                >
                    <LogOut size={20} className="group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-surface-900 transition-colors duration-300 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 glass flex-col animate-slide-in-right h-full">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-72 glass flex flex-col z-[100] lg:hidden transition-transform duration-300 ease-out",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-4 flex justify-end lg:hidden">
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500">
                        <X size={24} />
                    </button>
                </div>
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 glass flex items-center justify-between px-4 z-40">
                    <div className="flex items-center gap-2">
                        <Timer size={20} className="text-brand-500" />
                        <span className="font-bold gradient-text">AnkaTracker</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                <main className="flex-1 overflow-auto">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

