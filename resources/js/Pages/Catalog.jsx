import GuestLayout from '@/Layouts/GuestLayout';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import CatalogContent from '@/Components/CatalogContent';

export default function Catalog({ categories = [], courses = { data: [] }, filters = {}, isDashboard = false, basePath = '/catalog', detailRouteName = 'courses.public.show' }) {
    const Layout = isDashboard ? DashboardLayout : GuestLayout;

    return (
        <Layout 
            header={isDashboard ? <h2 className="font-semibold text-xl text-gray-800 leading-tight">Course Catalog</h2> : null}
        >
            <Head title="Course Catalog" />

            {!isDashboard && (
                /* Header only for Guest Version */
                <header className="bg-muted py-20 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl space-y-4 text-center sm:text-left">
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
                                Explore Our <span className="text-primary">Catalog</span>
                            </h1>
                            <p className="text-gray-500 text-lg font-medium">
                                Choose from professional courses and start learning today.
                            </p>
                        </div>
                    </div>
                </header>
            )}

            <div className={isDashboard ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"}>
                <CatalogContent 
                    categories={categories}
                    courses={courses}
                    filters={filters}
                    basePath={basePath}
                    detailRouteName={detailRouteName}
                />
            </div>
        </Layout>
    );
}
