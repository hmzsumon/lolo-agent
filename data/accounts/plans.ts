// data/accounts/plans.ts
import type { Plan } from "@/types/accounts";

export const plans: readonly Omit<Plan, "accounts">[] = [
  { title: "Lite", price: 30, url: "/ai-trade?plan=lite" },
  { title: "Core", price: 50, url: "/ai-trade?plan=core" },
  { title: "Prime", price: 80, url: "/ai-trade?plan=prime" },
  { title: "Elite", price: 100, url: "/ai-trade?plan=elite" },
  { title: "Ultra", price: 200, url: "/ai-trade?plan=ultra" },
  { title: "Infinity", price: 500, url: "/ai-trade?plan=infinity" },
  { title: "Titan", price: 1000, url: "/ai-trade?plan=titan" },
];
