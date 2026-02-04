"use client";

import { ComingSoon } from "@/components/shared/coming-soon";
import { AlertCircle } from "lucide-react";

const ReportPage = () => {
    return (
        <ComingSoon
            title="Advanced Reporting"
            icon={AlertCircle}
            description="Detailed analytics, custom report builders, and scheduled data exports are currently in development."
        />
    );
};

export default ReportPage;
