/**
 * Cyclone - Status Slice
 * Manages status line messages
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type StatusType = 'info' | 'success' | 'error' | 'warning';

export interface StatusMessage {
  message: string;
  type: StatusType;
  timestamp: number;
}

export interface StatusState {
  currentMessage: StatusMessage | null;
}

const initialState: StatusState = {
  currentMessage: null,
};

const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<{ message: string; type: StatusType }>) => {
      state.currentMessage = {
        message: action.payload.message,
        type: action.payload.type,
        timestamp: Date.now(),
      };
    },
    clearStatus: (state) => {
      state.currentMessage = null;
    },
  },
});

export const { setStatus, clearStatus } = statusSlice.actions;
export default statusSlice.reducer;
