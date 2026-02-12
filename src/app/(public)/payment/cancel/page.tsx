import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CancelPageProps {
    searchParams: Promise<{
        courseId: string;
    }>;
}

const CancelPage = async ({
    searchParams
}: CancelPageProps) => {
    const { courseId } = await searchParams;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return redirect("/auth/login");
    }

    const course = await db.course.findUnique({
        where: { id: courseId },
    });

    if (!course) {
        return redirect("/");
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center pt-24 pb-12">
            <div className="max-w-md w-full px-6 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mx-auto w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100">
                    <XCircle className="h-12 w-12 text-rose-500" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Payment Cancelled</h1>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed">
                        The payment process was interrupted. No charges were made for <br />
                        <span className="text-slate-900 font-bold">"{course.title}"</span>
                    </p>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                    <p className="text-sm text-slate-600 font-medium">
                        Need help with your purchase? Our support team is here to assist you with any payment issues.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <Link href="/support" className="flex items-center gap-2 text-indigo-600 font-bold hover:underline">
                            <HelpCircle className="h-4 w-4" />
                            Contact Support
                        </Link>
                    </div>
                </div>

                <div className="pt-4 flex flex-col gap-4">
                    <Button asChild size="lg" className="h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 transition-all rounded-2xl">
                        <Link href={`/checkout/${courseId}`} className="flex items-center gap-2">
                            Try Again
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="text-slate-500 font-bold hover:text-slate-900">
                        <Link href={`/courses/${courseId}`} className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to course details
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CancelPage;
