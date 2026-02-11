import { Settings } from "lucide-react";

export const SettingsHeader = () => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                    <Settings className="h-6 w-6 text-slate-700" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your platform branding, email templates, and payment configurations.
                    </p>
                </div>
            </div>
        </div>
    );
};
