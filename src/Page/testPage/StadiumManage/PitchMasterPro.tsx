import React from "react";

// --- Interfaces ---
interface Stadium {
  id: number;
  name: string;
  address: string;
  capacity: string;
  club: string;
  image: string;
  badge?: string;
  badgeColor?: string;
}

// --- Mock Data ---
const STADIUMS: Stadium[] = [
  {
    id: 1,
    name: "SVĐ Mỹ Đình",
    address: "Lê Đức Thọ, Mỹ Đình 1, Nam Từ Liêm, Hà Nội",
    capacity: "40.192",
    club: "Tuyển QG",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCCSlgATLppX2EQGGGjvRn8Hs0Hf7Vg46bSKVsoP1iSpkOlnHyzT_9DPztbLvqxr72gJiRCT7snDE4Ahlcw7SNufMIp4mvIFbSDiDS1O-rYv8QOSidBj3VpBWA54-K0JLuEEOb3cQwhM3qOGOlTEHbhMkzERmxwJTbx_ibx0QOndntYutDEdYgzT2MlrWP2SuVob_au6AQgSgFdnq6gymaYE9-0rEQDV_L8qgduYzmkWaQsuH07tvVoJhQ0lWD8z_49oW0dMphOkw",
    badge: "Tiêu chuẩn FIFA",
    badgeColor: "bg-primary/90",
  },
  {
    id: 2,
    name: "SVĐ Hàng Đẫy",
    address: "Trịnh Hoài Đức, Cát Linh, Đống Đa, Hà Nội",
    capacity: "22.500",
    club: "Hà Nội FC",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAEWZgGK2A8LFCDxnIFhPeobXVu2H3d-8skq8-8aOee2dWCAXT2IGm3hnSDCJhnnk7vVoCqorppY4q6eqqithVBFrxVFjqe2HcqQyXKju7NoyoO4KLoOlZitCVAY28J5gtZoQ_-p3DP3WNlJyzaG2uVQ83Vwq8-7KC3h-JUIrpBUy--7nF7PoVEvrO6ur1iM1ABr9q8EbaXb3fXkMbQJni8_Pf4D5jtszWL0B5z08tpde2jUVsg3xrBLdF70cwycwYvcicSVBrb0w",
    badge: "Trung tâm",
    badgeColor: "bg-secondary/90",
  },
  {
    id: 3,
    name: "SVĐ Thống Nhất",
    address: "Đào Duy Từ, Phường 6, Quận 10, TP. HCM",
    capacity: "16.000",
    club: "TP.HCM FC",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC_p-KJcjbYLzdHROlbptFwye2hctiU8z000LOEque1akx67eD3YIrzRs_fX68vYhdiWPxkYjfzX3L-e06TybtoqbthBiLhYdlLyhi1fKAzxNtp86DXjBCf0sa75qNC65Jf5oLTnWTsFWGH4i8r7gjQwvflDras88WH0ffXDrLElGH_c6pgEaJjuAFqIKuOwcjEzvhapeooRFG-uJEeNKtYAWoiIPEljRDWmjW4P_yNjVdw9geWa7SSpLF2qIRzwOi33LDjAfCqPg",
    badge: "Miền Nam",
    badgeColor: "bg-tertiary-container",
  },
  {
    id: 4,
    name: "SVĐ Hòa Xuân",
    address: "Cẩm Lệ, Đà Nẵng",
    capacity: "20.500",
    club: "SHB Đà Nẵng",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD7Qhn_32x9EqKSzlL4NaXjelBBS8xefgPByR0-vrZTq8mUZa_oyAQ115nWAQIuQsJ5zM1kcB648E5fXvGJtzi7qhJuC2NNHt_RseZKHzW5EQz791PyGRczIAtP9DcnA2LGxryNPi-Nq2pYlkAPZX7RABLmR2OXJh4eoqe-zDvvVk-amRTUFO_eJUjuxOlrMcKC-yCCcKVX0UH2UESeSMcoObwTFyjvUWKYmMsx4ZqzyZPQKumhyFdkSvPMvpP6NewT7GKHdJN_Xg",
  },
  {
    id: 5,
    name: "SVĐ Lạch Tray",
    address: "Lạch Tray, Ngô Quyền, Hải Phòng",
    capacity: "30.000",
    club: "Hải Phòng FC",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAuMYbU2o3bO7rykNvXI16iYKLgTQAWrhH3ZMvJNI5oj6wCDetHRTn54QW9BowkCIaw6gSsUD04j3IZQv-oI7e8gug8nNNZG_6aE1T3KF-Z0yRLNcV1c7s7Tz7riFM7W-xnsn9tn17AFb2aahRxLC2YitrKeO6_FoaClemYvN5c5YUJEcJTV3Z_cH2_mu33UeGWLBdpeShA-mdTOP_H0YM6Qa0Kex8AgmpzP2S_EMRo0IxUVQAl2WNFgn60vU-Bd4SLiyH3uhIToQ",
  },
];

// --- Sub-components ---
const StadiumCard: React.FC<{ stadium: Stadium }> = ({ stadium }) => (
  <div className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-500 flex flex-col relative">
    <div className="relative h-56 overflow-hidden">
      <img
        alt={stadium.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        src={stadium.image}
      />
      {stadium.badge && (
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 ${stadium.badgeColor} backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-tighter`}
          >
            {stadium.badge}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
        <button className="w-full py-2 bg-white/20 backdrop-blur-md text-white rounded-full font-bold text-sm border border-white/30 hover:bg-white hover:text-green-700 transition-all">
          Chi tiết cơ sở vật chất
        </button>
      </div>
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold font-headline text-gray-900">
          {stadium.name}
        </h3>
        <span className="material-symbols-outlined text-green-600/40 hover:text-green-600 cursor-pointer transition-colors">
          verified
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
        <span className="material-symbols-outlined text-sm">location_on</span>
        <span>{stadium.address}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-auto pb-4">
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">
            Sức chứa
          </p>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-700 text-lg">
              groups
            </span>
            <span className="font-bold text-sm">{stadium.capacity}</span>
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">
            CLB chủ quản
          </p>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-lg">
              shield
            </span>
            <span className="font-bold text-sm">{stadium.club}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-700 hover:text-white transition-all font-bold text-xs">
          <span className="material-symbols-outlined text-sm">edit</span>
          <span>Sửa</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all font-bold text-xs">
          <span className="material-symbols-outlined text-sm">delete</span>
          <span>Xóa</span>
        </button>
      </div>
    </div>
  </div>
);

const NavItem: React.FC<{ icon: string; label: string; active?: boolean }> = ({
  icon,
  label,
  active,
}) => (
  <a
    href="#"
    className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 ${
      active
        ? "text-green-700 bg-white font-bold shadow-sm"
        : "text-gray-600 hover:bg-white/50"
    }`}
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="font-medium text-sm">{label}</span>
  </a>
);

// --- Main Page Component ---
const PitchMasterPro: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fbf9f5] text-gray-900 font-sans">
      {/* Sidebar Navigation */}
      <aside className="h-screen w-72 fixed left-0 top-0 overflow-y-auto bg-[#f5f3ef] flex flex-col gap-1 p-6 border-r border-gray-200 z-50">
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center text-white">
            <span className="material-symbols-outlined">sports_soccer</span>
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-tight">Elite League</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">
              Season 2026
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <NavItem icon="dashboard" label="Dashboard" />
          <NavItem icon="trophy" label="Tournaments" />
          <NavItem icon="stadium" label="Configuration" active />
          <NavItem icon="groups" label="Clubs" />
          <NavItem icon="person" label="Players" />
          <NavItem icon="calendar_today" label="Schedule" />
          <NavItem icon="assessment" label="Reports" />
        </nav>

        <div className="mt-auto pt-6">
          <button className="w-full py-4 px-6 bg-gradient-to-br from-green-700 to-green-900 text-white rounded-full font-bold shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <span className="material-symbols-outlined">add</span>
            <span>New Match</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 min-h-screen relative">
        {/* Header */}
        <header className="w-full h-16 sticky top-0 z-40 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-green-700 tracking-tighter font-headline">
              PitchMaster Pro
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm hệ thống..."
                className="pl-10 pr-4 py-1.5 bg-gray-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-green-500/20"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-green-700">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="text-gray-500 hover:text-green-700">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <div className="h-8 w-[1px] bg-gray-200"></div>
              <div className="flex items-center gap-3">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAn5euL0P4EcXnslJLlzHp5qzZpM6Fz1qJMfoJhxICoJZpmAjQQHDVR13sqZrtghnVxo5VmnUBd_hfds9cF_6cYhY4Xpu4_Hep3xJ4tVTmyPU8S6f2xl8V1OF9Wtee6F8NpDtJeCaowpF5H6troK04AVAI_h_vd_AIUMZTCr7aoEUrVwnisxFYRkw449qJp_fqCfqn3kQBMZ5oyDkt5UifQrLBvmspV3CiKt1iN8TvknVEwFtKwLIEqDzZlIH22bCmBnZUEbLSAZw"
                  className="w-8 h-8 rounded-full border border-green-100"
                  alt="Admin"
                />
                <span className="text-sm font-semibold">Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Breadcrumb & Title */}
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
              <a href="#" className="hover:text-green-700 transition-colors">
                Trang chủ
              </a>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <span className="text-gray-900">Quản lý sân</span>
            </nav>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase leading-none">
                  Quản lý sân thi đấu
                </h1>
                <p className="text-gray-500 mt-2 font-medium">
                  Hệ thống cơ sở vật chất và hạ tầng thể thao toàn quốc.
                </p>
              </div>
              <button className="flex items-center gap-2 px-6 py-3.5 bg-green-200 text-green-900 rounded-full font-bold shadow-sm hover:shadow-md transition-all active:scale-95">
                <span className="material-symbols-outlined">add_circle</span>
                <span>Thêm sân vận động mới</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <section className="mb-8 p-1.5 bg-gray-100 rounded-xl flex flex-wrap items-center gap-2">
            <div className="flex-grow min-w-[300px] relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-lg text-sm focus:ring-2 focus:ring-green-500/10"
                placeholder="Tìm kiếm theo tên sân hoặc mã sân..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-2 pr-1.5">
              <select className="pl-4 pr-10 py-3 bg-white border-none rounded-lg text-sm font-medium cursor-pointer focus:ring-2 focus:ring-green-500/10">
                <option>Tất cả thành phố</option>
                <option>Hà Nội</option>
                <option>TP. Hồ Chí Minh</option>
              </select>
              <select className="pl-4 pr-10 py-3 bg-white border-none rounded-lg text-sm font-medium cursor-pointer focus:ring-2 focus:ring-green-500/10">
                <option>Sức chứa</option>
                <option>&gt; 50.000 chỗ</option>
              </select>
            </div>
          </section>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STADIUMS.map((stadium) => (
              <StadiumCard key={stadium.id} stadium={stadium} />
            ))}

            {/* Add New Placeholder */}
            <div className="group border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-12 text-center hover:border-green-500 transition-colors cursor-pointer bg-gray-50/50">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-green-600">
                  add_home
                </span>
              </div>
              <h4 className="font-bold text-gray-900">Đăng ký sân mới</h4>
              <p className="text-sm text-gray-500 mt-2 max-w-[200px]">
                Thêm cơ sở thi đấu mới vào hệ thống quản lý tập trung.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatBox
              label="Tổng số sân"
              value="42"
              subValue="+3 năm nay"
              color="green"
            />
            <StatBox
              label="Tổng sức chứa"
              value="840K"
              subValue="Chỗ ngồi"
              color="indigo"
            />
            <StatBox
              label="Sân đạt chuẩn FIFA"
              value="12"
              subValue="Sân loại A"
              color="green"
            />
            <StatBox
              label="Thành phố bao phủ"
              value="24"
              subValue="Khu vực"
              color="gray"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

const StatBox: React.FC<{
  label: string;
  value: string;
  subValue: string;
  color: string;
}> = ({ label, value, subValue, color }) => {
  const colorClasses: Record<string, string> = {
    green: "bg-green-50 border-green-100 text-green-700",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
    gray: "bg-gray-50 border-gray-100 text-gray-600",
  };

  return (
    <div className={`${colorClasses[color]} p-6 rounded-lg border`}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1">
        {label}
      </p>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-black text-gray-900">{value}</span>
        <span className="text-xs font-bold mb-1 opacity-80">{subValue}</span>
      </div>
    </div>
  );
};

export default PitchMasterPro;
