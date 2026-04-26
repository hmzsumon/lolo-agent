"use client";

import { formatBalance, formDateWithTimeToLocal } from "@/lib/functions";
import {
  useConvertAgentLoloCoinMutation,
  useGetMyAgentLoloCoinQuery,
} from "@/redux/features/loloCoin/loloCoinApi";
import {
  Coins,
  Gift,
  History,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

const safeNumber = (n: any) => Number(n || 0);
const coinImg = "/images/lolo/lolo-coin.png";

export default function LoloCoinPage() {
  const { data, isLoading, refetch } = useGetMyAgentLoloCoinQuery();
  const [convertLoloCoin, { isLoading: isConverting }] =
    useConvertAgentLoloCoinMutation();
  const [coinAmount, setCoinAmount] = useState("");

  const lolo = data?.data;
  const coinBalance = safeNumber(lolo?.coinBalance);
  const minConvert = safeNumber(lolo?.config?.minConvertCoin || 200000);
  const coinPerBtc = safeNumber(lolo?.config?.coinPerBtc || 5000000);
  const earnPercent = safeNumber(lolo?.config?.earnPercent || 0.01);

  const progress = useMemo(() => {
    const value = (coinBalance / coinPerBtc) * 100;
    return Math.min(100, Math.max(0, value));
  }, [coinBalance, coinPerBtc]);

  const inputCoin = safeNumber(coinAmount);
  const previewBtc = inputCoin > 0 ? inputCoin / coinPerBtc : 0;
  const canConvert =
    coinBalance >= minConvert &&
    inputCoin >= minConvert &&
    inputCoin <= coinBalance;

  const handleMax = () => {
    // সব LOLO coin একসাথে convert করার জন্য max set
    setCoinAmount(String(Math.floor(coinBalance)));
  };

  const handleConvert = async () => {
    if (!canConvert) {
      toast.error(`Minimum ${minConvert.toLocaleString()} LOLO Coin লাগবে`);
      return;
    }

    try {
      const res = await convertLoloCoin({ coinAmount: inputCoin }).unwrap();
      toast.success(`${formatBalance(res.btcAmount)} BTC balance এ যোগ হয়েছে`);
      setCoinAmount("");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "LOLO Coin convert failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden px-3 py-4 text-white sm:px-4">
        <div className="mx-auto max-w-5xl animate-pulse rounded-3xl bg-white/10 p-6 text-sm sm:p-8">
          LOLO Coin loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_top,#16685f_0%,#063b36_45%,#041f1e_100%)] px-2 py-3 text-white sm:px-4 sm:py-5">
      <div className="mx-auto w-full max-w-6xl space-y-4 pb-28 sm:space-y-5 lg:pb-10">
        {/* ────────── top hero section / mobile friendly ────────── */}
        <section className="relative overflow-hidden rounded-[24px] border border-yellow-300/30 bg-gradient-to-br from-[#09584f] via-[#0a3d39] to-[#051f1e] shadow-2xl sm:rounded-[28px]">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-yellow-300/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative grid gap-4 p-4 sm:p-6 md:grid-cols-[1fr_260px] md:items-center lg:p-8">
            <div className="min-w-0">
              <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-yellow-300/40 bg-yellow-300/10 px-3 py-1 text-xs font-bold text-yellow-200 sm:text-sm">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="truncate">Agent LOLO Coin Reward</span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <img
                  src={coinImg}
                  alt="LOLO Coin"
                  className="h-20 w-20 shrink-0 rounded-full object-contain drop-shadow-2xl sm:h-28 sm:w-28 md:hidden"
                />
                <div className="min-w-0">
                  <h1 className="text-[26px] font-black leading-tight sm:text-4xl lg:text-5xl">
                    Deposit করলেই LOLO Coin
                  </h1>
                  <p className="mt-2 max-w-2xl text-xs leading-5 text-white/75 sm:text-sm md:text-base md:leading-6">
                    Agent deposit approve অথবা admin manual topup করলে{" "}
                    {earnPercent}% LOLO Coin পাবেন।{" "}
                    {coinPerBtc.toLocaleString()} coin হলে 1 BTC value হবে।{" "}
                    {minConvert.toLocaleString()} coin বা তার বেশি হলে convert
                    করে খেলতে পারবেন।
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-yellow-300/30 bg-black/25 p-4 text-center shadow-xl sm:p-5">
              <img
                src={coinImg}
                alt="LOLO Coin"
                className="mx-auto mb-2 hidden h-28 w-28 rounded-full object-contain drop-shadow-2xl md:block lg:h-32 lg:w-32"
              />
              <p className="text-xs text-white/60 sm:text-sm">Your LOLO Coin</p>
              <h2 className="mt-1 break-words text-3xl font-black text-yellow-300 sm:text-4xl">
                {coinBalance.toLocaleString()}
              </h2>
              <p className="mt-1 text-[11px] text-white/60 sm:text-xs">
                Convert value: {formatBalance(lolo?.availableBtc || 0)} BTC
              </p>
            </div>
          </div>
        </section>

        {/* ────────── coin progress / rule cards ────────── */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur sm:p-5">
            <Gift className="mb-3 h-7 w-7 text-yellow-300" />
            <p className="text-xs text-white/60 sm:text-sm">Deposit Reward</p>
            <h3 className="mt-1 text-xl font-black sm:text-2xl">
              {earnPercent}% Coin
            </h3>
            <p className="mt-2 text-xs leading-5 text-white/60">
              agent deposit/manual topup approve হওয়ার সাথে সাথে auto coin
              wallet এ যোগ হবে।
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur sm:p-5">
            <ShieldCheck className="mb-3 h-7 w-7 text-emerald-300" />
            <p className="text-xs text-white/60 sm:text-sm">Convert Unlock</p>
            <h3 className="mt-1 text-xl font-black sm:text-2xl">
              {minConvert.toLocaleString()}+
            </h3>
            <p className="mt-2 text-xs leading-5 text-white/60">
              এই limit cross করলে নিচের convert button active হবে।
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur sm:col-span-2 sm:p-5 lg:col-span-1">
            <Coins className="mb-3 h-7 w-7 text-orange-300" />
            <p className="text-xs text-white/60 sm:text-sm">BTC Rate</p>
            <h3 className="mt-1 text-xl font-black sm:text-2xl">
              {coinPerBtc.toLocaleString()} = 1 BTC
            </h3>
            <p className="mt-2 text-xs leading-5 text-white/60">
              same rate অনুযায়ী convert value agent balance এ add হবে।
            </p>
          </div>
        </section>

        {/* ────────── progress bar ────────── */}
        <section className="rounded-3xl border border-yellow-300/20 bg-black/25 p-4 shadow-lg sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <span className="font-bold text-yellow-200">1 BTC Progress</span>
            <span className="shrink-0">{progress.toFixed(2)}%</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between gap-3 text-[11px] text-white/60 sm:text-xs">
            <span className="min-w-0 truncate">
              {coinBalance.toLocaleString()} coin
            </span>
            <span className="shrink-0">{coinPerBtc.toLocaleString()} coin</span>
          </div>
        </section>

        {/* ────────── convert box ────────── */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="min-w-0 rounded-3xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="min-w-0 text-lg font-black sm:text-xl">
                Convert LOLO Coin
              </h2>
              <button
                onClick={() => refetch()}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20 sm:gap-2 sm:text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            <label className="text-sm font-semibold text-white/70">
              Coin Amount
            </label>
            <div className="mt-2 flex w-full overflow-hidden rounded-2xl border border-yellow-300/25 bg-black/25">
              <input
                value={coinAmount}
                onChange={(e) =>
                  setCoinAmount(e.target.value.replace(/[^0-9.]/g, ""))
                }
                placeholder={`${minConvert.toLocaleString()} or more`}
                className="min-w-0 flex-1 bg-transparent px-3 py-4 text-base font-bold outline-none placeholder:text-white/30 sm:px-4 sm:text-lg"
              />
              <button
                onClick={handleMax}
                className="shrink-0 border-l border-yellow-300/20 px-3 text-sm font-black text-yellow-300 sm:px-4 sm:text-base"
              >
                MAX
              </button>
            </div>

            <div className="mt-3 rounded-2xl bg-black/20 p-4 text-sm text-white/70">
              Preview:{" "}
              <span className="font-black text-yellow-300">
                {formatBalance(previewBtc)} BTC
              </span>
            </div>

            <button
              disabled={!canConvert || isConverting}
              onClick={handleConvert}
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 px-5 py-4 text-base font-black text-black shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
            >
              {isConverting ? "Converting..." : "Convert Now"}
            </button>
          </div>

          <div className="min-w-0 rounded-3xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur sm:p-5">
            <h2 className="mb-4 text-lg font-black sm:text-xl">My Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3 rounded-2xl bg-black/20 p-3">
                <span className="text-white/60">Total Earned</span>
                <b className="break-all text-right">
                  {safeNumber(lolo?.totalEarned).toLocaleString()}
                </b>
              </div>
              <div className="flex justify-between gap-3 rounded-2xl bg-black/20 p-3">
                <span className="text-white/60">Total Converted</span>
                <b className="break-all text-right">
                  {safeNumber(lolo?.totalConverted).toLocaleString()}
                </b>
              </div>
              <div className="flex justify-between gap-3 rounded-2xl bg-black/20 p-3">
                <span className="text-white/60">BTC Received</span>
                <b className="break-all text-right">
                  {formatBalance(lolo?.totalBtcConverted || 0)}
                </b>
              </div>
              <div className="flex justify-between gap-3 rounded-2xl bg-black/20 p-3">
                <span className="text-white/60">Agent Balance</span>
                <b className="break-all text-right">
                  {formatBalance(lolo?.rollingBalance || 0)}
                </b>
              </div>
            </div>
          </div>
        </section>

        {/* ────────── history section ────────── */}
        <section className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-yellow-300" />
            <h2 className="text-lg font-black sm:text-xl">LOLO Coin History</h2>
          </div>

          <div className="space-y-3">
            {lolo?.histories?.length ? (
              lolo.histories.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold capitalize">{item.type}</p>
                    <p className="text-[11px] text-white/50 sm:text-xs">
                      {formDateWithTimeToLocal(new Date(item.createdAt))}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={
                        item.coinAmount >= 0
                          ? "font-black text-emerald-300"
                          : "font-black text-orange-300"
                      }
                    >
                      {item.coinAmount >= 0 ? "+" : ""}
                      {item.coinAmount.toLocaleString()} coin
                    </p>
                    {item.btcAmount > 0 && (
                      <p className="text-xs text-yellow-300">
                        +{formatBalance(item.btcAmount)} BTC
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-black/20 p-6 text-center text-sm text-white/60">
                No LOLO Coin history yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
