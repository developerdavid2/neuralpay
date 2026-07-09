"use client";

import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Input } from "@neuralpay/ui/components/input";
import { Label } from "@neuralpay/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neuralpay/ui/components/select";
import { Lock } from "lucide-react";
import type { UpdateProfileInput } from "@neuralpay/types";

interface PersonalInfoSectionProps {
  name: string;
  nickname: string | null;
  email: string;
  gender: string | null;
  dateOfBirth: string | null;
  phone: string | null;
  onChange: (field: keyof UpdateProfileInput, value: unknown) => void;
}

export function PersonalInfoSection({
  name,
  nickname,
  email,
  gender,
  dateOfBirth,
  phone,
  onChange,
}: PersonalInfoSectionProps) {
  return (
    <Card className="bg-gray-400/5">
      <CardHeader className="pb-0">
        <p className="text-base font-semibold">Personal Information</p>
        <p className="text-sm text-muted-foreground">
          Update your personal details. Your nickname will be visible to others
          in splits.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              value={nickname ?? ""}
              onChange={(e) => onChange("nickname", e.target.value || null)}
              placeholder="How others see you in splits"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                value={email}
                disabled
                className="pr-10 bg-muted"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone ?? ""}
              onChange={(e) => onChange("phone", e.target.value || null)}
              placeholder="+1 (555) 000-0000"
              type="tel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={gender ?? undefined}
              onValueChange={(value) => onChange("gender", value)}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non_binary">Non-binary</SelectItem>
                <SelectItem value="prefer_not_to_say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth ?? ""}
              onChange={(e) => onChange("dateOfBirth", e.target.value || null)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
