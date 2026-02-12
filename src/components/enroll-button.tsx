"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Banknote, CreditCard, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/actions/stripe";
import { enrollInCourse } from "@/actions/progress";
import { enrollWithCod } from "@/actions/purchase";
import { cn } from "@/lib/utils";

import { GuestCheckoutDialog } from "@/components/guest-checkout-dialog";

interface EnrollButtonProps {
    courseId: string;
    price: number;
    isFree: boolean;
    fullWidth?: boolean;
    initiallyShowOptions?: boolean;
}

export const EnrollButton = ({
    courseId,
    price,
    isFree,
    fullWidth,
    initiallyShowOptions = false
}: EnrollButtonProps) => {
    const { data: session } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showOptions, setShowOptions] = useState(initiallyShowOptions);
    const [showGuestCodDialog, setShowGuestCodDialog] = useState(false);

    const onClick = async (method?: "stripe" | "cod") => {
        // Allow Stripe (Guest) to proceed without session
        if (!session && method !== "stripe") {
            // For COD guest, show dialog instead of redirect
            if (method === "cod") {
                setShowGuestCodDialog(true);
                return;
            }
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
            } else if (method === "cod") {
                // COD requires login check above
                if (!session) return router.push("/auth/login");

                const response = await enrollWithCod(courseId);
                if (response.success) {
                    toast.success("Enrollment requested! Wait for approval.", { duration: 5000 });
                    router.refresh();
                } else {
                    toast.error(response.error || "Failed to request enrollment");
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
                onClick={() => setShowOptions(true)}
                disabled={isLoading}
                size="lg"
                className={cn(
                    "h-14 px-10 text-lg font-bold bg-indigo-600 hover:bg-slate-900 text-white transition-all rounded-2xl shadow-xl shadow-indigo-500/20",
                    fullWidth && "w-full"
                )}
            >
                Buy Now
            </Button>
        );
    }

    return (
        <div className={cn("grid gap-4", fullWidth && "w-full")}>
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
            <button
                onClick={() => setShowOptions(false)}
                className="text-sm text-slate-400 font-bold hover:text-white transition-colors text-center w-full"
            >
                Cancel payment
            </button>
            <GuestCheckoutDialog
                open={showGuestCodDialog}
                onOpenChange={setShowGuestCodDialog}
                courseId={courseId}
                coursePrice={price}
            />
        </div>
    );
};
