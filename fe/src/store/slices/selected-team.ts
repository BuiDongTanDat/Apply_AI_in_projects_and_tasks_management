import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Team } from "@/types/team.type";

interface SelectedTeamState {
    team: Team | null;
}

const initialState: SelectedTeamState = {
    team: null,
};

const selectedTeamSlice = createSlice({
    name: "selectedTeam",
    initialState,
    reducers: {
        setSelectedTeam(state, action: PayloadAction<Team | null>) {
            state.team = action.payload;
        },
        clearSelectedTeam(state) {
            state.team = null;
        },
    },
});

export const { setSelectedTeam, clearSelectedTeam } =
    selectedTeamSlice.actions;
export default selectedTeamSlice.reducer;
