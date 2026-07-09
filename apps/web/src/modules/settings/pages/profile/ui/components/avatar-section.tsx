"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@neuralpay/ui/components/avatar";
import { Button } from "@neuralpay/ui/components/button";
import { Camera, Trash2 } from "lucide-react";

interface AvatarSectionProps {
  image: string | null;
  name: string;
  onImageChange: (url: string | null) => void;
}

export function AvatarSection({
  image,
  name,
  onImageChange,
}: AvatarSectionProps) {
  return (
    <div className="flex items-center gap-6">
      <Avatar className="h-24 w-24">
        <AvatarImage src={image ?? undefined} alt={name} />
        <AvatarFallback className="text-2xl">
          {name?.charAt(0).toUpperCase() ?? "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Camera className="h-4 w-4" />
            Change
          </Button>
          {image && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={() => onImageChange(null)}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or GIF. Max 2MB.
        </p>
      </div>
    </div>
  );
}
