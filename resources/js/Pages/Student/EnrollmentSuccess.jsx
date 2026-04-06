import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Toast from '@/Components/Toast';

export default function EnrollmentSuccess({ course }) {
    const { data, setData, post, processing, errors } = useForm({
        reasons: [],
    });
    
    const [toast, setToast] = useState(null);

    const presetReasons = [
        "Upgrade my current skills",
        "I need the portfolio from this course",
        "The syllabus interests me",
        "I want to update my portfolio",
        "I want to get a remote/freelance job"
    ];

    const toggleReason = (reason) => {
        const current = [...data.reasons];
        if (current.includes(reason)) {
            setData('reasons', current.filter(r => r !== reason));
        } else {
            setData('reasons', [...current, reason]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('student.enrollment.reason', course.slug), {
            onSuccess: () => {
                // Should redirect to learning page
            },
            onError: () => {
                setToast({ message: 'Terjadi kesalahan, silakan coba lagi.', type: 'error' });
            }
        });
    };

    const skip = () => {
        router.post(route('student.enrollment.reason', course.slug), { reasons: [] });
    };

    return (
        <GuestLayout>
            <Head title="Success Join Class" />
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl w-full">
                    {/* Illustration Header */}
                    <div className="flex justify-center mb-8">
                        {/* Placeholder illustration */}
                        <div className="w-80 h-48 bg-primary/10 rounded-3xl flex items-center justify-center overflow-hidden">
                            <span className="text-6xl">🎉</span>
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-extrabold text-foreground mb-3">
                            Happy Learning
                        </h1>
                        <h2 className="text-2xl font-bold text-[#2a3547] mb-4">
                            {course.title}
                        </h2>
                        <p className="text-gray-500 max-w-md mx-auto text-sm">
                            Silakan mempelajari materi kelas yang telah kami design dengan baik untuk mencapai goals
                        </p>
                    </div>

                    <div className="bg-white py-10 px-6 sm:px-12 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100">
                        <h3 className="text-lg font-bold text-foreground mb-2">
                            Why do you join this course and what is your expectation?
                        </h3>
                        <p className="text-sm text-gray-400 mb-8">
                            You can choose more than one option
                        </p>

                        <form onSubmit={submit}>
                            <div className="space-y-4 mb-10">
                                {presetReasons.map((reason, index) => (
                                    <label 
                                        key={index} 
                                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                                            data.reasons.includes(reason) 
                                                ? 'border-primary bg-primary/5 shadow-sm' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary/50"
                                            checked={data.reasons.includes(reason)}
                                            onChange={() => toggleReason(reason)}
                                        />
                                        <span className={`ml-4 text-sm font-medium ${
                                            data.reasons.includes(reason) ? 'text-primary' : 'text-gray-600'
                                        }`}>
                                            {reason}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-2/3 py-4 px-6 bg-primary text-white font-extrabold text-[15px] rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 hover:-translate-y-0.5 transition-all disabled:opacity-75 disabled:hover:translate-y-0"
                                >
                                    {processing ? 'Processing...' : 'Mulai Belajar'}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={skip}
                                    disabled={processing}
                                    className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    I rather not to tell
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
