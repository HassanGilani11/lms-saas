export const formatPrice = (
    price: number,
    currency = "USD",
    exchangeRates?: any,
    baseCurrency = "USD"
) => {
    if (price === 0) return "Free";

    let displayPrice = price;
    if (exchangeRates && currency !== baseCurrency) {
        const rate = exchangeRates[currency] || 1;
        displayPrice = price * rate;
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
    }).format(displayPrice);
}
