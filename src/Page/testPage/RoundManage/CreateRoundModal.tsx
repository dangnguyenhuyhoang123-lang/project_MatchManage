import React from "react";

// ================= MAIN COMPONENT =================

export default function CreateRoundModal({ onClose }: { onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-[#fbf9f5] rounded-3xl shadow-2xl animate-fadeIn">
        <div className="p-6 md:p-10">
          <PageHeader onClose={onClose} />
          <FormLayout onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
// ================= PAGE CONTENT =================

function PageHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="mb-10 flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Thiết lập Vòng đấu mới
        </h1>
        <p className="text-[#707a6c] text-sm">
          Cấu hình thông số và lịch trình cho vòng đấu.
        </p>
      </div>

      <button
        onClick={onClose}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}

// ================= FORM LAYOUT =================

const FormLayout = ({ onClose }) => {
  return (
    <form className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Cột trái: Thông tin chính */}
      <div className="lg:col-span-8 space-y-6">
        {/* Box: Nhập liệu cơ bản */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_12px_48px_-12px_rgba(27,28,26,0.06)] border border-[#bfcaba]/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="round-name"
                className="text-sm font-bold text-[#40493d] px-1"
              >
                Tên vòng đấu
              </label>
              <input
                id="round-name"
                placeholder="Ví dụ: Vòng 1"
                className="bg-[#eae8e4]/50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#0d631b]/50 focus:ring-4 focus:ring-[#0d631b]/10 outline-none transition-all placeholder:text-[#707a6c]/50"
                type="text"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="season"
                className="text-sm font-bold text-[#40493d] px-1"
              >
                Mùa giải
              </label>
              <div className="relative">
                <select
                  id="season"
                  className="w-full bg-[#eae8e4]/50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#0d631b]/50 focus:ring-4 focus:ring-[#0d631b]/10 outline-none appearance-none transition-all font-medium cursor-pointer"
                >
                  <option>Mùa hè 2024</option>
                  <option>Mùa thu 2024</option>
                  <option>Cúp Quốc Gia 2024</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#707a6c]">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="start-date"
                className="text-sm font-bold text-[#40493d] px-1"
              >
                Thời gian bắt đầu dự kiến
              </label>
              <input
                id="start-date"
                type="datetime-local"
                className="w-full bg-[#eae8e4]/50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#0d631b]/50 focus:ring-4 focus:ring-[#0d631b]/10 outline-none transition-all cursor-pointer text-[#40493d]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="end-date"
                className="text-sm font-bold text-[#40493d] px-1"
              >
                Thời gian kết thúc dự kiến
              </label>
              <input
                id="end-date"
                type="datetime-local"
                className="w-full bg-[#eae8e4]/50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#0d631b]/50 focus:ring-4 focus:ring-[#0d631b]/10 outline-none transition-all cursor-pointer text-[#40493d]"
              />
            </div>
          </div>
        </div>

        {/* Box: Tùy chọn nâng cao */}
        <div className="bg-[#f5f3ef] p-8 rounded-3xl border border-[#bfcaba]/30 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-10 h-10 bg-[#959efd] rounded-full flex items-center justify-center text-[#27308a] shadow-inner">
              <span className="material-symbols-outlined text-[20px]">
                info
              </span>
            </div>
            <div>
              <h3 className="font-bold text-[#1b1c1a] text-lg">
                Lưu ý quản lý
              </h3>
              <p className="text-xs text-[#707a6c] mt-0.5">
                Hệ thống sẽ tự động thông báo cho các đội sau khi lưu.
              </p>
            </div>
          </div>

          <div className="space-y-4 relative z-10 pl-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer w-5 h-5 appearance-none border-2 border-[#bfcaba] rounded-md checked:bg-[#0d631b] checked:border-[#0d631b] transition-all cursor-pointer"
                />
                <span className="material-symbols-outlined absolute text-white text-[16px] pointer-events-none opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  check
                </span>
              </div>
              <span className="text-sm text-[#40493d] font-medium group-hover:text-[#1b1c1a] transition-colors mt-0.5">
                Gửi email thông báo lịch thi đấu cho các đội trưởng ngay lập
                tức.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="peer w-5 h-5 appearance-none border-2 border-[#bfcaba] rounded-md checked:bg-[#0d631b] checked:border-[#0d631b] transition-all cursor-pointer"
                />
                <span className="material-symbols-outlined absolute text-white text-[16px] pointer-events-none opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  check
                </span>
              </div>
              <span className="text-sm text-[#40493d] font-medium group-hover:text-[#1b1c1a] transition-colors mt-0.5">
                Tự động phân bổ trọng tài dựa trên lịch sử trận đấu.
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Cột phải: Thống kê & Action Buttons */}
      <div className="lg:col-span-4 space-y-6">
        {/* Bộ đếm số trận */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_12px_48px_-12px_rgba(27,28,26,0.06)] border border-[#bfcaba]/30 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#a3f69c] flex items-center justify-center rounded-2xl mb-4 shadow-sm transform -rotate-3">
            <span className="material-symbols-outlined text-[#002204] text-[32px] transform rotate-3">
              sports
            </span>
          </div>
          <label
            htmlFor="max-matches"
            className="text-base font-black text-[#1b1c1a] mb-2"
          >
            Số trận tối đa
          </label>
          <p className="text-xs text-[#707a6c] mb-8 leading-relaxed px-2">
            Tổng số trận đấu có thể tổ chức trong vòng này dựa trên sân bãi khả
            dụng.
          </p>

          <div className="flex items-center justify-between w-full bg-[#fbf9f5] rounded-full p-1 border border-[#bfcaba]/20">
            <button
              type="button"
              className="w-12 h-12 flex items-center justify-center bg-white rounded-full hover:bg-gray-50 hover:shadow-sm transition-all text-gray-500 active:scale-95"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <input
              id="max-matches"
              type="number"
              defaultValue="10"
              className="w-16 text-center bg-transparent border-none text-3xl font-black text-[#0d631b] focus:ring-0 p-0 m-0 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              className="w-12 h-12 flex items-center justify-center bg-white rounded-full hover:bg-gray-50 hover:shadow-sm transition-all text-gray-500 active:scale-95"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>

        {/* Card Trực quan (Mật độ lịch thi đấu) */}
        <div className="relative overflow-hidden rounded-3xl h-[180px] bg-gradient-to-br from-[#1d622b] to-[#0d631b] p-6 flex flex-col justify-end group shadow-md">
          {/* Overlay họa tiết sân cỏ (Dùng CSS thay cho hình ảnh gốc) */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent scale-150"></div>

          <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-1">
            <h4 className="font-black text-xl leading-tight mb-2 text-white">
              Mật độ lịch thi đấu
            </h4>
            <p className="text-xs text-[#cbffc2]/90 leading-relaxed font-medium">
              Vòng đấu này dự kiến sẽ kéo dài 4 ngày với mật độ thi đấu cao.
            </p>
          </div>
        </div>

        {/* Cụm Nút Lưu / Hủy */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            onClick={onClose}
            className="w-full py-4 bg-[#0d631b] text-white font-bold rounded-full shadow-lg shadow-[#0d631b]/20 hover:bg-[#0a4a14] hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">
              save
            </span>
            Lưu thông tin
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-4 bg-transparent text-[#707a6c] font-bold rounded-full hover:bg-[#eae8e4]/50 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
            Hủy bỏ
          </button>
        </div>
      </div>
    </form>
  );
};
