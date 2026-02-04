"use client";

import { ComingSoon } from "@/components/shared/coming-soon";
import { Share2 } from "lucide-react";

const ToolsPage = () => {
    return (
        <ComingSoon
            title="Import & Export"
            icon={Share2}
            description="Bulk data migration tools for courses, users, and progress tracking are being finalized for launch."
        />
    );
};

export default ToolsPage;
