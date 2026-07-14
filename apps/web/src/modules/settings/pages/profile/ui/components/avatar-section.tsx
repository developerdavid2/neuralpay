"use client";

import React from "react";
import { useDropzone, type FileWithPath } from "react-dropzone";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@neuralpay/ui/components/avatar";
import { Button } from "@neuralpay/ui/components/button";
import { Camera, Trash2 } from "lucide-react";
import { Show } from "@/components/show";
import { ImageCropper, type FileWithPreview } from "@/components/image-cropper";

interface AvatarSectionProps {
  image: string | null;
  name: string;
  onFileSelected: (file: File, previewUrl: string) => void;
  onRemove: () => void;
}

const accept = {
  "image/*": [],
};

export function AvatarSection({
  image,
  name,
  onFileSelected,
  onRemove,
}: AvatarSectionProps) {
  const [selectedFile, setSelectedFile] =
    React.useState<FileWithPreview | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const onDrop = React.useCallback((acceptedFiles: FileWithPath[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const fileWithPreview = Object.assign(file, {
      preview: URL.createObjectURL(file),
    }) as FileWithPreview;

    setSelectedFile(fileWithPreview);
    setDialogOpen(true);
  }, []);

  // noClick/noKeyboard so the "Change" button drives the picker,
  // not a click anywhere on the section
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div {...getRootProps()} className="flex items-center gap-6">
      <input {...getInputProps()} />

      <Show
        when={!!selectedFile}
        fallback={
          <Avatar className="h-24 w-24">
            <AvatarImage src={image ?? undefined} alt={name} />
            <AvatarFallback className="text-2xl bg-primary/5">
              {name?.charAt(0).toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        }
      >
        <ImageCropper
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          onCropComplete={(file, previewUrl) =>
            onFileSelected(file, previewUrl)
          }
        />
      </Show>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={open}
          >
            <Camera className="h-4 w-4" />
            Change
          </Button>
          <Show when={!!image}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </Show>
        </div>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or GIF. Max 2MB.
        </p>
      </div>
    </div>
  );
}
