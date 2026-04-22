/* ────────── app/(public)/casino-games/game/[id]/page.tsx ─────────── */

import GameDetailsClient from "./GameDetailsClient";

export default function GameDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return <GameDetailsClient id={params.id} />;
}
