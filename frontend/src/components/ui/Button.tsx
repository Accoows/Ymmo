import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type ButtonVariant = "primary" | "ghost" | "dark";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const baseStyles =
  "inline-flex items-center justify-center font-body font-500 tracking-editorial uppercase transition-all duration-250 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed select-none";

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-[11px] px-5 py-2.5 tracking-[0.2em]",
  md: "text-[11px] px-8 py-3.5 tracking-[0.22em]",
  lg: "text-[12px] px-10 py-4 tracking-[0.22em]",
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-ink hover:bg-gold-light active:bg-gold",
  ghost:
    "bg-transparent border text-gold hover:bg-gold hover:text-ink",
  dark:
    "bg-transparent border text-surface/80 hover:border-gold hover:text-gold",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      style={
        variant === "ghost"
          ? { borderColor: "var(--gold-border)" }
          : variant === "dark"
          ? { borderColor: "rgba(255,255,255,0.2)" }
          : undefined
      }
      {...props}
    >
      {children}
    </button>
  );
}

interface ButtonLinkProps extends Omit<LinkProps, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      style={
        variant === "ghost"
          ? { borderColor: "var(--gold-border)" }
          : variant === "dark"
          ? { borderColor: "rgba(255,255,255,0.2)" }
          : undefined
      }
      {...props}
    >
      {children}
    </Link>
  );
}
