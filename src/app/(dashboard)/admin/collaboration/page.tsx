"use client";

import { ComingSoon } from "@/components/shared/coming-soon";
import { MessagesSquare } from "lucide-react";

const CollaborationPage = () => {
    return (
        <ComingSoon
            title="Collaboration Tools"
            icon={MessagesSquare}
            description="Real-time chat, shared whiteboards, and peer-review systems will be available in future updates."
        />
    );
};

export default CollaborationPage;
