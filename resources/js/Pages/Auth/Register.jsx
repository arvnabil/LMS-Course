import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Register() {
    const { global_settings } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        full_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Create Account" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center">
                <div className="w-full max-w-xl">
                    <div className="bg-white rounded-[40px] p-8 sm:p-12 shadow-2xl shadow-primary/5 border border-gray-100">
                        <div className="text-center mb-10 space-y-4">
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Create Your Account</h1>
                            <p className="text-gray-500 font-medium">Join {global_settings?.platform_name || 'EduCore'} and start your learning journey.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-extrabold text-foreground uppercase tracking-widest px-1">Full Name</label>
                                <input
                                    type="text"
                                    value={data.full_name}
                                    className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="Enter your full name"
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.full_name} />
                            </div>

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
                                <label className="text-sm font-extrabold text-foreground uppercase tracking-widest px-1">Password</label>
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

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-extrabold text-foreground uppercase tracking-widest px-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <div className="pt-4">
                                <button
                                    disabled={processing}
                                    className="w-full py-5 rounded-full bg-primary text-white font-extrabold hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all translate-y-0 hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0"
                                >
                                    {processing ? 'Creating Account...' : 'Continue to Dashboard'}
                                </button>
                            </div>

                            <div className="text-center pt-6">
                                <p className="text-sm font-bold text-gray-400">
                                    Already have an account?{' '}
                                    <Link href={route('login')} className="text-primary hover:underline">
                                        Sign In
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
