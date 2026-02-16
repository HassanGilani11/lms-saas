import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BookOpen, CheckCircle2, ShieldCheck, CreditCard, Banknote, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EnrollButton } from "@/components/enroll-button";

interface CheckoutPageProps {
    params: Promise<{
        courseId: string;
    }>;
}

const CheckoutPage = async ({
    params
}: CheckoutPageProps) => {
    const { courseId } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    // Allow guest access to checkout page
    // if (!userId) {
    //    return redirect("/auth/login");
    // }

    const course = await db.course.findUnique({
        where: {
            id: courseId,
            isPublished: true,
        },
        include: {
            category: true,
            lessons: {
                where: { isPublished: true },
                include: {
                    topics: {
                        where: { isPublished: true },
                    }
                }
            }
        }
    });

    if (!course) {
        return redirect("/");
    }

    // Only check purchase history if user is logged in
    if (userId) {
        const purchase = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                }
            }
        });

        if (purchase && purchase.status === "COMPLETED") {
            return redirect(`/courses/${courseId}`);
        }
    }

    const totalLessons = course.lessons.reduce((acc, lesson) => acc + lesson.topics.length, 0);

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-5xl">
                <Link
                    href={`/courses/${courseId}`}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group w-fit"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to course details
                </Link>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Course Summary */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                            <h1 className="text-3xl font-extrabold text-slate-900">Checkout Summary</h1>

                            <div className="flex gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="h-24 w-40 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                                    {course.imageUrl ? (
                                        <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="h-8 w-8 text-slate-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase">
                                        {course.category?.name || "Uncategorized"}
                                    </span>
                                    <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{course.title}</h2>
                                    <p className="text-slate-500 text-sm line-clamp-2 italic">{course.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                        <BookOpen className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Content</p>
                                        <p className="text-sm font-bold text-slate-700">{totalLessons} Lessons</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                        <ShieldCheck className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Access</p>
                                        <p className="text-sm font-bold text-slate-700">Lifetime Access</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 space-y-4">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    What's included
                                </h3>
                                <ul className="grid sm:grid-cols-2 gap-3">
                                    {[
                                        "Full course curriculum",
                                        "Certificate of completion",
                                        "Discussion forum access",
                                        "Future updates included",
                                        "Downloadable resources",
                                        "Learn on mobile & desktop"
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Payment Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-32 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 font-medium">Course Price</span>
                                    <span className="text-xl font-bold text-slate-900">{formatPrice(course.price || 0)}</span>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <span className="text-slate-900 font-bold">Total Investment</span>
                                    <span className="text-3xl font-extrabold text-indigo-600">{formatPrice(course.price || 0)}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-xs text-slate-400 font-bold uppercase text-center">Payment Options</p>
                                <EnrollButton
                                    courseId={course.id}
                                    price={course.price || 0}
                                    isFree={!course.price || course.price === 0}
                                    fullWidth
                                    initiallyShowOptions={true}
                                    checkoutMode={true}
                                />
                            </div>

                            <div className="pt-6 border-t border-slate-100 space-y-4 text-center">
                                <div className="flex items-center justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                                    <CreditCard className="h-6 w-6" />
                                    <Banknote className="h-6 w-6" />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">
                                    By completing your purchase, you agree to our <br />
                                    <Link href="/terms" className="underline hover:text-indigo-600 text-slate-500">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-indigo-600 text-slate-500">Privacy Policy</Link>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
