import Link from "next/link";
import { CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

const GuestCodSuccessPage = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-4">
            <CheckCircle className="h-16 w-16 text-emerald-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                Order Received!
            </h1>
            <p className="text-slate-600 text-center max-w-sm">
                Your request for enrollment via Cash on Delivery has been received.
                <br /><br />
                We have created an account for you. Please check your email for login details and further instructions.
            </p>
            <div className="flex items-center gap-x-3 mt-6">
                <Link href="/">
                    <Button variant="outline">
                        Back to Home
                    </Button>
                </Link>
                <Link href="/auth/login">
                    <Button>
                        Go to Login
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default GuestCodSuccessPage;
