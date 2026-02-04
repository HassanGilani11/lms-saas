"use client";

import { ComingSoon } from "@/components/shared/coming-soon";
import { Settings } from "lucide-react";

const SettingsPage = () => {
    return (
        <ComingSoon
            title="Global Settings"
            icon={Settings}
            description="Configure platform-wide branding, security protocols, and system integrations in the upcoming release."
        />
    );
};

export default SettingsPage;
