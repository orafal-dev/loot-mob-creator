import { BackgroundGradient } from "@/components/background-gradient";
import { GitHubLink } from "@/components/github-link";
import { WebScrape } from "@/components/web-scrape";

export default function HomePage() {
  return (
    <BackgroundGradient>
      <h1>Generate loot</h1>
      <p className="lead">
        Use fields below to enter monster name, and generate loot from Tibia
        Fandom Wiki
      </p>
      <WebScrape />

      <footer className="not-prose mt-16 w-full space-y-10 pb-16 lg:max-w-5xl">
        <div className="flex flex-col items-center justify-between gap-5 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-400">
            © Copyright {new Date().getFullYear()}. All rights reserved.
          </p>
          <GitHubLink />
        </div>
      </footer>
    </BackgroundGradient>
  );
}
