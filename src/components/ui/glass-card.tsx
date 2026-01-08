import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "subtle" | "prominent";
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg shadow-black/5",
      subtle: "bg-white/50 backdrop-blur-lg border border-white/30 shadow-md shadow-black/5",
      prominent: "bg-white/80 backdrop-blur-2xl border border-white/60 shadow-xl shadow-black/10",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-300",
          variants[variant],
          "hover:shadow-xl hover:shadow-black/10 hover:border-white/70",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
