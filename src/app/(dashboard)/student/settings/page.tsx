"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, updateCurrentUser } from "@/actions/user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, MapPin, User, Mail, Phone, Home, ImageIcon } from "lucide-react";
import { FileUpload } from "@/components/shared/file-upload";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    address: z.string().optional(),
    image: z.string().optional(),
});

const StudentSettingsPage = () => {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            image: "",
        },
    });

    const fetchUser = async () => {
        setIsLoading(true);
        const data = await getCurrentUser();
        setUser(data);
        if (data) {
            form.reset({
                name: data.name || "",
                email: data.email || "",
                phone: data.phone || "",
                address: data.address || "",
                image: data.image || "",
            });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const updated = await updateCurrentUser(values);
            if (updated) {
                toast.success("Profile updated successfully");
                setUser(updated);
                setIsDialogOpen(false);
            } else {
                toast.error("Failed to update profile");
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    if (isLoading) return <div className="p-6 text-slate-500 animate-pulse">Loading settings...</div>;

    return (
        <div className="py-6 space-y-8 font-sans">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">Profile Settings</h1>
                <p className="text-sm text-slate-500">Manage your personal information and account details.</p>
            </div>

            <Card className="border shadow-sm overflow-hidden bg-white rounded-2xl">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-50">
                        <div className="flex items-center gap-x-6">
                            <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-sm">
                                <AvatarImage src={user?.image || ""} />
                                <AvatarFallback className="bg-slate-100 text-2xl font-bold text-slate-500">
                                    {user?.name?.[0] || user?.email?.[0] || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-slate-900">{user?.name || "User Name"}</h2>
                                <div className="flex items-center gap-x-2 text-slate-400 text-xs font-medium">
                                    <MapPin size={12} />
                                    <span>{user?.address || "No address provided"}</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            variant="outline"
                            size="sm"
                            className="rounded-full border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-6 h-9 gap-x-2 self-start md:self-center"
                        >
                            <Pencil size={14} />
                            Update Profile
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8">
                        <div className="flex items-start gap-x-4">
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                <User className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Full Name</span>
                                <p className="text-sm font-bold text-slate-700">{user?.name || "N/A"}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-x-4">
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                <Mail className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Email Address</span>
                                <p className="text-sm font-bold text-slate-700">{user?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-x-4">
                            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                <Phone className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Phone Number</span>
                                <p className="text-sm font-bold text-slate-700">{user?.phone || "N/A"}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-x-4">
                            <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                                <Home className="h-5 w-5 text-violet-600" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Home Address</span>
                                <p className="text-sm font-bold text-slate-700 leading-relaxed">{user?.address || "No address provided."}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-indigo-600 px-6 py-6 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Update Profile</DialogTitle>
                            <p className="text-indigo-100 text-xs">Ensure your contact details are up to date.</p>
                        </DialogHeader>
                    </div>
                    <div className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Profile Image</FormLabel>
                                            <FormControl>
                                                <FileUpload
                                                    endpoint="imageUploader"
                                                    value={field.value}
                                                    onChange={(url) => field.onChange(url)}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" className="h-11 rounded-xl bg-slate-50 border-none focus-visible:ring-indigo-500 transition-all text-sm font-medium" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 gap-5">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Email Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="john@example.com" className="h-11 rounded-xl bg-slate-50 border-none focus-visible:ring-indigo-500 transition-all text-sm font-medium" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+1 234 567 890" className="h-11 rounded-xl bg-slate-50 border-none focus-visible:ring-indigo-500 transition-all text-sm font-medium" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Home Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Street Name, City" className="h-11 rounded-xl bg-slate-50 border-none focus-visible:ring-indigo-500 transition-all text-sm font-medium" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex gap-x-3 pt-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="flex-1 h-11 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-[2] h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transition-all"
                                        disabled={form.formState.isSubmitting}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StudentSettingsPage;
