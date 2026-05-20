import React from "react";
import { useState } from "react";
import { Modal } from "../../../components/Modal";

import { AppLayout } from "../../../layouts/AppLayout";
import { PageHeader } from "../../../components/PageHeader";
const MatchResults: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <AppLayout>
      {/* Main Wrapper */}

      {/* TopAppBar */}

      {/* Content Canvas */}

      {/* Breadcrumb */}
      {/* <nav className="flex text-xs font-medium text-on-surface-variant/60 mb-2 gap-2 items-center">
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
      </nav> */}

      {/* Page Title & Main Actions */}
      <PageHeader
        title="Kết Quả Trận Đấu"
        description="Theo dõi và quản lý các kết quả thi đấu trong hệ thống quốc gia."
        buttonText="Thêm kết quả mới"
        onButtonClick={() => setOpen(true)}
      />
      <main className="flex-1 overflow-y-auto p-8 bg-surface">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Filters Strip */}
          <div className="flex flex-col md:flex-row gap-4 p-4 bg-surface-container-low rounded-lg shadow-sm border border-outline-variant/15">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface-container-high border-none rounded-sm text-body-md text-on-surface focus:ring-1 focus:ring-outline-variant/50 focus:outline-none"
                placeholder="Tìm kiếm trận đấu..."
                type="text"
              />
            </div>
            <div className="flex gap-4">
              <select className="px-4 py-2 bg-surface-container-high border-none rounded-sm text-body-md text-on-surface focus:ring-1 focus:ring-outline-variant/50 appearance-none min-w-[160px] pr-10">
                <option>Tất cả Giải đấu</option>
                <option>Premier League</option>
                <option>Champions League</option>
              </select>
              <select className="px-4 py-2 bg-surface-container-high border-none rounded-sm text-body-md text-on-surface focus:ring-1 focus:ring-outline-variant/50 appearance-none min-w-[140px] pr-10">
                <option>Mùa 2023-2024</option>
                <option>Mùa 2022-2023</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="space-y-2">
            {/* Table Header (Visual Only) */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-label-sm font-semibold text-secondary uppercase tracking-wider hidden md:grid">
              <div className="col-span-4">Trận đấu</div>
              <div className="col-span-2 text-center">Tỷ số</div>
              <div className="col-span-2">Giải đấu</div>
              <div className="col-span-1">Vòng đấu</div>
              <div className="col-span-2">Ngày</div>
              <div className="col-span-1 text-right">Thao tác</div>
            </div>

            {/* Match Rows rendering */}
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="mt-auto py-8 px-8 flex justify-between items-center text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">
        <span>© 2024 VFF - Elite Pitch Manager</span>
        <span>Phiên bản 1.2.0-Tactical</span>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <MatchResultUpdateModal onClose={() => setOpen(false)} />
      </Modal>
    </AppLayout>
  );
};

export default MatchResults;
