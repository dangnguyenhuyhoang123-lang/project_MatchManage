import { Link, useLocation } from "react-router-dom";

export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { label: "Bảng điều khiển", path: "/" },
    { label: "Giải đấu", path: "/league" },
    { label: "Vòng đấu", path: "/rounds" },
    { label: "Câu lạc bộ", path: "/clubs" },
    { label: "Cầu thủ", path: "/players" },
    { label: "Đăng ký", path: "/registrations" },
    { label: "Lịch thi đấu", path: "/matches" },
    { label: "Kết quả", path: "/results" },
    { label: "Bảng xếp hạng", path: "/standings" },
    { label: "Báo cáo", path: "/reports" },
  ];

  return (
    <aside className="w-64 bg-[#f5f3ef] p-6 hidden md:flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-green-700">PitchPro</h1>
        <p className="text-xs opacity-60">Quản lý chuyên nghiệp</p>
      </div>

      {/* Menu */}
      <nav className="space-y-2 text-sm">
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={i}
              to={item.path}
              className={`block px-4 py-2 rounded-xl transition-all
                ${
                  isActive
                    ? "bg-white text-green-700 font-semibold shadow-sm"
                    : "text-gray-600 hover:bg-white/70 hover:text-green-700"
                }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
