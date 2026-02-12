import { db } from "@/lib/db";
import { getCategories } from "@/actions/category";
import { CoursesList } from "@/components/courses-list";
import { Categories } from "./_components/categories";
import { SearchInput } from "./_components/search-input";
import { getCoursesWithProgress } from "@/actions/get-courses";

interface SearchPageProps {
    searchParams: Promise<{
        title: string;
        categoryId: string;
    }>;
}

const SearchPage = async ({
    searchParams
}: SearchPageProps) => {
    const { title, categoryId } = await searchParams;

    const categories = await getCategories();

    // Enhancement: We can filter getCoursesWithProgress if we modify it, 
    // but for now let's do a direct fetch since getCoursesWithProgress 
    // doesn't support filters in its current signature.
    // Or let's modify it later. For now, let's get all and filter in memory 
    // or just use a new query for the search page to be efficient.

    const courses = await db.course.findMany({
        where: {
            isPublished: true,
            title: {
                contains: title,
                mode: "insensitive",
            },
            categoryId: categoryId,
        },
        include: {
            category: true,
            lessons: {
                where: {
                    isPublished: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // We need to map these to CourseWithProgress shape for CoursesList
    const formattedCourses = courses.map((course) => ({
        ...course,
        progress: null, // Public search doesn't show personal progress easily without extra logic
        isEnrolled: false,
    }));

    return (
        <div className="pt-32 pb-20 relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900 min-h-screen">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -z-10 w-1/2 h-screen bg-gradient-to-l from-indigo-50/50 to-transparent blur-3xl opacity-60" />
            <div className="absolute bottom-0 left-0 -z-10 w-1/2 h-1/2 bg-gradient-to-t from-slate-50 to-transparent blur-3xl opacity-60" />

            <div className="container mx-auto px-6 max-w-7xl space-y-12">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
                            <span className="text-xs font-semibold tracking-wide uppercase">Course Catalog</span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
                            Search <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Courses</span>
                        </h1>
                        <p className="text-slate-600 max-w-2xl leading-relaxed">
                            Find the perfect course to advance your skills. Browse by category or search by keywords.
                        </p>
                    </div>

                    <div className="bg-white/40 backdrop-blur-sm p-2 rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <SearchInput />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-tighter">
                            Popular Categories
                        </h3>
                        <Categories items={categories} />
                    </div>
                </div>

                <div className="mt-12">
                    <CoursesList items={formattedCourses as any} />
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
