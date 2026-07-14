"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader } from "@neuralpay/ui/components/card";
import { Field, FieldError, FieldLabel } from "@neuralpay/ui/components/field";
import { Input } from "@neuralpay/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neuralpay/ui/components/select";
import { DatePicker } from "@/components/date-picker";
import { PhoneInput } from "./phone-input";
import { GENDER_TYPES, type UpdateProfileInput } from "@neuralpay/types";
import { Lock } from "lucide-react";

export function PersonalInfoSection({
  form,
  email,
}: {
  form: UseFormReturn<UpdateProfileInput>;
  email: string;
}) {
  return (
    <Card className="bg-card shadow-none drop-shadow-sm">
      <CardHeader className="pb-0">
        <p className="text-base font-semibold">Personal Information</p>
        <p className="text-sm text-muted-foreground">
          Your basic profile details.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Full Name</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  className="rounded-xl"
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="nickname"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Nickname</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  className="rounded-xl"
                  placeholder="How others see you in splits"
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Field>
            <FieldLabel>Email</FieldLabel>
            <div className="relative">
              <Input value={email} disabled className="rounded-xl" />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </Field>

          <Controller
            name="gender"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Gender</FieldLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="capitalize">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_TYPES.map((g) => (
                      <SelectItem key={g} value={g} className="capitalize">
                        {g.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            name="dateOfBirth"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Date of Birth</FieldLabel>
                <DatePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date?.toISOString())}
                  className="rounded-xl bg-input/50 text-foreground hover:bg-main-tint"
                />
              </Field>
            )}
          />

          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Phone</FieldLabel>
                <PhoneInput
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
