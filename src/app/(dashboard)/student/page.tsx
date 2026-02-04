import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Note: forgot to add progress component, will add in next step
import { CheckCircle } from "lucide-react";

const courses = [
    {
        id: "1",
        title: "Next.js 15 Deep Dive",
        progress: 45,
        lessonsCount: 20,
        completedLessons: 9,
    },
    {
        id: "2",
        title: "React Design Patterns",
        progress: 100,
        lessonsCount: 15,
        completedLessons: 15,
    },
];

const StudentDashboardPage = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-8">My Learning</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <Card key={course.id} className="overflow-hidden hover:shadow-md transition">
                        <div className="h-32 bg-slate-200" /> {/* Placeholder for course image */}
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-x-2 text-sm text-muted-foreground mb-4">
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                <span>{course.lessonsCount} Lessons</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span>Progress</span>
                                    <span>{course.progress}%</span>
                                </div>
                                {/* Fallback progress bar since component not yet installed */}
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 transition-all"
                                        style={{ width: `${course.progress}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default StudentDashboardPage;
