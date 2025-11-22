import React from "react";

interface CaptchaContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const CaptchaContainer: React.FC<CaptchaContainerProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/20 bg-[#050716]/95 p-10 text-slate-100 shadow-[0_50px_140px_rgba(2,4,18,0.7)] backdrop-blur-3xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(71,121,255,0.25),transparent_45%)] opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(13,255,227,0.18),transparent_55%)]" />
      <div className="relative z-10">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.6em] text-accent-neon/80 uppercase mb-3">
            HUMAN VERIFICATION
          </p>
          <h1 className="text-4xl md:text-5xl font-bold heading-glow mb-3">
            {title}
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-3xl mx-auto">
            {description}
          </p>
        </div>
        <div className="text-slate-100">{children}</div>
      </div>
    </section>
  );
};
