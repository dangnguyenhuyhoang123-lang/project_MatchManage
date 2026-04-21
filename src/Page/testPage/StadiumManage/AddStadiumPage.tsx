import React, { useState } from "react";

// --- Sub-components ---

const SidebarItem: React.FC<{
  icon: string;
  label: string;
  active?: boolean;
}> = ({ icon, label, active }) => (
  <a
    href="#"
    className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 ${
      active
        ? "bg-white dark:bg-gray-800 text-green-700 font-bold shadow-sm scale-95"
        : "text-gray-600 dark:text-gray-400 hover:bg-white/50 hover:translate-x-1"
    }`}
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="text-sm">{label}</span>
  </a>
);

const FormSection: React.FC<{
  icon: string;
  title: string;
  children: React.ReactNode;
  iconBg: string;
  iconColor: string;
}> = ({ icon, title, children, iconBg, iconColor }) => (
  <section className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
    <div className="flex items-center gap-3 mb-6">
      <div
        className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </div>
    {children}
  </section>
);

// --- Main Page Component ---

const AddStadiumPage: React.FC = () => {
  const [grassType, setGrassType] = useState<"natural" | "artificial">(
    "natural",
  );

  return (
    <div className="bg-[#fbf9f5] text-gray-900 min-h-screen flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 bg-[#f5f3ef] dark:bg-gray-900 p-4 gap-2 shrink-0 border-r border-transparent">
        <div className="flex items-center gap-3 px-2 py-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center text-white shadow-lg overflow-hidden">
            <span className="material-symbols-outlined">sports_soccer</span>
          </div>
          <div>
            <div className="text-lg font-black leading-tight text-gray-900 dark:text-white">
              Quốc gia
            </div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Quản lý vận hành
            </div>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          <SidebarItem icon="dashboard" label="Tổng quan" />
          <SidebarItem icon="stadium" label="Quản lý sân" active />
          <SidebarItem icon="calendar_month" label="Lịch thi đấu" />
          <SidebarItem icon="grass" label="Bảo trì mặt cỏ" />
          <SidebarItem icon="payments" label="Doanh thu" />
        </nav>

        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-gray-200/20">
          <button className="bg-green-800 text-white py-3 px-4 rounded-full font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all mb-4">
            Báo cáo sự cố
          </button>
          <SidebarItem icon="help" label="Trợ giúp" />
          <SidebarItem icon="logout" label="Đăng xuất" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex justify-between items-center w-full px-6 py-4 bg-white/80 backdrop-blur-md">
          <div className="text-xl font-bold tracking-tight">
            Quản lý Sân vận động
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <input
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-full border-none text-sm w-64 focus:ring-2 focus:ring-green-700/20"
                placeholder="Tìm kiếm hệ thống..."
                type="text"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                search
              </span>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold leading-none">
                  Admin Manager
                </div>
                <div className="text-xs text-gray-500">
                  Quản trị viên cấp cao
                </div>
              </div>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmObWyuNK-WKIBjcUk64Ix-20RgBZ16-imRPXpRPlNWmgR1wWr77vZhrMbEDDw_g8Wt8MnUamjit9kyAU2P9Ar8ZLGN6O0yEdRxGuc6U-8-hMEQseYZHVEmnLYN50QldKLJQjp1My3PW-wHFS8MC2eJ_dLO5pB4iGN9TwmhWhonvh5nxrqzkCdGRybC7rJr19Zlo1QXxKCuBNGSqg5uZzqUEV4b2AWXGE_RzXEncVm38mwfpIei8HT-o_rngr7PAH8yhvQr41Hvw"
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                alt="Admin"
              />
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-green-700 transition-colors">
              Quản lý sân thi đấu
            </a>
            <span className="material-symbols-outlined text-xs">
              chevron_right
            </span>
            <span className="text-green-700 font-bold">Thêm sân mới</span>
          </nav>

          <div className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              Thêm sân vận động mới
            </h1>
            <p className="text-gray-500">
              Điền thông tin chi tiết để khởi tạo hồ sơ quản lý cho sân vận động
              mới trong hệ thống.
            </p>
          </div>

          <form
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-8">
              <FormSection
                icon="info"
                title="Thông tin cơ bản"
                iconBg="bg-green-50"
                iconColor="text-green-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tên sân vận động
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-md bg-gray-100 border-none focus:ring-2 focus:ring-green-700/20"
                      placeholder="Nhập tên chính thức của sân"
                      type="text"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    <div className="relative">
                      <input
                        className="w-full pl-10 pr-4 py-3 rounded-md bg-gray-100 border-none focus:ring-2 focus:ring-green-700/20"
                        placeholder="Số nhà, đường, quận/huyện, thành phố"
                        type="text"
                      />
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        location_on
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Sức chứa (Người)
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-md bg-gray-100 border-none focus:ring-2 focus:ring-green-700/20"
                      placeholder="Ví dụ: 40000"
                      type="number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Năm khánh thành
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-md bg-gray-100 border-none focus:ring-2 focus:ring-green-700/20"
                      placeholder="YYYY"
                      type="text"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                icon="corporate_fare"
                title="Đơn vị quản lý & Kỹ thuật"
                iconBg="bg-blue-50"
                iconColor="text-blue-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Câu lạc bộ chủ quản
                    </label>
                    <select className="w-full px-4 py-3 rounded-md bg-gray-100 border-none focus:ring-2 focus:ring-green-700/20">
                      <option>Chọn câu lạc bộ</option>
                      <option>Hà Nội FC</option>
                      <option>Hải Phòng FC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Loại cỏ mặt sân
                    </label>
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-md">
                      <button
                        type="button"
                        onClick={() => setGrassType("natural")}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${grassType === "natural" ? "bg-white text-green-700 shadow-sm" : "text-gray-500"}`}
                      >
                        Tự nhiên
                      </button>
                      <button
                        type="button"
                        onClick={() => setGrassType("artificial")}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${grassType === "artificial" ? "bg-white text-green-700 shadow-sm" : "text-gray-500"}`}
                      >
                        Nhân tạo
                      </button>
                    </div>
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-8">
              <FormSection
                icon="image"
                title="Hình ảnh sân"
                iconBg="bg-orange-50"
                iconColor="text-orange-700"
              >
                <div className="group relative w-full aspect-video rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 hover:border-green-700/50 transition-colors cursor-pointer overflow-hidden">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnQm1B51VbznQGF5112z866SYgDZ1biR8m_KLfg_mFNMRx7N3_a5MUXMi_2kdgWRG9am04b7YRNjlOxrWLheuTZL1EPJfXaOn_huMNPzt7jJszH3uBFdEA-6qaS70M-NhYOM1I1pT-xZv80NfUDW1y4pJUcs26Xi_xxiCxVXkhGlm1xkDYpuH2xTe_rf6Wsz8sZfqlC6OoqDpau6-xASZ1vHwQNcsetEJbiT3vgE67w2-8J_hsGLDa6FoPnQ65r2JsnNAUluNBFg"
                    className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity"
                    alt="Preview"
                  />
                  <span className="material-symbols-outlined text-4xl text-gray-400 mb-2 group-hover:scale-110 group-hover:text-green-700 transition-all">
                    cloud_upload
                  </span>
                  <span className="text-sm font-bold text-gray-600 group-hover:text-green-700">
                    Tải lên ảnh đại diện
                  </span>
                  <span className="text-xs text-gray-400 mt-1 text-center">
                    Hỗ trợ JPG, PNG (Tối đa 5MB)
                  </span>
                </div>
                <div className="mt-6 p-3 rounded-md bg-gray-50 flex items-start gap-3">
                  <span className="material-symbols-outlined text-sm text-green-700">
                    verified
                  </span>
                  <p className="text-xs text-gray-500 italic">
                    Ảnh chất lượng cao sẽ giúp tăng uy tín cho sân trên hệ
                    thống.
                  </p>
                </div>
              </FormSection>

              {/* Actions */}
              <div className="sticky top-24 space-y-4">
                <button className="w-full py-4 rounded-full bg-gradient-to-r from-green-700 to-green-900 text-white font-black text-lg shadow-xl shadow-green-900/20 hover:scale-[1.02] active:scale-95 transition-all">
                  Lưu thông tin
                </button>
                <button className="w-full py-4 rounded-full bg-gray-200 text-gray-600 font-bold hover:bg-gray-300 transition-colors">
                  Hủy
                </button>
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-2">
                    <span>Tiến trình hoàn thiện</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-[65%] h-full bg-green-700 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Decorative background elements */}
        <div className="fixed -bottom-48 -right-48 w-96 h-96 bg-green-700/5 blur-[120px] rounded-full -z-10"></div>
        <div className="fixed top-1/4 -left-24 w-64 h-64 bg-blue-700/5 blur-[100px] rounded-full -z-10"></div>
      </main>
    </div>
  );
};

export default AddStadiumPage;
