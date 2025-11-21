import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "pill inline-flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-neon/60 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-accent to-accent-bright text-background shadow-glow hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(157,123,255,0.45)] active:translate-y-0",
    secondary:
      "border border-border-glow/60 text-foreground/90 bg-background-card/60 hover:text-accent-neon hover:border-accent-neon/80 hover:-translate-y-0.5",
    danger:
      "bg-gradient-to-r from-rose-500 to-orange-400 text-white shadow-[0_15px_40px_rgba(249,71,71,0.35)] hover:-translate-y-0.5",
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

