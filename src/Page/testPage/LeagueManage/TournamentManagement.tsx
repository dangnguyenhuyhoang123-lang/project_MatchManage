import React from "react";

// --- Interfaces ---
interface Tournament {
  id: string;
  name: string;
  season: string;
  teams: number;
  status: "active" | "upcoming" | "finished";
  logo: string;
}

// --- Sub-components ---

const SidebarItem: React.FC<{
  icon: string;
  label: string;
  active?: boolean;
}> = ({ icon, label, active }) => (
  <a
    href="#"
    className={`flex items-center gap-3 px-4 py-3 rounded-full mx-2 font-headline text-sm font-medium transition-all duration-300 ${
      active
        ? "bg-[#0d631b] text-white shadow-lg shadow-[#0d631b]/20"
        : "text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800 hover:translate-x-1"
    }`}
  >
    <span className="material-symbols-outlined">{icon}</span>
    {label}
  </a>
);

const StatCard: React.FC<{
  title: string;
  value: string;
  trend: string;
  desc: string;
  icon: string;
  colorClass?: string;
}> = ({ title, value, trend, desc, icon, colorClass = "text-primary" }) => (
  <div className="bg-stone-100 p-6 rounded-2xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
      <span className="material-symbols-outlined text-8xl">{icon}</span>
    </div>
    <h3 className="text-stone-500 font-bold text-xs uppercase tracking-widest mb-2">
      {title}
    </h3>
    <div className="flex items-end gap-2">
      <span className="text-4xl font-bold font-headline leading-none">
        {value}
      </span>
      <span
        className={`${colorClass} text-sm font-bold mb-1 flex items-center`}
      >
        <span className="material-symbols-outlined text-xs">trending_up</span>
        {trend}
      </span>
    </div>
    <p className="text-xs text-stone-400 mt-4">{desc}</p>
  </div>
);

const TournamentRow: React.FC<{ tournament: Tournament }> = ({
  tournament,
}) => {
  const statusStyles = {
    active: "bg-green-100 text-green-700",
    upcoming: "bg-blue-100 text-blue-700",
    finished: "bg-stone-100 text-stone-500",
  };

  const statusLabels = {
    active: "Đang diễn ra",
    upcoming: "Sắp khởi tranh",
    finished: "Đã kết thúc",
  };

  return (
    <div className="grid grid-cols-12 items-center bg-white px-6 py-4 rounded-2xl shadow-sm border border-stone-100/50 hover:bg-stone-50 transition-all group">
      <div className="col-span-12 md:col-span-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center overflow-hidden">
          <img
            src={tournament.logo}
            alt="Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-bold font-headline text-stone-900">
            {tournament.name}
          </h4>
          <p className="text-xs text-stone-400">ID: {tournament.id}</p>
        </div>
      </div>
      <div className="col-span-6 md:col-span-2 mt-4 md:mt-0 text-sm font-medium text-stone-600">
        {tournament.season}
      </div>
      <div className="col-span-6 md:col-span-2 mt-4 md:mt-0 flex items-center gap-2">
        <span className="material-symbols-outlined text-stone-400 text-lg">
          groups
        </span>
        <span className="text-sm font-bold text-stone-600">
          {tournament.teams} Đội
        </span>
      </div>
      <div className="col-span-6 md:col-span-2 mt-4 md:mt-0">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusStyles[tournament.status]}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${tournament.status === "active" ? "bg-green-600" : tournament.status === "upcoming" ? "bg-blue-600" : "bg-stone-400"}`}
          ></span>
          {statusLabels[tournament.status]}
        </span>
      </div>
      <div className="col-span-6 md:col-span-2 mt-4 md:mt-0 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 text-stone-400 hover:text-green-700 hover:bg-green-50 rounded-full transition-all">
          <span className="material-symbols-outlined text-xl">edit</span>
        </button>
        <button className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
          <span className="material-symbols-outlined text-xl">delete</span>
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---

const TournamentManagement: React.FC = () => {
  const tournaments: Tournament[] = [
    {
      id: "T-88219",
      name: "V.League Championship 2024",
      season: "Mùa Xuân 2024",
      teams: 20,
      status: "active",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuApyBCI80_Rx7aFSMozUF9KPXnW0Q3UAV9O916XFRGWx8YrH-MCo33CRgBgtDrEvMU5X9glpyfj9q259bOZNn0XYQHZdRk97hh29pvOZGPIpUbjxfet1OHVGyXSbyHccL0uR3-T91Tw0VM1M2sqv1mod1Y6jvz6GSR4rTP3pxzyFvNH1XR_hotpIT9JcaGyOSHStxIYevatqezf6o2NdWPbOFLR9rB3w9-Mss1yjfVaiZGeJ8PoLNs3c-U-nzCxgqRlSOmbF5o7hQ",
    },
    {
      id: "T-88220",
      name: "Cúp Hùng Vương Open",
      season: "Mùa Hè 2024",
      teams: 12,
      status: "upcoming",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIKfOVIutAFmlJ7qO08XBt1Kzvc-ptopHqE0xik3zIllkFHRGH8XCpYIPvEs9nfr0Wks3cUw-2LFuE0b7HacONwQSNDUJua3SRLDncI4CvqNoyKHUmd9i2il_s-_3sthf03YlZtob9-YLwEvw3-eLfiZpXjD0XlaC6QGl0MCMEDIW3lVU-27vacFOEz1-hNo5xUPdgPcEQ3q0EJB9y4nUUd6_ar3RxeqbqtVPCpRwDRUQ_lY-H4GrhZwt1LP8LBmp9I9rqq74QpQ",
    },
    {
      id: "T-88221",
      name: "Giải Vô Địch Học Sinh-SV",
      season: "V.League 2023",
      teams: 32,
      status: "finished",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvLjUSnC2u8U0-2F7RxrQIIu8ON8lqgH1tihH_tc7pj8zSpihnQZJZeBGpJToHxxOf_UEFfemZo5_rn8hCzyAZibstjI-3xf4Nswqn3ihBquBc5T_rVexHROz_Stm4xNWOrcEeKs8QxabNvh3DKpe_31nkrY2LQgJpPojJiwlExF7XnxXQt7bUgk6tRtRJ__c9BJMzSpc2x73wullmFh4K0385MfkQeHQg0H0pfBaAnz3M_R4kYoK0cxoVpV7ncwBa8aXFk2LuIQ",
    },
    {
      id: "T-88222",
      name: "League-1 Premier Series",
      season: "Mùa Xuân 2024",
      teams: 16,
      status: "active",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6QlJ7-F2mK0ZktJMkgr62rDbBW_YSn4OmAiNccpRCJKn3I5HRpmzbGUD2fYruLhIRoRCNACZzGLpKTR4UB_o_SDR0Cp-2DAB52Ls8WzCgoFKWvPtvkJ4WfhpGa5NPlLry8hFVQZkuPW0D18tTOU16kUEI3j7XDZz8qlYWNiOfiEVi-FEPgQuTKhaEcAQp49LmXyhrJKobaV9tHDOXRj2l70aWe3PqxAkkaYdAYUANtTccuMJICeL8aWDHpeQ78iBj_e-BrCpURA",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#fbf9f5] font-sans">
      {/* Aside Sidebar */}
      <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-[#f5f3ef] flex-col py-6 gap-2 z-50">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0d631b] rounded-xl flex items-center justify-center text-white">
            <span className="material-symbols-outlined">sports_soccer</span>
          </div>
          <span className="text-xl font-bold text-[#0d631b] font-headline">
            PitchMaster
          </span>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          <SidebarItem icon="dashboard" label="Bảng điều khiển" />
          <SidebarItem icon="emoji_events" label="Giải đấu" active />
          <SidebarItem icon="sports_soccer" label="Trận đấu" />
          <SidebarItem icon="groups" label="Đội bóng" />
          <SidebarItem icon="leaderboard" label="Phân tích" />
          <SidebarItem icon="settings" label="Cài đặt" />
        </nav>
        <div className="px-6 mt-auto">
          <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpzKnOrt7vpp2c1pGdftBwEgWWdSa9Lsqq3_rxvfp8XaV5eoasdQfK03v57KpozuzppGFL8hNP3bkA1riCebzAOiV4flmiaNKht22V9nJem_geAlBSV70IqY9tHZ7byIq3tnnadqA8aLnztmgs2s3xHhdgE9CG4EpcRETxX2gjlPwtkXYXWSyYtFkod-omHTkBRkZ5jcT5pWp1r-BUGWg6TxYmvibz-w2DENWOhTTJelRAlqPqIhOFlj5Lks1hyJnjeZ29W9Pzqg"
                className="w-10 h-10 rounded-full object-cover"
                alt="Admin"
              />
              <div>
                <p className="text-sm font-bold">Quản Lý Giải</p>
                <p className="text-xs text-stone-500">Elite Level</p>
              </div>
            </div>
            <button className="w-full py-2 bg-[#0d631b] text-white rounded-full text-xs font-bold shadow-md">
              Nâng cấp Pro
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center sticky top-0 bg-[#fbf9f5]/80 backdrop-blur-md py-4 z-40">
          <h2 className="font-headline font-bold text-lg text-[#0d631b]">
            Quản lý giải đấu
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <input
                className="pl-10 pr-4 py-2 bg-stone-100 border-none rounded-full text-sm focus:ring-2 focus:ring-green-700/20 w-64"
                placeholder="Tìm kiếm giải đấu..."
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                search
              </span>
            </div>
            <button className="bg-[#0d631b] text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-green-900/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span> Tạo
              Giải Đấu
            </button>
          </div>
        </header>

        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-8 flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">
                Mùa giải
              </label>
              <select className="block w-full bg-stone-100 border-none rounded-xl text-sm px-4 py-2.5">
                <option>Tất cả mùa giải</option>
                <option>Mùa hè 2024</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">
                Trạng thái
              </label>
              <select className="block w-full bg-stone-100 border-none rounded-xl text-sm px-4 py-2.5">
                <option>Tất cả trạng thái</option>
                <option>Đang diễn ra</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table List */}
        <div className="space-y-3">
          <div className="hidden md:grid grid-cols-12 px-6 py-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
            <div className="col-span-4">Tên giải đấu</div>
            <div className="col-span-2">Mùa giải</div>
            <div className="col-span-2">Số đội</div>
            <div className="col-span-2">Trạng thái</div>
            <div className="col-span-2 text-right">Thao tác</div>
          </div>
          {tournaments.map((t) => (
            <TournamentRow key={t.id} tournament={t} />
          ))}
        </div>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Đang hoạt động"
            value="08"
            trend="+2"
            desc="Tăng so với tháng trước"
            icon="military_tech"
          />
          <StatCard
            title="Tổng đội bóng"
            value="124"
            trend="+12%"
            desc="Số lượng cầu thủ tăng"
            icon="stadium"
            colorClass="text-blue-600"
          />
          <div className="bg-[#0d631b] text-white p-6 rounded-2xl relative overflow-hidden">
            <h3 className="text-white/70 font-bold text-xs uppercase mb-2">
              Hệ thống gợi ý
            </h3>
            <p className="text-sm mb-4">
              Mùa hè 2024 có nhu cầu cao. Hãy tạo thêm giải bán chuyên!
            </p>
            <button className="bg-white text-[#0d631b] px-4 py-2 rounded-full text-xs font-bold">
              Xem ngay
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TournamentManagement;
