import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import pic1 from "../../assets/user_icon.svg";
import { useAuth } from "../../utils/useAuth";

const navLinks = [
  { label: "Trang chủ", path: "/" },
  { label: "Tính năng", path: "/features" },
  { label: "Giải đấu", path: "/leagues" },
  { label: "Tin tức", path: "/news" },
  { label: "Về chúng tôi", path: "/about" },
];

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  ROLE_ADMIN: "Admin",
  CLUB_MANAGER: "Quản lý CLB",
  ROLE_CLUB_MANAGER: "Quản lý CLB",
  STAFF: "Nhân viên",
  ROLE_STAFF: "Nhân viên",
  USER: "Người dùng",
  ROLE_USER: "Người dùng",
};

export const Header_HomePage = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userRoles = useMemo(() => user?.roles ?? [], [user?.roles]);
  const isAdmin = userRoles.some(
    (role) => role === "ADMIN" || role === "ROLE_ADMIN",
  );
  const isClubManager = userRoles.some(
    (role) => role === "CLUB_MANAGER" || role === "ROLE_CLUB_MANAGER",
  );
  const roleLabel =
    userRoles.map((role) => roleLabels[role]).find(Boolean) || "Người dùng";

  const getNavLinkClass = (path: string) => {
    const isActive =
      path === "/"
        ? location.pathname === "/" || location.pathname === "/homepage"
        : location.pathname === path;

    return [
      "relative text-sm font-semibold transition-colors",
      isActive ? "text-[#1a6e38]" : "text-gray-700 hover:text-[#1a6e38]",
    ].join(" ");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between bg-white px-4 shadow-sm md:px-12">
      <div className="flex items-center">
        <Link
          to="/"
          className="text-2xl font-black tracking-tight text-[#1a6e38] transition-transform hover:scale-[1.02]"
        >
          PitchPro
        </Link>
      </div>

      <nav className="hidden items-center gap-8 md:flex">
        {navLinks.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/" || location.pathname === "/homepage"
              : location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={getNavLinkClass(item.path)}
            >
              {item.label}
              {isActive && (
                <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-[#1a6e38]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
        {!user ? (
          <>
            <Link
              to="/login"
              className="inline-flex h-10 items-center justify-center px-4 text-sm font-bold text-gray-700 transition-colors hover:text-[#1a6e38] sm:px-6"
            >
              Đăng nhập
            </Link>

            <Link
              to="/sign-up"
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#1a6e38] px-4 text-sm font-bold text-white shadow-md transition-colors hover:bg-green-800 sm:px-6"
            >
              Đăng ký
            </Link>
          </>
        ) : (
          <>
            {(isAdmin || isClubManager) && (
              <Link
                to={isAdmin ? "/admin/dashboard" : "/club/dashboard"}
                className="hidden h-10 items-center justify-center rounded-full bg-[#1a6e38] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-800 sm:inline-flex"
              >
                {isAdmin ? "Trang quản trị" : "Quản lý CLB"}
              </Link>
            )}

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
              aria-label="Thông báo"
            >
              <Bell size={20} className="text-gray-600" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex cursor-pointer items-center gap-2 rounded-2xl px-2 py-1.5 transition-colors hover:bg-gray-100 sm:gap-3"
              >
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-green-500/20">
                  <img
                    src={user.avatar || pic1}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="hidden text-right leading-tight md:block">
                  <p className="text-sm font-semibold text-gray-800">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-xs text-gray-500">{roleLabel}</p>
                </div>

                <ChevronDown
                  size={18}
                  className={`hidden text-gray-400 transition-transform md:block ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {open && (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-72 origin-top-right">
                  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                    <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-white px-4 py-4">
                      <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-green-500/15">
                        <img
                          src={user.avatar || pic1}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {user.fullName || user.username}
                        </p>
                        <p className="text-xs text-gray-500">{roleLabel}</p>
                      </div>
                    </div>

                    <div className="py-2">
                      {(isAdmin || isClubManager) && (
                        <DropdownLink
                          to={isAdmin ? "/admin/dashboard" : "/club/dashboard"}
                          onClick={() => setOpen(false)}
                          icon={<LayoutDashboard size={18} />}
                          label={isAdmin ? "Trang quản trị" : "Quản lý CLB"}
                        />
                      )}

                      <DropdownLink
                        to="/profile"
                        onClick={() => setOpen(false)}
                        icon={<User size={18} />}
                        label="Thông tin tài khoản"
                      />

                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <Settings size={18} />
                        Cài đặt
                      </button>
                    </div>

                    <div className="border-t border-gray-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={18} />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

function DropdownLink({
  to,
  onClick,
  icon,
  label,
}: {
  to: string;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100"
    >
      {icon}
      {label}
    </Link>
  );
}
