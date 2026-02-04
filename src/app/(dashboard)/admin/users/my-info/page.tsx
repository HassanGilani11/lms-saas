"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, updateCurrentUser } from "@/actions/user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, MapPin } from "lucide-react";
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
});

const MyInfoPage = () => {
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

    if (isLoading) return <div className="p-6 text-slate-500 animate-pulse">Loading profile...</div>;

    return (
        <div className="p-6 space-y-6 font-sans">
            <h1 className="text-[15px] font-bold text-slate-800">My Info</h1>

            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <CardContent className="p-8">
                    <div className="flex items-center gap-x-6 mb-12">
                        <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-sm">
                            <AvatarImage src={user?.image || ""} />
                            <AvatarFallback className="bg-slate-100 text-2xl font-bold">
                                {user?.name?.[0] || user?.email?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-slate-900">{user?.name || "User Name"}</h2>
                            <div className="flex items-center gap-x-2 text-slate-400 text-[12px] font-medium">
                                <MapPin size={14} />
                                <span>{user?.address?.split(',')?.slice(-2)?.join(',') || "Florida, United States"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h3 className="text-[14px] font-bold text-slate-800 tracking-tight">Personal Details</h3>
                            <Button
                                onClick={() => setIsDialogOpen(true)}
                                variant="ghost"
                                size="sm"
                                className="text-slate-400 hover:text-slate-900 gap-x-2"
                            >
                                <Pencil size={14} />
                                <span className="text-[12px] font-bold">Edit</span>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 text-[13px]">
                            <div className="flex flex-col gap-y-1">
                                <span className="text-slate-400 font-medium">Name:</span>
                                <span className="text-slate-700 font-bold">{user?.name || "N/A"}</span>
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <span className="text-slate-400 font-medium">Email ID:</span>
                                <span className="text-slate-700 font-bold">{user?.email}</span>
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <span className="text-slate-400 font-medium">Mobile:</span>
                                <span className="text-slate-700 font-bold">{user?.phone || "N/A"}</span>
                            </div>
                            <div className="flex flex-col gap-y-1 col-span-full">
                                <span className="text-slate-400 font-medium">Address:</span>
                                <span className="text-slate-700 font-bold max-w-md">
                                    {user?.address || "No address provided."}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="font-sans">
                    <DialogHeader>
                        <DialogTitle className="text-[16px] font-bold">Edit Profile</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] font-bold text-slate-700">Full Name</FormLabel>
                                        <FormControl><Input placeholder="John Doe" className="h-10 text-[13px]" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] font-bold text-slate-700">Email Address</FormLabel>
                                        <FormControl><Input placeholder="john@example.com" className="h-10 text-[13px]" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] font-bold text-slate-700">Phone Number</FormLabel>
                                        <FormControl><Input placeholder="+1 234 567 890" className="h-10 text-[13px]" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] font-bold text-slate-700">Address</FormLabel>
                                        <FormControl><Input placeholder="123 Street Name, City" className="h-10 text-[13px]" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full h-10 bg-slate-900 text-[13px] font-bold mt-6" disabled={form.formState.isSubmitting}>
                                Save Changes
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MyInfoPage;
