import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const DEFAULT_STATE = {
  width: window.innerWidth,
  navCollapsed: true
}

export const settingSlice = createSlice({
  name: 'settings',
  initialState: DEFAULT_STATE,
  reducers: {
    updateWindowWidth: (
      state: typeof DEFAULT_STATE,
      action: PayloadAction<number>
    ) => {
      state.width = action.payload
    },
    toggleCollapsedSideNav: (
      state: typeof DEFAULT_STATE,
      action: PayloadAction<boolean>
    ) => {
      state.navCollapsed = action.payload
    }
  }
})

const { actions, reducer } = settingSlice

export const { updateWindowWidth, toggleCollapsedSideNav } = actions

export default reducer
