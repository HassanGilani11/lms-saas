import { auth } from "@/auth";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    const role = session.user.role;

    if (role === "ADMIN") {
        return redirect("/admin");
    }

    if (role === "INSTRUCTOR") {
        return redirect("/instructor");
    }

    if (role === "STUDENT") {
        return redirect("/student");
    }

    // Prevents redirect loop if role is missing or invalid by sending to login
    return redirect("/auth/login?error=InvalidRole");
};

export default DashboardPage;
