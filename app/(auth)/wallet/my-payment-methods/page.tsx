"use client";

import { Loader2, Pencil, Star } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import {
  AgentPaymentMethod,
  useDeleteMyPaymentMethodMutation,
  useGetMyPaymentMethodsQuery,
  useSetMyDefaultPaymentMethodMutation,
  useToggleMyPaymentMethodMutation,
  useUpdateMyPaymentMethodMutation,
} from "@/redux/features/agent/agentFinanceApi";
import { fetchBaseQueryError } from "@/redux/services/helpers";

const mask = (v: string) => {
  const s = String(v || "");
  if (s.length <= 4) return s;
  return `${s.slice(0, 2)}******${s.slice(-2)}`;
};

const methodNameOptions = ["Bkash", "Nagad", "Rocket", "Bank"] as const;
const methodTypeOptions = ["agent", "personal", "bank"] as const;

export default function PaymentMethodManagerPage() {
  const { data, isLoading, isError, error, refetch } =
    useGetMyPaymentMethodsQuery();

  const [togglePM, toggleState] = useToggleMyPaymentMethodMutation();
  const [setDefault, defaultState] = useSetMyDefaultPaymentMethodMutation();
  const [updatePM, updateState] = useUpdateMyPaymentMethodMutation();
  const [deletePM, deleteState] = useDeleteMyPaymentMethodMutation();

  // ✅ TS-safe: supports both {data: []} and {paymentMethods: []}
  const list: AgentPaymentMethod[] =
    ((data as any)?.data as AgentPaymentMethod[]) ??
    ((data as any)?.paymentMethods as AgentPaymentMethod[]) ??
    [];

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AgentPaymentMethod | null>(null);

  const [accountNumber, setAccountNumber] = useState("");
  const [methodName, setMethodName] = useState("");
  const [methodType, setMethodType] = useState("");

  const busy =
    toggleState.isLoading ||
    defaultState.isLoading ||
    updateState.isLoading ||
    deleteState.isLoading;

  const onEdit = (pm: AgentPaymentMethod) => {
    setEditing(pm);
    setAccountNumber(pm.accountNumber || "");
    setMethodName(pm.methodName || "");
    setMethodType(pm.methodType || "");
    setOpen(true);
  };

  const saveEdit = async () => {
    if (!editing?._id) return;

    const body: any = {
      accountNumber: accountNumber.trim(),
      methodName,
      methodType,
    };

    if (!body.accountNumber || !body.methodName || !body.methodType) {
      toast.error("সবগুলো ফিল্ড দিন");
      return;
    }

    try {
      await updatePM({ id: editing._id, body }).unwrap();
      toast.success("Payment method updated!");
      setOpen(false);
      setEditing(null);
    } catch (e) {
      toast.error(
        (e as fetchBaseQueryError)?.data?.message ||
          (e as fetchBaseQueryError)?.data?.error ||
          "Update failed",
      );
    }
  };

  const onToggle = async (id: string) => {
    try {
      await togglePM(id).unwrap();
      toast.success("Status updated");
    } catch (e) {
      toast.error(
        (e as fetchBaseQueryError)?.data?.message ||
          (e as fetchBaseQueryError)?.data?.error ||
          "Toggle failed",
      );
    }
  };

  const onMakeDefault = async (id: string) => {
    try {
      await setDefault(id).unwrap();
      toast.success("Default payment method set");
    } catch (e) {
      toast.error(
        (e as fetchBaseQueryError)?.data?.message ||
          (e as fetchBaseQueryError)?.data?.error ||
          "Set default failed",
      );
    }
  };

  const onDelete = async (pm: AgentPaymentMethod) => {
    if (!pm?._id) return;

    const ok = window.confirm(
      `Delete "${pm.title || pm.methodName}"?\n(ডাটাবেইজ থেকে delete হবে না, শুধু আপনি আর দেখতে পাবেন না)`,
    );
    if (!ok) return;

    try {
      await deletePM(pm._id).unwrap();
      toast.success("Deleted (hidden) successfully");
    } catch (e) {
      toast.error(
        (e as fetchBaseQueryError)?.data?.message ||
          (e as fetchBaseQueryError)?.data?.error ||
          "Delete failed",
      );
    }
  };

  const headerRight = useMemo(() => {
    return (
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => refetch()} disabled={busy}>
          Refresh
        </Button>
        <Button
          onClick={() => (window.location.href = "/wallet/add-payment-method")}
        >
          + Add
        </Button>
      </div>
    );
  }, [busy, refetch]);

  if (isError) {
    const msg =
      (error as fetchBaseQueryError)?.data?.message ||
      (error as fetchBaseQueryError)?.data?.error ||
      "Failed to load payment methods";
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <Card className="border-neutral-800 bg-neutral-950 text-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Payment Methods
              {headerRight}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-red-400">
            {msg}
            <div className="mt-4">
              <Button onClick={() => refetch()}>Try again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl py-6">
      <Card className="border-neutral-800 bg-neutral-950 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Payment Methods
            {headerRight}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-sm text-neutral-300">
              এখনও কোনো payment method নেই।{" "}
              <button
                className="underline"
                onClick={() =>
                  (window.location.href = "/wallet/add-payment-method")
                }
              >
                Add Payment Method
              </button>
            </div>
          ) : (
            list.map((pm) => {
              const isActive = !!pm.isActive; // ✅ TS-safe
              const isDefault = !!pm.isDefault; // ✅ TS-safe

              return (
                <div
                  key={pm._id}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-2 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-full">
                      {/* ✅ Title show */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-semibold">
                          {pm.title || pm.methodName}
                        </div>

                        {isDefault ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-300">
                            <Star className="h-3.5 w-3.5" />
                            Default
                          </span>
                        ) : null}

                        {!isActive ? (
                          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300">
                            Inactive
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-300">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-sm flex items-center gap-4 text-neutral-300">
                        <span>
                          {pm.methodName}
                          <span className="text-neutral-400">
                            {" "}
                            • {pm.accountNumber}
                          </span>{" "}
                        </span>

                        <span>• type: {pm.methodType}</span>
                      </div>

                      <div className="mt-3 flex justify-between flex-wrap items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onEdit(pm)}
                          disabled={busy}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onToggle(pm._id)}
                          disabled={busy}
                        >
                          {toggleState.isLoading ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Updating...
                            </span>
                          ) : isActive ? (
                            "Deactivate"
                          ) : (
                            "Activate"
                          )}
                        </Button>

                        {!isDefault ? (
                          <Button
                            size="sm"
                            onClick={() => onMakeDefault(pm._id)}
                            disabled={busy || !isActive}
                            title={
                              !isActive
                                ? "Inactive method cannot be default"
                                : ""
                            }
                          >
                            Set Default
                          </Button>
                        ) : (
                          <Button size="sm" disabled>
                            Default
                          </Button>
                        )}

                        {/* ✅ Delete (soft delete / hide) */}
                        {/* <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(pm)}
                          disabled={busy}
                        >
                          {deleteState.isLoading ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Deleting...
                            </span>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </>
                          )}
                        </Button> */}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* ✅ Edit Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="border-neutral-800 bg-neutral-950 text-white">
          <DrawerHeader className="text-left">
            <DrawerTitle>Edit Payment Method</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-2">
            <div className="space-y-2">
              <Label className="text-neutral-200">Method Name</Label>
              <Select value={methodName} onValueChange={setMethodName}>
                <SelectTrigger className="border-neutral-800 bg-neutral-900 text-white">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="border-neutral-800 bg-neutral-950 text-white">
                  {methodNameOptions.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-neutral-200">Method Type</Label>
              <Select value={methodType} onValueChange={setMethodType}>
                <SelectTrigger className="border-neutral-800 bg-neutral-900 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="border-neutral-800 bg-neutral-950 text-white">
                  {methodTypeOptions.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-neutral-200">Account Number</Label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="border-neutral-800 bg-neutral-900 text-white"
                placeholder="e.g. 01XXXXXXXXX"
              />
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={saveEdit} disabled={updateState.isLoading}>
              {updateState.isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="secondary" disabled={updateState.isLoading}>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
