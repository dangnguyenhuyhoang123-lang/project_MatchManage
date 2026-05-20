import { useState, useRef, useEffect } from "react";
import pic1 from "../../assets/user_icon.svg";
import { useAuth } from "../../utils/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export const Header1 = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

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

  const roleMap: Record<string, string> = {
    ROLE_ADMIN: "Admin",
    ROLE_STAFF: "Staff",
  };

  const roleLabel =
    user?.roles?.map((r: string) => roleMap[r]).find(Boolean) || "User";

  return (
    <header className="sticky top-0 z-50 relative w-full h-16 bg-white border border-gray-200 shadow-sm px-4 sm:px-6 flex items-center gap-4">
      {/* Brand */}

      {/* Search */}
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-xl">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm dữ liệu..."
            className="w-full h-11 pl-11 pr-4 rounded-full bg-gray-100 border border-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400 focus:border-green-500/20 focus:ring-2 focus:ring-green-500/10"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
        {!user ? (
          <>
            <Link
              to="/login"
              className="px-4 sm:px-5 h-10 inline-flex items-center justify-center rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
            >
              Login
            </Link>

            <Link
              to="/sign-up"
              className="px-4 sm:px-5 h-10 inline-flex items-center justify-center rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <button
              type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-[22px] text-gray-600">
                notifications
              </span>
            </button>

            <button
              type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
              aria-label="Settings"
            >
              <span className="material-symbols-outlined text-[22px] text-gray-600">
                settings
              </span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 sm:gap-3 cursor-pointer rounded-2xl px-2 py-1.5 hover:bg-gray-100 transition"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-green-500/20 shrink-0">
                  <img
                    src={user.avatar || pic1}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="hidden md:block text-right leading-tight">
                  <p className="text-sm font-semibold text-gray-800">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500">{roleLabel}</p>
                </div>

                <span className="material-symbols-outlined text-gray-400 text-[18px] hidden md:block">
                  expand_more
                </span>
              </button>

              <div
                className={`absolute right-0 top-[calc(100%+0.75rem)] w-72 origin-top-right transition-all duration-200 ease-out z-50 ${open
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
              >
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-4 flex items-center gap-3 bg-linear-to-r from-green-50 to-white">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-green-500/15">
                      <img
                        src={user.avatar || pic1}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500">{roleLabel}</p>
                    </div>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <span className="text-lg">👤</span>
                      Thông tin tài khoản
                    </Link>

                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition text-left"
                    >
                      <span className="text-lg">⚙️</span>
                      Cài đặt
                    </button>
                  </div>

                  <div className="border-t border-gray-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition text-left"
                  >
                    <span className="text-lg">🚪</span>
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
