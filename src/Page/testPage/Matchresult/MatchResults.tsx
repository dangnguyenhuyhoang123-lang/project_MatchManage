import React, { useState } from "react";
import { Modal } from "../../../components/Modal";
import MatchResultUpdateModal from "./MatchResultUpdate";
import { AppLayout } from "../../../components/AppLayout";
import { PageHeader } from "../../../components/PageHeader";
import MatchResultUpdate from "./MatchResultUpdate";

type MatchItem = {
  home: string;
  away: string;
  scoreHome: number;
  scoreAway: number;
  league: string;
  round: string;
  date: string;
  homeIconColor: string;
  awayIconColor: string;
  roundClassName: string;
};

const matches: MatchItem[] = [
  {
    home: "Man City",
    away: "Arsenal",
    scoreHome: 2,
    scoreAway: 1,
    league: "Premier League",
    round: "Vòng 30",
    date: "15/04/2024",
    homeIconColor: "text-[#0D631B]",
    awayIconColor: "text-[#BA1A1A]",
    roundClassName: "bg-[#E0E0FF] text-[#27308A]",
  },
  {
    home: "Liverpool",
    away: "Chelsea",
    scoreHome: 1,
    scoreAway: 1,
    league: "Premier League",
    round: "Vòng 30",
    date: "14/04/2024",
    homeIconColor: "text-[#BA1A1A]",
    awayIconColor: "text-[#4C56AF]",
    roundClassName: "bg-[#E0E0FF] text-[#27308A]",
  },
  {
    home: "Real Madrid",
    away: "Bayern",
    scoreHome: 3,
    scoreAway: 0,
    league: "Champions League",
    round: "Tứ kết",
    date: "10/04/2024",
    homeIconColor: "text-[#1B1C1A]",
    awayIconColor: "text-[#0D631B]",
    roundClassName: "bg-[#ABF4AC80] text-[#07521D]",
  },
];

const MatchResults: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <AppLayout>
      <PageHeader
        title="Kết Quả Trận Đấu"
        description="Theo dõi và quản lý các kết quả thi đấu trong hệ thống quốc gia."
        buttonText="Thêm kết quả mới"
        onButtonClick={() => setOpen(true)}
      />

      <main className="flex-1 overflow-y-auto p-8 bg-surface">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Filters */}
          <div
            className="
    flex
    flex-col
    md:flex-row
    items-center
    gap-4

    bg-[#F5F3EF]
    border
    border-[#E4E2DE]

    rounded-[28px]

    px-5
    py-4

    shadow-[0_4px_12px_rgba(27,28,26,0.03)]
  "
          >
            {/* Search */}
            <div className="flex-1 relative w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#707A6C] text-[22px]">
                search
              </span>

              <input
                className="
        w-full
        h-[56px]

        bg-[#ECE9E4]

        rounded-[18px]

        border-none
        outline-none

        pl-12
        pr-4

        text-[16px]
        text-[#1B1C1A]

        placeholder:text-[#8B8B8B]

        focus:ring-2
        focus:ring-[#D8D4CE]
      "
                placeholder="Tìm kiếm trận đấu..."
                type="text"
              />
            </div>

            {/* Right Filters */}
            <div className="flex gap-4 w-full md:w-auto">
              {/* League */}
              <div className="relative">
                <select
                  className="
          appearance-none

          h-[56px]
          min-w-[220px]

          bg-[#ECE9E4]

          rounded-[18px]

          px-5
          pr-10

          text-[16px]
          text-[#1B1C1A]

          border-none
          outline-none

          focus:ring-2
          focus:ring-[#D8D4CE]
        "
                >
                  <option>Tất cả Giải đấu</option>
                </select>

                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#707A6C] text-[20px] pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Season */}
              <div className="relative">
                <select
                  className="
          appearance-none

          h-[56px]
          min-w-[190px]

          bg-[#ECE9E4]

          rounded-[18px]

          px-5
          pr-10

          text-[16px]
          text-[#1B1C1A]

          border-none
          outline-none

          focus:ring-2
          focus:ring-[#D8D4CE]
        "
                >
                  <option>Mùa 2023-2024</option>
                </select>

                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#707A6C] text-[20px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="space-y-2">
            {/* Header */}
            <div
              className="
    grid
    grid-cols-12
    gap-4
    px-6
    py-4
    hidden
    md:grid
    text-[#5C67D6]
    text-[14px]
    font-[800]
    uppercase
    tracking-[0.08em]
    font-headline
  "
            >
              <div className="col-span-4">TRẬN ĐẤU</div>

              <div className="col-span-2 text-center">TỶ SỐ</div>

              <div className="col-span-2">GIẢI ĐẤU</div>

              <div className="col-span-1">VÒNG ĐẤU</div>

              <div className="col-span-2">NGÀY</div>

              <div className="col-span-1 text-right">THAO TÁC</div>
            </div>

            {/* Rows */}
            {matches.map((match, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-4 bg-surface-container-lowest rounded-DEFAULT shadow-[0_4px_12px_rgba(27,28,26,0.03)] hover:shadow-[0_8px_24px_rgba(27,28,26,0.06)] transition-shadow duration-300"
              >
                {/* Teams */}
                <div className="col-span-4 flex items-center justify-between md:justify-start gap-4">
                  <div className="flex items-center gap-3 w-[45%] justify-end">
                    <span className="font-headline font-semibold text-body-md text-on-surface text-right">
                      {match.home}
                    </span>

                    <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                      <span
                        className={`material-symbols-outlined text-[16px] ${match.homeIconColor}`}
                      >
                        shield
                      </span>
                    </div>
                  </div>

                  <span className="text-label-sm text-on-surface-variant font-medium shrink-0">
                    vs
                  </span>

                  <div className="flex items-center gap-3 w-[45%]">
                    <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                      <span
                        className={`material-symbols-outlined text-[16px] ${match.awayIconColor}`}
                      >
                        shield
                      </span>
                    </div>

                    <span className="font-headline font-semibold text-body-md text-on-surface">
                      {match.away}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="col-span-2 flex justify-center items-center">
                  <div className="px-4 py-1 bg-surface-container-high rounded-full flex gap-2 items-center font-display font-bold text-lg text-on-surface">
                    <span>{match.scoreHome}</span>

                    <span className="text-on-surface-variant text-sm font-normal">
                      -
                    </span>

                    <span>{match.scoreAway}</span>
                  </div>
                </div>

                {/* League */}
                <div className="col-span-2 flex flex-col md:block">
                  <span className="text-body-sm text-on-surface font-medium">
                    {match.league}
                  </span>
                </div>

                {/* Round */}
                <div className="col-span-1 flex flex-col md:block">
                  <span
                    className={`inline-block px-2 py-1 text-label-sm rounded-sm ${match.roundClassName}`}
                  >
                    {match.round}
                  </span>
                </div>

                {/* Date */}
                <div className="col-span-2 flex flex-col md:block text-body-sm text-on-surface-variant">
                  {match.date}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-end gap-2">
                  <button
                    className="p-2 text-on-surface-variant hover:text-secondary hover:bg-secondary-fixed/50 rounded-full transition-colors"
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      edit
                    </span>
                  </button>

                  <button
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/50 rounded-full transition-colors"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="mt-auto py-8 px-8 flex justify-between items-center text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">
        <span>© 2024 VFF - Elite Pitch Manager</span>
        <span>Phiên bản 1.2.0-Tactical</span>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <MatchResultUpdate onClose={() => setOpen(false)} />
      </Modal>
    </AppLayout>
  );
};

export default MatchResults;
