/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { createUploadthing, type FileRouter } from "uploadthing/next";

// Configure UploadThing file router for avatar uploads.
// We keep this minimal for now and handle DB updates client-side after upload completes.
const f: ReturnType<typeof createUploadthing> = createUploadthing();

export const uploadthingFileRouter = {
  avatarUploader: f({ image: { maxFileCount: 1, maxFileSize: "4MB" } })
    // Optional middleware could enforce auth; omitted for now.
    .onUploadComplete(async ({ file }: { file: { url: string } }) => {
      // You can perform server-side actions here (e.g., logging).
      console.log("[UploadThing] avatar uploaded:", file.url);
      // Return data to the client; we'll use file.url to update the user's profile.
      return { url: file.url } as { url: string };
    }),
} satisfies FileRouter;

export type UploadthingFileRouter = typeof uploadthingFileRouter;
