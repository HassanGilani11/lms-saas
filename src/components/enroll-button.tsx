"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Banknote, CreditCard, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { createCheckoutSession } from "@/actions/stripe";
import { enrollInCourse } from "@/actions/progress";
import { enrollWithCod } from "@/actions/purchase";
import { cn } from "@/lib/utils";

import { CodCheckoutForm } from "@/components/cod-checkout-form";

interface EnrollButtonProps {
    courseId: string;
    price: number;
    isFree: boolean;
    fullWidth?: boolean;
    checkoutMode?: boolean;
    initiallyShowOptions?: boolean;
    stripeEnabled?: boolean;
    codEnabled?: boolean;
}

export const EnrollButton = ({
    courseId,
    price,
    isFree,
    fullWidth,
    initiallyShowOptions = false,
    checkoutMode = false,
    stripeEnabled = true,
    codEnabled = true,
}: EnrollButtonProps) => {
    const { data: session } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showOptions, setShowOptions] = useState(initiallyShowOptions);
    // const [showGuestCodDialog, setShowGuestCodDialog] = useState(false); // Deprecated in favor of generic form
    const [showCodForm, setShowCodForm] = useState(false);

    const onClick = async (method?: "stripe" | "cod") => {
        // If not in checkout mode and not free, redirect to checkout page
        if (!checkoutMode && !isFree) {
            return router.push(`/checkout/${courseId}`);
        }

        // Show COD form for both guest and logged-in users
        if (method === "cod") {
            setShowCodForm(true);
            return;
        }

        // Allow Stripe (Guest) to proceed without session
        if (!session && method !== "stripe") {
            return router.push("/auth/login");
        }

        try {
            setIsLoading(true);

            if (isFree) {
                // Free enrollment requires login check above
                if (!session) return router.push("/auth/login");

                const result = await enrollInCourse(courseId);
                if (result) {
                    toast.success("Enrolled successfully!", { duration: 5000 });
                    router.refresh();
                    router.push(`/courses/${courseId}`);
                } else {
                    toast.error("Failed to enroll");
                }
                return;
            }

            if (method === "stripe") {
                const response = await createCheckoutSession(courseId);
                if (response?.url) {
                    window.location.assign(response.url);
                } else {
                    toast.error("Stripe integration failed");
                }
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFree) {
        return (
            <Button
                onClick={() => onClick()}
                disabled={isLoading}
                size="lg"
                className={cn(
                    "h-14 px-10 text-lg font-bold bg-indigo-600 hover:bg-slate-900 text-white transition-all rounded-2xl shadow-xl shadow-indigo-500/20",
                    fullWidth && "w-full"
                )}
            >
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Enroll Now for Free
                    </div>
                )}
            </Button>
        );
    }

    if (!showOptions) {
        return (
            <Button
                onClick={() => onClick()}
                disabled={isLoading}
                size="lg"
                className={cn(
                    "h-14 px-10 text-lg font-bold bg-indigo-600 hover:bg-slate-900 text-white transition-all rounded-2xl shadow-xl shadow-indigo-500/20",
                    fullWidth && "w-full"
                )}
            >
                {checkoutMode ? "Confirm Payment" : "Enroll Now"}
            </Button>
        );
    }

    return (
        <>
            <Dialog open={showCodForm} onOpenChange={setShowCodForm}>
                <DialogContent className="sm:max-w-xl">
                    <DialogTitle className="sr-only">Billing Details</DialogTitle>
                    <CodCheckoutForm
                        courseId={courseId}
                        price={price}
                        onCancel={() => setShowCodForm(false)}
                        initialData={{
                            name: session?.user?.name || "",
                            email: session?.user?.email || "",
                            phone: "",
                            address: ""
                        }}
                    />
                </DialogContent>
            </Dialog>

            {(!stripeEnabled && !codEnabled && !isFree) && (
                <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-semibold text-center w-full">
                    Enrollment currently disabled by administrator.
                </div>
            )}

            <div className={cn("grid gap-4", fullWidth && "w-full")}>
                {stripeEnabled && (
                    <Button
                        onClick={() => onClick("stripe")}
                        disabled={isLoading}
                        size="lg"
                        className="h-14 px-8 text-base font-bold bg-white text-slate-900 border-2 border-indigo-600/20 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-600/40 transition-all rounded-2xl flex items-center justify-between shadow-lg shadow-indigo-500/5 group"
                    >
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                            Pay with Card
                        </div>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                        ) : (
                            <Sparkles className="h-4 w-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
                        )}
                    </Button>
                )}
                {codEnabled && (
                    <Button
                        onClick={() => onClick("cod")}
                        disabled={isLoading}
                        size="lg"
                        className="h-14 px-8 text-base font-bold bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all rounded-2xl flex items-center justify-between shadow-lg shadow-slate-500/5 group"
                    >
                        <div className="flex items-center gap-3">
                            <Banknote className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                            Cash on Delivery
                        </div>
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                    </Button>
                )}
                <button
                    onClick={() => setShowOptions(false)}
                    className="text-sm text-slate-400 font-bold hover:text-white transition-colors text-center w-full"
                >
                    Cancel payment
                </button>
            </div>
        </>
    );
};
