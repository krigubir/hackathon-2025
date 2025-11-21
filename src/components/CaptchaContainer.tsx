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
    <section className="relative min-h-screen overflow-hidden px-6 py-16">
      <div className="absolute inset-0 bg-hero-glow opacity-60 blur-3xl pointer-events-none" />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-center">
        <div className="gradient-border w-full animate-fade-in">
          <div className="glass-panel relative z-10 p-10">
            <div className="grid-lines" />
            <div className="relative z-10 text-center mb-12 animate-slide-up">
              <p className="text-xs tracking-[0.6em] text-accent-neon/80 uppercase mb-4">
                HUMAN VERIFICATION
              </p>
              <h1 className="text-4xl md:text-5xl font-bold heading-glow mb-4">{title}</h1>
              <p className="text-muted text-base md:text-lg max-w-3xl mx-auto">{description}</p>
            </div>
            <div className="relative z-10">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

