"use client";

import { logout } from "@/actions/auth";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LogoutButton = () => {
    const onClick = () => {
        logout();
    };

    return (
        <Button
            variant="ghost"
            className="w-full justify-start gap-x-2 text-slate-500 hover:text-red-600 hover:bg-red-50"
            onClick={onClick}
        >
            <LogOut size={22} />
            Logout
        </Button>
    );
};
