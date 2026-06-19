"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Settings } from "lucide-react";
import { settingsSections } from "../constants";
import { cn } from "@neuralpay/ui/lib/utils";

export function SettingsSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return href === "/dashboard/settings"
      ? pathname === href
      : pathname.startsWith(href);
  };

  return (
    <aside className="w-64 shrink-0 border-r border-border hidden md:block">
      <div className="flex h-full flex-col">
        {/* Navigation */}
        <nav className="flex-1 space-y-6 px-6 pt-10">
          {settingsSections.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-violet-300/20",
                          !active && item.danger && "text-destructive",
                          active &&
                            item.danger &&
                            "text-destructive hover:bg-destructive/10 bg-destructive/10",
                          active &&
                            !item.danger &&
                            "text-primary bg-primary/10",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 transition-colors",
                            active
                              ? "text-primary"
                              : item.danger
                                ? "text-destructive"
                                : "text-muted-foreground group-hover:text-foreground",
                          )}
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer hint
        <div className="p-4 border-t border-border">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Need help?{" "}
            <Link
              href={"/support" as string}
              className="text-primary hover:underline underline-offset-2"
            >
              Contact support
            </Link>
          </p>
        </div> */}
      </div>
    </aside>
  );
}
