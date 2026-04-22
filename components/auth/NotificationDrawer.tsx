"use client";

import {
  useGetMyNotificationsQuery,
  useGetMyUnreadCountQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
} from "@/redux/features/notifications/notificationApi";
import {
  markAllRead as markAllReadLocal,
  markRead as markReadLocal,
  setNotifications,
  setUnreadCount,
  stopRinging,
} from "@/redux/features/notifications/notificationsSlice";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

/* ────────── Drawer ────────── */
export default function NotificationDrawer({
  open,
  onClose,
  topOffset = 64,
}: {
  open: boolean;
  onClose: () => void;
  topOffset?: number;
}) {
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector((s: any) => s.notifications);

  /* ────────── drawer open হলে শুধু UNREAD টেনে আনি ────────── */
  const { data: listRes } = useGetMyNotificationsQuery(
    open ? { unread: true } : (undefined as any),
  );
  const { data: countRes } = useGetMyUnreadCountQuery(
    open ? undefined : (undefined as any),
  );

  /* ────────── Only Unread ────────── */
  const unreadItems = (items || []).filter((n: any) => !n?.is_read);

  const [markAllReadApi, { isLoading: allLoading }] = useMarkAllReadMutation();
  const [markReadApi] = useMarkReadMutation();

  useEffect(() => {
    /* ────────── drawer open => stop sound ────────── */
    if (open) dispatch(stopRinging());
  }, [open]);

  useEffect(() => {
    if (listRes?.data) dispatch(setNotifications(listRes.data));
  }, [listRes?.data]);

  useEffect(() => {
    if (typeof countRes?.dataCount === "number")
      dispatch(setUnreadCount(countRes.dataCount));
  }, [countRes?.dataCount]);

  const handleMarkAll = async () => {
    try {
      await markAllReadApi().unwrap();
      dispatch(markAllReadLocal());
    } catch {}
  };

  const handleOpenOne = async (id: string, url?: string) => {
    try {
      await markReadApi({ id }).unwrap();
      dispatch(markReadLocal(id));
    } catch {}

    /* url থাকলে navigate (Next router ব্যবহার করো চাইলে) */
    if (url) window.location.href = url;
  };

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ top: topOffset }}
      />

      {/* panel */}
      <aside
        className={`fixed right-0 z-[61] h-[calc(100dvh-4rem)] w-full max-w-[380px] translate-x-0 border-l border-neutral-900 bg-neutral-950 transition-transform md:max-w-[420px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ top: topOffset }}
        aria-hidden={!open}
      >
        <div className="flex h-12 items-center justify-between border-b border-neutral-900 px-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-white">
              Notifications
            </div>
            {unreadCount > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAll}
              disabled={allLoading || unreadItems?.length === 0}
              className="rounded-lg border border-white/10 px-2 py-1 text-xs font-semibold text-neutral-200 hover:bg-white/10 disabled:opacity-60"
            >
              Mark all read
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-neutral-300 hover:bg-neutral-900 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="h-full overflow-auto p-3">
          {unreadItems?.length === 0 ? (
            <div className="p-4 text-sm text-neutral-300">
              You currently have no unread notifications.
            </div>
          ) : (
            <div className="space-y-2">
              {unreadItems.map((n: any) => (
                <button
                  key={n._id}
                  onClick={() => handleOpenOne(n._id, n?.url)}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${
                    n?.is_read
                      ? "border-white/5 bg-white/0"
                      : "border-emerald-500/15 bg-emerald-500/5"
                  } hover:bg-white/5`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-white">
                      {n?.title}
                    </div>
                    {!n?.is_read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                    )}
                  </div>
                  {n?.message && (
                    <div className="mt-1 text-xs text-neutral-300">
                      {n.message}
                    </div>
                  )}
                  {n?.createdAt && (
                    <div className="mt-1 text-[11px] text-neutral-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
