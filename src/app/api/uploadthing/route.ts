import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

console.log("[UPLOADTHING_ROUTE] Token present:", !!process.env.UPLOADTHING_TOKEN);

export const { GET, POST } = createRouteHandler({
    router: ourFileRouter,
});
