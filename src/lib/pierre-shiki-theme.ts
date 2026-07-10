import pierreDark from "@pierre/theme/pierre-dark";
import type { ThemeRegistration } from "shiki";

export const pierreDarkShikiTheme: ThemeRegistration = {
  name: pierreDark.name,
  type: pierreDark.type,
  colors: { ...pierreDark.colors },
  fg: pierreDark.colors["editor.foreground"],
  bg: pierreDark.colors["editor.background"],
  settings: pierreDark.tokenColors.map((token) => ({
    scope: token.scope,
    settings: { ...token.settings },
  })),
};

export const pierreEditorBackground = pierreDark.colors["editor.background"];
export const pierreWidgetBorder = pierreDark.colors["widget.border"];
