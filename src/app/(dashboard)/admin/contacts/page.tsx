"use client";

import { useEffect, useState } from "react";
import { getContacts, createContact, deleteContact, updateContact, toggleContactStatus } from "@/actions/contact";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import {
    Trash2, Pencil, Plus,
    MoreVertical, Filter, ArrowUpDown,
    Search, Calendar, ChevronLeft, ChevronRight,
    UserPlus, Mail, Phone, MapPin
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
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    address: z.string().optional(),
});

const ContactsPage = () => {
    const [contacts, setContacts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingContact, setEditingContact] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
        },
    });

    const fetchContacts = async () => {
        setIsLoading(true);
        const data = await getContacts();
        setContacts(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (editingContact) {
                await updateContact(editingContact.id, values);
                toast.success("Contact updated");
            } else {
                await createContact(values);
                toast.success("Contact created");
            }
            setIsDialogOpen(false);
            setEditingContact(null);
            form.reset();
            fetchContacts();
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const onDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this contact?")) {
            await deleteContact(id);
            toast.success("Contact deleted");
            fetchContacts();
        }
    };

    const onEdit = (contact: any) => {
        setEditingContact(contact);
        form.reset({
            name: contact.name,
            email: contact.email,
            phone: contact.phone || "",
            address: contact.address || "",
        });
        setIsDialogOpen(true);
    };

    const onToggleStatus = async (id: string) => {
        await toggleContactStatus(id);
        fetchContacts();
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 font-sans">
            <h1 className="text-[15px] font-bold text-slate-800">Administrative Contacts</h1>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setEditingContact(null);
                                    form.reset();
                                    setIsDialogOpen(true);
                                }}
                                className="h-8 w-8 text-slate-500 hover:text-slate-900"
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
                                placeholder="Search Contacts"
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
                                <TableHead className="w-[80px] text-[11px] font-bold text-slate-400 uppercase tracking-tighter pl-6">ID#</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Contact</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Email</TableHead>
                                <TableHead className="text-[11px) font-bold text-slate-400 uppercase tracking-tighter">Phone</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Created Date</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredContacts.map((contact, idx) => (
                                <TableRow key={contact.id} className="group hover:bg-slate-50/50 border-b last:border-0">
                                    <TableCell className="text-[12px] font-medium text-slate-500 pl-6">#{2015 + idx}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-x-3">
                                            <Avatar className="h-8 w-8 border">
                                                <AvatarImage src={contact.image || ""} />
                                                <AvatarFallback className="text-[10px] bg-slate-100 font-bold">{contact.name?.[0] || "?"}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-bold text-slate-700 leading-tight">{contact.name}</span>
                                                <span className="text-[10px] text-slate-400">{contact.address || "No address"}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-slate-500 font-medium">{contact.email}</TableCell>
                                    <TableCell className="text-[12px] text-slate-500 font-mono text-[11px]">{contact.phone || "---"}</TableCell>
                                    <TableCell className="text-[12px] text-slate-500">
                                        <div className="flex items-center gap-x-2">
                                            <Calendar className="h-3.5 w-3.5 text-slate-300" />
                                            {format(new Date(contact.createdAt), "MMM dd, yyyy")}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={contact.isActive}
                                            onCheckedChange={() => onToggleStatus(contact.id)}
                                            className="scale-75"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="text-[13px]">
                                                <DropdownMenuItem onClick={() => onEdit(contact)}><Pencil className="h-3.5 w-3.5 mr-2" />Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDelete(contact.id)} className="text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" />Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredContacts.length === 0 && !isLoading && (
                        <div className="text-center py-20 text-muted-foreground">
                            <p className="text-[13px] font-medium">No contacts found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 border bg-white shadow-sm"><ChevronLeft className="h-4 w-4" /></Button>
                {[1].map(p => (
                    <Button key={p} variant="default" className="h-8 w-10 text-[12px] font-bold border bg-slate-100 text-slate-900 shadow-sm">{p}</Button>
                ))}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 border bg-white shadow-sm"><ChevronRight className="h-4 w-4" /></Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="font-sans">
                    <DialogHeader>
                        <DialogTitle className="text-[16px] font-bold">
                            {editingContact ? "Edit Contact" : "Add New Contact"}
                        </DialogTitle>
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
                                {editingContact ? "Save Changes" : "Create Contact"}
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ContactsPage;
