"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { SystemSettings } from "@/lib/prisma";
import { Switch } from "@/components/ui/switch";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/shared/file-upload";
import { updateSettings } from "@/actions/settings";
import { Loader2, Palette, Mail, CreditCard, Save } from "lucide-react";

const formSchema = z.object({
    siteName: z.string().min(1, "Site name is required"),
    siteLogo: z.string().optional(),
    contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
    stripeCurrency: z.string().min(1, "Currency is required").max(3, "Currency code should be 3 letters (e.g., USD)"),
    baseCurrency: z.string().min(1, "Base currency is required").max(3),
    exchangeRates: z.any().optional(),
    stripeEnabled: z.boolean(),
    codEnabled: z.boolean(),
    instructorCommission: z.number().min(0, "Commission cannot be negative").max(100, "Commission cannot exceed 100%"),
    emailTemplates: z.any().optional(),
});

interface SettingsFormProps {
    initialData: SystemSettings | null;
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
            baseCurrency: initialData?.baseCurrency || "USD",
            exchangeRates: initialData?.exchangeRates || {},
            stripeEnabled: initialData?.stripeEnabled ?? true,
            codEnabled: initialData?.codEnabled ?? true,
            instructorCommission: initialData?.instructorCommission ?? 70,
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
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || "Something went wrong");
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="baseCurrency"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Base Currency (Authoring)</FormLabel>
                                                    <Select
                                                        disabled={isLoading}
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select base currency" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                                                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                                                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>The currency used when setting course prices.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="stripeCurrency"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Display Currency (Site-wide)</FormLabel>
                                                    <Select
                                                        disabled={isLoading}
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a currency" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                                                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                                                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>The primary currency shown to students.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="instructorCommission"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Instructor Commission (%)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                disabled={isLoading}
                                                                type="number"
                                                                step="0.1"
                                                                placeholder="70"
                                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>Instructor's share of sales.</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="space-y-2">
                                                <FormLabel className="text-slate-500">Platform Share (%)</FormLabel>
                                                <div className="h-10 px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-slate-500 font-bold flex items-center">
                                                    {Math.max(0, 100 - (form.watch("instructorCommission") || 0)).toFixed(1)}%
                                                </div>
                                                <p className="text-[0.8rem] text-muted-foreground">Your earnings per sale.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800">Exchange Rates</h3>
                                                <p className="text-sm text-slate-500">Define rates relative to your base currency ({form.watch("baseCurrency") || "USD"}).</p>
                                                {initialData?.ratesUpdatedAt && (
                                                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                                                        Last synced: {new Date(initialData.ratesUpdatedAt).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={async () => {
                                                    try {
                                                        setIsLoading(true);
                                                        const base = form.getValues("baseCurrency");
                                                        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
                                                        const data = await response.json();
                                                        if (data.rates) {
                                                            const newRates = {
                                                                AUD: data.rates.AUD,
                                                                CAD: data.rates.CAD,
                                                                EUR: data.rates.EUR,
                                                                USD: data.rates.USD,
                                                            };
                                                            form.setValue("exchangeRates", newRates);
                                                            toast.success(`Exchange rates synced relative to ${base}`);
                                                        }
                                                    } catch (error) {
                                                        toast.error("Failed to sync exchange rates");
                                                    } finally {
                                                        setIsLoading(false);
                                                    }
                                                }}
                                                disabled={isLoading}
                                                className="font-bold uppercase tracking-widest text-[10px] h-8"
                                            >
                                                Sync Rates
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {["USD", "AUD", "CAD", "EUR"].map((code) => (
                                                code !== form.watch("baseCurrency") && (
                                                    <div key={code} className="space-y-1">
                                                        <FormLabel className="text-[10px] font-bold uppercase text-slate-400">{code} Rate</FormLabel>
                                                        <Input
                                                            type="number"
                                                            step="0.0001"
                                                            placeholder="1.0"
                                                            value={form.watch(`exchangeRates.${code}`) || ""}
                                                            onChange={(e) => {
                                                                const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                                                form.setValue(`exchangeRates.${code}`, isNaN(val) ? 0 : val, { shouldDirty: true });
                                                            }}
                                                            className="h-9 text-sm font-bold"
                                                        />
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <FormField
                                            control={form.control}
                                            name="stripeEnabled"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-2xl border p-4 shadow-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base font-bold text-slate-900 dark:text-slate-100 italic">Stripe Payments</FormLabel>
                                                        <FormDescription className="text-xs italic">
                                                            Enable credit/debit card payments via Stripe.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            disabled={isLoading}
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="codEnabled"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-2xl border p-4 shadow-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base font-bold text-slate-900 dark:text-slate-100 italic">Cash on Delivery</FormLabel>
                                                        <FormDescription className="text-xs italic">
                                                            Allow students to enroll and pay manually.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            disabled={isLoading}
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
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
            </form >
        </Form >
    );
};
