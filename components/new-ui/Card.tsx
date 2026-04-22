/* ────────── lightweight Card ────────── */
import { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  right?: ReactNode;
};

export default function Card({
  title,
  children,
  className = "",
  right,
}: CardProps) {
  return (
    <div
      className={`rounded-lg bg-[#0E1014] border border-white/10 px-2 py-4 ${className}`}
    >
      {(title || right) && (
        <div className="mb-3 flex items-center justify-between">
          {title ? (
            <h3 className="text-sm text-white/70">{title}</h3>
          ) : (
            <span />
          )}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}
