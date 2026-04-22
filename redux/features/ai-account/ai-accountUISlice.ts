/* ───────────────── accountUISlice ───────────────── */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AccountTab = "real" | "demo" | "archived";

interface AccountUIState {
  selectedAccountId: string | null;
  currentTab: AccountTab;
  // 👉 এখানে সব সিলেক্টেড একাউন্ট নাম্বার রাখব
  selectedAccountNumbers: (number | string)[];
}

const initialState: AccountUIState = {
  selectedAccountId: null,
  currentTab: "real",
  selectedAccountNumbers: [],
};

const accountUISlice = createSlice({
  name: "accountUI",
  initialState,
  reducers: {
    setSelectedAccountId(state, action: PayloadAction<string | null>) {
      state.selectedAccountId = action.payload;
    },
    setAccountTab(state, action: PayloadAction<AccountTab>) {
      state.currentTab = action.payload;
    },
    // 👉 নতুন reducer: একাধিক account number সেট করার জন্য
    setSelectedAccountNumbers(
      state,
      action: PayloadAction<(number | string)[]>
    ) {
      state.selectedAccountNumbers = action.payload;
    },
  },
});

export const {
  setSelectedAccountId,
  setAccountTab,
  setSelectedAccountNumbers,
} = accountUISlice.actions;

export default accountUISlice.reducer;
