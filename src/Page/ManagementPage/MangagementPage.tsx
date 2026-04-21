import { Route, Routes, Navigate } from "react-router-dom";
import MatchManagementPage from "./MatchManagementPage";
import TeamManagementPage from "./TeamManagementPage";
import PlayerManagementPage from "./PlayerManagementPage";
import CoachManagementPage from "./CoachManagementPage";
import { AdminLayout } from "./AdminLayout";

export const ManagementPage = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="matches" />} />

        <Route path="matches" element={<MatchManagementPage />} />
        <Route path="teams" element={<TeamManagementPage />} />
        <Route path="players" element={<PlayerManagementPage />} />
        <Route path="coaches" element={<CoachManagementPage />} />
      </Route>
    </Routes>
  );
};
