import GuestLayout from '@/Layouts/GuestLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Toast from '@/Components/Toast';

export default function Checkout({ snapToken, course, transaction, midtransClientKey, isProduction }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        // Load Midtrans Snap JS dynamically
        const script = document.createElement('script');
        script.src = isProduction 
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', midtransClientKey);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = () => {
        if (!window.snap) {
            setToast({ message: 'Midtrans is still loading, please wait...', type: 'info' });
            return;
        }

        setIsProcessing(true);

        window.snap.pay(snapToken, {
            onSuccess: function (result) {
                // Payment was successful (transaction success)
                // Midtrans Webhook will auto-enroll, we just redirect user
                router.get(route('payment.callback'), { status: 'success' });
            },
            onPending: function (result) {
                // Waiting your payment
                router.get(route('payment.callback'), { status: 'pending' });
            },
            onError: function (result) {
                // Payment failed
                router.get(route('payment.callback'), { status: 'error' });
                setIsProcessing(false);
            },
            onClose: function () {
                // Customer closed the popup without finishing the payment
                setIsProcessing(false);
            }
        });
    };

    return (
        <GuestLayout>
            <Head title={`Checkout - ${course.title}`} />
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            
            <div className="max-w-3xl mx-auto px-4 py-16">
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
                    <h1 className="text-2xl font-extrabold text-foreground mb-6">Complete Your Enrollment</h1>
                    
                    <div className="bg-muted rounded-2xl p-6 mb-8 border border-gray-50 flex items-center gap-6">
                        <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                            📘
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-foreground leading-tight">{course.title}</h2>
                            <p className="text-sm text-gray-500 mt-1">By {course.mentor?.full_name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                            <p className="text-2xl font-extrabold text-primary">
                                Rp {Number(transaction.amount).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <button 
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="w-full md:w-auto px-12 py-4 bg-foreground py-5 rounded-full font-extrabold text-sm text-white uppercase tracking-widest shadow-xl hover:bg-gray-800 transition-all disabled:opacity-50"
                        >
                            {isProcessing ? 'Processing...' : 'Pay with Midtrans'}
                        </button>
                        <p className="text-xs text-gray-400 font-medium mt-4">
                            You will be redirected securely to Midtrans payment gateway.
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
