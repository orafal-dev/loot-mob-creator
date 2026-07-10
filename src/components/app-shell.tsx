"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Minus, Square, X } from "lucide-react";
import type { ReactNode } from "react";
import { AppFooter } from "@/components/app-footer";
import { AppUpdateButton } from "@/components/app-update-button";
import {
  BackgroundGradientLayer,
  type BackgroundGradientVariant,
} from "@/components/background-gradient";
import { Button } from "@/components/ui/button";
import { closeApp, maximizeApp, minimizeApp } from "@/lib/tauri";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Tibia Wiki Loot Creator" },
  { href: "/items/", label: "Items mapping" },
];

type AppShellProps = {
  children: ReactNode;
};

const getGradientVariant = (pathname: string): BackgroundGradientVariant => {
  if (pathname === "/items" || pathname.startsWith("/items/")) {
    return "green";
  }

  return "red";
};

export const AppShell = ({ children }: AppShellProps) => {
  const pathname = usePathname();
  const gradientVariant = getGradientVariant(pathname);

  return (
    <div className="dark relative flex h-full flex-col overflow-hidden text-white">
      <BackgroundGradientLayer variant={gradientVariant} />

      <div
        data-tauri-drag-region
        className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-4 bg-zinc-900/20 pl-4 pr-4 backdrop-blur transition sm:pl-6 lg:left-72 lg:pl-8 xl:left-80"
      >
        <div className="absolute inset-x-0 top-full h-px bg-white/10" />

        <div
          className="flex items-center gap-5 lg:hidden"
          data-tauri-drag-region={false}
        >
          <Link
            href="/"
            aria-label="Home"
            className="h-6 text-xl font-black text-white"
          >
            Loot Creator
          </Link>
        </div>

        <div className="min-w-0 flex-1" aria-hidden data-tauri-drag-region />

        <div
          className="relative flex shrink-0 items-center gap-x-2"
          data-tauri-drag-region={false}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => void minimizeApp()}
            aria-label="Minimize window"
          >
            <Minus className="size-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden"
            onClick={() => void maximizeApp()}
            aria-label="Maximize window"
          >
            <Square className="size-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => void closeApp()}
            aria-label="Close window"
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>

      <AppFooter />

      <div className="relative z-10 flex h-full min-h-0 w-full">
        <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-72 lg:flex-col lg:overflow-hidden lg:border-r lg:border-white/10 lg:bg-black/20 lg:px-6 lg:pt-4 lg:backdrop-blur xl:w-80">
          <div className="shrink-0" data-tauri-drag-region>
            <Link
              href="/"
              aria-label="Home"
              className="h-6 text-xl font-black text-white"
              data-tauri-drag-region={false}
            >
              Loot Mob Creator
            </Link>
          </div>

          <nav className="mt-10 min-h-0 flex-1 overflow-y-auto">
            <ul className="mt-3 space-y-1 border-l border-transparent">
              {navigation.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex justify-between gap-2 py-1 -ml-4 pl-4 pr-3 text-sm transition",
                        isActive ? "text-white" : "text-white/50 hover:text-white/80",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="shrink-0 pt-4 pb-6">
            <AppUpdateButton />
          </div>
        </aside>

        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden lg:ml-72 xl:ml-80">
          {children}
        </div>
      </div>
    </div>
  );
};
