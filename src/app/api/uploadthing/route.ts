import { createRouteHandler } from "uploadthing/next";
import { uploadthingFileRouter } from "@/server/uploadthing";
import type { NextRequest } from "next/server";

// Create the UploadThing route handler and export typed GET/POST wrappers
const handler: {
  GET: (req: NextRequest) => Promise<Response> | Response;
  POST: (req: NextRequest) => Promise<Response> | Response;
} = createRouteHandler({ router: uploadthingFileRouter });

export async function GET(req: NextRequest): Promise<Response> {
  return handler.GET(req);
}

export async function POST(req: NextRequest): Promise<Response> {
  return handler.POST(req);
}
