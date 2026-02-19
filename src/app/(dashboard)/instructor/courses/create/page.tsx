"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { ChevronRight, Save, Hash } from "lucide-react";

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
import { getCategories } from "@/actions/category";
import { getCourseTags } from "@/actions/course-tags";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/shared/file-upload";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    courseCode: z.string().default(""),
    categoryId: z.string().min(1, "Category is required"),
    description: z.string().default(""),
    imageUrl: z.string().default(""),
    price: z.coerce.number().min(0).default(0),
    priceType: z.enum(["FREE", "PAID"]).default("FREE"),
    introVideoUrl: z.string().default(""),
    capacity: z.coerce.number().min(0).default(0),
    level: z.string().default("Beginner"),
    isActive: z.boolean().default(false),
    hideFromCatalog: z.boolean().default(false),
    tagIds: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

const InstructorCreateCoursePage = () => {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [availableTags, setAvailableTags] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            title: "",
            courseCode: "",
            categoryId: "",
            description: "",
            imageUrl: "",
            price: 0,
            priceType: "FREE",
            introVideoUrl: "",
            capacity: 0,
            level: "Beginner",
            isActive: false,
            hideFromCatalog: false,
            tagIds: [],
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [catData, tagData] = await Promise.all([
                    getCategories(),
                    getCourseTags(),
                ]);
                setCategories(catData);
                setAvailableTags(tagData);
            } catch (error) {
                toast.error("Error fetching data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (values: FormValues) => {
        try {
            const submitPrice = values.priceType === "FREE" ? 0 : values.price;
            const course = await createCourse(values.title, {
                price: submitPrice,
                categoryId: values.categoryId,
                courseCode: values.courseCode,
                tagIds: values.tagIds,
                imageUrl: values.imageUrl,
            } as any);

            if (course) {
                await updateCourse(course.id, {
                    ...values,
                    tagIds: values.tagIds,
                });

                toast.success("Course created successfully");
                router.push(`/instructor/courses/${course.id}/edit`);
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    if (isLoading) {
        return <div className="p-6 text-slate-500 font-medium">Preparing your workspace...</div>;
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
                    <Button onClick={form.handleSubmit(onSubmit)} className="h-9 text-[13px] font-bold bg-slate-900 hover:bg-slate-800 text-white px-6 transition-all active:scale-95">
                        Create Course
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    <Card className="border-none shadow-sm md:col-span-2">
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <div className="space-y-6">
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
                                </div>
                                <div className="space-y-2">
                                    <FormLabel className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Featured Image</FormLabel>
                                    <FormField
                                        control={form.control}
                                        name="imageUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <FileUpload
                                                        endpoint="courseImage"
                                                        value={field.value}
                                                        onChange={(url) => field.onChange(url)}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs">
                                                    This image will be shown on the course catalog and landing page.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

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
                                                <p className="text-[12px] text-slate-400 italic">No tags created yet.</p>
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
                                name="priceType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Price Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 bg-slate-50 border-none text-[14px]">
                                                    <SelectValue placeholder="Select price type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="FREE">Free</SelectItem>
                                                <SelectItem value="PAID">Paid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {form.watch("priceType") === "PAID" && (
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
                            )}
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

export default InstructorCreateCoursePage;
