import { configureStore } from '@reduxjs/toolkit'



// reducers
import auth from './auth';
import userInfo from './userInfo';
import darkLightMode from './darkLightMode';
import userInfoForEdit from './userInfoForEdit';


const store = configureStore({
    reducer: {
      auth,
      userInfo,
      darkLightMode,
      userInfoForEdit
    }
})


export default store;