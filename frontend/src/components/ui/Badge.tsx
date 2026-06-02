import { type ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "gold" | "stone" | "dark";
}

export default function Badge({ children, variant = "stone" }: BadgeProps) {
  const styles = {
    gold: "bg-gold/15 text-gold border border-gold/30",
    stone: "bg-stone/10 text-stone border border-stone/20",
    dark: "bg-ink/80 text-surface/80 border border-white/10",
  };

  return (
    <span
      className={`inline-flex items-center text-[10px] font-body font-600 uppercase tracking-[0.2em] px-3 py-1 ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
