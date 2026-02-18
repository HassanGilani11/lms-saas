"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { fulfillStripeCheckout } from "@/actions/fulfillment";
import { Loader2, CheckCircle2, PartyPopper, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { NotificationProvider } from "@/components/providers/notification-provider";


const SuccessContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { status } = useSession();
    const [isProcessing, setIsProcessing] = useState(false);

    const sessionId = searchParams.get("session_id");
    const courseId = searchParams.get("courseId");
    const isGuest = searchParams.get("is_guest");

    useEffect(() => {
        const processFulfillment = async () => {
            if (sessionId && !isProcessing) {
                setIsProcessing(true);
                try {
                    console.log("[SUCCESS_PAGE] Triggering fulfillment for session:", sessionId);

                    // 1. Ensure user/purchase exists (fallback for webhook)
                    const result = await fulfillStripeCheckout(sessionId);
                    console.log("[SUCCESS_PAGE] Fulfillment result:", result);

                    if (result.error) {
                        toast.error(result.error);
                        return;
                    }

                    // 2. Auto-login ONLY if was guest and unauthenticated
                    if (isGuest && status === "unauthenticated") {
                        const loginResult = await signIn("credentials", {
                            stripeSessionId: sessionId,
                            redirect: false,
                        });

                        if (loginResult?.ok) {
                            toast.success("Account created & logged in!");
                            router.refresh();
                        } else {
                            toast.error("Auto-login failed. Please log in manually.");
                        }
                    } else if (status === "authenticated") {
                        // Just refresh to show the course in portal
                        router.refresh();
                    }
                } catch (error) {
                    console.error(error);
                    toast.error("Something went wrong verifying your purchase");
                } finally {
                    setIsProcessing(false);
                }
            }
        };

        processFulfillment();
    }, [sessionId, isGuest, status, isProcessing, router]);

    if (isProcessing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-slate-500 font-medium">Setting up your account...</p>
            </div>
        );
    }

    return (
        <div className="max-w-md w-full px-6 text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                <div className="relative bg-emerald-500 rounded-full w-24 h-24 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-amber-400 rounded-full p-2 shadow-md animate-bounce">
                    <PartyPopper className="h-5 w-5 text-amber-900" />
                </div>
            </div>

            <div className="space-y-4">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Success!</h1>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">
                    Payment confirmed! You are now enrolled.
                </p>
                {isGuest && (
                    <p className="text-sm text-indigo-600 font-bold bg-indigo-50 p-2 rounded-lg">
                        Account created! Check your email for details.
                    </p>
                )}
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                <div className="flex items-center gap-3 text-left">
                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Immediate Access</p>
                        <p className="text-xs text-slate-500">Jump straight into the first lesson.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-left">
                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Certificate Track</p>
                        <p className="text-xs text-slate-500">Complete the course to earn your certificate.</p>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex flex-col gap-4">
                <Button asChild size="lg" className="h-14 text-lg font-bold bg-indigo-600 hover:bg-slate-900 transition-all rounded-2xl shadow-xl shadow-indigo-500/20">
                    <Link href={courseId ? `/courses/${courseId}` : "/student"} className="flex items-center gap-2">
                        Start Learning Now
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </Button>
                <Button asChild variant="ghost" className="text-slate-500 font-bold hover:text-slate-900">
                    <Link href="/student/orders">View Receipt</Link>
                </Button>
            </div>
        </div>
    );
};

const SuccessPage = () => {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center pt-24 pb-12">
            <NotificationProvider>
                <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin text-indigo-600" />}>
                    <SuccessContent />
                </Suspense>
            </NotificationProvider>
        </div>
    );
};

export default SuccessPage;
