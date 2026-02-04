"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const LoginSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
    password: z.string().min(1, {
        message: "Password is required",
    }),
});

export default function LoginPage() {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const data: any = await login(values);
            setError(data?.error);
            setSuccess(data?.success);
            if (data?.success) {
                router.refresh();
                router.push("/dashboard");
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-lg border-0 bg-white">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-extrabold tracking-tight">Login</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        Welcome back to LuminaLearn
                    </p>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isLoading}
                                                placeholder="john.doe@example.com"
                                                type="email"
                                                className="py-6"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isLoading}
                                                placeholder="******"
                                                type="password"
                                                className="py-6"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {error && (
                                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-x-2">
                                    <p>{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 flex items-center gap-x-2">
                                    <p>{success}</p>
                                </div>
                            )}

                            <Button
                                disabled={isLoading}
                                type="submit"
                                className="w-full py-6 text-lg font-semibold bg-slate-900 hover:bg-slate-800"
                            >
                                {isLoading ? "Signing in..." : "Login"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="justify-center">
                    <Link
                        href="/auth/register"
                        className="text-sm font-medium text-muted-foreground hover:text-slate-900 transition-colors"
                    >
                        Don&apos;t have an account? Register
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
