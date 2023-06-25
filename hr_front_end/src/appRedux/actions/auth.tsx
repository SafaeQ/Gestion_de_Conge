import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GlobalState, User } from "../../types";

const DEFAULT_STATE: GlobalState = {
  isAuthenticated: false, // hopefully be true, when logged in
  user: {} as unknown as User, // all the user info when logged in
};

export const authSlice = createSlice({
  name: "auth",
  initialState: DEFAULT_STATE,
  reducers: {
    setCurrentUser: (state: GlobalState, action: PayloadAction<User>) => {
      state.isAuthenticated =
        action.payload != null
          ? !(Object.keys(action.payload).length === 0)
          : false;
      state.user = action.payload;
    },
  },
});

const { actions, reducer } = authSlice;

export const { setCurrentUser } = actions;

export default reducer;
