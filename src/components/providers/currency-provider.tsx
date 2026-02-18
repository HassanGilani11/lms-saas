"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import { useSettings } from "./settings-provider";

interface CurrencyContextProps {
    currency: string;
    setCurrency: (currency: string) => void;
    availableCurrencies: string[];
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const { settings } = useSettings();
    const [currency, setCurrencyState] = useState<string>("USD");

    // Get available currencies from settings
    const ratesKeys = (settings as any)?.exchangeRates
        ? Object.keys((settings as any).exchangeRates as object)
        : ["USD", "EUR", "GBP", "CAD", "AUD"];

    const baseCur = (settings as any)?.baseCurrency || "USD";
    const stripeCur = (settings as any)?.stripeCurrency || "USD";

    // Ensure system currencies are always in the list and unique
    const availableCurrencies = Array.from(new Set([
        baseCur,
        stripeCur,
        ...ratesKeys
    ])).filter(Boolean).sort();

    useEffect(() => {
        const savedCurrency = Cookies.get("user-currency");
        if (savedCurrency) {
            setCurrencyState(savedCurrency);
        } else if ((settings as any)?.stripeCurrency) {
            setCurrencyState((settings as any).stripeCurrency);
        }
    }, [settings]);

    const setCurrency = (newCurrency: string) => {
        setCurrencyState(newCurrency);
        Cookies.set("user-currency", newCurrency, { expires: 365 });
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, availableCurrencies }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
};
