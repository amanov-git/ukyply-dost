import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: localStorage.getItem('theme') || 'light',
};

const darkLightMode = createSlice({
  name: 'darkLightMode',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
  },
});

export const { toggleTheme } = darkLightMode.actions;
export default darkLightMode.reducer;