"use client";

import { useEffect, useState } from "react";
import {
    getGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupCategories,
    getGroupTags
} from "@/actions/groups";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, Users, MoreVertical, Eye, Plus, Pencil, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().default("").or(z.literal("")),
    categoryId: z.string().default("").or(z.literal("")),
    tagIds: z.array(z.string()).default([]),
});

const AdminGroupsPage = () => {
    const [groups, setGroups] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [availableTags, setAvailableTags] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<any | null>(null);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            categoryId: "",
            tagIds: [],
        },
    });

    const fetchData = async () => {
        setIsLoading(true);
        const [groupsData, catData, tagData] = await Promise.all([
            getGroups(),
            getGroupCategories(),
            getGroupTags()
        ]);
        setGroups(groupsData);
        setCategories(catData);
        setAvailableTags(tagData);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (editingGroup) {
                await updateGroup(editingGroup.id, values);
                toast.success("Group updated successfully");
            } else {
                await createGroup(values);
                toast.success("Group created successfully");
            }
            setIsDialogOpen(false);
            setEditingGroup(null);
            form.reset();
            fetchData();
        } catch (error) {
            toast.error(editingGroup ? "Failed to update group" : "Failed to create group");
        }
    };

    const onDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure? This will delete the group and remove all user associations.")) {
            await deleteGroup(id);
            toast.success("Group deleted successfully");
            fetchData();
        }
    };

    const onEdit = (group: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingGroup(group);
        form.reset({
            name: group.name,
            description: group.description || "",
            categoryId: group.categoryId || "",
            tagIds: group.tags?.map((t: any) => t.id) || [],
        });
        setIsDialogOpen(true);
    };

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 text-black font-sans space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-[17px] font-bold text-slate-800">Groups</h1>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-slate-900"
                                onClick={() => {
                                    setEditingGroup(null);
                                    form.reset({
                                        name: "",
                                        description: "",
                                        categoryId: "",
                                        tagIds: [],
                                    });
                                    setIsDialogOpen(true);
                                }}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                                <Filter className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="relative group">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                            <Input
                                placeholder="Search groups..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 w-64 pl-9 bg-slate-50 border-none text-[13px] focus-visible:ring-1 focus-visible:ring-slate-200"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="pl-6 font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Group Name</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Category</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[11px] uppercase tracking-tighter text-center">Members</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[11px] uppercase tracking-tighter text-center">Tags</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[11px] uppercase tracking-tighter text-center">Created At</TableHead>
                                <TableHead className="text-right pr-6 font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Options</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredGroups.map((group) => (
                                <TableRow
                                    key={group.id}
                                    className="group hover:bg-slate-50/50 border-b last:border-0 cursor-pointer transition-colors"
                                    onClick={() => router.push(`/admin/groups/${group.id}`)}
                                >
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                                <Users className="h-4 w-4 text-indigo-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-slate-900">{group.name}</span>
                                                {group.description && (
                                                    <span className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{group.description}</span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600 text-[12px]">
                                        {group.category ? (
                                            <Badge variant="outline" className="font-normal bg-slate-50 text-slate-600 border-slate-200">
                                                {group.category.name}
                                            </Badge>
                                        ) : (
                                            <span className="text-slate-400 italic">Uncategorized</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold text-[11px]">
                                            {group._count.users} Users
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-wrap gap-1 justify-center max-w-[200px]">
                                            {group.tags.slice(0, 3).map((tag: any) => (
                                                <span key={tag.id} className="inline-flex items-center text-[10px] bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-medium">
                                                    <Hash className="h-2.5 w-2.5 mr-0.5 opacity-50" />
                                                    {tag.name}
                                                </span>
                                            ))}
                                            {group.tags.length > 3 && (
                                                <span className="text-[9px] text-slate-400 pl-1">+{group.tags.length - 3}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-medium text-slate-500 text-[12px]">
                                        {format(new Date(group.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="text-[13px] font-medium min-w-[140px]">
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/admin/groups/${group.id}`);
                                                    }}
                                                >
                                                    <Eye className="h-3.5 w-3.5 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => onEdit(group, e)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => onDelete(group.id, e)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {(filteredGroups.length === 0 || isLoading) && (
                        <div className="text-center py-24 text-slate-400 flex flex-col items-center gap-y-2">
                            <Users className="h-10 w-10 text-slate-100" />
                            <p className="text-[13px] font-medium">{isLoading ? "Loading groups..." : "No groups found."}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-x-2 pt-4">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 border bg-white shadow-sm"><ChevronLeft className="h-4 w-4" /></Button>
                {[1].map(p => (
                    <Button key={p} variant={p === 1 ? "default" : "ghost"} className={`h-8 w-10 text-[12px] font-bold border ${p === 1 ? "bg-slate-100 text-slate-900 shadow-sm" : "bg-white text-slate-400 shadow-sm"}`}>{p}</Button>
                ))}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 border bg-white shadow-sm"><ChevronRight className="h-4 w-4" /></Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">
                            {editingGroup ? "Edit Group" : "Create Group"}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[13px] font-bold text-slate-700">Group Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Summer Interns 2024" className="h-10 text-[13px]" {...field} />
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
                                            <FormLabel className="text-[13px] font-bold text-slate-700">Category</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-10 text-[13px]">
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
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] font-bold text-slate-700">Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Group description..." className="min-h-[80px] text-[13px]" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-3 pt-2">
                                <FormLabel className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Group Tags</FormLabel>
                                <FormField
                                    control={form.control}
                                    name="tagIds"
                                    render={({ field }) => (
                                        <FormItem className="space-y-0">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {availableTags.map((tag) => (
                                                    <FormItem
                                                        key={tag.id}
                                                        className="flex flex-row items-center space-x-3 space-y-0 p-2.5 rounded-lg bg-slate-50 border border-slate-100/50 hover:bg-slate-100 transition-colors"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(tag.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...field.value, tag.id])
                                                                        : field.onChange(
                                                                            field.value?.filter(
                                                                                (value: any) => value !== tag.id
                                                                            )
                                                                        )
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <div className="flex items-center gap-x-1.5 overflow-hidden">
                                                            <Hash className="h-3 w-3 text-slate-400 shrink-0" />
                                                            <FormLabel className="text-[12px] font-medium text-slate-600 truncate cursor-pointer">
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

                            <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 h-10 font-bold mt-4" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Saving..." : (editingGroup ? "Update Group" : "Create Group")}
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminGroupsPage;
