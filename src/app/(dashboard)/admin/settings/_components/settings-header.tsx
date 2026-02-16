import { Settings } from "lucide-react";

export const SettingsHeader = () => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Settings className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">System Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your platform branding, email templates, and payment configurations.
                    </p>
                </div>
            </div>
        </div>
    );
};
