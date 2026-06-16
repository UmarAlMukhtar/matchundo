import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-800 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-zinc-100 text-zinc-950 hover:bg-zinc-200 shadow-sm": variant === "default",
            "bg-red-950/20 text-red-400 border border-red-900/10 hover:bg-red-950/30": variant === "destructive",
            "border border-zinc-900 bg-zinc-950 hover:bg-zinc-900/60 hover:text-zinc-100 text-zinc-300": variant === "outline",
            "bg-zinc-900 text-zinc-100 hover:bg-zinc-850 border border-zinc-900": variant === "secondary",
            "hover:bg-zinc-900/50 hover:text-zinc-200 text-zinc-400": variant === "ghost",
            "text-emerald-500 underline-offset-4 hover:underline": variant === "link",
          },
          {
            "h-8 px-3.5": size === "default",
            "h-7 rounded-md px-2.5 text-[11px]": size === "sm",
            "h-9 rounded-md px-6": size === "lg",
            "h-8 w-8": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
