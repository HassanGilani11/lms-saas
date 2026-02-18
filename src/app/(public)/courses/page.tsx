import { getCoursesWithProgress } from "@/actions/get-courses";
import { CoursesList } from "@/components/courses-list";

const CoursesPage = async () => {
    const courses = await getCoursesWithProgress();

    return (
        <div className="pt-32 pb-20 relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -z-10 w-1/2 h-screen bg-gradient-to-l from-indigo-50/50 to-transparent blur-3xl opacity-60" />
            <div className="absolute bottom-0 left-0 -z-10 w-1/2 h-1/2 bg-gradient-to-t from-slate-50 to-transparent blur-3xl opacity-60" />

            <div className="container mx-auto px-6 max-w-7xl space-y-12">
                <div className="space-y-6 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span className="text-xs font-semibold tracking-wide uppercase">All Courses</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Courses</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                        Explore our curated list of high-quality courses designed to help you master new skills and accelerate your career.
                    </p>
                </div>

                <CoursesList
                    items={courses}
                />
            </div>
        </div>
    );
};

export default CoursesPage;
