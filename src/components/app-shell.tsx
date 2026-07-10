"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Minus, Square, X } from "lucide-react";
import type { ReactNode } from "react";
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

export const AppShell = ({ children }: AppShellProps) => {
  const pathname = usePathname();

  return (
    <div className="dark flex h-full flex-col overflow-hidden bg-zinc-950 text-white">
      <div className="flex h-full min-h-0 w-full">
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden lg:ml-72 xl:ml-80">
          <header className="contents lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex">
            <div className="contents lg:pointer-events-auto lg:block lg:w-72 lg:overflow-y-auto lg:border-r lg:border-white/10 lg:px-6 lg:pb-8 lg:pt-4 xl:w-80">
              <div className="hidden lg:flex">
                <Link
                  href="/"
                  aria-label="Home"
                  className="h-6 text-xl font-black text-white"
                >
                  Loot Mob Creator
                </Link>
              </div>

              <div
                data-tauri-drag-region
                className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-12 bg-zinc-900/20 pl-4 pr-4 backdrop-blur transition sm:pl-6 lg:left-72 lg:z-30 lg:pl-8 xl:left-80"
              >
                <div className="absolute inset-x-0 top-full h-px bg-white/10" />

                <div className="flex items-center gap-5 lg:hidden">
                  <Link
                    href="/"
                    aria-label="Home"
                    className="h-6 text-xl font-black text-white"
                  >
                    Loot Creator
                  </Link>
                </div>

                <div className="relative ml-auto flex items-center gap-x-2">
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

              <nav className="hidden lg:mt-10 lg:block">
                <h2 className="text-xs font-semibold text-white">Tools</h2>
                <ul className="mt-3 space-y-1 border-l border-transparent pl-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex justify-between gap-2 py-1 pl-4 pr-3 text-sm transition",
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
            </div>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
};
