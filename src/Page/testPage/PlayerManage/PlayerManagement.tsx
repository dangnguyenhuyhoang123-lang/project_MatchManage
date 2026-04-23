import React, { useState } from "react";
import { Sidebar } from "../../../utils/SideBar";
import { AddPlayerModal } from "./AddPlayer";
import { Modal } from "../../../components/Modal";

// --- Types ---
interface Player {
  id: string;
  name: string;
  position: string;
  roleCode: string;
  jerseyNumber: number;
  club: string;
  nationality: string;
  status: "Đang thi đấu" | "Chấn thương" | "Bị treo giò";
  avatar: string;
}

const PlayerManagement: React.FC = () => {
  // Mock data dựa trên file thiết kế của bạn
  const [open, setOpen] = useState(false);
  const [players] = useState<Player[]>([
    {
      id: "1",
      name: "Nguyễn Văn Quyết",
      position: "Tiền đạo (Cánh trái)",
      roleCode: "ST",
      jerseyNumber: 10,
      club: "Hà Nội FC",
      nationality: "Việt Nam",
      status: "Đang thi đấu",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA3qtwP2d_OZHLZomFWr2dQs56tbOv7S3x_-K3Wh_sF9xzCGtdnGi94CAFa4xhkY0p2j94rz1d3kV1tauwMvk0xYgdWCavSxpVq97jjCAOsBszQ2wwtWG27npnjjdLpRYIf_BOiQ8LaiMdOENuanOu2zBWRY9Ic9rkDihiVie7wt2KpoaWzCPnuc0XhTOyVMTZmTR09K0R9gn1sXPuFqXLg3mVTeiumxDYso8FXgQ3ON7y323R1pzMhJR0VPQDTiqlUszqQoBMm_w",
    },
    {
      id: "2",
      name: "Đỗ Hùng Dũng",
      position: "Tiền vệ trung tâm",
      roleCode: "CM",
      jerseyNumber: 88,
      club: "Viettel FC",
      nationality: "Việt Nam",
      status: "Chấn thương",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB6BO33F6Z4Kp9KgV7xOd_xveADJXYoeBmPK6NR_uW65kpB_mFEYc2TabNtVXmc-H8t3vyraxu8kQA5SSr5piJEbCBm0wdu_7mL3ojuL2JwbXISYAwBmZnoiC71n0e2oeLulpMc1jzDTOvaqP5v_jjBBRfjv_j7tAsBxdx0Lia3L0s2ufegbBuiY6NsFAu8mnWr-uQBYjr7PaGBYEx5pyRzYPcnAoFzB1PI8FP2PngZNe9LjkLrFGQAZz2PwNPki8aMhMjyQspmKQ",
    },
    {
      id: "3",
      name: "Quế Ngọc Hải",
      position: "Hậu vệ trung tâm",
      roleCode: "CB",
      jerseyNumber: 3,
      club: "CAHN",
      nationality: "Việt Nam",
      status: "Bị treo giò",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAlYDKgOzLMLPPMb686aKwCGGnRrG5w5NO1wvp4UzgU5BxDuYKzqX_U3fZKmuGsE-h4kUfwwpbgNh5_Rm6ytROMgtwc7Dn1V7X815GSPP2bUzjCYXtIlbWoPZi7XO6oPZFtWbYGTyIbYlXP9M9e8V3IYI2HsbErJ1kKoBDDsqsZIaWX6TRRYZznOhHvODpgcqx_wry-IhKgdzWivmZwkC5E5fHf3qfrLjXCMMblF8D_yvvJHxp4GuOzZRCRsu_uX87d_Hj013Oktw",
    },
  ]);

  return (
    <div className="flex min-h-screen bg-[#fbf9f5] font-sans">
      {/* Sidebar - Cố định bên trái */}
      <Sidebar />
      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-6 max-w-7xl mx-auto space-y-8">
        {/* Header Bar */}
        <header className="flex justify-between items-center px-8 h-16 sticky top-0 z-40 bg-[#fbf9f5]/80 backdrop-blur-md border-b border-black/5">
          <div className="relative w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-black/40 text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm cầu thủ, số áo..."
              className="w-full pl-11 pr-4 py-2 bg-[#f5f3ef] border-none rounded-full text-sm focus:ring-2 focus:ring-[#0d631b]/20"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-stone-200/50 rounded-full">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-px bg-black/10"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold">Admin PitchPro</p>
                <p className="text-[10px] opacity-60">Quản trị viên</p>
              </div>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsoclGwtcvH0EiGcUJj22KyIhMMXsH0C6y0NKvAnQ64_7UqutasnWnqicOOyBTglLB0C3IyaQXRum25lePmRXTHIhkUJ2TsfIvHHi_YjBeWv96SjOmPOY26ODZRPGVD4yVas1hPm532WGrdgRXXPtn_yT4MsSXYPPwVAhRMdACJ64WwaUz2jXjKKf_TJLw28t6eKQx4zYHFBWqj4wGLSvaon8jKWTs_T53l9sMDiReZSELqIe_oNq7DikVXjw9_x4k_cHxQSuS5w"
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                alt="Admin"
              />
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black font-['Be_Vietnam_Pro'] tracking-tight">
                Quản lý Cầu thủ
              </h1>
              <p className="text-[#40493d] font-medium">
                Hệ thống quản lý dữ liệu và thống kê cầu thủ chuyên nghiệp.
              </p>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="bg-gradient-to-r from-[#0d631b] to-[#2e7d32] text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-all"
            >
              <span className="material-symbols-outlined fill-1"></span>
              Thêm cầu thủ mới
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-4 gap-4 bg-[#f5f3ef] p-4 rounded-xl">
            <FilterSelect
              label="Vị trí"
              options={[
                "Tất cả vị trí",
                "Thủ môn",
                "Hậu vệ",
                "Tiền vệ",
                "Tiền đạo",
              ]}
            />
            <FilterSelect
              label="CLB Chủ quản"
              options={["Tất cả CLB", "Hà Nội FC", "HAGL", "Viettel", "CAHN"]}
            />
            <FilterSelect
              label="Trạng thái"
              options={[
                "Tất cả trạng thái",
                "Đang thi đấu",
                "Chấn thương",
                "Bị treo giò",
              ]}
            />
            <div className="flex items-end">
              <button className="w-full h-[42px] bg-[#4c56af] text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90">
                <span className="material-symbols-outlined"></span>
                Áp dụng bộ lọc
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="space-y-3">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-6 py-2 text-[10px] font-black uppercase tracking-widest opacity-40">
              <div className="col-span-4">Cầu thủ</div>
              <div className="col-span-1 text-center">Số áo</div>
              <div className="col-span-2">CLB</div>
              <div className="col-span-2">Quốc tịch</div>
              <div className="col-span-2 text-center">Trạng thái</div>
              <div className="col-span-1 text-right">Thao tác</div>
            </div>

            {/* Player Rows */}
            {players.map((player) => (
              <PlayerRow key={player.id} player={player} />
            ))}

            {/* Skeleton Loader Example */}
            <div className="grid grid-cols-12 items-center px-6 py-4 bg-white/50 rounded-xl animate-pulse">
              <div className="col-span-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="col-span-8 h-4 bg-gray-100 rounded"></div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-6 border-t border-black/5">
            <p className="text-sm text-[#40493d] font-medium">
              Hiển thị <span className="font-bold">1 - 10</span> trong số{" "}
              <span className="font-bold">124</span> cầu thủ
            </p>
            <div className="flex gap-2">
              <PaginationBtn icon="chevron_left" />
              <PaginationBtn label="1" active />
              <PaginationBtn label="2" />
              <PaginationBtn label="..." />
              <PaginationBtn label="12" />
              <PaginationBtn icon="chevron_right" />
            </div>
          </div>
        </div>
      </main>
      <Modal open={open} onClose={() => setOpen(false)}>
        <AddPlayerModal onClose={() => setOpen(false)} />
      </Modal>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8">
        <button className="w-14 h-14 bg-[#0d631b] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all">
          <span className="material-symbols-outlined text-3xl fill-1">add</span>
        </button>
      </div>
    </div>
  );
};

// --- Sub-components ---

const PlayerRow = ({ player }: { player: Player }) => {
  const statusColors = {
    "Đang thi đấu": "bg-[#0d631b]/10 text-[#0d631b]",
    "Chấn thương": "bg-red-100 text-red-600",
    "Bị treo giò": "bg-gray-100 text-gray-500",
  };

  const roleBg =
    player.roleCode === "ST"
      ? "bg-[#0d631b]"
      : player.roleCode === "CM"
        ? "bg-[#4c56af]"
        : "bg-stone-600";

  return (
    <div className="grid grid-cols-12 items-center px-6 py-4 bg-white rounded-xl hover:shadow-xl hover:shadow-stone-200/40 transition-all group">
      <div className="col-span-4 flex items-center gap-4">
        <div className="relative">
          <img
            className="w-12 h-12 rounded-full object-cover"
            src={player.avatar}
            alt={player.name}
          />
          <span
            className={`absolute -bottom-1 -right-1 w-5 h-5 ${roleBg} text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white`}
          >
            {player.roleCode}
          </span>
        </div>
        <div>
          <p className="font-['Be_Vietnam_Pro'] font-bold group-hover:text-[#0d631b] transition-colors">
            {player.name}
          </p>
          <p className="text-xs opacity-60">{player.position}</p>
        </div>
      </div>
      <div className="col-span-1 text-center font-['Be_Vietnam_Pro'] font-black text-xl text-[#0d631b]/30">
        {player.jerseyNumber}
      </div>
      <div className="col-span-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm opacity-40">
            shield
          </span>
          <span className="text-sm font-semibold">{player.club}</span>
        </div>
      </div>
      <div className="col-span-2 flex items-center gap-2 text-sm opacity-70">
        <span>🇻🇳</span> {player.nationality}
      </div>
      <div className="col-span-2 flex justify-center">
        <span
          className={`${statusColors[player.status]} px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider`}
        >
          {player.status}
        </span>
      </div>
      <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <ActionBtn icon="visibility" />
        <ActionBtn icon="edit" color="text-[#0d631b]" />
        <ActionBtn icon="delete" color="text-red-500" />
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: any) => (
  <a
    className={`flex items-center gap-3 px-4 py-3 transition-all rounded-full scale-95 ${
      active
        ? "text-[#2E7D32] bg-white font-bold shadow-sm"
        : "text-black/60 hover:text-[#2E7D32] hover:bg-white/50"
    }`}
    href="#"
  >
    <span className={`material-symbols-outlined ${active ? "fill-1" : ""}`}>
      {icon}
    </span>{" "}
    {label}
  </a>
);

const FilterSelect = ({ label, options }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 ml-2">
      {label}
    </label>
    <select className="w-full bg-white border-none rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#0d631b]/10 outline-none">
      {options.map((opt: string) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const ActionBtn = ({ icon, color = "text-gray-400" }: any) => (
  <button
    className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${color}`}
  >
    <span className="material-symbols-outlined text-xl">{icon}</span>
  </button>
);

const PaginationBtn = ({ label, icon, active = false }: any) => (
  <button
    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
      active
        ? "bg-[#0d631b] text-white font-bold shadow-md"
        : "hover:bg-[#f5f3ef] border border-black/5 font-medium"
    }`}
  >
    {icon ? <span className="material-symbols-outlined">{icon}</span> : label}
  </button>
);

export default PlayerManagement;
