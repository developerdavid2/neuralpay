"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@neuralpay/ui/lib/utils";
import { settingsSections } from "../constants";

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
                          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-violet-300/10",
                          !active &&
                            item.danger &&
                            "text-destructive hover:bg-destructive/10",
                          active &&
                            item.danger &&
                            "text-destructive bg-destructive/10 hover:bg-destructive/10",
                          active &&
                            !item.danger &&
                            "text-primary dark:text-violet-300 bg-primary/10 hover:bg-primary/10",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            !active &&
                              !item.danger &&
                              "text-muted-foreground group-hover:text-foreground",
                            !active && item.danger && "text-destructive",
                            active &&
                              !item.danger &&
                              "text-primary dark:text-violet-300",
                            active && item.danger && "text-destructive",
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
