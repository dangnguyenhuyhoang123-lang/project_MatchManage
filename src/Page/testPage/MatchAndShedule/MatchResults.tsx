import React from "react";
import { Sidebar } from "../../../utils/SideBar";
import { useState } from "react";
import { Modal } from "../../../components/Modal";
import MatchResultUpdateModal from "./MatchResultUpdate";

const MatchResults: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-sans flex">
      {/* SideNavBar */}
      <Sidebar />

      {/* Main Wrapper */}
      <main className="ml-64 flex flex-col min-h-screen">
        {/* TopAppBar */}

        {/* Content Canvas */}
        <div className="p-8 flex-1">
          {/* Breadcrumb */}
          <nav className="flex text-xs font-medium text-on-surface-variant/60 mb-2 gap-2 items-center">
            <a className="hover:text-primary transition-colors" href="#">
              Trang chủ
            </a>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <a className="hover:text-primary transition-colors" href="#">
              Quản lý trận đấu
            </a>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-on-surface">Danh sách kết quả</span>
          </nav>

          {/* Page Title & Main Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-4xl font-black text-on-surface tracking-tight mb-2 font-headline">
                Kết Quả Trận Đấu
              </h2>
              <p className="text-on-surface-variant max-w-md">
                Theo dõi và quản lý các kết quả thi đấu trong hệ thống quốc gia.
              </p>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="bg-gradient-to-r from-primary to-primary-container text-green rounded-full px-8 py-4 font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 flex items-center justify-center gap-2 transition-all group"
            >
              <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">
                add
              </span>
              Thêm kết quả mới
            </button>
          </div>

          {/* Filters Bento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="md:col-span-1 bg-surface-container-low p-4 rounded-lg flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 px-1">
                Chọn Giải đấu
              </label>
              <select className="bg-surface-container-lowest border-none rounded-md text-sm font-medium focus:ring-2 focus:ring-primary/20 p-2 text-on-surface outline-none cursor-pointer">
                <option>V-League 1</option>
                <option>V-League 2</option>
                <option>Cúp Quốc gia</option>
              </select>
            </div>

            <div className="md:col-span-1 bg-surface-container-low p-4 rounded-lg flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 px-1">
                Chọn Mùa giải
              </label>
              <select className="bg-surface-container-lowest border-none rounded-md text-sm font-medium focus:ring-2 focus:ring-primary/20 p-2 text-on-surface outline-none cursor-pointer">
                <option>2023 - 2024</option>
                <option>2022 - 2023</option>
                <option>2021 - 2022</option>
              </select>
            </div>

            <div className="md:col-span-2 bg-surface-container-low p-4 rounded-lg flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 px-1">
                Tìm kiếm nhanh
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                  search
                </span>
                <input
                  className="w-full bg-surface-container-lowest border-none rounded-md text-sm font-medium focus:ring-2 focus:ring-primary/20 pl-10 p-2 text-on-surface outline-none"
                  placeholder="Tên câu lạc bộ hoặc mã trận..."
                  type="text"
                />
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="flex flex-col gap-3">
            {/* Header row */}
            <div className="grid grid-cols-12 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">
              <div className="col-span-2">Thời gian & Vòng</div>
              <div className="col-span-5 text-center">Trận đấu & Tỉ số</div>
              <div className="col-span-2">Sân vận động</div>
              <div className="col-span-2 text-center">Trạng thái</div>
              <div className="col-span-1 text-right">Thao tác</div>
            </div>

            {/* Match Row 1 */}
            <div className="grid grid-cols-12 items-center px-6 py-5 bg-surface-container-lowest rounded-DEFAULT border border-outline-variant/10 hover:shadow-xl hover:shadow-black/5 transition-all group">
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-sm font-bold text-on-surface">
                  15/10/2023
                </span>
                <span className="text-[10px] font-black bg-surface-container px-2 py-0.5 rounded inline-block w-fit text-primary uppercase">
                  Vòng 12
                </span>
              </div>
              <div className="col-span-5 flex items-center justify-between px-8">
                <div className="flex flex-col items-center gap-2 w-32">
                  <img
                    alt="Hanoi FC Logo"
                    className="w-10 h-10 object-contain"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxOVRyD5l0_LG4k4eisU9S_AKZeH5Y_OtFQoSJFP3DNVIYXMoxCuykgV45ISv-CoLzAy3fkWwO7b_XKTrG4BaZg2Le3zBIvxIwd-i5SAQ2EQD7Ntr1gxshFkB0F8BKK_ehyvlYlHbwXhIePl3eJvEItB6VvFs223ZCv7zfyBV4yDJjKrt-1ffWrA_zl9HcASoUWIaVR7ScH64_iXwxaOsuSGZZwLcB0IBsU3u1gin6bCaUGk7nQNNLP8kt38a9LVrtcI705un0zQ"
                  />
                  <span className="text-xs font-black text-on-surface uppercase tracking-tight">
                    Hà Nội FC
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-black font-headline tracking-tighter text-on-surface flex items-center gap-3">
                    <span>3</span>
                    <span className="text-on-surface-variant/20 text-xl">
                      -
                    </span>
                    <span>1</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-medium mt-1">
                    Full Time
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 w-32">
                  <img
                    alt="Hai Phong FC Logo"
                    className="w-10 h-10 object-contain"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAROOm03ZAcM2ayqSzFSI6U_k6mPgKOZNNn1u2ksyZu1Cvh9GfIg7-vfhMag67_5xpq7VwTJJwxwXnz1yilqMsGsYqEoPUUtJWkwj24PxKKpbr_BYsUFC9lI3hO6TOc8WhA4xWrCNUUKuvZIJchE4IKJ2K7Umxa3z6Zm3aC7xWAvSo4n_FrwYYDmkBXyc7bquFuxLkBVXJSfPMpvVyRULdlb6_2G1spaX1tmFXPdex2yaJq9oLLpFCiNlxSV0em8avOEs-YyyPckg"
                  />
                  <span className="text-xs font-black text-on-surface uppercase tracking-tight">
                    Hải Phòng
                  </span>
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">
                  location_on
                </span>
                <span className="text-sm font-medium text-on-surface-variant">
                  Sân Hàng Đẫy
                </span>
              </div>
              <div className="col-span-2 flex justify-center">
                <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Đã kết thúc
                </span>
              </div>
              <div className="col-span-1 flex justify-end gap-2">
                <button className="p-2 hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors rounded-full">
                  <span className="material-symbols-outlined text-xl">
                    edit
                  </span>
                </button>
                <button className="p-2 hover:bg-error-container text-on-surface-variant hover:text-error transition-colors rounded-full">
                  <span className="material-symbols-outlined text-xl">
                    delete
                  </span>
                </button>
              </div>
            </div>

            {/* Match Row 2 */}
            <div className="grid grid-cols-12 items-center px-6 py-5 bg-surface-container-lowest rounded-DEFAULT border border-outline-variant/10 hover:shadow-xl hover:shadow-black/5 transition-all group">
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-sm font-bold text-on-surface">
                  16/10/2023
                </span>
                <span className="text-[10px] font-black bg-surface-container px-2 py-0.5 rounded inline-block w-fit text-primary uppercase">
                  Vòng 12
                </span>
              </div>
              <div className="col-span-5 flex items-center justify-between px-8">
                <div className="flex flex-col items-center gap-2 w-32">
                  <img
                    alt="HAGL Logo"
                    className="w-10 h-10 object-contain"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC8JJuI68flxveW1cMowJZbc7Re4sL9dkgpKoscO0t7u6GqFsizuE6aJJEbRriCqVB0bEV7HD6BMPF5P289n_oyFIY2MOWY_64o148Vl4eENify9iS2dixKz10RBKcPm1_HCrqLN2efNtCkg6B53aqI5_2nmMjq52BImaNxdKo1btfbyU9za5XfhaLCYHbAWsucZMD34PhEyr9L6t9NvH3YYEC2xS2Ids7pz32Fk4Rwn-a9ateh6kJs7RtZioGPwjR4ocJDUHYIA"
                  />
                  <span className="text-xs font-black text-on-surface uppercase tracking-tight text-center">
                    HAGL
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-black font-headline tracking-tighter text-on-surface flex items-center gap-3">
                    <span>2</span>
                    <span className="text-on-surface-variant/20 text-xl">
                      -
                    </span>
                    <span>2</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-medium mt-1">
                    Full Time
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 w-32">
                  <img
                    alt="CAHN Logo"
                    className="w-10 h-10 object-contain"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe7DGYcrw5c0DLtGUExvVd5gqhl1W-K9bx1BvpAq3ExGFtwuhX0T56gfeOhDd8tdTLtjGwoWoy3GBy9DDikncERx0ftAYdGaD3DBketofxmCIo0JJ1nidmM3e-TlXgOIDzhM3otBhhqPCLd7oG6GMxNXHd0V-p7Dp0jfXEbKP8b101ploQuQ54e_Uyu2TSw_dF3WaJTN-I7v5PY9bxDK40dtR6ggAddnsgwJLY4f-RwmHrA2wNsMBV6BtEH1_HC0P9UsOOgJVbYg"
                  />
                  <span className="text-xs font-black text-on-surface uppercase tracking-tight text-center">
                    CAHN
                  </span>
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">
                  location_on
                </span>
                <span className="text-sm font-medium text-on-surface-variant">
                  Sân Pleiku
                </span>
              </div>
              <div className="col-span-2 flex justify-center">
                <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Đã kết thúc
                </span>
              </div>
              <div className="col-span-1 flex justify-end gap-2">
                <button className="p-2 hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors rounded-full">
                  <span className="material-symbols-outlined text-xl">
                    edit
                  </span>
                </button>
                <button className="p-2 hover:bg-error-container text-on-surface-variant hover:text-error transition-colors rounded-full">
                  <span className="material-symbols-outlined text-xl">
                    delete
                  </span>
                </button>
              </div>
            </div>

            {/* Match Row 3 */}
            <div className="grid grid-cols-12 items-center px-6 py-5 bg-surface-container-lowest rounded-DEFAULT border border-outline-variant/10 hover:shadow-xl hover:shadow-black/5 transition-all group">
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-sm font-bold text-on-surface">
                  17/10/2023
                </span>
                <span className="text-[10px] font-black bg-surface-container px-2 py-0.5 rounded inline-block w-fit text-primary uppercase">
                  Vòng 12
                </span>
              </div>
              <div className="col-span-5 flex items-center justify-between px-8">
                <div className="flex flex-col items-center gap-2 w-32">
                  <img
                    alt="Binh Duong Logo"
                    className="w-10 h-10 object-contain"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCy3VTOU4V0ZJpPXijE5EM6ZDT3nnTd7ROTfUiJYIFZzdk1ku83tvIwsHcJVRLwoyxuJGDB5RCl8gwj6Fbb4xJw2f4HbGoj19OMf-hE-4UJqQV9HScf4ca8gu_1q3UXFdfNkjlhn44IZCF8UHB13-YJog0X--TcR3VR5OX91S3lEPRC5InTeLOEml0fvOlpEI568FTvKhyxSV0mLfccFqAoaz5S84FvaNh7gqPtVndu43LMy3jk4OggHW60J21aG5tbYZVjxExPBA"
                  />
                  <span className="text-xs font-black text-on-surface uppercase tracking-tight text-center">
                    B. Bình Dương
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-black font-headline tracking-tighter text-on-surface flex items-center gap-3">
                    <span>0</span>
                    <span className="text-on-surface-variant/20 text-xl">
                      -
                    </span>
                    <span>2</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-medium mt-1">
                    Full Time
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 w-32">
                  <img
                    alt="Thanh Hoa Logo"
                    className="w-10 h-10 object-contain"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDb40pFNs8sekUSZAa5pDjpix_q1QvsKk_3tLoHDR1Zo9PSlcUWMvxig6V4OC-SCCWkff-o4lvsjmrsta31kVvHoiSz7brIfumfNXPYRQ6t7Lox7syKpzdo0qiu_zgomunXNCqfQ6XYUR4fAK9rexO9mEJ0ZzLEbCfZkMYGLFbHUVChCtHCdzNrE7JZiZg0HK8iS5wDqeDGq07Ai0xCInZG9jrSua65Vj-_L5AytkNnaqk_Z1A-05ceFVFUnnOo-YnbVG5X6QNN6Q"
                  />
                  <span className="text-xs font-black text-on-surface uppercase tracking-tight text-center">
                    Thanh Hóa
                  </span>
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">
                  location_on
                </span>
                <span className="text-sm font-medium text-on-surface-variant">
                  Sân Gò Đậu
                </span>
              </div>
              <div className="col-span-2 flex justify-center">
                <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Đã kết thúc
                </span>
              </div>
              <div className="col-span-1 flex justify-end gap-2">
                <button className="p-2 hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors rounded-full">
                  <span className="material-symbols-outlined text-xl">
                    edit
                  </span>
                </button>
                <button className="p-2 hover:bg-error-container text-on-surface-variant hover:text-error transition-colors rounded-full">
                  <span className="material-symbols-outlined text-xl">
                    delete
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-between">
            <span className="text-sm text-on-surface-variant">
              Hiển thị 3 trên tổng số 42 trận đấu
            </span>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-md shadow-primary/20">
                1
              </button>
              <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-all">
                2
              </button>
              <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-all">
                3
              </button>
              <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto py-8 px-8 flex justify-between items-center text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">
          <span>© 2024 VFF - Elite Pitch Manager</span>
          <span>Phiên bản 1.2.0-Tactical</span>
        </div>
      </main>
      <Modal open={open} onClose={() => setOpen(false)}>
        <MatchResultUpdateModal onClose={() => setOpen(false)} />
      </Modal>
    </div>
  );
};

export default MatchResults;
