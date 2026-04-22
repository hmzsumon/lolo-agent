import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* ────────── Types ────────── */
export type AppNotification = {
  _id: string;
  title: string;
  message?: string;
  url?: string;
  is_read?: boolean;
  createdAt?: string;
  category?: string;
};

type State = {
  items: AppNotification[];
  unreadCount: number;
  isRinging: boolean; /* ────────── bell sound state ────────── */
};

const initialState: State = {
  items: [],
  unreadCount: 0,

  isRinging: false,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<AppNotification[]>) {
      state.items = action.payload || [];
      state.unreadCount = state.items.filter((n) => !n?.is_read).length;

      /* ────────── unread থাকলে ringing on ────────── */
      state.isRinging = state.unreadCount > 0;
    },
    addNotification(state, action: PayloadAction<AppNotification>) {
      const n = action.payload;
      if (!n?._id) return;

      /* ────────── duplicate guard ────────── */
      const exists = state.items.some((x) => x._id === n._id);
      if (!exists) state.items.unshift(n);

      state.unreadCount = state.items.filter((x) => !x?.is_read).length;
      /* ────────── new unread notification => ring ────────── */
      if (!n?.is_read) state.isRinging = true;
    },
    markRead(state, action: PayloadAction<string>) {
      const id = action.payload;
      const t = state.items.find((x) => x._id === id);
      if (t) t.is_read = true;
      state.unreadCount = state.items.filter((x) => !x?.is_read).length;

      /* ────────── no unread => stop ring ────────── */
      if (state.unreadCount === 0) state.isRinging = false;
    },
    markAllRead(state) {
      state.items = state.items.map((x) => ({ ...x, is_read: true }));
      state.unreadCount = 0;

      /* ────────── stop ring ────────── */
      state.isRinging = false;
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = Number(action.payload || 0);

      /* ────────── sync ring with unreadCount ────────── */
      state.isRinging = state.unreadCount > 0;
    },

    /* ────────── NEW: control ringing ────────── */
    startRinging(state) {
      state.isRinging = true;
    },
    stopRinging(state) {
      state.isRinging = false;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markRead,
  markAllRead,
  setUnreadCount,
  startRinging,
  stopRinging,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
