import { Link, useLocation } from "react-router-dom";
import type { AppWorkspace } from "../layouts/AppLayout";

type MenuItem = {
  label: string;
  path: string;
  icon: string;
  aliases?: string[];
};

type SidebarProps = {
  workspace?: AppWorkspace;
};

const adminMenu: MenuItem[] = [
  {
    label: "Tổng quan",
    path: "/admin/dashboard",
    icon: "dashboard",
    aliases: ["/dashBoard"],
  },
  {
    label: "Giải đấu",
    path: "/admin/leagues",
    icon: "emoji_events",
    aliases: ["/league"],
  },
  {
    label: "Vòng đấu",
    path: "/admin/rounds",
    icon: "schema",
    aliases: ["/rounds"],
  },
  {
    label: "Câu lạc bộ",
    path: "/admin/clubs",
    icon: "shield",
    aliases: ["/clubs"],
  },
  {
    label: "Cầu thủ",
    path: "/admin/players",
    icon: "groups",
    aliases: ["/players"],
  },
  {
    label: "Lịch thi đấu",
    path: "/admin/matches",
    icon: "calendar_month",
    aliases: ["/matches"],
  },
  {
    label: "Kết quả",
    path: "/admin/results",
    icon: "scoreboard",
    aliases: ["/results"],
  },
  {
    label: "Bảng xếp hạng",
    path: "/admin/standings",
    icon: "leaderboard",
    aliases: ["/standings"],
  },
  {
    label: "Duyệt đăng ký",
    path: "/admin/registrations",
    icon: "fact_check",
    aliases: ["/manageRegisger"],
  },
  {
    label: "Báo cáo",
    path: "/admin/reports",
    icon: "analytics",
    aliases: ["/reports"],
  },
];

const clubMenu: MenuItem[] = [
  {
    label: "Tổng quan CLB",
    path: "/club/dashboard",
    icon: "dashboard",
  },
  {
    label: "Thông tin CLB",
    path: "/club/info",
    icon: "badge",
    aliases: ["/manageInfoClub"],
  },
  {
    label: "Sân vận động",
    path: "/club/stadium",
    icon: "stadium",
    aliases: ["/manageStadiumClub"],
  },
  {
    label: "Cầu thủ",
    path: "/club/players",
    icon: "groups",
    aliases: ["/managePlayerClub"],
  },
  {
    label: "Ban huấn luyện",
    path: "/club/staff",
    icon: "sports",
    aliases: ["/manageCoachClub"],
  },
  {
    label: "Đăng ký thi đấu",
    path: "/club/registrations",
    icon: "assignment_add",
    aliases: ["/registrations"],
  },
  {
    label: "Trận đấu và đội hình",
    path: "/club/matches",
    icon: "tactic",
    aliases: ["/manageMatchClub"],
  },
];

const legacyClubPaths = [
  "/manageMatchClub",
  "/manageInfoClub",
  "/managePlayerClub",
  "/manageCoachClub",
  "/manageStadiumClub",
  "/registrations",
];

export const Sidebar = ({ workspace }: SidebarProps) => {
  const location = useLocation();
  const isClubArea =
    workspace === "club" ||
    location.pathname.startsWith("/club") ||
    legacyClubPaths.includes(location.pathname);
  const menuItems = isClubArea ? clubMenu : adminMenu;

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-gray-100 bg-[#f5f3ef] p-5 md:flex">
      <Link
        to={isClubArea ? "/club/dashboard" : "/admin/dashboard"}
        className="mb-7 block"
      >
        <p className="text-2xl font-black tracking-tight text-[#008C2F]">
          PitchPro
        </p>
        <p className="mt-1 text-xs font-semibold text-gray-500">
          {isClubArea ? "Không gian quản lý CLB" : "Bảng điều khiển quản trị"}
        </p>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 text-sm">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            item.aliases?.includes(location.pathname) ||
            (item.path !== "/" &&
              location.pathname.startsWith(`${item.path}/`));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-colors ${
                isActive
                  ? "bg-white text-[#008C2F] shadow-sm"
                  : "text-gray-600 hover:bg-white/70 hover:text-[#008C2F]"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wide text-gray-400">
          Chế độ hiện tại
        </p>
        <p className="mt-1 text-sm font-black text-gray-900">
          {isClubArea ? "Quản lý CLB" : "Admin"}
        </p>
        <Link
          to="/"
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#008C2F] transition-colors hover:text-[#0d631b]"
        >
          Xem trang public
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    </aside>
  );
};
