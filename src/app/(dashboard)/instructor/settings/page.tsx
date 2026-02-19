"use client";

import { useEffect, useState } from "react";
import { changePassword } from "@/actions/user";
import {
    getNotificationPreferences,
    updateNotificationPreference
} from "@/actions/notifications";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ShieldCheck,
    Bell,
    Lock,
    Mail,
    Smartphone,
    Save,
    Loader2,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const SettingsPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [preferences, setPreferences] = useState<any[]>([]);

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const fetchPreferences = async () => {
        try {
            setIsLoading(true);
            const data = await getNotificationPreferences();
            setPreferences(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPreferences();
    }, []);

    const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
        try {
            setIsSaving(true);
            const result = await changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });

            if (result.success) {
                toast.success("Password changed successfully");
                passwordForm.reset();
            } else {
                toast.error(result.error || "Failed to change password");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSaving(false);
        }
    };

    const togglePreference = async (type: string, enabled: boolean, field: 'enabled' | 'emailEnabled') => {
        try {
            const result = await updateNotificationPreference(
                type as any,
                field === 'enabled' ? enabled : preferences.find(p => p.type === type)?.enabled ?? true,
                field === 'emailEnabled' ? enabled : preferences.find(p => p.type === type)?.emailEnabled ?? false
            );

            if (result.success) {
                setPreferences(prev => prev.map(p =>
                    p.type === type ? { ...p, [field]: enabled } : p
                ));
                toast.success("Preference updated");
            } else {
                toast.error("Failed to update preference");
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="text-sm text-slate-500 font-medium">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 pb-12 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-indigo-600" />
                    Account Settings
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage your security preferences and notification settings.
                </p>
            </div>

            <Tabs defaultValue="security" className="w-full">
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl h-12 gap-1 mb-8">
                    <TabsTrigger value="security" className="rounded-lg px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="security" className="space-y-6">
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Update Password</CardTitle>
                            <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
                                    <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[13px] font-bold">Current Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            disabled={isSaving}
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            className="pr-10"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                                                        >
                                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={passwordForm.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[13px] font-bold">New Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            disabled={isSaving}
                                                            type="password"
                                                            placeholder="••••••••"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={passwordForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[13px] font-bold">Confirm Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            disabled={isSaving}
                                                            type="password"
                                                            placeholder="••••••••"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-8 rounded-xl"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Updating...
                                            </>
                                        ) : (
                                            "Update Password"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 rounded-lg">
                        <CardContent className="p-4 flex gap-4">
                            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">Security Recommendation</h4>
                                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                    Change your password regularly and use a combination of letters, numbers, and symbols for better protection.
                                    Do not use passwords that you use for other online accounts.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Notification Preferences</CardTitle>
                            <CardDescription>Choose how you want to be notified about course activity and system updates.</CardDescription>
                        </CardHeader>
                        <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { type: 'ENROLLMENT', label: 'Course Enrollments', desc: 'When a student joins one of your courses.' },
                                { type: 'DISCUSSION', label: 'Discussion Comments', desc: 'When someone participates in your course discussions.' },
                                { type: 'QUIZ_GRADED', label: 'Quiz Completions', desc: 'When a student finishes a quiz in your courses.' },
                                { type: 'COURSE_UPDATE', label: 'Course Updates', desc: 'System messages regarding your course status.' },
                                { type: 'SYSTEM', label: 'System Announcements', desc: 'Important platform updates and news.' },
                            ].map((item) => {
                                const pref = preferences.find(p => p.type === item.type) || { enabled: true, emailEnabled: false };
                                return (
                                    <div key={item.type} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.label}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="h-4 w-4 text-slate-400" />
                                                <span className="text-xs font-medium text-slate-600 mr-2">In-app</span>
                                                <Switch
                                                    checked={pref.enabled}
                                                    onCheckedChange={(val) => togglePreference(item.type, val, 'enabled')}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-slate-400" />
                                                <span className="text-xs font-medium text-slate-600 mr-2">Email</span>
                                                <Switch
                                                    checked={pref.emailEnabled}
                                                    onCheckedChange={(val) => togglePreference(item.type, val, 'emailEnabled')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                                <Bell className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Smart Notifications</h4>
                                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                                    We'll aggregate frequent updates into a daily digest to keep your inbox clean.
                                </p>
                            </div>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-indigo-200 dark:text-indigo-800" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SettingsPage;
