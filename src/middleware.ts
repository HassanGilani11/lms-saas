import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const { auth } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    trustHost: true,
});

import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userRole = (req.auth?.user as any)?.role;

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isPublicRoute = ["/", "/auth/login", "/auth/register"].includes(
        nextUrl.pathname
    );
    const isAuthRoute = nextUrl.pathname.startsWith("/auth");
    const isAdminRoute = nextUrl.pathname.startsWith("/admin");
    const isInstructorRoute = nextUrl.pathname.startsWith("/instructor");
    const isStudentRoute = nextUrl.pathname.startsWith("/student");
    const isDashboardRoute = nextUrl.pathname === "/dashboard";

    if (isApiAuthRoute) return NextResponse.next();

    if (isAuthRoute) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
        return NextResponse.next();
    }

    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }

    if (isLoggedIn) {
        if (isDashboardRoute) {
            if (userRole === "ADMIN") return NextResponse.redirect(new URL("/admin", nextUrl));
            if (userRole === "INSTRUCTOR") return NextResponse.redirect(new URL("/instructor", nextUrl));
            if (userRole === "STUDENT") return NextResponse.redirect(new URL("/student", nextUrl));
            return NextResponse.next();
        }

        if (isAdminRoute && userRole && userRole !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }

        if (isInstructorRoute && userRole && userRole !== "INSTRUCTOR" && userRole !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }

        if (isStudentRoute && userRole && userRole !== "STUDENT" && userRole !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
