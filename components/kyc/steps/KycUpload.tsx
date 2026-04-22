/* ── 07: Upload front/back with loader + delete ────────────── */
"use client";

import {
  doneUploadBack,
  doneUploadFront,
  go,
  removeBack,
  removeFront,
  startUploadBack,
  startUploadFront,
} from "@/redux/features/kyc/kycSlice";
import { RootState } from "@/redux/store";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function useObjectUrl(file?: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  useState(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  });
  return url;
}

export default function KycUpload() {
  const d = useDispatch();
  const { frontFile, backFile, uploadingFront, uploadingBack } = useSelector(
    (s: RootState) => s.kyc
  );

  const frontUrl = frontFile ? URL.createObjectURL(frontFile) : null;
  const backUrl = backFile ? URL.createObjectURL(backFile) : null;

  const pickFront = (f?: File) => {
    if (!f) return;
    d(startUploadFront());
    setTimeout(() => d(doneUploadFront(f)), 900); // mock upload delay
  };
  const pickBack = (f?: File) => {
    if (!f) return;
    d(startUploadBack());
    setTimeout(() => d(doneUploadBack(f)), 900);
  };

  const canSubmit = !!frontFile; // mock: front required

  return (
    <div className="space-y-5">
      {/* Front upload box */}
      <UploadBox
        label="Upload the front of your document"
        loading={uploadingFront}
        previewUrl={frontUrl}
        onPick={pickFront}
        onRemove={() => d(removeFront())}
      />

      {/* Back upload box */}
      <UploadBox
        label="Upload the back of your document"
        loading={uploadingBack}
        previewUrl={backUrl}
        onPick={pickBack}
        onRemove={() => d(removeBack())}
      />

      <button
        disabled={!canSubmit}
        onClick={() => d(go("underReview"))}
        className="w-full rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-neutral-900 disabled:opacity-50"
      >
        Submit document
      </button>
    </div>
  );
}

/* ── sub: upload box ───────────────────────────────────────── */
function UploadBox(props: {
  label: string;
  loading: boolean;
  previewUrl: string | null;
  onPick: (f?: File) => void;
  onRemove: () => void;
}) {
  const id = props.label.replace(/\s+/g, "-");
  return (
    <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900 p-4">
      {!props.previewUrl ? (
        <label
          htmlFor={id}
          className="flex h-40 cursor-pointer items-center justify-center text-neutral-400"
        >
          <span className="text-center text-sm">
            {props.loading ? "Uploading…" : props.label}
          </span>
          <input
            id={id}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => props.onPick(e.target.files?.[0])}
          />
        </label>
      ) : (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={props.previewUrl}
            alt="preview"
            className="h-40 w-full rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={props.onRemove}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 p-3 text-white shadow-lg"
            title="Remove"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
