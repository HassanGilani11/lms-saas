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
import { getUsers } from "@/actions/user";
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
import { Trash2, Users, MoreVertical, Eye, Plus, Pencil, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Hash, UserCheck, Network } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string(),
    categoryId: z.string(),
    tagIds: z.array(z.string()),
    parentId: z.string().optional(),
    leaderIds: z.array(z.string()),
});

const AdminGroupsPage = () => {
    const [groups, setGroups] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [availableTags, setAvailableTags] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
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
            parentId: undefined,
            leaderIds: [],
        },
    });

    const fetchData = async () => {
        setIsLoading(true);
        console.log("[GROUPS_PAGE] Fetching data...");
        try {
            const [groupsData, catData, tagData, usersData] = await Promise.all([
                getGroups(),
                getGroupCategories(),
                getGroupTags(),
                getUsers()
            ]);
            console.log("[GROUPS_PAGE] Data received:", { groupsCount: groupsData.length, groupsData });
            setGroups(groupsData);
            setCategories(catData);
            setAvailableTags(tagData);
            setAllUsers(usersData);
        } catch (error) {
            console.error("[GROUPS_PAGE] Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (editingGroup) {
                const res = await updateGroup(editingGroup.id, values);
                if (!res) throw new Error("Failed to update group");
                toast.success("Group updated successfully");
            } else {
                const res = await createGroup(values);
                if (!res) throw new Error("Failed to create group");
                toast.success("Group created successfully");
            }
            setIsDialogOpen(false);
            setEditingGroup(null);
            form.reset();
            fetchData();
        } catch (error: any) {
            toast.error(error.message || (editingGroup ? "Failed to update group" : "Failed to create group"));
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
            parentId: group.parentId || undefined,
            leaderIds: group.leaders?.map((l: any) => l.id) || [],
        });
        setIsDialogOpen(true);
    };

    const filteredGroups = groups.filter(group => {
        const query = searchQuery.toLowerCase();
        const nameMatch = group.name.toLowerCase().includes(query);
        const categoryMatch = group.category?.name?.toLowerCase().includes(query) ?? false;
        return nameMatch || categoryMatch;
    });


    return (
        <div className="p-6 text-slate-900 dark:text-slate-100 font-sans space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-[17px] font-bold text-slate-800 dark:text-slate-100">Groups & Enterprise</h1>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
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
                                        parentId: undefined,
                                        leaderIds: [],
                                    });
                                    setIsDialogOpen(true);
                                }}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
                                <Filter className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="relative group">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-300 transition-colors" />
                            <Input
                                placeholder="Search groups..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 w-64 pl-9 bg-slate-50 dark:bg-slate-800 border-none text-[13px] focus-visible:ring-1 focus-visible:ring-slate-200 dark:focus-visible:ring-slate-700"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <TableHead className="pl-6 font-bold text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-tighter">Group Name</TableHead>
                                <TableHead className="font-bold text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-tighter">Category / Parent</TableHead>
                                <TableHead className="font-bold text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-tighter text-center">Leaders</TableHead>
                                <TableHead className="font-bold text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-tighter text-center">Members</TableHead>
                                <TableHead className="font-bold text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-tighter text-center">Created At</TableHead>
                                <TableHead className="text-right pr-6 font-bold text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-tighter">Options</TableHead>
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
                                    <TableCell>
                                        <div className="flex flex-col gap-y-1">
                                            {group.category ? (
                                                <Badge variant="outline" className="w-fit font-normal bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 text-[10px]">
                                                    {group.category.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-400 italic text-[10px]">Uncategorized</span>
                                            )}
                                            {group.parent && (
                                                <div className="flex items-center gap-x-1 text-slate-400 text-[10px]">
                                                    <Network className="h-3 w-3" />
                                                    {group.parent.name}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex -space-x-2 overflow-hidden justify-center">
                                            {group.leaders?.length > 0 ? (
                                                group.leaders.map((leader: any) => (
                                                    <Avatar key={leader.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-white">
                                                        <AvatarImage src={leader.image || ""} />
                                                        <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700 font-bold">{leader.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                ))
                                            ) : (
                                                <span className="text-slate-300"><UserCheck className="h-4 w-4" /></span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold text-[11px]">
                                            {group._count.users} Users
                                        </Badge>
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
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 border bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm"><ChevronLeft className="h-4 w-4" /></Button>
                {[1].map(p => (
                    <Button key={p} variant={p === 1 ? "default" : "ghost"} className={`h-8 w-10 text-[12px] font-bold border ${p === 1 ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm dark:border-slate-700" : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 shadow-sm dark:border-slate-800"}`}>{p}</Button>
                ))}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 border bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm"><ChevronRight className="h-4 w-4" /></Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="parentId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[13px] font-bold text-slate-700">Parent Group (Optional)</FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(val === "none" ? undefined : val)}
                                                value={field.value || "none"}
                                                defaultValue={field.value || "none"}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-10 text-[13px]">
                                                        <SelectValue placeholder="Select parent" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None (Top Level)</SelectItem>
                                                    {groups.filter(g => g.id !== editingGroup?.id).map((g) => (
                                                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
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
                                <FormLabel className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Group Leaders</FormLabel>
                                <FormField
                                    control={form.control}
                                    name="leaderIds"
                                    render={({ field }) => (
                                        <FormItem className="space-y-0">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-1">
                                                {allUsers.filter(u => u.role === "ADMIN" || u.role === "INSTRUCTOR").map((user) => (
                                                    <FormItem
                                                        key={user.id}
                                                        className="flex flex-row items-center space-x-3 space-y-0 p-2.5 rounded-lg bg-slate-50 border border-slate-100/50 hover:bg-slate-100 transition-colors"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(user.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...field.value, user.id])
                                                                        : field.onChange(
                                                                            field.value?.filter(
                                                                                (value: any) => value !== user.id
                                                                            )
                                                                        )
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <div className="flex items-center gap-x-1.5 overflow-hidden">
                                                            <Avatar className="h-5 w-5">
                                                                <AvatarImage src={user.image || ""} />
                                                                <AvatarFallback className="text-[8px]">{user.name?.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <FormLabel className="text-[11px] font-medium text-slate-600 truncate cursor-pointer">
                                                                {user.name}
                                                            </FormLabel>
                                                        </div>
                                                    </FormItem>
                                                ))}
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

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

