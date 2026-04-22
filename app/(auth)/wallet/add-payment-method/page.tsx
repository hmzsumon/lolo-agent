"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateMyPaymentMethodMutation } from "@/redux/features/agent/agentFinanceApi";
import { fetchBaseQueryError } from "@/redux/services/helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const methodNameOptions = [
  { value: "Bkash", label: "bKash" },
  { value: "Nagad", label: "Nagad" },
  // { value: "Rocket", label: "Rocket" },
  // { value: "Bank", label: "Bank" },
] as const;

// সাধারণত personal/agent/bank হয় (backend যদি অন্য কিছুও নেয়, এখানে সহজে add করা যাবে)
const methodTypeOptions = [
  { value: "personal", label: "Personal" },
  { value: "agent", label: "Agent" },
  { value: "bank", label: "Bank" },
] as const;

const schema = z.object({
  methodName: z.string().min(1, "Payment method select করুন"),
  methodType: z.string().min(1, "Account type select করুন"),
  accountNumber: z
    .string()
    .trim()
    .min(6, "Account/Number কমপক্ষে 6 অক্ষর হতে হবে")
    .max(32, "Account/Number সর্বোচ্চ 32 অক্ষর হতে পারে"),
});

type FormValues = z.infer<typeof schema>;

export default function AddPaymentMethodPage() {
  const router = useRouter();

  const [createMyPaymentMethod, createState] =
    useCreateMyPaymentMethodMutation();
  const { isLoading, isError, isSuccess, error, data } = createState;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      methodName: "",
      methodType: "",
      accountNumber: "",
    },
    mode: "onChange",
  });

  const watched = form.watch();
  const isBank = watched.methodName === "Bank";

  // methodName=Bank হলে methodType=bank auto set
  useEffect(() => {
    if (isBank && form.getValues("methodType") !== "bank") {
      form.setValue("methodType", "bank", { shouldValidate: true });
    }
    if (!isBank && form.getValues("methodType") === "bank") {
      form.setValue("methodType", "", { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBank]);

  const canSubmit = useMemo(() => {
    return form.formState.isValid && !isLoading;
  }, [form.formState.isValid, isLoading]);

  const onSubmit = async (values: FormValues) => {
    try {
      await createMyPaymentMethod({
        accountNumber: values.accountNumber.trim(),
        methodName: values.methodName,
        methodType: values.methodType,
      }).unwrap();
    } catch {
      // toast handled below
    }
  };

  useEffect(() => {
    if (isError) {
      const msg =
        (error as fetchBaseQueryError)?.data?.message ||
        (error as fetchBaseQueryError)?.data?.error ||
        "Payment method create করতে সমস্যা হয়েছে";
      toast.error(msg);
    }
    if (isSuccess) {
      toast.success(data?.message || "Payment method created successfully");
      form.reset();
      // list page থাকলে:
      // router.push("/wallet/my-payment-methods");
    }
  }, [isError, isSuccess, error, data, form, router]);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          className="px-0 text-neutral-200 hover:bg-transparent hover:text-white"
          onClick={() => router.back()}
        >
          ← Back
        </Button>
      </div>

      <Card className="border-neutral-800 bg-neutral-950 text-white shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Add Payment Method</CardTitle>
          <CardDescription className="text-neutral-400">
            Withdraw/payout এর জন্য আপনার payment number/account যুক্ত করুন।
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              className="space-y-5"
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="methodName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-200">
                        Payment Method
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v)}
                      >
                        <FormControl>
                          <SelectTrigger className="border-neutral-800 bg-neutral-900 text-white">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-neutral-800 bg-neutral-950 text-white">
                          {methodNameOptions.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="methodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-200">
                        Account Type
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v)}
                        disabled={isBank}
                      >
                        <FormControl>
                          <SelectTrigger className="border-neutral-800 bg-neutral-900 text-white disabled:opacity-60">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-neutral-800 bg-neutral-950 text-white">
                          {methodTypeOptions
                            .filter((t) =>
                              isBank ? t.value === "bank" : t.value !== "bank",
                            )
                            .map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-200">
                      {isBank
                        ? "Bank Account Number"
                        : "Account / Wallet Number"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={
                          isBank ? "e.g. 0123-4567890" : "e.g. 01XXXXXXXXX"
                        }
                        className="border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-500"
                        inputMode={isBank ? "text" : "numeric"}
                        autoComplete="off"
                      />
                    </FormControl>
                    <div className="text-xs text-neutral-500">
                      {isBank
                        ? "Bank হলে account number (প্রয়োজনে branch/extra info পরে add করা যাবে)"
                        : "Mobile banking number দিলে 11 ডিজিট দিলে ভালো।"}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" className="w-full" disabled={!canSubmit}>
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save Payment Method"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => form.reset()}
                  disabled={isLoading}
                >
                  Clear
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
