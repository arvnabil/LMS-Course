import GuestLayout from '@/Layouts/GuestLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Verify({ code, certificate, status }) {
    const { global_settings } = usePage().props;
    const platformName = global_settings?.platform_name || 'LMS';
    
    const [searchCode, setSearchCode] = useState(code || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('certificate.verify'), { code: searchCode }, { preserveState: true });
    };

    return (
        <GuestLayout>
            <Head title={`Verify Certificate | ${platformName}`} />

            <div className="min-h-[calc(100vh-200px)] py-20 px-4 sm:px-6 lg:px-8 bg-muted relative">
                
                <div className="absolute top-0 left-0 w-full h-[300px] bg-primary/5 border-b border-primary/10"></div>

                <div className="max-w-3xl mx-auto relative z-10">
                    <div className="text-center mb-12 space-y-4">
                        <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-primary/10 rounded-2xl sm:rounded-3xl shadow-inner shadow-white mb-2 sm:mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-12 sm:h-12 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">Certificate Validation</h1>
                        <p className="text-gray-500 font-medium max-w-xl mx-auto text-sm sm:text-base">
                            Enter the unique certificate code below to verify its authenticity and check the details of the achievement.
                        </p>
                    </div>

                    <div className="bg-surface rounded-[32px] p-6 sm:p-10 shadow-xl shadow-gray-200/50 dark:shadow-none border border-border">
                        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                            <input 
                                type="text" 
                                value={searchCode}
                                onChange={e => setSearchCode(e.target.value)}
                                placeholder="e.g. CERT-ABC123XYZ" 
                                className="flex-1 w-full bg-muted border border-border rounded-xl px-5 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase outline-none transition-all placeholder:normal-case placeholder:font-normal placeholder:text-gray-400"
                                required
                            />
                            <button type="submit" className="bg-primary text-white font-extrabold px-6 py-4 rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">
                                <span className="hidden sm:inline">Verify</span>
                                <span className="sm:hidden">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                                </span>
                            </button>
                        </form>

                        {/* Results */}
                        {status === 'idle' && (
                            <div className="text-center py-12 text-gray-400 dark:text-gray-500 font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                                <p>Waiting for certificate code...</p>
                            </div>
                        )}

                        {status === 'invalid' && (
                            <div className="text-center py-10 px-6 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl animate-in fade-in zoom-in duration-300">
                                <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                </span>
                                <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mb-2">Invalid Certificate</h3>
                                <p className="text-red-700/80 dark:text-red-400/80 font-medium text-sm">
                                    We couldn't find a valid certificate matching the code provided. Please ensure the code is correct or contact support.
                                </p>
                            </div>
                        )}

                        {status === 'valid' && certificate && (
                            <div className="border border-green-200 dark:border-green-500/20 bg-gradient-to-b from-green-50 to-white dark:from-green-500/5 dark:to-transparent rounded-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-300">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 dark:bg-green-500/20 p-2 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-green-900 dark:text-green-400 leading-tight">Verified Successfully</h3>
                                            <p className="text-xs font-bold text-green-700 dark:text-green-500 uppercase tracking-widest">{certificate.certificate_code}</p>
                                        </div>
                                    </div>
                                    <div className="px-4 py-1.5 bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/20 rounded-full text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-widest self-start sm:self-auto">
                                        Authentic
                                    </div>
                                </div>
                                
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 pb-6 border-b border-gray-100 dark:border-white/10">
                                    <div>
                                        <dt className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Recipient Name</dt>
                                        <dd className="text-lg font-extrabold text-foreground">{certificate.student.full_name || certificate.student.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Issued For</dt>
                                        <dd className="text-base font-bold text-foreground leading-tight">{certificate.course.title}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Issue Date</dt>
                                        <dd className="text-base font-bold text-foreground">
                                            {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    This certificate guarantees that the individual has completed all requirements for the corresponding course.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
