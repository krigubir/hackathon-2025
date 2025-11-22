import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: AppDashboard,
});

function AppDashboard() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-24">
      <div className="glass-panel w-full max-w-2xl space-y-4 p-10 text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-accent-neon/70">
          Eunoia
        </p>
        <h1 className="text-3xl font-semibold heading-glow">
          Welcome to Eunoia
        </h1>
        <p className="text-muted text-sm">
          Ethos verification succeeded. This placeholder dashboard is where your
          tools will live.
        </p>
      </div>
    </main>
  );
}
