import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MagneticButton({
  children,
  onClick,
  variant = "gold",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "gold" | "ghost";
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.3 });

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.35);
        y.set((e.clientY - r.top - r.height / 2) * 0.35);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full px-8 text-sm font-medium tracking-wide transition-shadow duration-500",
        variant === "gold"
          ? "bg-gold-gradient text-primary-foreground shadow-gold"
          : "border border-border text-foreground hover:border-gold/50",
        className,
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-ivory/25 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-full" />
      <span className="relative flex items-center gap-3">{children}</span>
    </motion.button>
  );
}
