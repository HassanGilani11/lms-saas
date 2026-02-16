"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { enrollWithCod } from "@/actions/purchase";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    address: z.string().min(10, "Address must be at least 10 characters"),
    country: z.string().min(1, "Country is required"),
});

interface CodCheckoutFormProps {
    courseId: string;
    price: number;
    onCancel: () => void;
    initialData?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        country?: string;
    };
}

export const CodCheckoutForm = ({
    courseId,
    price,
    onCancel,
    initialData,
}: CodCheckoutFormProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            address: initialData?.address || "",
            country: initialData?.country || "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true);
            const submissionData = {
                ...values,
                address: `${values.address}, ${values.country}`,
            };
            const response = await enrollWithCod(courseId, submissionData);

            if (response.success) {
                toast.success("Enrollment request submitted!");
                router.push(`/payment/success?courseId=${courseId}&purchaseId=${response.purchase.id}`);
            } else {
                toast.error(response.error || "Something went wrong");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-top-5">
            <div className="flex items-center gap-3 mb-6 pb-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900">Billing Details</h3>
                    <p className="text-xs text-slate-500">Please provide your details to complete the order.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input disabled={isLoading} placeholder="Ex: John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input disabled={isLoading} placeholder="Ex: john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} placeholder="Country" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} placeholder="Ex: +1 234 567 890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Billing Address</FormLabel>
                                <FormControl>
                                    <Textarea
                                        disabled={isLoading}
                                        placeholder="Full address (Street, City, Zip)"
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="w-full"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Confirm Order
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};
