import React from 'react';

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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">{title}</h1>
          <p className="text-muted text-lg">{description}</p>
        </div>
        <div className="bg-background border border-border rounded-lg p-8 shadow-2xl transition-all hover:border-accent/30">
          {children}
        </div>
      </div>
    </div>
  );
};

