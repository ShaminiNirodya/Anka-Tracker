import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Timer, ArrowRight, Sparkles } from 'lucide-react';

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
    const { login } = useAuthStore();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        try {
            const res = await api.post('/auth/register', data);
            login(res.data.user, res.data.access_token);
            navigate('/');
        } catch (err: any) {
            setError('root', { message: err.response?.data?.message || 'Registration failed. Try again.' });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-surface-900 px-4 relative overflow-hidden transition-colors duration-500">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-float" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md animate-slide-up relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-light dark:bg-white/5 mb-6 border border-brand-500/10 shadow-sm dark:shadow-none">
                        <Sparkles size={14} className="text-brand-500 dark:text-brand-400" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Start tracking today</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xl shadow-brand-500/25">
                            <Timer size={32} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Create Account</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Join AnkaTracker and boost your productivity</p>
                </div>

                {/* Card */}
                <div className="glass rounded-[32px] p-8 sm:p-10 shadow-glow-lg dark:shadow-glow-xl border border-white dark:border-white/10 bg-white/70 dark:bg-surface-800/40 backdrop-blur-2xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {errors.root && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-2xl flex items-center gap-3 animate-scale-in">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <span className="font-semibold">{errors.root.message}</span>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Username</label>
                            <input
                                {...register('username')}
                                className="input-field"
                                placeholder="johndoe"
                            />
                            {errors.username && <p className="text-red-500 dark:text-red-400 text-xs mt-2 ml-1 font-medium">{errors.username.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Email Address</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="input-field"
                                placeholder="name@example.com"
                            />
                            {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-2 ml-1 font-medium">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Password</label>
                            <input
                                {...register('password')}
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-500 dark:text-red-400 text-xs mt-2 ml-1 font-medium">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base font-bold shadow-xl shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Get Started
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-bold transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
