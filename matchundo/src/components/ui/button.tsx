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
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-zinc-100 text-zinc-900 shadow hover:bg-zinc-200": variant === "default",
            "bg-red-900/30 text-red-400 border border-red-900/40 hover:bg-red-900/40": variant === "destructive",
            "border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-200": variant === "outline",
            "bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border border-zinc-805": variant === "secondary",
            "hover:bg-zinc-900 hover:text-zinc-100 text-zinc-400": variant === "ghost",
            "text-emerald-400 underline-offset-4 hover:underline": variant === "link",
          },
          {
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-10 rounded-md px-8": size === "lg",
            "h-9 w-9": size === "icon",
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
