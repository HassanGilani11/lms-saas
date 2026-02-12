"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { newPassword } from "@/actions/new-password";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NewPasswordSchema = z.object({
    password: z.string().min(6, {
        message: "Minimum 6 characters required",
    }),
});

const NewPasswordPage = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver: zodResolver(NewPasswordSchema),
        defaultValues: {
            password: "",
        },
    });

    const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            newPassword(values, token)
                .then((data) => {
                    setError(data?.error);
                    setSuccess(data?.success);
                });
        });
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-lg border-0 bg-white">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-extrabold tracking-tight">New Password</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        Enter your new password below
                    </p>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isPending}
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
                                disabled={isPending}
                                type="submit"
                                className="w-full py-6 text-lg font-semibold bg-slate-900 hover:bg-slate-800"
                            >
                                Reset Password
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="justify-center">
                    <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-slate-900">
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default NewPasswordPage;
