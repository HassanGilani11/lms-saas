"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { SystemSettings } from "@prisma/client";
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/shared/file-upload";
import { updateSettings } from "@/actions/settings";
import { Loader2, Palette, Mail, CreditCard, Save } from "lucide-react";

const formSchema = z.z.object({
    siteName: z.string().min(1, "Site name is required"),
    siteLogo: z.string().optional(),
    contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
    stripeCurrency: z.string().min(1, "Currency is required"),
    emailTemplates: z.any().optional(),
});

interface SettingsFormProps {
    initialData: any; // Using any for ease of initial implementation, should refine
}

export const SettingsForm = ({ initialData }: SettingsFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            siteName: initialData?.siteName || "LMS SaaS",
            siteLogo: initialData?.siteLogo || "",
            contactEmail: initialData?.contactEmail || "",
            stripeCurrency: initialData?.stripeCurrency || "USD",
            emailTemplates: initialData?.emailTemplates || {},
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true);
            const result = await updateSettings(values);
            if (result.success) {
                toast.success("Settings updated successfully");
            } else {
                toast.error(result.error || "Failed to update settings");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isMounted) {
        return null;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="general" className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                        </TabsTrigger>
                        <TabsTrigger value="payment" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payment
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        <TabsContent value="general">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Branding & General</CardTitle>
                                    <CardDescription>
                                        Configure your platform's name, logo, and core identity.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="siteName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Site Name</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isLoading} placeholder="e.g. My LMS" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="contactEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Email</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isLoading} placeholder="support@example.com" {...field} />
                                                </FormControl>
                                                <FormDescription>Global contact email for system notifications.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="siteLogo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Site Logo</FormLabel>
                                                <FormControl>
                                                    <FileUpload
                                                        endpoint="courseImage"
                                                        onChange={(url) => field.onChange(url)}
                                                        value={field.value}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Upload your platform logo. Recommended: SVG or transparent PNG (512x512px).
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="email">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Email Templates</CardTitle>
                                    <CardDescription>
                                        Customize the layout and content of system emails.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-sm text-muted-foreground border-l-4 border-amber-500 p-4 bg-amber-50 dark:bg-amber-900/10">
                                        Email template editor implementation is coming in the next iteration.
                                        You can currently configure global mail settings.
                                    </div>
                                    <p className="text-sm text-muted-foreground italic">Templates currently use system defaults.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="payment">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Configuration</CardTitle>
                                    <CardDescription>
                                        Manage your billing and transaction settings.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="stripeCurrency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Default Currency (ISO)</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isLoading} placeholder="USD, EUR, GBP..." {...field} />
                                                </FormControl>
                                                <FormDescription>The primary currency used for course purchases.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading} className="gap-2">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );
};
