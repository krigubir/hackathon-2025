import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "../components/Button";
import { useApp } from "../contexts/AppContext";
import EunoiaLogo from "../assets/Eunoia.svg";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const { resetProgress } = useApp();

  const handleBegin = () => {
    resetProgress();
    navigate({ to: "/captcha/ethos" });
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="rounded-[32px] border border-white/20 bg-[#060b1e]/95 p-10 shadow-[0_40px_130px_rgba(1,3,12,0.65)] backdrop-blur-3xl">
        <div className="flex items-center gap-4">
          <img
            src={EunoiaLogo}
            alt="Eunoia"
            className="w-32 drop-shadow-[0_10px_40px_rgba(93,137,255,0.35)]"
          />
          <span className="text-xs uppercase tracking-[0.45em] text-slate-400">
            Access Panel
          </span>
        </div>
        <div className="mt-12 space-y-4">
          <h1 className="text-3xl font-semibold text-white">
            Verify the human in you
          </h1>
          <p className="text-slate-300 max-w-2xl">
            This moment is about shared trust. Your identity confirmation is
            essential to proceed. It protects our collective security and data.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <Button variant="danger" onClick={handleBegin}>
            Begin Ethos Sequence
          </Button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3 text-sm text-slate-300">
          <div>
            <p className="font-semibold text-white">1. Initiate</p>
            <p>We launch the Ethos captcha from within this safe shell.</p>
          </div>
          <div>
            <p className="font-semibold text-white">2. Confirm</p>
            <p>Complete the rhythm, timing, and empathy sequences.</p>
          </div>
          <div>
            <p className="font-semibold text-white">3. Return</p>
            <p>Eunoia refreshes and lets you into the AI-free commons.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
