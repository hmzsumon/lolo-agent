// /components/ui/Button.tsx
/* ────────── button with variants ────────── */
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "warning" | "ghost";
  loading?: boolean;
};

export default function Button({
  variant = "primary",
  loading,
  className = "",
  ...rest
}: Props) {
  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-white/10 disabled:opacity-50";
  const map = {
    primary: "bg-[#21D3B3] text-[#0B0D12] hover:bg-[#1EC6A7]",
    warning: "bg-[#FF6A1A] text-white hover:bg-[#ff7d38]",
    ghost: "bg-white/5 text-white/80 hover:bg-white/10",
  } as const;

  return (
    <button
      className={`${base} ${map[variant]} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-r-transparent" />
      )}
      {rest.children}
    </button>
  );
}
