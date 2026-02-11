import { auth } from "@/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const handleAuth = async () => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        console.log("[UPLOADTHING_AUTH] Session User:", session?.user?.email, "Role:", session?.user?.role);

        if (!userId || session.user.role !== "ADMIN") {
            console.log("[UPLOADTHING_AUTH] Unauthorized access:", { userId, role: session?.user?.role });
            throw new UploadThingError("Unauthorized");
        }
        return { userId };
    } catch (error) {
        console.error("[UPLOADTHING_AUTH] Error in handleAuth:", error);
        throw new UploadThingError("Unauthorized");
    }
};

export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: "32MB", maxFileCount: 1 } })
        .middleware(async () => await handleAuth())
        .onUploadComplete(({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            console.log("File URL:", file.url);
            return { uploadedBy: metadata.userId };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
