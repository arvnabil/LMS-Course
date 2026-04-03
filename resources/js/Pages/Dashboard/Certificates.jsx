import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';

export default function Certificates({ certificates }) {
    const certs = certificates || [];

    return (
        <DashboardLayout header={<h1 className="text-xl font-bold text-foreground">My Certificates</h1>}>
            <Head title="Certificates" />

            <div className="space-y-6">
                {certs.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">No certificates yet</h3>
                        <p className="text-sm text-gray-500">Complete courses to earn certificates!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {certs.map(cert => (
                            <div key={cert.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Certificate Header */}
                                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">{cert.course?.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1 font-mono">{cert.certificate_code}</p>
                                </div>
                                {/* Certificate Details */}
                                <div className="p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Issued</span>
                                        <span className="text-foreground font-medium">
                                            {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                        </span>
                                    </div>
                                    {cert.pdf_url && (
                                        <a href={cert.pdf_url.startsWith('/') ? cert.pdf_url : `/storage/${cert.pdf_url}`} target="_blank" rel="noopener noreferrer"
                                            className="block w-full text-center px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                                            Download PDF
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
