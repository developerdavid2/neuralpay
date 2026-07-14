import { utapi } from "./client";

export async function deleteFileIfExists(
  key: string | null | undefined,
): Promise<void> {
  if (!key) return;
  try {
    await utapi.deleteFiles(key);
  } catch (err) {
    console.error("[file-upload] Failed to delete file:", key, err);
  }
}

export async function clearExistingFile(opts: {
  getCurrentKey: () => Promise<string | null | undefined>;
  clearReference: () => Promise<void>;
}): Promise<void> {
  const existingKey = await opts.getCurrentKey();
  if (!existingKey) return;

  await opts.clearReference();
  await deleteFileIfExists(existingKey);
}

export async function finalizeFile(opts: {
  getCurrentKey: () => Promise<string | null | undefined>;
  persistNew: (file: { url: string; key: string }) => Promise<void>;
  newFile: { url: string; key: string };
}): Promise<void> {
  const existingKey = await opts.getCurrentKey();

  await opts.persistNew(opts.newFile);

  if (existingKey && existingKey !== opts.newFile.key) {
    await deleteFileIfExists(existingKey);
  }
}
