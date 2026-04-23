import "./App.css";
import DashBoardPage from "./Page/testPage/DashBoardPage";

import MatchDetail from "./Page/MatchDetail";
import HomePage from "./Page/HomePage";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import LoginPage from "./Page/LoginPage";
import SignUpPage from "./Page/SignUpPage";
import LeaguesPage from "./Page/LeaguesPage";
import TeamDetail from "./Page/TeamDetail";
import UserProfilePage from "./Page/UserProfilePage";

import { ManagementPage } from "./Page/ManagementPage/MangagementPage";
import { Header1 } from "./components/Header/Header1";
import TournamentManagement from "./Page/testPage/LeagueManage/TournamentManagement";
import MatchSchedule from "./Page/testPage/MatchSchedule/MatchShedule";
import RoundManagement from "./Page/testPage/RoundManage/RoundManagement";
import ClubManagement from "./Page/testPage/TeamManage/ClubManagement";
import PlayerManagement from "./Page/testPage/PlayerManage/PlayerManagement";
import RegisterFormMatch from "./Page/testPage/RegisterForm/RegisterFormMatch";

function App() {
  return (
    <>
      <Header1 />
      <Routes>
        <Route path="/" element={<DashBoardPage />} />
        <Route path="/league" element={<TournamentManagement />}></Route>
        <Route path="/rounds" element={<RoundManagement />}></Route>
        <Route path="/clubs" element={<ClubManagement />}></Route>
        <Route path="/players" element={<PlayerManagement />}></Route>
        <Route path="/registrations" element={<RegisterFormMatch />}></Route>
        {/* <Route path="/matches/:id" element={<MatchDetail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/leagues" element={<LeaguesPage />} />
        <Route path="/teams/:teamName" element={<TeamDetail />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/admin/manage/*" element={<ManagementPage />} /> */}
      </Routes>
    </>
  );
}

export default App;
