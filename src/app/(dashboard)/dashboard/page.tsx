import { auth } from "@/auth";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    const role = session.user.role;

    if (role === "ADMIN") {
        redirect("/admin");
    }

    if (role === "INSTRUCTOR") {
        redirect("/instructor");
    }

    redirect("/student");
};

export default DashboardPage;
