import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Sign In" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center">
                <div className="w-full max-w-xl">
                    <div className="bg-white rounded-[40px] p-8 sm:p-12 shadow-2xl shadow-primary/5 border border-gray-100">
                        <div className="text-center mb-10 space-y-4">
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Welcome Back</h1>
                            <p className="text-gray-500 font-medium">Please enter your details to sign in.</p>
                        </div>

                        {status && (
                            <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-600">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-extrabold text-foreground uppercase tracking-widest px-1">Email Address</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="your@email.com"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-sm font-extrabold text-foreground uppercase tracking-widest">Password</label>
                                    {canResetPassword && (
                                        <Link href={route('password.request')} className="text-xs font-bold text-primary hover:underline">
                                            Forgot?
                                        </Link>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    value={data.password}
                                    className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center gap-2 px-1">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-5 h-5 rounded-md border-gray-200 text-primary focus:ring-primary/20"
                                />
                                <span className="text-sm font-bold text-gray-500">Remember me</span>
                            </div>

                            <div className="pt-4">
                                <button
                                    disabled={processing}
                                    className="w-full py-5 rounded-full bg-primary text-white font-extrabold hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all translate-y-0 hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0"
                                >
                                    {processing ? 'Signing In...' : 'Sign In'}
                                </button>
                            </div>

                            <div className="text-center pt-6">
                                <p className="text-sm font-bold text-gray-400">
                                    Don't have an account?{' '}
                                    <Link href={route('register')} className="text-primary hover:underline">
                                        Sign Up Free
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
