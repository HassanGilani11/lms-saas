import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

const InstructorDashboardPage = () => {
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Welcome Back, Instructor</h1>
                    <p className="text-muted-foreground">
                        Manage your courses and track student performance.
                    </p>
                </div>
                <Link href="/instructor/courses/create">
                    <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New Course
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder for course statistics or quick actions */}
                <div className="border rounded-lg p-6 bg-slate-50">
                    <h3 className="font-semibold mb-2">Total Students</h3>
                    <p className="text-3xl font-bold">1,234</p>
                </div>
                <div className="border rounded-lg p-6 bg-slate-50">
                    <h3 className="font-semibold mb-2">Active Courses</h3>
                    <p className="text-3xl font-bold">12</p>
                </div>
                <div className="border rounded-lg p-6 bg-slate-50">
                    <h3 className="font-semibold mb-2">Revenue (MTD)</h3>
                    <p className="text-3xl font-bold">$4,560</p>
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboardPage;
