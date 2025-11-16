"use client";

import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import type { UploadthingFileRouter } from "@/server/uploadthing";

// Typed UploadThing UI components based on our server FileRouter
export const UploadButton = generateUploadButton<UploadthingFileRouter>();
export const UploadDropzone = generateUploadDropzone<UploadthingFileRouter>();
