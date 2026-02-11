"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { newVerification } from "@/actions/new-verification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewVerificationPage() {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const onSubmit = useCallback(() => {
        if (success || error) return;

        if (!token) {
            setError("Missing token!");
            return;
        }

        newVerification(token)
            .then((data) => {
                setSuccess(data.success);
                setError(data.error);
                if (data.success) {
                    toast.success("Email verified!");
                }
            })
            .catch(() => {
                setError("Something went wrong!");
            });
    }, [token, success, error]);

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <Card className="w-[400px] shadow-lg border-none">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Verification</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                    {!success && !error && (
                        <div className="py-8">
                            <div className="h-10 w-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                        </div>
                    )}
                    {success && (
                        <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500 font-medium w-full justify-center">
                            <p>{success}</p>
                        </div>
                    )}
                    {error && (
                        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive font-medium w-full justify-center">
                            <p>{error}</p>
                        </div>
                    )}
                    <Button asChild variant="outline" className="w-full mt-4">
                        <Link href="/auth/login">
                            Back to Login
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
