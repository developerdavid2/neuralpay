"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@neuralpay/ui/components/card";

import {
  CopyIcon,
  CircleAlertIcon,
  TrashIcon,
  ShareIcon,
  ShoppingBagIcon,
  MoreHorizontalIcon,
  Loader2Icon,
  PlusIcon,
  MinusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
  SettingsIcon,
  ChevronUpIcon,
} from "lucide-react";
import { Button } from "@neuralpay/ui/components/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@neuralpay/ui/components/dropdown-menu";

export function Demo() {
  const [sliderValue, setSliderValue] = React.useState<number[]>([500]);
  const handleSliderValueChange = React.useCallback((value: number[]) => {
    setSliderValue(value);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-12 font-sans">
      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-bold">Style Overview</CardTitle>
              <CardDescription className="line-clamp-2">
                Designers love packing quirky glyphs into test phrases. This is
                a preview of the typography styles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-3">
                {[
                  "--background",
                  "--foreground",
                  "--primary",
                  "--secondary",
                  "--muted",
                  "--accent",
                  "--border",
                  "--chart-1",
                  "--chart-2",
                  "--chart-3",
                  "--chart-4",
                  "--chart-5",
                ].map((variant) => (
                  <div
                    key={variant}
                    className="flex flex-col flex-wrap items-center gap-2"
                  >
                    <div
                      className="relative aspect-square w-full rounded-lg bg-(--color) after:absolute after:inset-0 after:rounded-lg after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten"
                      style={
                        {
                          "--color": `var(${variant})`,
                        } as React.CSSProperties
                      }
                    />
                    <div className="hidden max-w-14 truncate font-mono text-[0.60rem] md:block">
                      {variant}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="grid grid-cols-8 place-items-center gap-4">
                <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
                  <CopyIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
                  <CircleAlertIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
                  <TrashIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
                  <ShareIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
                  <ShoppingBagIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
                  <MoreHorizontalIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
                  <Loader2Icon />
                </Card>
                <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
                  <PlusIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
                  <MinusIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
                  <ArrowLeftIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
                  <ArrowRightIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
                  <CheckIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
                  <ChevronDownIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
                  <ChevronRightIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
                  <SearchIcon />
                </Card>
                <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
                  <SettingsIcon />
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <Card className="w-full">
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="outline">Button Group</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <ChevronUpIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="top"
                    className="w-fit font-sans"
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Mute Conversation</DropdownMenuItem>
                      <DropdownMenuItem>Mark as Read</DropdownMenuItem>
                      <DropdownMenuItem>Block User</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Conversation</DropdownMenuLabel>
                      <DropdownMenuItem>Share Conversation</DropdownMenuItem>
                      <DropdownMenuItem>Copy Conversation</DropdownMenuItem>
                      <DropdownMenuItem>Report Conversation</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem variant="destructive">
                        Delete Conversation
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
