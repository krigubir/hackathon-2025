import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`glass-panel border border-border-glow/40 bg-background-card/80 p-8 shadow-card backdrop-blur-3xl ${className}`}
    >
      {children}
    </div>
  );
};

