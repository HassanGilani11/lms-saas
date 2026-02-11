import { auth } from "@/auth";
import { Sidebar } from "@/components/shared/sidebar";
import { InstructorHeader } from "@/components/shared/instructor-header";
import { redirect } from "next/navigation";

const InstructorLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth();

    if (!session?.user) {
        return redirect("/auth/login");
    }

    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
        return redirect("/dashboard");
    }

    return (
        <div className="h-full">
            <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
                <Sidebar />
            </div>
            <main className="md:pl-56 h-full flex flex-col">
                <InstructorHeader />
                <div className="flex-1 p-6 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default InstructorLayout;
