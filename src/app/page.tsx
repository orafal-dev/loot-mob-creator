import { BackgroundGradient } from "@/components/background-gradient";
import { WebScrape } from "@/components/web-scrape";

export default function HomePage() {
  return (
    <BackgroundGradient>
      <h1>Generate loot</h1>
      <p className="text-sm text-muted-foreground">
        Use fields below to enter monster name, and generate loot from Tibia
        Fandom Wiki
      </p>
      <hr className="my-4" />
      <WebScrape />
    </BackgroundGradient>
  );
}
