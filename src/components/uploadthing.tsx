/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
"use client";

import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import type { UploadthingFileRouter } from "@/server/uploadthing";
import React, { type FC, memo } from "react";

// Define common props and result types for the generated components
type UploadThingResult = { serverData?: { url?: string }; url?: string };
export type UploadButtonProps = {
  endpoint: keyof UploadthingFileRouter;
  onClientUploadComplete?: (res: UploadThingResult[]) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
};

// Generate once at module scope so renders of parent components (e.g. form typing)
// don’t recreate the UploadThing components and disrupt an in-progress upload.
const RawUploadButton = generateUploadButton<UploadthingFileRouter>();
const RawUploadDropzone = generateUploadDropzone<UploadthingFileRouter>();

const UploadButtonImpl: FC<UploadButtonProps> = (props) => {
  return <RawUploadButton {...props} />;
};

const UploadDropzoneImpl: FC<UploadButtonProps> = (props) => {
  return <RawUploadDropzone {...props} />;
};

// Memoize to avoid unnecessary child re-renders when parent state changes.
export const UploadButton = memo(UploadButtonImpl);
export type UploadDropzoneProps = UploadButtonProps;
export const UploadDropzone = memo(UploadDropzoneImpl);
