import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'px-6 py-3 font-medium rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:shadow-lg';
  
  const variantStyles = {
    primary: 'bg-accent text-background hover:bg-accent-light hover:scale-105 active:scale-95',
    secondary: 'bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-background hover:scale-105 active:scale-95',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 active:scale-95',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

