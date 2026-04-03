import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';

export default function Catalog() {
    return (
        <DashboardLayout
            header={
                <h1 className="text-xl font-bold text-foreground">Course Catalog</h1>
            }
        >
            <Head title="Course Catalog" />
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-[20px]">
                <div className="p-6 text-foreground border-b border-gray-100">
                    We are rendering the Course Catalog placeholder.
                </div>
            </div>
        </DashboardLayout>
    );
}
