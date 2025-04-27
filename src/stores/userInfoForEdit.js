import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userForEdit: {}
}

const userForEdit = createSlice({
  name: 'userForEdit',
  initialState,
  reducers: {
    setUserForEdit: (state, action) => {
      state.userForEdit = action.payload
    },
  }
})


export const { setUserForEdit } = userForEdit.actions
export default userForEdit.reducer