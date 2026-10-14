import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-primary text-primary-foreground",
        secondary:
          "border border-border bg-secondary text-secondary-foreground",
        destructive:
          "border border-transparent bg-destructive text-destructive-foreground",
        outline: "border border-border text-foreground",
        // Triase badges with dot style
        triageRed:
          "border border-red-200 bg-red-50 text-red-700 font-semibold",
        triageYellow:
          "border border-amber-200 bg-amber-50 text-amber-800 font-semibold",
        triageGreen:
          "border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dotColor?: string;
}

function Badge({ className, variant, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {variant === "triageRed" && (
        <span className="size-1.5 rounded-full bg-red-600 animate-pulse" />
      )}
      {variant === "triageYellow" && (
        <span className="size-1.5 rounded-full bg-amber-500" />
      )}
      {variant === "triageGreen" && (
        <span className="size-1.5 rounded-full bg-emerald-500" />
      )}
      {dotColor && <span className={cn("size-1.5 rounded-full", dotColor)} />}
      <span>{children}</span>
    </div>
  );
}

export { Badge, badgeVariants };
