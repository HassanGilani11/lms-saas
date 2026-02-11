import { auth } from "@/auth";
import { notificationEmitter } from "@/lib/events";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return new Response("Unauthorized", { status: 401 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            const onNotification = (notification: any) => {
                // Only send to the intended user
                if (notification.userId === userId) {
                    const data = JSON.stringify(notification);
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                }
            };

            notificationEmitter.on("notification", onNotification);

            // Keep alive pulse
            const keepAlive = setInterval(() => {
                controller.enqueue(encoder.encode(": keepalive\n\n"));
            }, 30000);

            req.signal.addEventListener("abort", () => {
                clearInterval(keepAlive);
                notificationEmitter.off("notification", onNotification);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
