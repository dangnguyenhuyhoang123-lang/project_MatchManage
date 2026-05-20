import React, { useState } from "react";

// --- Interfaces ---
interface Player {
  id: string;
  name: string;
  avatar: string;
  number: string;
  position: string;
  birthYear: number;
  status: "valid" | "missing_info";
}

const PlayerList: Player[] = [
  {
    id: "QH19-2024",
    name: "Nguyễn Quang Hải",
    avatar: "https://placehold.co/40x40",
    number: "19",
    position: "Tiền vệ",
    birthYear: 1997,
    status: "valid",
  },
  {
    id: "VH05-2024",
    name: "Đoàn Văn Hậu",
    avatar: "https://placehold.co/40x40",
    number: "05",
    position: "Hậu vệ",
    birthYear: 1999,
    status: "missing_info",
  },
  {
    id: "TH09-2024",
    name: "Phạm Tuấn Hải",
    avatar: "https://placehold.co/40x40",
    number: "09",
    position: "Tiền đạo",
    birthYear: 1998,
    status: "valid",
  },
];

const RegistrationDetail: React.FC = () => {
  const [note, setNote] = useState<string>("");

  return (
    <div className="flex min-h-screen bg-[#fbf9f5] font-['Inter']">
      {/* Cấu hình Font và Icon (Có thể đưa vào index.html) */}
      <link
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;700;900&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        rel="stylesheet"
      />

      {/* Sidebar - Cố định bên trái */}
      <aside className="w-72 fixed h-full bg-stone-100 p-8 flex flex-col gap-2 border-r border-stone-200">
        <div className="px-6 mb-8">
          <h1 className="text-lg font-bold text-stone-900 font-['Be_Vietnam_Pro']">
            LĐBĐ Chuyên nghiệp
          </h1>
          <p className="text-xs text-stone-500">Hệ thống Quản lý Giải đấu</p>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem icon="dashboard" label="Bảng điều khiển" />
          <NavItem icon="assignment" label="Đơn đăng ký" active />
          <NavItem icon="emoji_events" label="Giải đấu" />
          <NavItem icon="groups" label="Đội bóng" />
        </nav>

        <div className="mt-auto space-y-4">
          <button className="w-full bg-[#0d631b] text-white rounded-full py-3 font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-90">
            <span className="material-symbols-outlined text-sm">add</span> Tạo
            đăng ký mới
          </button>
          <NavItem icon="logout" label="Đăng xuất" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          <span>Trang chủ</span>
          <span className="material-symbols-outlined text-[12px]">
            chevron_right
          </span>
          <span className="text-[#0d631b]">Chi tiết đơn đăng ký</span>
        </nav>

        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 font-['Be_Vietnam_Pro'] leading-tight">
              Chi tiết Đơn đăng ký: CLB Hà Nội - Mùa giải 2024
            </h2>
            <div className="flex items-center gap-4 mt-3">
              <span className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase">
                Đang chờ duyệt
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-sm">
                  calendar_today
                </span>{" "}
                Cập nhật 2 giờ trước
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-50 font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">chat</span>{" "}
              Yêu cầu bổ sung
            </button>
            <button className="px-8 py-3 rounded-full bg-[#0d631b] text-white font-black text-sm shadow-lg shadow-green-900/20 hover:scale-105 transition-transform">
              Phê duyệt đơn
            </button>
          </div>
        </div>

        {/* Bento Grid Info */}
        <div className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-6 grid grid-cols-2 gap-4">
            <InfoCard label="Câu lạc bộ" value="Hà Nội FC" highlight />
            <InfoCard label="Đại diện" value="Nguyễn Văn Nam" />
            <InfoCard label="Ngày nộp" value="12/10/2024" />
            <InfoCard label="Giải đấu" value="V-League 1" />
          </div>

          <div className="col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
              Quy trình kiểm tra hệ thống
            </p>
            <div className="space-y-3">
              <CheckItem label="Số lượng tối thiểu" status="18/18" passed />
              <CheckItem label="Giới hạn độ tuổi" status="Đạt" passed />
              <CheckItem label="Cầu thủ ngoại" status="0/3 - Đạt" passed />
            </div>
          </div>
        </div>

        {/* Player List */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black font-['Be_Vietnam_Pro']">
              Danh sách cầu thủ đăng ký
            </h3>
            <span className="text-xs font-bold text-gray-400">
              Tổng số: 18 cầu thủ
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
              <div className="col-span-5">Họ tên</div>
              <div className="col-span-1 text-center">Số áo</div>
              <div className="col-span-2">Vị trí</div>
              <div className="col-span-2 text-center">Năm sinh</div>
              <div className="col-span-2 text-right">Trạng thái</div>
            </div>

            {PlayerList.map((player) => (
              <div
                key={player.id}
                className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <img
                    src={player.avatar}
                    className="w-8 h-8 rounded-full bg-gray-100"
                    alt=""
                  />
                  <div>
                    <p className="text-sm font-bold group-hover:text-[#0d631b] transition-colors">
                      {player.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      ID: {player.id}
                    </p>
                  </div>
                </div>
                <div className="col-span-1 text-center">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-black">
                    {player.number}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-bold text-gray-600">
                    {player.position}
                  </span>
                </div>
                <div className="col-span-2 text-center text-sm font-medium">
                  {player.birthYear}
                </div>
                <div className="col-span-2 text-right">
                  <span
                    className={`flex items-center justify-end gap-1 text-[10px] font-black uppercase ${player.status === "valid" ? "text-green-600" : "text-red-500"}`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {player.status === "valid" ? "verified" : "error"}
                    </span>
                    {player.status === "valid" ? "Hợp lệ" : "Thiếu thông tin"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Footer */}
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <h3 className="text-sm font-black mb-3">Ghi chú cho đơn đăng ký</h3>
            <textarea
              className="w-full bg-gray-100 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-green-100 transition-all outline-none"
              placeholder="Nhập nhận xét hoặc yêu cầu sửa đổi tại đây..."
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">
              Thao tác nhanh
            </h3>
            <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#0d631b] hover:text-white rounded-xl transition-all group border border-gray-100">
              <span className="text-sm font-bold">Duyệt hồ sơ ngay</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group border border-gray-100">
              <span className="text-sm font-bold">Từ chối đơn</span>
              <span className="material-symbols-outlined">cancel</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Sub-components để code sạch hơn ---

const NavItem = ({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) => (
  <a
    className={`flex items-center gap-3 py-3 px-6 rounded-full transition-colors text-sm font-semibold ${active ? "bg-white text-[#0d631b] shadow-sm" : "text-stone-500 hover:text-[#0d631b]"}`}
    href="#"
  >
    <span className="material-symbols-outlined">{icon}</span> {label}
  </a>
);

const InfoCard = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="bg-gray-100/50 p-6 rounded-2xl space-y-1">
    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
      {label}
    </p>
    <p
      className={`text-lg font-black font-['Be_Vietnam_Pro'] ${highlight ? "text-[#0d631b]" : "text-gray-900"}`}
    >
      {value}
    </p>
  </div>
);

const CheckItem = ({
  label,
  status,
  passed,
}: {
  label: string;
  status: string;
  passed: boolean;
}) => (
  <div className="flex items-center justify-between p-3 rounded-full bg-green-50/50 border border-green-100/50">
    <div className="flex items-center gap-3">
      <span
        className="material-symbols-outlined text-[#0d631b] text-sm"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        check_circle
      </span>
      <span className="text-sm font-bold text-gray-700">{label}</span>
    </div>
    <span className="text-xs font-black text-[#0d631b]">{status}</span>
  </div>
);

export default RegistrationDetail;
