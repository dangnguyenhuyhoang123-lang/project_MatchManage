import { Link, useLocation } from "react-router-dom";
import type { AppWorkspace } from "../layouts/AppLayout";
import { ArrowBigLeftIcon } from "lucide-react";

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
    label: "Giải đấu",
    path: "/admin/leagues",
    icon: "emoji_events",
    aliases: ["/league"],
  },
  {
    label: "Đội tham gia mùa giải",
    path: "/admin/season-teams",
    icon: "groups",
  },
  {
    label: "Lời mời mùa giải",
    path: "/admin/invitations",
    icon: "outgoing_mail",
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
    label: "Trọng tài",
    path: "/admin/referees",
    icon: "sports",
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
  {
    label: "Cấu hình luật",
    path: "/admin/systemrule",
    icon: "analytics",
    aliases: ["/systemrule"],
  },
  {
    label: "Phân quyền ",
    path: "/admin/settings",
    icon: "settings",
    aliases: ["/settings"],
  },
];

const clubMenu: MenuItem[] = [
  {
    label: "Tổng quan CLB",
    path: "/club/dashboard",
    icon: "dashboard",
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
  {
    label: "Lời mời giải đấu",
    path: "/club/invitations",
    icon: "mail",
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

// Hiển thị Sidebar.
export const Sidebar = ({ workspace }: SidebarProps) => {
  const location = useLocation();
  const isClubArea =
    workspace === "club" ||
    location.pathname.startsWith("/club") ||
    legacyClubPaths.includes(location.pathname);
  const menuItems = isClubArea ? clubMenu : adminMenu;

  return (
    <aside className="sticky top-0 hidden w-64 shrink-0 flex-col self-start border-r border-gray-100 bg-[#f5f3ef] p-5 md:flex">
      <Link
        to={isClubArea ? "/club/dashboard" : "/admin/leagues"}
        className="mb-7 block"
      >
        <p className="text-2xl font-black tracking-tight text-[#008C2F]">
          HDPro
        </p>
        <p className="mt-1 text-xs font-semibold text-gray-500">
          {isClubArea ? "Không gian quản lý CLB" : "Bảng điều khiển quản trị"}
        </p>
      </Link>

      <nav className="space-y-1 pr-1 text-sm">
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
          <ArrowBigLeftIcon />
          Quay lại
        </Link>
      </div>
    </aside>
  );
};
