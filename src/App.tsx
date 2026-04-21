import "./App.css";
import MatchDetail from "./Page/MatchDetail";
import HomePage from "./Page/HomePage";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import LoginPage from "./Page/LoginPage";
import SignUpPage from "./Page/SignUpPage";
import LeaguesPage from "./Page/LeaguesPage";
import TeamDetail from "./Page/TeamDetail";
import UserProfilePage from "./Page/UserProfilePage";
import AdminMatchManagementPage from "./Page/AdminMatchManagementPage";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/matches/:id" element={<MatchDetail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/leagues" element={<LeaguesPage />} />
        <Route path="/teams/:teamName" element={<TeamDetail />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/admin/matches" element={<AdminMatchManagementPage />} />
      </Routes>
    </>
  );
}

export default App;
