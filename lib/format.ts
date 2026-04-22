// /lib/format.ts
/* ────────── Comments lik this ────────── */
/* number/currency formatting helpers */

export const formatCurrency = (n: number) =>
  n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export const formatNumber = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 0 });
