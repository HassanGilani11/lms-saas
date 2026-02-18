"use client";

import { useCurrency } from "@/components/providers/currency-provider";
import { useSettings } from "@/components/providers/settings-provider";
import { formatPrice } from "@/lib/format";
import { useCallback } from "react";

export const useFormatPrice = () => {
    const { currency } = useCurrency();
    const { settings } = useSettings();

    const format = useCallback((price: number) => {
        return formatPrice(
            price,
            currency,
            (settings as any)?.exchangeRates,
            (settings as any)?.baseCurrency || "USD"
        );
    }, [currency, settings]);

    return { format, currency };
};
