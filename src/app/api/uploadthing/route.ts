import { createRouteHandler } from "uploadthing/next";
import { uploadthingFileRouter } from "@/server/uploadthing";

// Export routes for UploadThing: handles GET and POST for upload endpoints
export const { GET, POST } = createRouteHandler({
  router: uploadthingFileRouter,
});
