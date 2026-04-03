import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <DashboardLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-foreground">Profile Settings</h1>
                    <p className="text-xs text-gray-500">Manage your account information and security.</p>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-[20px] shadow-sm border border-gray-100">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="bg-white p-6 md:p-8 rounded-[20px] shadow-sm border border-gray-100">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="bg-red-50/50 p-6 md:p-8 rounded-[20px] shadow-sm border border-red-100">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </DashboardLayout>
    );
}
