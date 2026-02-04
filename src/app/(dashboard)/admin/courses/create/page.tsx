"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { ChevronRight, ArrowLeft, Save, X, Hash } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { createCourse, updateCourse } from "@/actions/course";
import { getCategories } from "@/actions/admin";
import { getUsers } from "@/actions/user";
import { UserRole } from "@/lib/prisma";
import { getCourseTags } from "@/actions/course-tags";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    courseCode: z.string().default(""),
    categoryId: z.string().min(1, "Category is required"),
    description: z.string().default(""),
    price: z.coerce.number().min(0).default(0),
    introVideoUrl: z.string().default(""),
    capacity: z.coerce.number().min(0).default(0),
    level: z.string().default("Beginner"),
    userId: z.string().min(1, "Instructor is required"),
    isActive: z.boolean().default(true),
    hideFromCatalog: z.boolean().default(false),
    tagIds: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

const CreateCoursePage = () => {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [availableTags, setAvailableTags] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            title: "",
            courseCode: "",
            categoryId: "",
            description: "",
            price: 0,
            introVideoUrl: "",
            capacity: 0,
            level: "Beginner",
            userId: "",
            isActive: true,
            hideFromCatalog: false,
            tagIds: [],
        } as any,
    }) as any;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [catData, instData, tagData] = await Promise.all([
                getCategories(),
                getUsers(UserRole.INSTRUCTOR),
                getCourseTags(),
            ]);
            setCategories(catData);
            setInstructors(instData);
            setAvailableTags(tagData);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const onSubmit = async (values: FormValues) => {
        try {
            const course = await createCourse(values.title, {
                price: values.price,
                userId: values.userId,
                categoryId: values.categoryId,
                courseCode: values.courseCode,
                tagIds: values.tagIds,
            });

            if (course) {
                // Now update with the remaining fields since createCourse is basic
                await updateCourse(course.id, {
                    ...values,
                    tagIds: values.tagIds,
                });

                toast.success("Course created successfully");
                router.push("/admin/courses");
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    if (isLoading) {
        return <div className="p-6 text-slate-400">Loading form...</div>;
    }

    return (
        <div className="p-6 space-y-6 font-sans">
            <div className="flex items-center gap-x-2 text-sm text-slate-500">
                <span>Dashboards</span>
                <ChevronRight className="h-4 w-4" />
                <span>Courses</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-slate-900 font-medium">Add Course</span>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Add Course</h1>
                    <p className="text-sm text-slate-500">Create a new course with full details</p>
                </div>
                <div className="flex items-center gap-x-2">
                    <Button variant="outline" onClick={() => router.back()} className="h-9 text-[13px] font-medium border-slate-200">
                        Cancel
                    </Button>
                    <Button onClick={form.handleSubmit(onSubmit)} className="h-9 text-[13px] font-bold bg-slate-900 hover:bg-slate-800 text-white px-6">
                        Save & Select Users
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>

            <Form {...(form as any)}>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    <Card className="border-none shadow-sm md:col-span-2">
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Course Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter course title" className="h-11 bg-slate-50 border-none text-[14px]" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="courseCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Course Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. CS101" className="h-11 bg-slate-50 border-none text-[14px]" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 bg-slate-50 border-none text-[14px]">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Add a course description up to 5000 characters"
                                                    className="min-h-[120px] bg-slate-50 border-none text-[14px] resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4 pt-2">
                                <h3 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Course Status</h3>
                                <div className="flex items-center gap-x-8">
                                    <FormField
                                        control={form.control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center gap-x-3 space-y-0">
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-90" />
                                                </FormControl>
                                                <FormLabel className="text-[13px] font-semibold text-slate-600">Active</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="hideFromCatalog"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center gap-x-3 space-y-0">
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-90" />
                                                </FormControl>
                                                <FormLabel className="text-[13px] font-semibold text-slate-600">Hide from course catalog</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-2 border-t border-slate-100">
                                <h3 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Course Tags</h3>
                                <FormField
                                    control={form.control}
                                    name="tagIds"
                                    render={({ field }) => (
                                        <FormItem className="space-y-0">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {availableTags.map((tag) => (
                                                    <FormItem
                                                        key={tag.id}
                                                        className="flex flex-row items-center space-x-3 space-y-0 p-3 rounded-xl bg-slate-50/50 border border-slate-100/50 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(tag.id)}
                                                                onCheckedChange={(checked) => {
                                                                    const current = field.value || [];
                                                                    const updated = checked
                                                                        ? [...current, tag.id]
                                                                        : current.filter((value: string) => value !== tag.id);
                                                                    field.onChange(updated);
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <div className="flex items-center gap-x-1.5">
                                                            <Hash className="h-3 w-3 text-slate-400" />
                                                            <FormLabel className="text-[13px] font-medium text-slate-600 cursor-pointer">
                                                                {tag.name}
                                                            </FormLabel>
                                                        </div>
                                                    </FormItem>
                                                ))}
                                            </div>
                                            {availableTags.length === 0 && (
                                                <p className="text-[12px] text-slate-400 italic">No tags created yet. Go to Course Tags to add some.</p>
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm md:col-span-1">
                        <CardContent className="p-6 space-y-6">
                            <FormField
                                control={form.control}
                                name="userId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Instructor</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 bg-slate-50 border-none text-[14px]">
                                                    <SelectValue placeholder="Select instructor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {instructors.map((inst) => (
                                                    <SelectItem key={inst.id} value={inst.id}>{inst.name || inst.email}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Price ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" className="h-11 bg-slate-50 border-none text-[14px]" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="level"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Level</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 bg-slate-50 border-none text-[14px]">
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Beginner">Beginner</SelectItem>
                                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                <SelectItem value="Advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm md:col-span-1">
                        <CardContent className="p-6 space-y-6">
                            <FormField
                                control={form.control}
                                name="introVideoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Intro Video URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://youtube.com/..." className="h-11 bg-slate-50 border-none text-[14px]" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Capacity (Max Students)</FormLabel>
                                        <FormControl>
                                            <Input type="number" className="h-11 bg-slate-50 border-none text-[14px]" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormItem>
                                <FormLabel className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Certificates</FormLabel>
                                <div className="p-3 bg-slate-50 rounded-lg text-slate-400 text-sm border-dashed border-2 border-slate-200 text-center">
                                    Default Certificate Applied
                                </div>
                            </FormItem>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
};

export default CreateCoursePage;
