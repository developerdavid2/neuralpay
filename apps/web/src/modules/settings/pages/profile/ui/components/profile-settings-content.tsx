"use client";

import { useProfile } from "@/hooks/queries/use-profile";
import { useConfirm } from "@/hooks/ui/use-confirm";
import { useUploadThing } from "@/lib/uploadthing";
import type { UpdateProfileInput, UserRecord } from "@neuralpay/types";
import { Button } from "@neuralpay/ui/components/button";
import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Skeleton } from "@neuralpay/ui/components/skeleton";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUpdateProfile } from "../../hooks/mutations/use-update-profile";
import { AvatarSection } from "./avatar-section";
import { LanguageRegionSection } from "./language-region-section";
import { LocationSection } from "./location-section";
import { PersonalInfoSection } from "./personal-info-section";
import { Spinner } from "@neuralpay/ui/components/spinner";

export function ProfileSettingsContent() {
  const { profile, isLoading } = useProfile();
  if (isLoading) {
    return <p>Loading</p>;
  }

  return <ProfileSettingsForm profile={profile!} />;
}

function buildDefaults(profile: UserRecord): UpdateProfileInput {
  return {
    name: profile.name,
    nickname: profile.nickname ?? undefined,
    image: profile.image ?? undefined,
    imageKey: profile.imageKey ?? undefined,
    phone: profile.phone ?? undefined,
    email: profile.email ?? undefined,
    gender: profile.gender ?? undefined,
    dateOfBirth: profile.dateOfBirth ?? undefined,
    country: profile.country ?? undefined,
    state: profile.state ?? undefined,
    city: profile.city ?? undefined,
    address: profile.address ?? undefined,
    language: profile.language,
    timezone: profile.timezone,
    currency: profile.currency,
    dateFormat: profile.dateFormat,
  };
}

export function ProfileSettingsForm({ profile }: { profile: UserRecord }) {
  const updateProfile = useUpdateProfile();
  const [ConfirmDialog, confirm] = useConfirm();

  // Avatar is staged locally and only actually uploaded/committed on Save.
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  const { startUpload, isUploading } = useUploadThing("avatarUploader", {
    onUploadError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const form = useForm<UpdateProfileInput>({
    defaultValues: buildDefaults(profile),
  });

  const displayedAvatar = avatarRemoved
    ? null
    : (avatarPreview ?? form.watch("image") ?? null);

  const avatarIsDirty = !!pendingAvatarFile || avatarRemoved;

  const onSubmit = async (values: UpdateProfileInput) => {
    const ok = await confirm({
      title: "Save profile changes",
      message:
        "Are you sure you want to update your profile with these changes?",
      confirmLabel: "Save",
    });
    if (!ok) return;

    const finalValues: UpdateProfileInput = { ...values };

    if (pendingAvatarFile) {
      const result = await startUpload([pendingAvatarFile]);
      const uploaded = result?.[0];

      if (!uploaded?.ufsUrl) {
        toast.error("Avatar upload failed. Please try saving again.");
        return; // bail before touching the DB
      }

      finalValues.image = uploaded.ufsUrl;
      finalValues.imageKey = uploaded.key;
    } else if (avatarRemoved) {
      finalValues.image = null;
      finalValues.imageKey = null;
    }

    const payload = { ...finalValues };
    if (!pendingAvatarFile && !avatarRemoved) {
      delete payload.image;
      delete payload.imageKey;
    }

    updateProfile.mutate(payload, {
      onSuccess: () => {
        toast.success("Profile updated");
        form.reset(finalValues);
        setPendingAvatarFile(null);
        setAvatarPreview(null);
        setAvatarRemoved(false);
      },
      onError: () => toast.error("Failed to update profile"),
    });
  };

  return (
    <>
      <ConfirmDialog />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AvatarSection
          image={displayedAvatar}
          name={profile.name}
          onFileSelected={(file, previewUrl) => {
            setPendingAvatarFile(file);
            setAvatarPreview(previewUrl);
            setAvatarRemoved(false);
          }}
          onRemove={() => {
            setPendingAvatarFile(null);
            setAvatarPreview(null);
            setAvatarRemoved(true);
          }}
        />

        <PersonalInfoSection form={form} email={form.watch("email") ?? ""} />
        <LocationSection
          form={form}
          country={form.watch("country") ?? ""}
          state={form.watch("state") ?? ""}
        />
        <LanguageRegionSection form={form} />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={
              (!form.formState.isDirty && !avatarIsDirty) ||
              updateProfile.isPending ||
              isUploading
            }
          >
            {updateProfile.isPending || isUploading ? (
              <>
                <Spinner />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </>
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
