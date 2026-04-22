/* ────────── app/(public)/casino-games/brand/[brand]/page.tsx ─────────── */

import BrandGamesClient from "./BrandGamesClient";

export default function BrandGamesPage({
  params,
}: {
  params: { brand: string };
}) {
  return <BrandGamesClient brandSlug={params.brand} />;
}
