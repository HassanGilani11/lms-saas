import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, CheckCircle2, Clock, Globe, ShieldCheck, Award } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSettings } from "@/actions/settings";
import { EnrollButton } from "@/components/enroll-button";
import { checkAndIssueCertificate } from "@/actions/certificate";

interface CoursePageProps {
    params: Promise<{
        courseId: string;
    }>;
}

const CoursePage = async ({
    params
}: CoursePageProps) => {
    const { courseId } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    const isAdmin = session?.user?.role === "ADMIN";
    const settings = await getSettings();

    const course = await db.course.findUnique({
        where: {
            id: courseId,
            ...(isAdmin ? {} : { isPublished: true }),
        },
        include: {
            category: true,
            lessons: {
                where: isAdmin ? {} : { isPublished: true },
                include: {
                    topics: {
                        where: isAdmin ? {} : { isPublished: true },
                        orderBy: { position: "asc" }
                    }
                },
                orderBy: { position: "asc" }
            }
        }
    });

    if (!course) {
        return redirect("/");
    }

    const purchase = userId ? await db.purchase.findUnique({
        where: {
            userId_courseId: {
                userId,
                courseId: courseId,
            }
        }
    }) : null;

    const isEnrolled = (!!purchase && purchase.status === "COMPLETED") || isAdmin;
    const isPending = !!purchase && purchase.status === "PENDING";

    const firstTopicId = course.lessons[0]?.topics[0]?.id;

    // Certificate Logic
    let certificate = null;
    let isCompleted = false;

    if (userId && isEnrolled) {
        const userProgress = await db.userProgress.findMany({
            where: {
                userId,
                topic: {
                    lesson: {
                        courseId
                    }
                },
                isCompleted: true
            }
        });

        const totalTopicsCount = course.lessons.reduce((acc, lesson) => acc + lesson.topics.length, 0);
        isCompleted = totalTopicsCount > 0 && userProgress.length === totalTopicsCount;

        if (isCompleted) {
            certificate = await checkAndIssueCertificate(courseId);
        }
    }

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-slate-900 text-white">
                <div className="absolute top-0 right-0 -z-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/20 to-transparent blur-3xl opacity-50 transition-opacity duration-1000" />
                <div className="absolute bottom-0 left-0 -z-0 w-1/3 h-1/2 bg-gradient-to-t from-violet-500/20 to-transparent blur-3xl opacity-50" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
                                    {course.category?.name || "Uncategorized"}
                                </span>
                                <div className="flex items-center gap-1 text-slate-400 text-sm">
                                    <Clock className="h-4 w-4" />
                                    <span>Self-paced</span>
                                </div>
                            </div>

                            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                                {course.title}
                            </h1>

                            <p className="text-xl text-slate-300 max-w-xl leading-relaxed">
                                {course.description}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                                {isEnrolled ? (
                                    <Button asChild size="lg" className="h-14 px-10 text-lg font-bold bg-white text-slate-900 hover:bg-slate-100 transition-all rounded-2xl shadow-xl shadow-indigo-500/20">
                                        <Link href={`/courses/${course.id}/topics/${firstTopicId}`}>Continue Learning</Link>
                                    </Button>
                                ) : isPending ? (
                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-200 font-semibold flex items-center gap-3">
                                        <Clock className="h-5 w-5" />
                                        Enrollment Pending Approval (COD)
                                    </div>
                                ) : (
                                    <EnrollButton
                                        courseId={course.id}
                                        price={course.price || 0}
                                        isFree={!course.price || course.price === 0}
                                        stripeEnabled={settings?.stripeEnabled ?? true}
                                        codEnabled={settings?.codEnabled ?? true}
                                    />
                                )}

                                <div className="flex items-center gap-3 text-slate-300">
                                    <ShieldCheck className="h-6 w-6 text-indigo-400" />
                                    <span className="text-sm font-medium">30-Day Money-Back Guarantee</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative group lg:block hidden">
                            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                                {course.imageUrl ? (
                                    <img
                                        src={course.imageUrl}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500/40 to-violet-600/40 flex items-center justify-center">
                                        <BookOpen className="h-20 w-20 text-indigo-300/50" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm font-bold tracking-wide">LATEST VERSION UPDATED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Content & Highlights */}
            <div className="py-24 container mx-auto px-6">
                <div className="grid lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-16">
                        {/* Highlights */}
                        <section className="space-y-8">
                            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-base">
                                    <Globe className="h-5 w-5" />
                                </span>
                                What you&apos;ll learn
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    "Build industry-standard applications",
                                    "Master core concepts and advanced techniques",
                                    "Hands-on projects and real-world scenarios",
                                    "Access to exclusive learning resources",
                                    "Step-by-step video tutorials",
                                    "Certificate of completion"
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Curriculum */}
                        <section className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-bold text-slate-900">Course Content</h2>
                                <span className="text-slate-500 font-medium">
                                    {course.lessons.length} Modules • {course.lessons.reduce((acc, l) => acc + l.topics.length, 0)} Lessons
                                </span>
                            </div>

                            <div className="space-y-4">
                                {course.lessons.map((lesson, idx) => (
                                    <div key={lesson.id} className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm">
                                        <div className={cn(
                                            "p-6 bg-slate-50 flex items-center justify-between",
                                            lesson.topics.length > 0 && "border-b border-slate-100"
                                        )}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400">
                                                    {idx + 1}
                                                </div>
                                                <h3 className="font-bold text-slate-800">{lesson.title}</h3>
                                            </div>
                                            <span className="text-slate-400 text-sm font-medium">{lesson.topics.length} items</span>
                                        </div>
                                        {lesson.topics.length > 0 && (
                                            <div className="p-4 space-y-1">
                                                {lesson.topics.map((topic) => (
                                                    <div key={topic.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                                        <div className="flex items-center gap-3">
                                                            <BookOpen className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                                            <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors">{topic.title}</span>
                                                        </div>
                                                        {topic.type === "QUIZ" && (
                                                            <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 text-[10px] font-bold uppercase letter-tracking-wider">Quiz</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sticky Sidebar Info */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-8">
                            <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-sm space-y-8">
                                <div className="space-y-2">
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Total Investment</p>
                                    <p className="text-4xl font-extrabold text-slate-900">
                                        {formatPrice(
                                            course.price || 0,
                                            settings?.stripeCurrency || "USD",
                                            settings?.exchangeRates,
                                            settings?.baseCurrency
                                        )}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Clock className="h-5 w-5 text-indigo-600" />
                                        <span className="font-medium text-sm">Full Lifetime Access</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <ShieldCheck className="h-5 w-5 text-indigo-600" />
                                        <span className="font-medium text-sm">Official Certificate</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Globe className="h-5 w-5 text-indigo-600" />
                                        <span className="font-medium text-sm">Learn on Mobile & PC</span>
                                    </div>
                                </div>

                                <div className="pt-4 space-y-3">
                                    {isEnrolled ? (
                                        <>
                                            <Button asChild size="lg" className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 transition-all rounded-2xl">
                                                <Link href={`/courses/${course.id}/topics/${firstTopicId}`}>Continue Learning</Link>
                                            </Button>
                                            {certificate && (
                                                <Button asChild variant="outline" size="lg" className="w-full h-14 text-lg font-bold border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-all rounded-2xl">
                                                    <Link href={`/certificates/${certificate.certificateCode}`} target="_blank">
                                                        <Award className="h-5 w-5 mr-2" />
                                                        View Certificate
                                                    </Link>
                                                </Button>
                                            )}
                                        </>
                                    ) : isPending ? (
                                        <Button disabled size="lg" className="w-full h-14 text-lg font-bold bg-amber-500 text-white rounded-2xl opacity-80">
                                            Approval Pending
                                        </Button>
                                    ) : (
                                        <EnrollButton
                                            courseId={course.id}
                                            price={course.price || 0}
                                            isFree={!course.price || course.price === 0}
                                            fullWidth
                                            stripeEnabled={settings?.stripeEnabled ?? true}
                                            codEnabled={settings?.codEnabled ?? true}
                                        />

                                    )}
                                </div>

                                <p className="text-center text-xs text-slate-400 font-medium">
                                    Secure payment with Stripe & SSL Encryption
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CoursePage;
