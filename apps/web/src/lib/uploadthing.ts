import { generateReactHelpers } from "@uploadthing/react";
import type { UserUploadFileRouter } from "@orra/api-gateway/router";
import { webEnv } from "@orra/env/web";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<UserUploadFileRouter>({
    url: `${webEnv.NEXT_PUBLIC_SERVER_URL}/v1/uploadthing`,
  });
