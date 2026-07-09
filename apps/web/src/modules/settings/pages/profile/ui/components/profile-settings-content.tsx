"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/queries/use-profile";
import type { UpdateProfileInput } from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { toast } from "sonner";
import { useUpdateProfile } from "../../hooks/queries/use-update-profile";
import { AvatarSection } from "./avatar-section";
import { LanguageRegionSection } from "./language-region-section";
import { LocationSection } from "./location-section";
import { PersonalInfoSection } from "./personal-info-section";

export function ProfileSettingsContent() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState<UpdateProfileInput>({});
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof UpdateProfileInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    if (!hasChanges) return;

    updateProfile.mutate(formData, {
      onSuccess: () => {
        toast.success("Profile updated");
        setFormData({});
        setHasChanges(false);
      },
      onError: () => {
        toast.error("Failed to update profile");
      },
    });
  };

  return (
    <div className="space-y-6">
      <AvatarSection
        image={profile.image}
        name={profile.name}
        onImageChange={(url) => handleChange("image", url)}
      />

      <PersonalInfoSection
        name={profile.name}
        nickname={profile.nickname}
        email={profile.email}
        gender={profile.gender}
        dateOfBirth={profile.dateOfBirth}
        phone={profile.phone}
        onChange={handleChange}
      />

      <LocationSection
        country={profile.country}
        state={profile.state}
        city={profile.city}
        address={profile.address}
        onChange={handleChange}
      />

      <LanguageRegionSection
        language={profile.language}
        timezone={profile.timezone}
        currency={profile.currency}
        dateFormat={profile.dateFormat}
        onChange={handleChange}
      />

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!hasChanges || updateProfile.isPending}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export function ProfileSettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Avatar skeleton */}
      <div className="flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Personal info skeleton */}
      <Card className="bg-gray-400/5">
        <CardHeader className="pb-0">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location skeleton */}
      <Card className="bg-gray-400/5">
        <CardHeader className="pb-0">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Language & Region skeleton */}
      <Card className="bg-gray-400/5">
        <CardHeader className="pb-0">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
