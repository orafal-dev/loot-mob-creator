"use client";

import { ArrowDownCircle, RefreshCw } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { useAppUpdater } from "@/hooks/use-app-updater";
import { isTauri } from "@/lib/tauri";
import { cn } from "@/lib/utils";

export const AppUpdateButton = () => {
  const {
    status,
    version,
    progress,
    error,
    isAvailable,
    isUpdating,
    checkForUpdate,
    installUpdate,
  } = useAppUpdater();

  if (!isTauri()) {
    return null;
  }

  if (!isAvailable && !isUpdating && status !== "error") {
    return null;
  }

  const handleInstallClick = () => {
    void installUpdate();
  };

  const handleRetryClick = () => {
    void checkForUpdate();
  };

  const handleInstallKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleInstallClick();
  };

  const handleRetryKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleRetryClick();
  };

  if (status === "error") {
    return (
      <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-3">
        <p className="text-xs text-amber-100/80">Could not check for updates.</p>
        {error ? (
          <p className="mt-1 truncate text-xs text-amber-100/60" title={error}>
            {error}
          </p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full border-amber-400/30 bg-transparent text-amber-50 hover:bg-amber-400/10"
          onClick={handleRetryClick}
          onKeyDown={handleRetryKeyDown}
          aria-label="Retry update check"
        >
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        isUpdating
          ? "border-sky-400/20 bg-sky-400/10"
          : "border-emerald-400/20 bg-emerald-400/10",
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-1 size-2 shrink-0 rounded-full",
            isUpdating ? "animate-pulse bg-sky-300" : "bg-emerald-300",
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">
            {isUpdating ? "Installing update..." : "Update available"}
          </p>
          {version ? (
            <p className="mt-0.5 text-xs text-white/60">Version {version}</p>
          ) : null}
          {isUpdating ? (
            <p className="mt-1 text-xs text-white/60">
              {status === "installing" ? "Restarting app..." : `${progress}% downloaded`}
            </p>
          ) : null}
        </div>
      </div>

      {!isUpdating ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full border-emerald-400/30 bg-transparent text-emerald-50 hover:bg-emerald-400/10"
          onClick={handleInstallClick}
          onKeyDown={handleInstallKeyDown}
          aria-label={version ? `Install update ${version}` : "Install update"}
        >
          <ArrowDownCircle className="size-4" />
          Install update
        </Button>
      ) : null}
    </div>
  );
};
