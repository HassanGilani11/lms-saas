"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserRole } from "@/lib/prisma";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createUserType } from "@/actions/user-type";
import { ChevronRight } from "lucide-react";

const PERMISSIONS = {
    Administrator: [
        "Users", "Courses", "Groups", "Categories", "Branches",
        "Events Engine", "Import-Export", "User Types",
        "Account & Settings", "Reports"
    ],
    Instructor: ["Courses", "Groups", "Reports", "Calender"],
    Learner: ["Courses", "Course Catalog", "Calender", "Progress", "Gamification"],
    General: ["Message", "Profile", "Help", "Timeline"]
};

const formSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    role: z.nativeEnum(UserRole),
    permissions: z.record(z.string(), z.array(z.string())),
});

const UserTypesPage = () => {
    const router = useRouter();
    const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({
        Administrator: [],
        Instructor: [],
        Learner: [],
        General: []
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            role: "STUDENT",
            permissions: {}
        }
    });

    const isSubmitting = form.formState.isSubmitting;

    const togglePermission = (category: string, permission: string) => {
        const current = selectedPermissions[category] || [];
        const updated = current.includes(permission)
            ? current.filter(p => p !== permission)
            : [...current, permission];

        const next = { ...selectedPermissions, [category]: updated };
        setSelectedPermissions(next);
        form.setValue("permissions", next);
    };

    const toggleCategory = (category: string) => {
        const all = (PERMISSIONS as any)[category];
        const current = selectedPermissions[category] || [];

        const updated = current.length === all.length ? [] : [...all];
        const next = { ...selectedPermissions, [category]: updated };
        setSelectedPermissions(next);
        form.setValue("permissions", next);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const res = await createUserType(values);
            if (res) {
                toast.success("User type created successfully");
                form.reset();
                setSelectedPermissions({
                    Administrator: [],
                    Instructor: [],
                    Learner: [],
                    General: []
                });
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            toast.error("Internal Error");
        }
    };

    return (
        <div className="p-6 space-y-6 font-sans max-w-[1200px]">
            <div className="flex items-center gap-x-2 text-[13px] text-slate-400 font-medium">
                <span>Dashboards</span>
                <ChevronRight size={14} />
                <span>User Types</span>
                <ChevronRight size={14} />
                <span className="text-slate-900">Add User Types</span>
            </div>

            <h1 className="text-[15px] font-bold text-slate-800">Add User Types</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="First Name"
                                                    className="h-12 bg-white border-slate-100 rounded-xl px-4 text-[14px] focus-visible:ring-1 focus-visible:ring-slate-200"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="Last Name"
                                                    className="h-12 bg-white border-slate-100 rounded-xl px-4 text-[14px] focus-visible:ring-1 focus-visible:ring-slate-200"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[13px] text-slate-400 font-medium mb-2 block">User Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-12 bg-white border-slate-100 rounded-xl px-4 text-[14px] font-medium text-slate-700">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="ADMIN">Administrator</SelectItem>
                                                    <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                                                    <SelectItem value="STUDENT">Learner</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <h3 className="text-[15px] font-bold text-slate-800">Permissions</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {Object.entries(PERMISSIONS).map(([category, items]) => (
                                <div key={category} className="space-y-4">
                                    <div className="flex items-center gap-x-3 mb-6">
                                        <Checkbox
                                            id={category}
                                            checked={selectedPermissions[category]?.length === items.length}
                                            onCheckedChange={() => toggleCategory(category)}
                                            className="h-5 w-5 border-slate-200 rounded-[4px] data-[state=checked]:bg-slate-900"
                                        />
                                        <label htmlFor={category} className="text-[14px] font-medium text-slate-500 cursor-pointer flex items-center gap-x-1">
                                            {category}
                                            <ChevronRight size={14} className="rotate-90 text-slate-300" />
                                        </label>
                                    </div>

                                    <div className="space-y-4 pl-8">
                                        {items.map((item) => (
                                            <div key={item} className="flex items-center gap-x-3 transition-colors hover:bg-slate-50/50 p-1 rounded-md cursor-pointer group">
                                                <Checkbox
                                                    id={`${category}-${item}`}
                                                    checked={selectedPermissions[category]?.includes(item)}
                                                    onCheckedChange={() => togglePermission(category, item)}
                                                    className="h-4 w-4 border-slate-200 rounded-[3px] data-[state=checked]:bg-slate-900"
                                                />
                                                <label
                                                    htmlFor={`${category}-${item}`}
                                                    className="text-[13px] text-slate-400 group-hover:text-slate-600 cursor-pointer font-medium leading-none"
                                                >
                                                    {item}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-x-4 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            className="h-12 px-10 rounded-xl bg-slate-50 text-slate-600 font-bold text-[14px] hover:bg-slate-100 transition-all"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-12 px-12 rounded-xl bg-[#4b8df8] text-white font-bold text-[14px] shadow-sm hover:shadow-md hover:bg-[#3a7bd5] transition-all"
                        >
                            {isSubmitting ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default UserTypesPage;
