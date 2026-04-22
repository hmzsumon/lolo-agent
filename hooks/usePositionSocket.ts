// hooks/usePositionSocket.ts
"use client";

import { useSocket } from "@/context/SocketContext";
import { useGetAllAiPositionsQuery } from "@/redux/features/ai-account/ai-accountApi";
import { useEffect } from "react";
import toast from "react-hot-toast";

export function usePositionSocket() {
  const { socket, isSocketConnected } = useSocket();
  const { refetch } = useGetAllAiPositionsQuery();

  useEffect(() => {
    if (!socket || !isSocketConnected) return;

    const onOpened = (p: any) => {
      toast.success(
        `Opened ${p?.symbol} ${String(p?.side).toUpperCase()} • ${Number(
          p?.lots
        ).toFixed(2)} lot @ ${Number(p?.entryPrice).toFixed(2)}`
      );
      refetch();
    };

    const onClosed = (p: any) => {
      toast.success(
        `Closed ${p?.symbol} ${String(p?.side).toUpperCase()} • P/L $${Number(
          p?.pnl
        ).toFixed(2)}`
      );
      refetch();
    };

    socket.on("position:opened", onOpened);
    socket.on("position:closed", onClosed);

    // চাইলে অ্যাডমিন/মনিটরের জন্য:
    // socket.on("position:opened:all", onOpened);
    // socket.on("position:closed:all", onClosed);

    return () => {
      socket.off("position:opened", onOpened);
      socket.off("position:closed", onClosed);
      // socket.off("position:opened:all", onOpened);
      // socket.off("position:closed:all", onClosed);
    };
  }, [socket, isSocketConnected, refetch]);
}
