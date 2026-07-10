"use client";

import type { Update } from "@tauri-apps/plugin-updater";
import { useCallback, useEffect, useRef, useState } from "react";
import { isTauri } from "@/lib/tauri";
import type { AppUpdateStatus } from "@/lib/tauri-updater.types";

const CHECK_INTERVAL_MS = 1000 * 60 * 60 * 4;

export const useAppUpdater = () => {
  const [status, setStatus] = useState<AppUpdateStatus>("idle");
  const [version, setVersion] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const updateRef = useRef<Update | null>(null);

  const checkForUpdate = useCallback(async () => {
    if (!isTauri()) {
      return;
    }

    setStatus("checking");
    setError(null);

    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const update = await check();

      if (!update) {
        updateRef.current = null;
        setVersion(null);
        setNotes(null);
        setStatus("idle");
        return;
      }

      updateRef.current = update;
      setVersion(update.version);
      setNotes(update.body ?? null);
      setStatus("available");
    } catch (checkError) {
      updateRef.current = null;
      setStatus("error");
      setError(
        checkError instanceof Error ? checkError.message : "Update check failed",
      );
    }
  }, []);

  const installUpdate = useCallback(async () => {
    const update = updateRef.current;

    if (!update) {
      return;
    }

    setStatus("downloading");
    setProgress(0);
    setError(null);

    try {
      let downloaded = 0;
      let contentLength = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength ?? 0;
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              setProgress(Math.round((downloaded / contentLength) * 100));
            }
            break;
          case "Finished":
            setProgress(100);
            setStatus("installing");
            break;
        }
      });

      const { relaunch } = await import("@tauri-apps/plugin-process");
      await relaunch();
    } catch (installError) {
      setStatus("available");
      setError(
        installError instanceof Error
          ? installError.message
          : "Update install failed",
      );
    }
  }, []);

  useEffect(() => {
    void checkForUpdate();

    const intervalId = window.setInterval(() => {
      void checkForUpdate();
    }, CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [checkForUpdate]);

  return {
    status,
    version,
    notes,
    progress,
    error,
    isAvailable: status === "available",
    isUpdating: status === "downloading" || status === "installing",
    checkForUpdate,
    installUpdate,
  };
};
