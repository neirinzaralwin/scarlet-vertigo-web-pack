import { DashboardLayout } from '@/components/dashboard-layout';

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
                    <p className="text-muted-foreground">Manage your account information and general preferences.</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
