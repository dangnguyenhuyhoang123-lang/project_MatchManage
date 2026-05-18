import React, { useEffect, useState } from "react";

import AddMatchModal from "./AddMatchModal";
import { Modal } from "../../../components/Modal";
import { AppLayout } from "../../../components/AppLayout";
import { PhanTrang } from "../../../utils/PhanTrang";

import { MatchModel } from "../../../model/Match/MatchModel";

import MatchService from "../../../services/MatchService";
import LeagueService from "../../../services/LeagueService";
import RoundService from "../../../services/RoundService";

export default function MatchSchedule() {
  const [open, setOpen] = useState(false);
  const [matches, setMatches] = useState<MatchModel[]>([]);
  const [editingMatch, setEditingMatch] = useState<MatchModel | null>(null);

  const handleSaveMatch = async (payload: any) => {
    try {
      if (editingMatch) {
        await MatchService.updateMatch(editingMatch.id!, payload);
      } else {
        await MatchService.addMatch(payload);
      }
      setOpen(false);
      setEditingMatch(null);
      fetchMatches(trangHienTai);
    } catch (error) {
      console.error("Lỗi khi lưu trận đấu:", error);
      alert("Có lỗi xảy ra khi lưu trận đấu!");
    }
  };

  const handleDeleteMatch = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa trận đấu này?")) {
      try {
        await MatchService.deleteMatch(id);
        fetchMatches(trangHienTai);
      } catch (error) {
        console.error("Lỗi khi xóa trận đấu:", error);
        alert("Có lỗi xảy ra khi xóa trận đấu!");
      }
    }
  };

  const [leagues, setLeagues] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);

  const [selectedLeague, setSelectedLeague] = useState<number | "">(1);
  const [selectedSeason, setSelectedSeason] = useState<number | "">(1);
  const [selectedRound, setSelectedRound] = useState<number | "">("");

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await LeagueService.getAllLeaguesNormalized(0, 100);
        setLeagues(response.content || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách giải đấu:", error);
      }
    };
    fetchLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      const fetchSeasons = async () => {
        try {
          const response = await LeagueService.getSeasonsByLeague(Number(selectedLeague));
          setSeasons(response);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách mùa giải:", error);
        }
      };
      fetchSeasons();
    } else {
      setSeasons([]);
    }
  }, [selectedLeague]);

  useEffect(() => {
    if (selectedSeason) {
      const fetchRounds = async () => {
        try {
          const response = await RoundService.getAllRoundsNormalized(0, 100, Number(selectedSeason));
          setRounds(response.content || []);
        } catch (error) {
          console.error("Lỗi lấy dữ liệu vòng đấu:", error);
          setRounds([]);
        }
      };
      fetchRounds();
    } else {
      setRounds([]);
    }
  }, [selectedSeason]);

  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoTrang, setTongSoTrang] = useState(0);
  const [tongSoPhanTu, setTongSoPhanTu] = useState(0);

  const SO_TRAN_MOI_TRANG = 8;

  const [filters, setFilters] = useState({
    status: "Tất cả trạng thái",
    search: "",
  });

  /* ================= FETCH ================= */
  const fetchMatches = async (page = 1) => {
    try {
      const res = await MatchService.getAllMatches(
        page - 1,
        SO_TRAN_MOI_TRANG,
        {
          ...filters,
          seasonId: selectedSeason ? selectedSeason : undefined,
          roundId: selectedRound ? selectedRound : undefined,
        }
      );

      const data = res.data;

      setMatches(data.content);
      setTongSoTrang(data.totalPages);
      setTongSoPhanTu(data.totalElements);
      setTrangHienTai(data.number + 1);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMatches(trangHienTai);
  }, [trangHienTai, filters, selectedSeason, selectedRound]);

  /* ================= FILTER ================= */
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = () => {
    setTrangHienTai(1);
  };

  /* ================= UI ================= */
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Title & Filters */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              <span className="text-green-700">Lịch Thi</span> Đấu
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Quản lý và cập nhật lịch thi đấu mới nhất
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold shadow-sm hover:bg-gray-50 outline-none appearance-none cursor-pointer"
              value={selectedLeague}
              onChange={(e) => {
                setSelectedLeague(e.target.value ? Number(e.target.value) : "");
                setSelectedSeason("");
                setSelectedRound("");
              }}
            >
              <option value="">-- Chọn Giải đấu --</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>{league.name}</option>
              ))}
            </select>

            <select
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold shadow-sm hover:bg-gray-50 outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              value={selectedSeason}
              onChange={(e) => {
                setSelectedSeason(e.target.value ? Number(e.target.value) : "");
                setSelectedRound("");
              }}
              disabled={!selectedLeague}
            >
              <option value="">-- Chọn Mùa giải --</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>{season.name || season.year}</option>
              ))}
            </select>

            <select
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold shadow-sm hover:bg-gray-50 outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value ? Number(e.target.value) : "")}
              disabled={!selectedSeason}
            >
              <option value="">-- Chọn Vòng đấu --</option>
              {rounds.map((round) => (
                <option key={round.id} value={round.id}>{round.name || `Vòng ${round.roundNumber}`}</option>
              ))}
            </select>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <div className="bg-[#f0ede6]/40 p-6 rounded-[2rem] border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-4 items-center w-full max-w-2xl">
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Trạng thái</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full bg-white rounded-xl p-3 border border-gray-100 text-sm font-bold shadow-sm outline-none"
                >
                  <option>Tất cả trạng thái</option>
                  <option value="SCHEDULED">Chưa diễn ra</option>
                  <option value="FINISHED">Đã kết thúc</option>
                  <option value="CONFLICT">Xung đột</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Tìm kiếm</label>
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Tên đội..."
                  className="w-full bg-white rounded-xl p-3 border border-gray-100 text-sm font-bold shadow-sm outline-none"
                />
              </div>
            </div>
            
            <button
              onClick={() => { setEditingMatch(null); setOpen(true); }}
              className="bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-green-800 transition-colors whitespace-nowrap"
            >
              + Thêm trận đấu
            </button>
          </div>

          {/* TABLE */}
          <div className="space-y-3 min-h-[600px] mt-6">
            {/* HEADER */}
            <div className="grid grid-cols-12 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 pt-4 border-t border-gray-200/60">
              <div className="col-span-2">Thời gian</div>
              <div className="col-span-4 text-center">Trận đấu</div>
              <div className="col-span-3">Sân</div>
              <div className="col-span-2 text-right">Trạng thái</div>
              <div className="col-span-1"></div>
            </div>

          {/* ROWS */}
          {[
            ...matches,
            ...Array(Math.max(0, SO_TRAN_MOI_TRANG - matches.length)).fill(
              null,
            ),
          ].map((match, index) =>
            match ? (
              <MatchRow 
                key={match.id ?? index} 
                match={match} 
                onEdit={(m) => { setEditingMatch(m); setOpen(true); }} 
                onDelete={handleDeleteMatch} 
              />
            ) : (
              <MatchSkeleton key={index} />
            ),
          )}

          {/* PAGINATION */}
          <div className="flex justify-between items-center pt-6 border-t">
            <p className="text-sm">
              Hiển thị{" "}
              <b>
                {tongSoPhanTu === 0
                  ? "0"
                  : `${(trangHienTai - 1) * SO_TRAN_MOI_TRANG + 1} - ${Math.min(
                      trangHienTai * SO_TRAN_MOI_TRANG,
                      tongSoPhanTu,
                    )}`}
              </b>{" "}
              trong {tongSoPhanTu} trận
            </p>

            <PhanTrang
              tongSoTrang={tongSoTrang}
              trangHienTai={trangHienTai}
              xuLyTrang={(p) => setTrangHienTai(p)}
            />
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setEditingMatch(null); }}>
        {open && (
          <AddMatchModal
            onClose={() => { setOpen(false); setEditingMatch(null); }}
            initialData={editingMatch}
            onSave={handleSaveMatch}
          />
        )}
      </Modal>
      </div>
    </AppLayout>
  );
}

/* ================= ROW ================= */
function MatchRow({ match, onEdit, onDelete }: { match: MatchModel; onEdit: (m: MatchModel) => void; onDelete: (id: number) => void }) {
  const date = new Date(match.matchDate);

  const isConflict = match.status === "CONFLICT";

  const renderStatus = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <span className="px-3 py-1 text-xs rounded-full font-bold bg-blue-100 text-blue-600">Chưa diễn ra</span>;
      case "FINISHED":
        return <span className="px-3 py-1 text-xs rounded-full font-bold bg-green-100 text-green-600">Đã kết thúc</span>;
      case "CONFLICT":
        return <span className="px-3 py-1 text-xs rounded-full font-bold bg-red-100 text-red-600">Xung đột</span>;
      default:
        return <span className="px-3 py-1 text-xs rounded-full font-bold bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  return (
    <div
      className={`grid grid-cols-12 items-center p-6 rounded-xl transition-all
        ${
          isConflict
            ? "bg-red-50 border-2 border-red-200"
            : "bg-white shadow-sm hover:shadow-md"
        }`}
    >
      {/* TIME */}
      <div className="col-span-2">
        <p className={`text-sm font-bold ${isConflict ? "text-red-500" : ""}`}>
          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="text-xs text-gray-400">{date.toLocaleDateString()}</p>
      </div>

      {/* MATCH */}
      <div className="col-span-4 flex items-center justify-center gap-6">
        {/* HOME */}
        <div className="flex flex-col items-center gap-1 w-24">
          <img
            src={match.homeTeam?.logo || "/default.png"}
            className="w-10 h-10 object-contain"
          />
          <span className="text-xs font-bold text-center">
            {match.homeTeam?.name}
          </span>
        </div>

        <div className="text-lg font-black text-gray-300 italic">VS</div>

        {/* AWAY */}
        <div className="flex flex-col items-center gap-1 w-24">
          <img
            src={match.awayTeam?.logo || "/default.png"}
            className="w-10 h-10 object-contain"
          />
          <span className="text-xs font-bold text-center">
            {match.awayTeam?.name}
          </span>
        </div>
      </div>

      {/* STADIUM */}
      <div className="col-span-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-gray-400">
          location_on
        </span>
        <span
          className={`text-sm ${isConflict ? "text-red-500 font-bold" : ""}`}
        >
          {match.league?.name}
        </span>
      </div>

      {/* STATUS */}
      <div className="col-span-2 text-right">
        {renderStatus(match.status)}
      </div>

      {/* ACTION */}
      <div className="col-span-1 flex justify-end gap-1">
        <button onClick={() => onEdit(match)} className="p-1.5 hover:bg-gray-100 rounded-full">
          <span className="material-symbols-outlined text-sm">edit</span>
        </button>

        <button onClick={() => onDelete(match.id!)} className="p-1.5 hover:bg-red-100 rounded-full text-red-500">
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>
    </div>
  );
}

/* ================= SKELETON ================= */
function MatchSkeleton() {
  return (
    <div className="grid grid-cols-12 p-5 bg-white/50 rounded-xl animate-pulse">
      <div className="col-span-12 h-4 bg-gray-200 rounded"></div>
    </div>
  );
}
