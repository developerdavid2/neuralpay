import { generateReactHelpers } from "@uploadthing/react";
import type { UserUploadFileRouter } from "@neuralpay/api-gateway/router";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<UserUploadFileRouter>({
    url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/uploadthing`,
  });
