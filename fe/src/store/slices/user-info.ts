import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/user.type";

interface UserInfoState {
  user: User | null;
  isAuthenticated: boolean;
  isQCThisTeam?: boolean;
  isDevThisTeam?: boolean;
  isLeadThisTeam?: boolean;
}

const initialState: UserInfoState = {
  user: null,
  isAuthenticated: false,
  isQCThisTeam: false,
  isDevThisTeam: false,
  isLeadThisTeam: false,
};

const userInfoSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{ user: User; isAuthenticated: boolean }>,
    ) {
      state.user = action.payload.user;
      state.isAuthenticated = action.payload.isAuthenticated;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },

    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setIsQCThisTeam(state, action: PayloadAction<boolean>) {
      state.isQCThisTeam = action.payload;
    },
    setIsDevThisTeam(state, action: PayloadAction<boolean>) {
      state.isDevThisTeam = action.payload;
    },
    setIsLeadThisTeam(state, action: PayloadAction<boolean>) {
      state.isLeadThisTeam = action.payload;
    },
  },
});

export const {
  loginSuccess,
  logout,
  setUser,
  setIsQCThisTeam,
  setIsDevThisTeam,
  setIsLeadThisTeam,
} = userInfoSlice.actions;
export default userInfoSlice.reducer;
