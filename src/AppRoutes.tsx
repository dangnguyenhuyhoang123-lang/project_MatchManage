import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import HomePage from "./Page/HomePage";
import LoginPage from "./Page/LoginPage";
import SignUpPage from "./Page/SignUpPage";
import FeaturePage from "./Page/FeaturePage";
import NewsPage from "./Page/NewsPage";
import NewsDetailPage from "./Page/NewsDetailPage";
import AboutPage from "./Page/AboutPage";
import PublicLeaguesPage from "./Page/PublicLeaguesPage";
import MatchDetail from "./Page/MatchDetail";
import TeamDetail from "./Page/TeamDetail";
import UserProfilePage from "./Page/UserProfilePage";

import DashBoardPage from "./Page/testPage/DashBoardPage";
import TournamentManagement from "./Page/testPage/AdminPage/LeagueManage/TournamentManagement";
import RoundManagement from "./Page/testPage/AdminPage/RoundManage/RoundManagement";
import ClubManagement from "./Page/testPage/TeamManage/ClubManagement";
import PlayerManagement from "./Page/testPage/AdminPage/PlayerManage/PlayerManagement";
import MatchSchedule from "./Page/testPage/AdminPage/MatchSchedule/MatchShedule";
import MatchResults from "./Page/testPage/Matchresult/MatchResults";
import StandingsPage from "./Page/testPage/StadingPage";
import ReportPage from "./Page/testPage/AdminPage/ReportPage";
import AdminRegistrationManager from "./Page/testPage/AdminPage/AdminRegistrationManager";

import RegisterFormMatch from "./Page/testPage/ClubManagerPage/RegisterForm/RegisterFormMatch";
import MatchManagePageClub from "./Page/testPage/ClubManagerPage/MatchManage/MatchManagePageClub";
import ClubDetailPage from "./Page/testPage/ClubManagerPage/InfoClubManage/ClubDetailPage";
import PlayerRosterPage from "./Page/testPage/ClubManagerPage/InfoClubManage/PlayerRosterPage";
import ClubStaffPage from "./Page/testPage/ClubManagerPage/InfoClubManage/ClubStaffPage";
import StadiumDetailPage from "./Page/testPage/ClubManagerPage/InfoClubManage/StadiumDetailPage";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import ClubManagerLayout from "./layouts/ClubManagerLayout";

import ProtectedRoute from "./routes/ProtectedRoute";
function getRouteWorkspace(pathname: string) {
  if (pathname.startsWith("/admin")) {
    return "admin";
  }

  if (
    pathname.startsWith("/club") ||
    [
      "/registrations",
      "/manageMatchClub",
      "/manageInfoClub",
      "/managePlayerClub",
      "/manageCoachClub",
      "/manageStadiumClub",
    ].includes(pathname)
  ) {
    return "club";
  }

  return "public";
}

const AppRoutes = () => {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const routeWorkspace = getRouteWorkspace(location.pathname);
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.26, ease: "easeInOut" as const };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeWorkspace}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
        transition={transition}
        className="min-h-screen bg-[#fbf9f5]"
      >
        <Routes location={location}>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/homepage" element={<Navigate to="/" replace />} />
            <Route path="/features" element={<FeaturePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/leagues" element={<PublicLeaguesPage />} />
            <Route
              path="/public-leagues"
              element={<Navigate to="/leagues" replace />}
            />
            <Route path="/matches/:id" element={<MatchDetail />} />
            <Route path="/teams/:teamName" element={<TeamDetail />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_STAFF"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route path="/admin/dashboard" element={<DashBoardPage />} />
            <Route path="/admin/leagues" element={<TournamentManagement />} />
            <Route path="/admin/rounds" element={<RoundManagement />} />
            <Route path="/admin/clubs" element={<ClubManagement />} />
            <Route path="/admin/players" element={<PlayerManagement />} />
            <Route path="/admin/matches" element={<MatchSchedule />} />
            <Route path="/admin/results" element={<MatchResults />} />
            <Route path="/admin/standings" element={<StandingsPage />} />
            <Route path="/admin/reports" element={<ReportPage />} />
            <Route
              path="/admin/registrations"
              element={<AdminRegistrationManager />}
            />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={["ROLE_CLUB_MANAGER"]}>
                <ClubManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/club"
              element={<Navigate to="/club/dashboard" replace />}
            />
            <Route path="/club/dashboard" element={<ClubDetailPage />} />
            <Route path="/club/info" element={<ClubDetailPage />} />
            <Route path="/club/stadium" element={<StadiumDetailPage />} />
            <Route path="/club/players" element={<PlayerRosterPage />} />
            <Route path="/club/staff" element={<ClubStaffPage />} />
            <Route path="/club/registrations" element={<RegisterFormMatch />} />
            <Route path="/club/matches" element={<MatchManagePageClub />} />
          </Route>

          <Route
            path="/dashBoard"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/league"
            element={<Navigate to="/admin/leagues" replace />}
          />
          <Route
            path="/rounds"
            element={<Navigate to="/admin/rounds" replace />}
          />
          <Route
            path="/clubs"
            element={<Navigate to="/admin/clubs" replace />}
          />
          <Route
            path="/players"
            element={<Navigate to="/admin/players" replace />}
          />
          <Route
            path="/matches"
            element={<Navigate to="/admin/matches" replace />}
          />
          <Route
            path="/results"
            element={<Navigate to="/admin/results" replace />}
          />
          <Route
            path="/standings"
            element={<Navigate to="/admin/standings" replace />}
          />
          <Route
            path="/reports"
            element={<Navigate to="/admin/reports" replace />}
          />
          <Route
            path="/manageRegisger"
            element={<Navigate to="/admin/registrations" replace />}
          />

          <Route
            path="/registrations"
            element={<Navigate to="/club/registrations" replace />}
          />
          <Route
            path="/manageMatchClub"
            element={<Navigate to="/club/matches" replace />}
          />
          <Route
            path="/manageInfoClub"
            element={<Navigate to="/club/info" replace />}
          />
          <Route
            path="/managePlayerClub"
            element={<Navigate to="/club/players" replace />}
          />
          <Route
            path="/manageCoachClub"
            element={<Navigate to="/club/staff" replace />}
          />
          <Route
            path="/manageStadiumClub"
            element={<Navigate to="/club/stadium" replace />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppRoutes;
