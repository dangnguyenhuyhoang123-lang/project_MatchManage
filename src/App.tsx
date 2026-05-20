import "./App.css";
import DashBoardPage from "./Page/testPage/DashBoardPage";

import MatchDetail from "./Page/MatchDetail";
import HomePage from "./Page/HomePage";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import LoginPage from "./Page/LoginPage";
import SignUpPage from "./Page/SignUpPage";
import LeaguesPage from "./Page/LeaguesPage";
import TeamDetail from "./Page/TeamDetail";
import UserProfilePage from "./Page/UserProfilePage";

import { ManagementPage } from "./Page/ManagementPage/MangagementPage";
import { Header1 } from "./components/Header/Header1";

import MatchSchedule from "./Page/testPage/AdminPage/MatchSchedule/MatchShedule";
import RoundManagement from "./Page/testPage/AdminPage/RoundManage/RoundManagement";
import ClubManagement from "./Page/testPage/TeamManage/ClubManagement";
import PlayerManagement from "./Page/testPage/AdminPage/PlayerManage/PlayerManagement";
import RegisterFormMatch from "./Page/testPage/ClubManagerPage/RegisterForm/RegisterFormMatch";
import MatchResults from "./Page/testPage/Matchresult/MatchResults";
import StandingsPage from "./Page/testPage/StadingPage";
import ReportPage from "./Page/testPage/ReportPage";
<<<<<<< HEAD
import AdminRegistrationManager from "./Page/testPage/RegisterForm/AdminRegistrationManager";
import FeaturePage from "./Page/FeaturePage";
import NewsPage from "./Page/NewsPage";
import AboutPage from "./Page/AboutPage";
import PublicLeaguesPage from "./Page/PublicLeaguesPage";

=======
import AdminRegistrationManager from "./Page/testPage/AdminPage/AdminRegistrationManager";
import MatchManagePageClub from "./Page/testPage/ClubManagerPage/MatchManage/MatchManagePageClub";
import TournamentManagement from "./Page/testPage/AdminPage/LeagueManage/TournamentManagement";
import ClubDetailPage from "./Page/testPage/ClubManagerPage/InfoClubManage/ClubDetailPage";
import PlayerRosterPage from "./Page/testPage/ClubManagerPage/InfoClubManage/PlayerRosterPage";
import ClubStaffPage from "./Page/testPage/ClubManagerPage/InfoClubManage/ClubStaffPage";
import StadiumDetailPage from "./Page/testPage/ClubManagerPage/InfoClubManage/StadiumDetailPage";
>>>>>>> origin/main
function App() {
  const location = useLocation();

  const hideHeader1Paths = ["/homepage", "/features", "/news", "/about", "/public-leagues"];

  return (
    <>
      {!hideHeader1Paths.includes(location.pathname) && <Header1 />}

      <Routes>
        <Route path="/" element={<DashBoardPage />} />
        <Route path="/homepage" element={<HomePage />} />

        <Route path="/features" element={<FeaturePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/public-leagues" element={<PublicLeaguesPage />} />

        <Route path="/league" element={<TournamentManagement />} />
        <Route path="/rounds" element={<RoundManagement />} />
        <Route path="/clubs" element={<ClubManagement />} />
        <Route path="/players" element={<PlayerManagement />} />
        <Route path="/registrations" element={<RegisterFormMatch />} />
        <Route path="/matches" element={<MatchSchedule />} />
        <Route path="/results" element={<MatchResults />} />
        <Route path="/standings" element={<StandingsPage />} />
        <Route path="/reports" element={<ReportPage />} />

        <Route
          path="/manageRegisger"
          element={<AdminRegistrationManager />}
        ></Route>
<<<<<<< HEAD

=======
        <Route
          path="/manageMatchClub"
          element={<MatchManagePageClub />}
        ></Route>
        <Route path="/manageInfoClub" element={<ClubDetailPage />}></Route>
        <Route path="/managePlayerClub" element={<PlayerRosterPage />}></Route>
        <Route path="/manageCoachClub" element={<ClubStaffPage />}></Route>
        <Route
          path="/manageStadiumClub"
          element={<StadiumDetailPage />}
        ></Route>
>>>>>>> origin/main
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