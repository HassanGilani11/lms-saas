"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/components/providers/currency-provider";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const CurrencySwitcher = () => {
    const { currency, setCurrency, availableCurrencies } = useCurrency();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-x-2 text-slate-600 hover:text-slate-900 transition-colors px-3 h-9"
                >
                    <Globe className="h-4 w-4" />
                    <span className="text-sm font-bold uppercase tracking-wider">{currency}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 rounded-xl p-2 border-slate-100 shadow-xl">
                {availableCurrencies.map((cur) => (
                    <DropdownMenuItem
                        key={cur}
                        onClick={() => setCurrency(cur)}
                        className={cn(
                            "flex items-center justify-between cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            currency === cur
                                ? "bg-indigo-50 text-indigo-600"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        {cur}
                        {currency === cur && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
