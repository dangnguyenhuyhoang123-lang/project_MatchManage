import { createContext, useContext, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Container } from "../utils/Container";
import { Sidebar } from "../utils/SideBar";
import { useAuth } from "../utils/useAuth";
import LoadingSpinner from "../components/Spinner/LoadingSpinner";
export type AppWorkspace = "public" | "admin" | "club";

interface AppLayoutProps {
  children: ReactNode;
  workspace?: AppWorkspace;
}

const AppLayoutContext = createContext(false);

const legacyClubPaths = [
  "/manageMatchClub",
  "/manageInfoClub",
  "/managePlayerClub",
  "/manageCoachClub",
  "/manageStadiumClub",
  "/registrations",
];

const legacyTitles: Record<string, string> = {
  "/dashBoard": "Tổng quan hệ thống",
  "/league": "Quản lý giải đấu",
  "/rounds": "Quản lý vòng đấu",
  "/clubs": "Quản lý câu lạc bộ",
  "/players": "Quản lý cầu thủ",
  "/matches": "Lịch thi đấu",
  "/results": "Kết quả trận đấu",
  "/standings": "Bảng xếp hạng",
  "/reports": "Báo cáo",
  "/manageRegisger": "Duyệt đăng ký thi đấu",
  "/manageMatchClub": "Trận đấu và đội hình",
  "/manageInfoClub": "Thông tin câu lạc bộ",
  "/managePlayerClub": "Cầu thủ câu lạc bộ",
  "/manageCoachClub": "Ban huấn luyện",
  "/manageStadiumClub": "Sân vận động",
};

function resolveWorkspace(pathname: string, workspace?: AppWorkspace) {
  if (workspace) {
    return workspace;
  }

  if (pathname.startsWith("/club") || legacyClubPaths.includes(pathname)) {
    return "club";
  }

  if (pathname.startsWith("/admin")) {
    return "admin";
  }

  return "public";
}

export const AppLayout = ({ children, workspace }: AppLayoutProps) => {
  const alreadyInsideAppLayout = useContext(AppLayoutContext);
  const location = useLocation();
  const currentWorkspace = resolveWorkspace(location.pathname, workspace);
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (alreadyInsideAppLayout) {
    return <>{children}</>;
  }

  if (currentWorkspace === "public") {
    return (
      <AppLayoutContext.Provider value>
        <div className="min-h-screen bg-[#fbf9f5] font-sans text-gray-950">
          {children}
        </div>
      </AppLayoutContext.Provider>
    );
  }

  const isClubArea = currentWorkspace === "club";
  const areaLabel = isClubArea ? "Club Workspace" : "Admin Workspace";

  const homePath = isClubArea ? "/club/dashboard" : "/admin/dashboard";
  const accountLabel = isClubArea ? "Becamex TP.Hồ Chí Minh" : "Quản trị viên";

  return (
    <AppLayoutContext.Provider value>
      <div className="min-h-screen bg-[#fbf9f5] font-['Be_Vietnam_Pro'] text-gray-950">
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;900&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0"
          rel="stylesheet"
        />

        <div className="mx-auto flex min-h-screen w-full max-w-[1500px] gap-4 px-3 sm:px-4 lg:px-6">
          <Sidebar workspace={currentWorkspace} />

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 border-b border-gray-100 bg-[#fbf9f5]/90 py-4 backdrop-blur">
              <Container size="xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      <Link to="/" className="hover:text-[#008C2F]">
                        Trang chủ
                      </Link>
                      <span className="material-symbols-outlined text-sm">
                        chevron_right
                      </span>
                      <Link to={homePath} className="text-[#008C2F]">
                        {areaLabel}
                      </Link>
                    </div>
                    {/* <h1 className="text-2xl font-black tracking-tight text-gray-950">
                      {pageTitle}
                    </h1> */}
                  </div>

                  <Link
                    to={homePath}
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-600 shadow-sm transition-colors hover:text-[#008C2F]"
                  >
                    <span className="material-symbols-outlined text-base">
                      {isClubArea ? "shield" : "admin_panel_settings"}
                    </span>
                    {accountLabel}
                  </Link>
                </div>
              </Container>
            </header>

            <main className="flex-1 py-6">
              <Container size="xl">{children}</Container>
            </main>
          </div>
        </div>
      </div>
    </AppLayoutContext.Provider>
  );
};
