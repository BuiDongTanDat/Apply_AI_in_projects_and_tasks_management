import { configureStore } from '@reduxjs/toolkit';
import userInfoReducer from './slices/user-info';
import selectedTeamReducer from './slices/selected-team';
import notificationReducer from './slices/notification';


export const store = configureStore({
    reducer: {
        userInfo: userInfoReducer,
        selectedTeam: selectedTeamReducer,
        notification: notificationReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;