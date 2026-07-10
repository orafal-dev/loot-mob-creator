"use client";

import { codeToHtml } from "shiki";
import { useEffect, useState } from "react";
import {
  pierreDarkShikiTheme,
  pierreEditorBackground,
  pierreWidgetBorder,
} from "@/lib/pierre-shiki-theme";
import { cn } from "@/lib/utils";

type HighlightedCodeProps = {
  code: string;
  className?: string;
};

export const HighlightedCode = ({ code, className }: HighlightedCodeProps) => {
  const [highlightedCode, setHighlightedCode] = useState("");

  useEffect(() => {
    let cancelled = false;

    const highlight = async () => {
      const html = await codeToHtml(code, {
        lang: "lua",
        theme: pierreDarkShikiTheme,
      });

      if (!cancelled) {
        setHighlightedCode(html);
      }
    };

    void highlight();

    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border [&_.shiki]:overflow-x-auto [&_.shiki]:p-10",
        className,
      )}
      style={{
        backgroundColor: pierreEditorBackground,
        borderColor: pierreWidgetBorder,
      }}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
};
