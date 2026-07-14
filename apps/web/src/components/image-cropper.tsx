"use client";

import React, { useRef, useState, useCallback, type PointerEvent } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@neuralpay/ui/components/avatar";
import { Button } from "@neuralpay/ui/components/button";
import { Slider } from "@neuralpay/ui/components/slider";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@neuralpay/ui/components/dialog";
import type { FileWithPath } from "react-dropzone";

import { CropIcon, Trash2Icon, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { dataUrlToFile } from "@/lib/data-url-to-file";

export type FileWithPreview = FileWithPath & {
  preview: string;
};

interface ImageCropperProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedFile: FileWithPreview | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<FileWithPreview | null>>;
  onCropComplete?: (file: File, previewUrl: string) => void;
}

// Fixed frame the user crops into — square output, matches your aspect=1 use case
const FRAME_SIZE = 320;
const OUTPUT_SIZE = 512; // final exported avatar resolution

export function ImageCropper({
  dialogOpen,
  setDialogOpen,
  selectedFile,
  setSelectedFile,
  onCropComplete,
}: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const naturalSize = useRef({ width: 0, height: 0 });

  const [croppedImage, setCroppedImage] = useState<string>("");

  // scale=1 means the image is sized to just cover the frame (its smaller
  // dimension === FRAME_SIZE). zoom multiplies on top of that base scale.
  const [baseScale, setBaseScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const dragState = useRef<{
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
    dragging: boolean;
  } | null>(null);

  function clampOffset(
    x: number,
    y: number,
    scale: number,
  ): { x: number; y: number } {
    const { width, height } = naturalSize.current;
    const scaledW = width * scale;
    const scaledH = height * scale;

    // Image can pan until its edge reaches the frame edge — never further,
    // so the frame is never left showing empty space.
    const maxX = Math.max(0, (scaledW - FRAME_SIZE) / 2);
    const maxY = Math.max(0, (scaledH - FRAME_SIZE) / 2);

    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    naturalSize.current = {
      width: img.naturalWidth,
      height: img.naturalHeight,
    };

    // Cover the frame: scale so the SMALLER natural dimension fills FRAME_SIZE
    const cover = FRAME_SIZE / Math.min(img.naturalWidth, img.naturalHeight);
    setBaseScale(cover);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        startOffsetX: offset.x,
        startOffsetY: offset.y,
        dragging: true,
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [offset],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!dragState.current?.dragging) return;

      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      const scale = baseScale * zoom;

      setOffset(
        clampOffset(
          dragState.current.startOffsetX + dx,
          dragState.current.startOffsetY + dy,
          scale,
        ),
      );
    },
    [baseScale, zoom],
  );

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    if (dragState.current) dragState.current.dragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function handleZoomChange(values: number[]) {
    const nextZoom = values[0] ?? 1;
    const scale = baseScale * nextZoom;
    setZoom(nextZoom);
    setOffset((prev) => clampOffset(prev.x, prev.y, scale));
  }

  function getCroppedImg(): string {
    const image = imgRef.current;
    if (!image) return "";

    const scale = baseScale * zoom;
    const { width, height } = naturalSize.current;

    // The frame's top-left corner in *scaled image* pixel space
    const scaledW = width * scale;
    const scaledH = height * scale;
    const frameLeftInScaled = (scaledW - FRAME_SIZE) / 2 - offset.x;
    const frameTopInScaled = (scaledH - FRAME_SIZE) / 2 - offset.y;

    // Convert back to natural (unscaled) image pixel space for drawImage
    const sx = frameLeftInScaled / scale;
    const sy = frameTopInScaled / scale;
    const sSize = FRAME_SIZE / scale;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, sx, sy, sSize, sSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    return canvas.toDataURL("image/png", 1.0);
  }

  function onCrop() {
    try {
      const croppedImageUrl = getCroppedImg();
      setCroppedImage(croppedImageUrl);
      const file = dataUrlToFile(croppedImageUrl, "avatar.png");

      onCropComplete?.(file, croppedImageUrl);
      setDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error("Something went wrong while processing your avatar.");
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger>
        <Avatar className="size-36 cursor-pointer ring-offset-2 ring-2 ring-slate-200">
          <AvatarImage
            src={croppedImage ? croppedImage : selectedFile?.preview}
            alt="@shadcn"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent className="p-0 gap-0">
        <div className="p-6 flex flex-col items-center gap-4">
          <div
            className="relative overflow-hidden rounded-full cursor-grab active:cursor-grabbing bg-muted touch-none select-none"
            style={{ width: FRAME_SIZE, height: FRAME_SIZE }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <img
              ref={imgRef}
              src={selectedFile?.preview}
              alt="Image to crop"
              draggable={false}
              onLoad={onImageLoad}
              className="absolute top-1/2 left-1/2 max-w-none pointer-events-none"
              style={{
                width: naturalSize.current.width * baseScale * zoom,
                height: naturalSize.current.height * baseScale * zoom,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              }}
            />
          </div>

          <div className="flex items-center gap-3 w-full max-w-xs">
            <ZoomIn className="size-4 text-muted-foreground shrink-0" />
            <Slider
              min={1}
              max={3}
              step={0.01}
              value={[zoom]}
              onValueChange={handleZoomChange}
            />
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 justify-center">
          <DialogClose asChild>
            <Button
              size="sm"
              type="reset"
              className="w-fit"
              variant="outline"
              onClick={() => setSelectedFile(null)}
            >
              <Trash2Icon className="mr-1.5 size-4" />
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" size="sm" className="w-fit" onClick={onCrop}>
            <CropIcon className="mr-1.5 size-4" />
            Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
