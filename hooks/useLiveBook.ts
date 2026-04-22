// hooks/useLiveBook.ts
"use client";

import { useUnifiedPrice } from "@/hooks/useUnifiedPrice";

export function useLiveBook(symbol: string) {
  const { bid, ask, mid, spreadAbs, spreadPm } = useUnifiedPrice(symbol);
  return { book: { bid, ask, mid, spreadAbs, spreadPm } };
}
