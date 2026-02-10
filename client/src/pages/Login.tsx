import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Timer, ArrowRight, Sparkles } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
    const { login } = useAuthStore();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            const res = await api.post('/auth/login', data);
            login(res.data.user, res.data.access_token);
            navigate('/');
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError('root', { message: 'Invalid email or password' });
            } else {
                setError('root', { message: 'Something went wrong. Please try again.' });
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-900 px-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md animate-slide-up relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-light mb-6">
                        <Sparkles size={14} className="text-brand-400" />
                        <span className="text-xs font-medium text-gray-400">Productivity made simple</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
                            <Timer size={24} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                    <p className="text-gray-400 mt-2">Sign in to continue tracking your productivity</p>
                </div>

                {/* Card */}
                <div className="glass rounded-2xl p-8 shadow-glow-lg">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {errors.root && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2 animate-scale-in">
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                                {errors.root.message}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input
                                {...register('password')}
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}
