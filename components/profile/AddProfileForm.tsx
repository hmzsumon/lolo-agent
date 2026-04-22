// components/profile/AddProfileForm.tsx
"use client";

/* ── step: add profile info (name, dob, country, gender, addr) ─ */
import { useMemo, useState } from "react";
import CountrySelectPro from "./CountrySelectPro";

export default function AddProfileForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [birthCountry, setBirthCountry] = useState("");
  const [gender, setGender] = useState<"Female" | "Male" | "Other" | "">("");
  const [address, setAddress] = useState("");

  const days = useMemo(
    () => Array.from({ length: 31 }, (_, i) => `${i + 1}`),
    []
  );
  const years = useMemo(
    () =>
      Array.from({ length: 100 }, (_, i) => `${new Date().getFullYear() - i}`),
    []
  );
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to save profile
    onSuccess();
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4"
    >
      <div className="mb-4 text-2xl font-extrabold text-white">
        Add profile information
      </div>

      {/* ── name ─────────────────────────────────────────────── */}
      <label className="mb-1 block text-sm text-neutral-300">First Name</label>
      <input
        value={first}
        onChange={(e) => setFirst(e.target.value)}
        placeholder="Your first name as shown on your ID"
        className="mb-3 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500"
      />
      <label className="mb-1 block text-sm text-neutral-300">Last Name</label>
      <input
        value={last}
        onChange={(e) => setLast(e.target.value)}
        placeholder="Your last name as shown on your ID"
        className="mb-3 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500"
      />

      {/* ── dob ──────────────────────────────────────────────── */}
      <label className="mb-1 block text-sm text-neutral-300">
        Date of birth
      </label>
      <div className="mb-3 grid grid-cols-3 gap-2">
        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100"
        >
          <option value="">Day</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100"
        >
          <option value="">Month</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100"
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* ── country of birth ─────────────────────────────────── */}
      <label className="mb-1 block text-sm text-neutral-300">
        Country of birth
      </label>
      <CountrySelectPro
        value={birthCountry}
        onChange={(v) => setBirthCountry(v || "")}
        placeholder="Select country"
      />

      {/* ── gender ───────────────────────────────────────────── */}
      <div className="mt-4">
        <div className="mb-1 text-sm text-neutral-300">Your gender</div>
        <div className="flex items-center gap-6">
          {(["Female", "Male", "Other"] as const).map((g) => (
            <label key={g} className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value={g}
                checked={gender === g}
                onChange={() => setGender(g)}
                className="h-4 w-4 accent-emerald-500"
              />
              <span className="text-neutral-200">{g}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── address ──────────────────────────────────────────── */}
      <label className="mt-4 mb-1 block text-sm text-neutral-300">
        Your residential address
      </label>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="City, Street, house (apartment)"
        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500"
      />
      <p className="mt-1 text-xs text-neutral-500">
        You will be asked to verify your address later
      </p>

      <button
        type="submit"
        className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-neutral-950 hover:bg-emerald-400"
      >
        Continue
      </button>
    </form>
  );
}
