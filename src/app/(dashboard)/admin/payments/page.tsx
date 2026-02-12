import { getAdminPurchases } from "@/actions/purchase";
import { TransactionsTable } from "./_components/transactions-table";

const PaymentGatewayPage = async () => {
    const transactions = await getAdminPurchases();

    return (
        <div className="space-y-6 font-sans">
            <h1 className="text-[15px] font-bold text-slate-800 uppercase tracking-tight">
                Transaction Management
            </h1>
            <TransactionsTable data={transactions} />
        </div>
    );
};

export default PaymentGatewayPage;
