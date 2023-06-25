import { createSlice } from "@reduxjs/toolkit";

const DEFAULT_STATE = {
  width: window.innerWidth,
  navCollapsed: true,
};

export const settingSlice = createSlice({
  name: "settings",
  initialState: DEFAULT_STATE,
  reducers: {
    updateWindowWidth: (state: typeof DEFAULT_STATE, action) => {
      state.width = action.payload;
    },
    toggleCollapsedSideNav: (state: typeof DEFAULT_STATE, action) => {
      state.navCollapsed = action.payload;
    },
  },
});

const { actions, reducer } = settingSlice;

export const { updateWindowWidth, toggleCollapsedSideNav } = actions;

export default reducer;
