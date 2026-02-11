"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
    onChange: (url?: string) => void;
    value?: string;
    endpoint: keyof typeof ourFileRouter;
}

export const FileUpload = ({
    onChange,
    value,
    endpoint
}: FileUploadProps) => {
    if (value) {
        return (
            <div className="relative h-28 w-28">
                <Image
                    fill
                    src={value}
                    alt="Upload"
                    className="rounded-full object-cover border-2 border-slate-200"
                />
                <Button
                    onClick={() => onChange("")}
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full shadow-sm"
                    type="button"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <UploadDropzone
            endpoint={endpoint}
            onUploadBegin={(name) => {
                console.log("Uploading file:", name);
                toast.loading("Uploading image...");
            }}
            onClientUploadComplete={(res) => {
                onChange(res?.[0].url);
                toast.dismiss();
                toast.success("Upload complete");
            }}
            onUploadError={(error: Error) => {
                toast.dismiss();
                toast.error(`${error?.message}`);
            }}
            appearance={{
                button: "bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-800 transition",
                allowedContent: "text-slate-400 text-xs mt-2",
                label: "text-slate-600 font-semibold mb-2"
            }}
            className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-8 hover:bg-slate-100/50 transition duration-200"
        />
    );
};
