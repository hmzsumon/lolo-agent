/* components/trade/ConfirmTradeDrawer.tsx */
"use client";

import NumberField from "@/components/trade/fields/NumberField";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useCreateAiLossPositionMutation,
  usePlaceAiOrderMutation,
} from "@/redux/features/ai-account/ai-accountApi";
import { useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

export type ConfirmTradeDrawerProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  account: any;
  symbol: string; // raw e.g. BTCUSDT
  side: "buy" | "sell";
  bid?: number;
  ask?: number;
  mid?: number;

  headerRight?: ReactNode;
  dp?: number; // default 2
};

export default function ConfirmTradeDrawer({
  open,
  onOpenChange,
  account,
  symbol,
  side,
  bid = 0,
  ask = 0,
  mid = 0,
  headerRight,
  dp = 2,
}: ConfirmTradeDrawerProps) {
  const searchParams = useSearchParams();

  // Redux থেকে selected account numbers নিয়ে আসলাম (show করার জন্য)
  const { selectedAccountNumbers } = useSelector(
    (state: any) => state.aiAccountUI
  );

  // plan → "elite"
  const plan = searchParams.get("plan");
  // isTradeForLoss → boolean
  const isTradeForLoss = searchParams.get("isTradeForLoss") === "true";

  const sideColor =
    side === "buy"
      ? "bg-blue-600 hover:bg-blue-500"
      : "bg-red-600 hover:bg-red-500";

  // লোকাল ভলিউম + TP/SL
  const [volText, setVolText] = useState("0.10");
  const [tpText, setTpText] = useState("");
  const [slText, setSlText] = useState("");

  useEffect(() => {
    if (open) setVolText("0.10"); // drawer খোলার সময় ডিফল্ট
  }, [open]);

  // helpers
  const parse = (t: string) => {
    const n = Number(t);
    return Number.isFinite(n) ? n : NaN;
  };
  const clampLots = (v: number) =>
    Number.isFinite(v) ? Math.max(0.01, +v.toFixed(2)) : 0.01;
  const lots = clampLots(parse(volText) || 0);

  // price fallbacks
  const pxBid = Number.isFinite(bid) && bid > 0 ? bid : 0;
  const pxAsk = Number.isFinite(ask) && ask > 0 ? ask : 0;
  const pxMid = Number.isFinite(mid) && mid > 0 ? mid : 0;
  const execPrice =
    side === "buy"
      ? pxAsk || pxMid || pxBid || 0
      : pxBid || pxMid || pxAsk || 0;

  // leverage/contract + P&L basis
  const leverage = account?.leverage ?? 200;
  const contractSize = useMemo(
    () => (symbol.includes("XAU") ? 100 : 1),
    [symbol]
  );
  const basis = pxMid || execPrice || 0;
  const notional = basis * contractSize * lots;
  const margin = leverage ? notional / leverage : 0;
  const fees = useMemo(() => notional * 0.0005, [notional]);

  const canTrade = !!account && lots > 0 && execPrice > 0;

  // mutation here
  const [place, { isLoading }] = usePlaceAiOrderMutation();

  const [createLoss, { isLoading: placingLoss }] =
    useCreateAiLossPositionMutation();
  const [submitting, setSubmitting] = useState(false);

  // volume controls
  const incVol = () => {
    const n = clampLots((parse(volText) || 0) + 0.01);
    setVolText(n.toFixed(2));
  };
  const decVol = () => {
    const n = clampLots((parse(volText) || 0) - 0.01);
    setVolText(n.toFixed(2));
  };
  const setVolFromText = (t: string) => {
    const raw = t.replace(/[^\d.]/g, "");
    const parts = raw.split(".");
    const safe =
      parts.length > 1 ? parts[0] + "." + parts.slice(1).join("") : raw;
    setVolText(safe);
  };

  const stepPx = dp >= 4 ? 0.0001 : dp === 3 ? 0.001 : 0.01;
  const incTP = () => setTpText(((parse(tpText) || 0) + stepPx).toFixed(dp));
  const decTP = () => setTpText(((parse(tpText) || 0) - stepPx).toFixed(dp));
  const incSL = () => setSlText(((parse(slText) || 0) + stepPx).toFixed(dp));
  const decSL = () => setSlText(((parse(slText) || 0) - stepPx).toFixed(dp));

  async function onConfirm() {
    if (!canTrade || submitting) return;

    const toastId = toast.loading("Placing order…");
    setSubmitting(true);
    try {
      const res = await place({
        accountId: account._id,
        symbol,
        side,
        lots,
        price: execPrice, // client hint
        takeProfit: parse(tpText) || 0,
        stopLoss: parse(slText) || 0,
      }).unwrap();

      toast.success("Order placed", { id: toastId });
      window.dispatchEvent(
        new CustomEvent("position:opened", {
          detail: { position: res.position },
        })
      );
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to place order";
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }

  async function onConfirm2() {
    if (!canTrade || submitting) return;

    const stopLossValue = parse(slText) || 0;

    if (isTradeForLoss && !selectedAccountNumbers?.length) {
      toast.error("Select at least one account for loss trade");
      return;
    }

    const toastId = toast.loading("Placing order…");
    setSubmitting(true);

    try {
      if (isTradeForLoss) {
        // 🔥 LOSS TRADE (multiple accounts)
        const body = {
          accountNumbers: selectedAccountNumbers,
          symbol,
          side,
          lots,
          price: execPrice,
          maxSlippageBps: 50, // ইচ্ছা করলে বাদ দিতে পারো
          stopLoss: stopLossValue,
        };

        const res = await createLoss(body).unwrap();

        toast.success("Loss trade placed", { id: toastId });
        window.dispatchEvent(
          new CustomEvent("position:opened", {
            detail: { position: res.position },
          })
        );
      } else {
        // 🟢 normal ai trade (আগের মতো)
        const res = await place({
          accountId: account._id,
          symbol,
          side,
          lots,
          price: execPrice,
          takeProfit: parse(tpText) || 0,
          stopLoss: stopLossValue,
        }).unwrap();

        toast.success("Order placed", { id: toastId });
        window.dispatchEvent(
          new CustomEvent("position:opened", {
            detail: { position: res.position },
          })
        );
      }

      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to place order";
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="z-[1000] bg-neutral-950 text-white p-0 min-h-[60vh]"
      >
        <SheetHeader className="px-4 pt-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base text-center font-semibold">
              Confirm trade
            </SheetTitle>
            {headerRight}
          </div>
        </SheetHeader>

        <div className="px-4 mt-2 space-y-3">
          {/* Volume */}
          <NumberField
            label="Volume"
            valueText={volText}
            onValueText={setVolFromText}
            onMinus={decVol}
            onPlus={incVol}
            inputAria="Volume (lots)"
            right={
              <button
                type="button"
                className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs hover:bg-neutral-800"
                onClick={() => setVolText("1.00")}
              >
                1.00
              </button>
            }
          />

          {isTradeForLoss ? (
            <>
              {" "}
              {/* Stop Loss */}
              <NumberField
                label="Stop Loss"
                valueText={slText}
                onValueText={setSlText}
                onMinus={decSL}
                onPlus={incSL}
                right={
                  <button
                    type="button"
                    className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs hover:bg-neutral-800"
                    onClick={() => setSlText("")}
                  >
                    Clear
                  </button>
                }
              />
            </>
          ) : (
            <>
              {/* Take Profit */}
              <NumberField
                label="Take Profit"
                valueText={tpText}
                onValueText={setTpText}
                onMinus={decTP}
                onPlus={incTP}
                right={
                  <button
                    type="button"
                    className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs hover:bg-neutral-800"
                    onClick={() => setTpText("")}
                  >
                    Clear
                  </button>
                }
              />
            </>
          )}

          {/* Summary */}
          {/* <div className="space-y-2 text-sm">
            <RowBox>
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">Symbol</span>
                <span className="font-medium">{symbol}</span>
              </div>
            </RowBox>
            <RowBox>
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">Price</span>
                <span className="font-medium">
                  {execPrice > 0 ? execPrice.toFixed(dp) : "—"}
                </span>
              </div>
            </RowBox>
            <RowBox>
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">Notional</span>
                <span className="font-medium">
                  ${(notional || 0).toFixed(2)}
                </span>
              </div>
            </RowBox>
            <RowBox>
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">Margin</span>
                <span className="font-medium">
                  ${(margin || 0).toFixed(2)}{" "}
                  <span className="text-neutral-400">(1:{leverage})</span>
                </span>
              </div>
            </RowBox>
            <RowBox>
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">Fees (est.)</span>
                <span className="font-medium">${fees.toFixed(2)}</span>
              </div>
            </RowBox>
          </div> */}
        </div>

        {/* Footer */}
        <div className="p-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-32 rounded-xl border border-neutral-700 bg-neutral-900 py-3 text-sm font-medium hover:bg-neutral-800"
          >
            Cancel
          </button>
          {isTradeForLoss ? (
            <button
              disabled={
                !canTrade ||
                isLoading ||
                submitting ||
                !selectedAccountNumbers?.length
              }
              onClick={onConfirm2}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {submitting || isLoading
                ? "Placing…"
                : `Confirm ${
                    side === "buy" ? "Buy" : "Sell"
                  } For Loss Trade ${lots.toFixed(2)} lots ${
                    execPrice > 0 ? execPrice.toFixed(dp) : ""
                  } / ${selectedAccountNumbers?.length} Accounts`}
            </button>
          ) : (
            <button
              disabled={!canTrade || isLoading || submitting}
              onClick={onConfirm}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold ${sideColor} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {submitting || isLoading
                ? "Placing…"
                : `Confirm ${side === "buy" ? "Buy" : "Sell"}  ${lots.toFixed(
                    2
                  )} lots ${execPrice > 0 ? execPrice.toFixed(dp) : ""}`}
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// isTradeForLoss
