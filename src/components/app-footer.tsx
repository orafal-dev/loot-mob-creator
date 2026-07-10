import { GitHubLink } from "@/components/github-link";

export const APP_FOOTER_HEIGHT_CLASS = "h-18";
export const APP_FOOTER_PADDING_CLASS = "pb-18";

export const AppFooter = () => (
  <footer
    className={`fixed inset-x-0 bottom-0 z-50 flex ${APP_FOOTER_HEIGHT_CLASS} items-center border-t border-white/5 bg-zinc-900/20 px-4 backdrop-blur sm:px-6 lg:left-72 lg:pl-8 xl:left-80`}
  >
    <div className="flex w-full flex-col items-center justify-between gap-5 sm:flex-row">
      <p className="text-xs text-zinc-400">
        © Copyright {new Date().getFullYear()}. All rights reserved.
      </p>
      <GitHubLink />
    </div>
  </footer>
);
