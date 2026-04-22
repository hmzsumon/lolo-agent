// types/trade.ts
export type PositionStatus = "open" | "closed";
export type PositionSide = "buy" | "sell";

export interface AiPosition {
  _id: string;
  symbol: string; // e.g., "BTCUSDT"
  side: PositionSide;
  volume: number; // lots
  entryPrice: number; // avg entry
  status: PositionStatus; // "open" | "closed"
  profit?: number;
  accountNumber: number;
}
