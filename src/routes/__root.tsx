import { createRootRoute, Outlet } from "@tanstack/react-router";
import EthosLogo from "../assets/Ethos.svg";
import EunoiaLogo from "../assets/Eunoia.svg";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed top-0 left-0 right-0 z-30 flex items-start justify-between px-6 py-6">
        <img
          src={EunoiaLogo}
          alt="Eunoia identity mark"
          className="w-32 opacity-60 mix-blend-screen drop-shadow-[0_0_25px_rgba(157,123,255,0.4)]"
        />
        <img
          src={EthosLogo}
          alt="Ethos identity mark"
          className="w-40 opacity-50 mix-blend-screen drop-shadow-[0_0_35px_rgba(70,240,255,0.35)]"
        />
      </div>
      <Outlet />
    </div>
  );
}
