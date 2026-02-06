import { allFilaments } from "@/app/lib/filament-data";
import { FilamentGrid } from "@/app/components/FilamentGrid";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Filament Tracker
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Track your 3D printing filament stock
          </p>
        </header>
        <main className="flex flex-col gap-6">
          <FilamentGrid filaments={allFilaments} />
        </main>
      </div>
    </div>
  );
}
