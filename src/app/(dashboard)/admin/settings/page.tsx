
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSettings } from "@/actions/settings";
import { SettingsHeader } from "./_components/settings-header";
import { SettingsForm } from "./_components/settings-form";

const SettingsPage = async () => {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
        return redirect("/");
    }

    const settings = await getSettings();

    return (
        <div className="p-6 space-y-6 text-slate-900 dark:text-slate-100">
            <SettingsHeader />
            <div className="grid gap-6">
                <SettingsForm initialData={settings} />
            </div>
        </div>
    );
};

export default SettingsPage;
