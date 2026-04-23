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
    navigate("/login");
  };

  const roleMap: Record<string, string> = {
    ROLE_ADMIN: "Admin",
    ROLE_STAFF: "Staff",
  };

  const roleLabel =
    user?.roles?.map((r: string) => roleMap[r]).find(Boolean) || "User";

  return (
    <header className="h-16 flex justify-between items-center px-8 border-b border-gray-100 bg-white/70 backdrop-blur-lg sticky top-0 z-50">
      <span className="text-2xl font-extrabold text-green-800 tracking-tight">
        Elite Soccer Management
      </span>

      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {!user ? (
          <>
            <Link to="/login">
              <button className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 transition font-medium">
                Login
              </button>
            </Link>

            <Link to="/sign-up">
              <button className="bg-green-500 text-white px-5 py-2 rounded-xl hover:bg-green-600 transition font-medium">
                Sign Up
              </button>
            </Link>
          </>
        ) : (
          <>
            {/* Avatar trigger */}
            <div
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-3 cursor-pointer px-2 py-1 rounded-xl hover:bg-gray-100 transition"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-green-500/30">
                <img
                  src={user.avatar || pic1}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="hidden md:block leading-tight">
                <p className="text-sm font-semibold text-gray-800">
                  {user.username}
                </p>
                <p className="text-xs text-gray-400">{roleLabel}</p>
              </div>
            </div>

            {/* Dropdown */}
            <div
              className={`absolute right-0 top-14 w-64 origin-top-right transform transition-all duration-200 ease-out
              ${
                open
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-4 flex items-center gap-3 bg-gradient-to-r from-green-50 to-white">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={user.avatar || pic1}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500">{roleLabel}</p>
                  </div>
                </div>

                {/* Menu */}
                <div className="py-2">
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    <span className="text-lg">👤</span>
                    Thông tin tài khoản
                  </Link>

                  <button
                    onClick={() => setOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    <span className="text-lg">⚙️</span>
                    Cài đặt
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100"></div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition"
                >
                  <span className="text-lg">🚪</span>
                  Đăng xuất
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
