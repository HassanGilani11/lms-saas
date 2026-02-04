"use client";

import { ComingSoon } from "@/components/shared/coming-soon";
import { GitBranch } from "lucide-react";

const BranchPage = () => {
    return (
        <ComingSoon
            title="Branch Management"
            icon={GitBranch}
            description="Manage multiple locations, specialized departments, and regional branding from a single dashboard."
        />
    );
};

export default BranchPage;
