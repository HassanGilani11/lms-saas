"use client";

import { ComingSoon } from "@/components/shared/coming-soon";
import { CreditCard } from "lucide-react";

const PaymentGatewayPage = () => {
    return (
        <ComingSoon
            title="Payment Gateway"
            icon={CreditCard}
            description="Our advanced payment processing system with multi-currency support and automated invoicing is on its way."
        />
    );
};

export default PaymentGatewayPage;
