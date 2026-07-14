import { createUploadthing, type FileRouter } from "uploadthing/express";

const f = createUploadthing();

export const userFileRouter = {
  avatarUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { uploadedKey: file.key };
  }),
} satisfies FileRouter;

export type UserFileRouter = typeof userFileRouter;
