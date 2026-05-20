import React, { useState, useEffect } from "react";
import PlayerService from "../../../../services/PlayerService";
import { Modal } from "../../../../components/Modal";
import type { SelectedPlayer } from "./RegisterFormMatch";

type Props = {
  setStep: (step: number) => void;
  mainPlayers?: SelectedPlayer[];
  subPlayers?: SelectedPlayer[];
  onPlayersChange?: (
    mainPlayers: SelectedPlayer[],
    subPlayers: SelectedPlayer[],
  ) => void;
};

const PlayerRegistration: React.FC<Props> = ({
  setStep,
  mainPlayers: initialMainPlayers = [],
  subPlayers: initialSubPlayers = [],
  onPlayersChange,
}) => {
  const [mainPlayers, setMainPlayers] =
    useState<SelectedPlayer[]>(initialMainPlayers);
  const [subPlayers, setSubPlayers] =
    useState<SelectedPlayer[]>(initialSubPlayers);

  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<"main" | "sub" | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchTeamPlayers = async () => {
      try {
        // Mặc định lấy dữ liệu cầu thủ của Becamex Bình Dương (teamId = 1)
        const response = await PlayerService.getAllPlayersNormalized(0, 100, {
          teamId: 1,
        });
        // Đề phòng backend chưa lọc, chúng ta lọc lại trên frontend
        const filtered = (response.content || []).filter(
          (p: any) => p.teamId === 1 || p.teamId === "1" || !p.teamId,
        );
        setAvailablePlayers(filtered);
      } catch (error) {
        console.error("Lỗi lấy cầu thủ của đội bóng:", error);
      }
    };
    fetchTeamPlayers();
  }, []);

  const calculateAge = (dob?: string) => {
    if (!dob) return "--";
    const year = new Date(dob).getFullYear();
    return new Date().getFullYear() - year;
  };

  const removeMainPlayer = (id: number) => {
    const nextMainPlayers = mainPlayers.filter((p) => p.id !== id);
    setMainPlayers(nextMainPlayers);
    onPlayersChange?.(nextMainPlayers, subPlayers);
  };

  const removeSubPlayer = (id: number) => {
    const nextSubPlayers = subPlayers.filter((p) => p.id !== id);
    setSubPlayers(nextSubPlayers);
    onPlayersChange?.(mainPlayers, nextSubPlayers);
  };

  const openAddModal = (mode: "main" | "sub") => {
    setAddMode(mode);
    setSelectedPlayerIds([]);
    setIsModalOpen(true);
  };

  const toggleSelectPlayer = (id: number) => {
    if (selectedPlayerIds.includes(id)) {
      setSelectedPlayerIds(selectedPlayerIds.filter((pid) => pid !== id));
    } else {
      setSelectedPlayerIds([...selectedPlayerIds, id]);
    }
  };

  const handleConfirmSelection = () => {
    const playersToAdd = availablePlayers.filter((p) =>
      selectedPlayerIds.includes(p.id),
    );
    if (addMode === "main") {
      const nextMainPlayers = [...mainPlayers, ...playersToAdd].slice(0, 11);
      setMainPlayers(nextMainPlayers);
      onPlayersChange?.(nextMainPlayers, subPlayers);
    } else if (addMode === "sub") {
      const nextSubPlayers = [...subPlayers, ...playersToAdd].slice(0, 7);
      setSubPlayers(nextSubPlayers);
      onPlayersChange?.(mainPlayers, nextSubPlayers);
    }
    setIsModalOpen(false);
    setSelectedPlayerIds([]);
  };

  const allCurrentIds = new Set([
    ...mainPlayers.map((p) => p.id),
    ...subPlayers.map((p) => p.id),
  ]);
  const unselectedAvailablePlayers = availablePlayers.filter(
    (p) => !allCurrentIds.has(p.id),
  );

  const totalSelected = mainPlayers.length + subPlayers.length;

  return (
    <>
      {/* Warning Banner */}
      <div className="bg-[#fff9c4]/40 border border-[#fbc02d]/30 p-5 rounded-xl mb-8 flex items-start gap-4">
        <span className="material-symbols-outlined text-[#f57f17] text-2xl">
          warning
        </span>
        <div>
          <h3 className="font-bold text-[#f57f17] text-sm">
            Cần bổ sung cầu thủ
          </h3>
          <p className="text-[#f57f17]/80 text-xs mt-1">
            Danh sách hiện có{" "}
            <span className="font-bold">{totalSelected}/18</span> cầu thủ.
            {totalSelected < 14 && (
              <> Cần thêm ít nhất {14 - totalSelected} cầu thủ nữa.</>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 pb-24">
        {/* Main List Section */}
        <div className="col-span-12 xl:col-span-7">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Đội hình Chính thức{" "}
              <span className="font-normal text-sm text-gray-400 ml-2">
                ({mainPlayers.length}/11 cầu thủ)
              </span>
            </h3>
            <button
              onClick={() => openAddModal("main")}
              disabled={mainPlayers.length >= 11}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#0d631b] text-xs font-bold rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">
                person_add
              </span>{" "}
              Thêm mới
            </button>
          </div>

          <div className="space-y-3">
            {mainPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      player.avatar ||
                      `https://placehold.co/100x100?text=${player.position || "Player"}`
                    }
                    alt={player.name}
                    className="w-12 h-12 rounded-lg bg-gray-100 object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{player.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 font-bold rounded bg-blue-100 text-blue-700`}
                      >
                        {player.position || "Cầu thủ"}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {calculateAge(player.dateOfBirth)} tuổi • Chuyên nghiệp
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-[#0d631b]">
                    check_circle
                  </span>
                  <button
                    onClick={() => removeMainPlayer(player.id)}
                    className="material-symbols-outlined text-gray-300 hover:text-red-500 transition-colors"
                  >
                    delete
                  </button>
                </div>
              </div>
            ))}

            {mainPlayers.length < 11 && (
              <div
                onClick={() => openAddModal("main")}
                className="border-2 border-dashed border-gray-200 p-8 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-white hover:border-[#0d631b]/30 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-3xl mb-1">
                  add_circle
                </span>
                <p className="text-xs font-bold">
                  Nhấn để thêm cầu thủ chính thức
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Validation & Subs Section */}
        <div className="col-span-12 xl:col-span-5 space-y-6">
          {/* ĐỘI HÌNH DỰ BỊ */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Đội hình Dự bị{" "}
                <span className="font-normal text-sm text-gray-400 ml-2">
                  ({subPlayers.length}/7 cầu thủ)
                </span>
              </h3>
              <button
                onClick={() => openAddModal("sub")}
                disabled={subPlayers.length >= 7}
                className="flex items-center gap-2 px-3 py-1.5 bg-white text-[#0d631b] text-xs font-bold rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">
                  person_add
                </span>{" "}
                Thêm
              </button>
            </div>

            <div className="bg-[#f5f3ef] p-4 rounded-2xl border border-gray-200 space-y-3 min-h-[150px]">
              {subPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 bg-white/80 p-3 rounded-lg shadow-sm border border-white relative group"
                >
                  <img
                    src={
                      player.avatar ||
                      `https://placehold.co/100x100?text=${player.position || "Player"}`
                    }
                    className="w-10 h-10 rounded-full bg-gray-100 object-cover"
                    alt="avatar"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">
                      {player.name}
                    </p>
                    <p className="text-[10px] text-[#4c56af] font-bold uppercase">
                      {player.position || "Cầu thủ"} •{" "}
                      {calculateAge(player.dateOfBirth)} tuổi
                    </p>
                  </div>

                  <button
                    onClick={() => removeSubPlayer(player.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      delete
                    </span>
                  </button>
                </div>
              ))}

              {subPlayers.length < 7 && (
                <div
                  onClick={() => openAddModal("sub")}
                  className="p-3 border border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-400 text-[11px] italic bg-white/20 hover:bg-white cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-sm">
                    info
                  </span>
                  Còn trống {7 - subPlayers.length} vị trí dự bị
                </div>
              )}
            </div>
          </section>

          {/* CARD VALIDATION */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0d631b]">
                fact_check
              </span>{" "}
              Kiểm tra tính hợp lệ
            </h3>

            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <span
                  className={`material-symbols-outlined ${totalSelected >= 14 ? "text-[#0d631b]" : "text-red-500"}`}
                >
                  {totalSelected >= 14 ? "check_circle" : "cancel"}
                </span>
                <div>
                  <p className="text-sm font-bold">Số lượng tối thiểu</p>
                  <p className="text-[11px] text-gray-400">
                    {totalSelected}/18 cầu thủ (cần tối thiểu 14)
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#0d631b]">
                  check_circle
                </span>
                <div>
                  <p className="text-sm font-bold">Độ tuổi hợp lệ</p>
                  <p className="text-[11px] text-gray-400">Tất cả hợp lệ</p>
                </div>
              </li>
            </ul>

            {/* progress */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase">
                  Độ sẵn sàng
                </span>
                <span className="text-xs font-black text-[#0d631b]">
                  {Math.min(Math.round((totalSelected / 18) * 100), 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0d631b] transition-all"
                  style={{
                    width: `${Math.min((totalSelected / 18) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ACTION FOOTER */}
      <div className="fixed bottom-10 left-64 right-0 flex justify-center px-10 pointer-events-none z-40">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-full p-4 flex items-center justify-between shadow-2xl w-full max-w-4xl pointer-events-auto">
          {/* INFO */}
          <div className="flex items-center gap-4 pl-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-700">
                groups
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {totalSelected}/18 cầu thủ
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Danh sách hiện tại
              </p>
            </div>
          </div>

          {/* ACTION */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-8 py-3 rounded-full text-gray-500 hover:bg-gray-50 font-bold text-sm transition-all"
            >
              Quay lại
            </button>

            <button
              onClick={() => setStep(4)}
              disabled={totalSelected < 14}
              className="px-10 py-3 rounded-full bg-green-700 text-white font-bold shadow-lg shadow-green-700/20 hover:scale-105 active:scale-95 transition-all text-sm disabled:opacity-50"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>

      {/* Modal Chọn Cầu Thủ */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6 md:p-8 max-w-2xl w-full bg-white rounded-3xl max-h-[85vh] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-900">
              Chọn cầu thủ {addMode === "main" ? "Chính thức" : "Dự bị"}
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Danh sách cầu thủ thuộc biên chế đội bóng (chưa được chọn)
          </p>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {unselectedAvailablePlayers.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-bold">
                Không còn cầu thủ nào để chọn
              </div>
            ) : (
              unselectedAvailablePlayers.map((player) => (
                <div
                  key={player.id}
                  onClick={() => toggleSelectPlayer(player.id)}
                  className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPlayerIds.includes(player.id)
                      ? "border-green-500 bg-green-50"
                      : "border-gray-100 hover:border-green-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      selectedPlayerIds.includes(player.id)
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {selectedPlayerIds.includes(player.id) && (
                      <span className="material-symbols-outlined text-white text-xs font-bold">
                        check
                      </span>
                    )}
                  </div>

                  <img
                    src={
                      player.avatar ||
                      `https://placehold.co/100x100?text=${player.position || "Player"}`
                    }
                    alt={player.name}
                    className="w-10 h-10 rounded-full bg-white object-cover border border-gray-100"
                  />

                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm">
                      {player.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {player.position || "Cầu thủ"} •{" "}
                      {calculateAge(player.dateOfBirth)} tuổi
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={selectedPlayerIds.length === 0}
              className="px-6 py-2.5 rounded-xl font-bold bg-green-700 text-white shadow-md hover:bg-green-800 disabled:opacity-50 transition-all"
            >
              Xác nhận chọn ({selectedPlayerIds.length})
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PlayerRegistration;
