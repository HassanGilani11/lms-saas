import { db } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SearchPage = async () => {
    const courses = await db.course.findMany({
        where: {
            isPublished: true,
        },
        include: {
            category: true,
            modules: {
                where: {
                    isPublished: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="p-6 space-y-4">
            <div className="relative">
                <SearchIcon className="h-4 w-4 absolute top-3 left-3 text-slate-600" />
                <Input
                    className="pl-9 bg-slate-100 focus-visible:ring-slate-200"
                    placeholder="Search for a course..."
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                {courses.map((course) => (
                    <Card key={course.id} className="overflow-hidden hover:shadow-md transition">
                        <div className="aspect-video relative bg-slate-200 flex items-center justify-center">
                            {course.imageUrl ? (
                                <img src={course.imageUrl} alt={course.title} className="object-cover" />
                            ) : (
                                <SearchIcon className="h-10 w-10 text-slate-400" />
                            )}
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1 lowercase">
                                {course.category?.name || "Uncategorized"}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                                <Badge variant="secondary">
                                    {course.modules.length} {course.modules.length === 1 ? "Module" : "Modules"}
                                </Badge>
                                <p className="font-bold text-slate-700">
                                    {course.price ? `$${course.price.toFixed(2)}` : "Free"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {courses.length === 0 && (
                <div className="text-center text-muted-foreground mt-10">
                    No courses found matching your criteria.
                </div>
            )}
        </div>
    );
};

export default SearchPage;
