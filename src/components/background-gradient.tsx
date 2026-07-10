import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BackgroundGradientProps = {
  children: ReactNode;
  className?: string;
  variant?: "red" | "green";
};

export const BackgroundGradient = ({
  children,
  className,
  variant = "red",
}: BackgroundGradientProps) => {
  const gradientClass =
    variant === "green"
      ? "from-green-500/30 to-indigo-600/30"
      : "from-red-500/30 to-indigo-600/30";

  return (
    <div className={cn("relative isolate flex h-full min-h-0 flex-col", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 ml-[-38rem] h-[25rem] w-[81.25rem] [mask-image:linear-gradient(white,transparent)]">
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-100",
              gradientClass,
            )}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-14 sm:px-6 lg:px-8">
        <main className="flex-auto">
          <article className="flex flex-col pb-10 pt-16">
            <div className="flex-auto prose prose-invert !max-w-5xl [html_:where(&>*)]:mx-auto [html_:where(&>*)]:max-w-2xl [html_:where(&>*)]:lg:mx-[calc(50%-min(50%,theme(maxWidth.lg)))] [html_:where(&>*)]:lg:max-w-3xl">
              {children}
            </div>
          </article>
        </main>
      </div>
    </div>
  );
};
