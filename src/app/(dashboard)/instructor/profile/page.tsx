"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, updateCurrentUser } from "@/actions/user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Pencil,
    MapPin,
    Globe,
    Link as LinkIcon,
    Twitter,
    Linkedin,
    Github,
    Mail,
    Phone,
    UserCircle,
    Save,
    Loader2
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/shared/file-upload";
import { useSession } from "next-auth/react";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    title: z.string().optional(),
    bio: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    image: z.string().optional(),
    socialLinks: z.object({
        website: z.string().optional(),
        twitter: z.string().optional(),
        linkedin: z.string().optional(),
        github: z.string().optional(),
    }).optional(),
});

const ProfilePage = () => {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { update } = useSession();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            title: "",
            bio: "",
            phone: "",
            address: "",
            image: "",
            socialLinks: {
                website: "",
                twitter: "",
                linkedin: "",
                github: "",
            },
        },
    });

    const fetchUser = async () => {
        try {
            setIsLoading(true);
            const data = await getCurrentUser();
            setUser(data);
            if (data) {
                const social = typeof data.socialLinks === 'string'
                    ? JSON.parse(data.socialLinks)
                    : (data.socialLinks || {});

                form.reset({
                    name: data.name || "",
                    title: data.title || "",
                    bio: data.bio || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    image: data.image || "",
                    socialLinks: {
                        website: social.website || "",
                        twitter: social.twitter || "",
                        linkedin: social.linkedin || "",
                        github: social.github || "",
                    },
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsSaving(true);
            const updated = await updateCurrentUser(values);
            if (updated) {
                toast.success("Profile updated successfully");
                setUser(updated);

                // Trigger sidebar/header sync
                await update({
                    name: values.name,
                    image: values.image,
                });
            } else {
                toast.error("Failed to update profile");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="text-sm text-slate-500 font-medium">Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 pb-12 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                    <UserCircle className="h-6 w-6 text-indigo-600" />
                    Instructor Profile
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage your public presence and how students see you across the platform.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Photo & Basics */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Profile Photo</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="image"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col items-center text-center">
                                                <FormControl>
                                                    <FileUpload
                                                        endpoint="courseImage"
                                                        onChange={(url) => field.onChange(url)}
                                                        value={field.value}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-[11px] mt-2">
                                                    PNG, JPG or SVG. Max 4MB.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Quick Links</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="socialLinks.website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[12px] font-bold">Personal Website</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                        <Input disabled={isSaving} className="pl-9 h-9 text-sm" placeholder="https://example.com" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="socialLinks.twitter"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[12px] font-bold">Twitter Handle</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Twitter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                        <Input disabled={isSaving} className="pl-9 h-9 text-sm" placeholder="@username" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="socialLinks.linkedin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[12px] font-bold">LinkedIn Profile</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                        <Input disabled={isSaving} className="pl-9 h-9 text-sm" placeholder="linkedin.com/in/..." {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Bio & Professional Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold">About You</CardTitle>
                                    <CardDescription>This information will be shown on your course landing pages.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[13px] font-bold">Display Name</FormLabel>
                                                    <FormControl>
                                                        <Input disabled={isSaving} placeholder="e.g. Dr. Jane Smith" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[13px] font-bold">Professional Title</FormLabel>
                                                    <FormControl>
                                                        <Input disabled={isSaving} placeholder="e.g. Senior Software Engineer" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[13px] font-bold">Biography</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        disabled={isSaving}
                                                        placeholder="Share your experience, achievements, and teaching style..."
                                                        className="min-h-[150px] resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    A detailed bio helps build trust with potential students.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold">Contact Information</CardTitle>
                                    <CardDescription>These details are used for administrative purposes and support.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[13px] font-bold">Phone Number</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                            <Input disabled={isSaving} className="pl-9" placeholder="+1 234 567 890" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[13px] font-bold">Address / Location</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                            <Input disabled={isSaving} className="pl-9" placeholder="City, Country" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-x-4">
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 px-8 rounded-xl shadow-lg border-none transition-all active:scale-95 gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Profile
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default ProfilePage;
