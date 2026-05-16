import type { ReactNode } from "react";
import { PremiumButton } from "./premium-button";
import type { LucideIcon } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}

export function DashboardHeader({
  title,
  description,
  action,
  icon,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {action && <PremiumButton icon={icon}>{action}</PremiumButton>}
    </div>
  );
}
