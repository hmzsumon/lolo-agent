/* ────────── app/(public)/casino-games/category/[category]/page.tsx ─────────── */

import CategoryGamesClient from "./CategoryGamesClient";

export default function CategoryGamesPage({
  params,
}: {
  params: { category: string };
}) {
  return <CategoryGamesClient categorySlug={params.category} />;
}
