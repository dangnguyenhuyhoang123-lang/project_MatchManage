import React, { useState, useEffect, useMemo } from "react";
import LoadingSpinner from "../../../../components/Spinner/LoadingSpinner";
import PlayerService from "../../../../services/PlayerService";
import { Modal } from "../../../../components/Modal";
import type { SelectedPlayer } from "./RegisterFormMatch";
import { useCurrentClubId } from "../InfoClubManage/clubInfoHelpers";

type Props = {
  setStep: (step: number) => void;
  rule?: any;
  mainPlayers?: SelectedPlayer[];
  subPlayers?: SelectedPlayer[];
  onPlayersChange?: (
    mainPlayers: SelectedPlayer[],
    subPlayers: SelectedPlayer[],
  ) => void;
};

const PlayerRegistration: React.FC<Props> = ({
  setStep,
  rule,
  mainPlayers: initialMainPlayers = [],
  subPlayers: initialSubPlayers = [],
  onPlayersChange,
}) => {
  const { currentClubId, authLoading } = useCurrentClubId();
  const [mainPlayers, setMainPlayers] =
    useState<SelectedPlayer[]>(initialMainPlayers);
  const [subPlayers, setSubPlayers] =
    useState<SelectedPlayer[]>(initialSubPlayers);
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<"main" | "sub" | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchTeamPlayers = async () => {
      if (authLoading) return;

      if (!currentClubId) {
        setAvailablePlayers([]);
        setErrorMessage(
          "Không xác định được câu lạc bộ của người dùng đang đăng nhập.",
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        // Registration phải lấy Player gốc theo CLB, không lấy PlayerSeason.
        // PlayerSeason chỉ được backend tạo sau khi ADMIN duyệt hồ sơ.
        const response = await PlayerService.getPlayersByTeamNormalized(
          currentClubId,
          0,
          500,
        );
        setAvailablePlayers(response.content || []);
      } catch (error) {
        console.error("Lỗi lấy cầu thủ của đội bóng:", error);
        setAvailablePlayers([]);
        setErrorMessage(
          "Không thể tải danh sách cầu thủ thuộc biên chế câu lạc bộ.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamPlayers();
  }, [authLoading, currentClubId]);

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

  const minPlayersReq = rule?.minRegistrationPlayers || rule?.minPlayers || 14;
  const maxPlayersReq = rule?.maxPlayers || 30;
  const minAgeReq = rule?.minAge || 16;
  const maxAgeReq = rule?.maxAge || 40;
  const maxForeignReq =
    rule?.maxForeignPlayers !== null && rule?.maxForeignPlayers !== undefined
      ? rule.maxForeignPlayers
      : 3;

  // Age check
  const invalidAgePlayers = [...mainPlayers, ...subPlayers].filter((p) => {
    const age = calculateAge(p.dateOfBirth);
    if (age === "--") return false;
    const numericAge = Number(age);
    return numericAge < minAgeReq || numericAge > maxAgeReq;
  });

  // Foreign check
  const isForeignPlayer = (nationality?: string) => {
    if (!nationality) return false;
    const n = nationality
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    return n !== "viet nam" && n !== "vietnam";
  };
  const foreignPlayers = [...mainPlayers, ...subPlayers].filter((p: any) =>
    isForeignPlayer(p.nationality),
  );

  // Jersey check
  const duplicateShirts = useMemo(() => {
    const counts: Record<number, number> = {};
    [...mainPlayers, ...subPlayers].forEach((p) => {
      const num = p.shirtNumber ?? p.number;
      if (num != null) {
        counts[num] = (counts[num] || 0) + 1;
      }
    });
    return Object.keys(counts)
      .map(Number)
      .filter((num) => counts[num] > 1);
  }, [mainPlayers, subPlayers]);

  const duplicatePlayers = useMemo(() => {
    const ids = new Set<number>();
    const dupes: string[] = [];
    [...mainPlayers, ...subPlayers].forEach((p) => {
      if (ids.has(p.id)) {
        dupes.push(p.name);
      } else {
        ids.add(p.id);
      }
    });
    return dupes;
  }, [mainPlayers, subPlayers]);

  const hasValidationErrors =
    totalSelected < minPlayersReq ||
    totalSelected > maxPlayersReq ||
    invalidAgePlayers.length > 0 ||
    foreignPlayers.length > maxForeignReq ||
    duplicateShirts.length > 0 ||
    duplicatePlayers.length > 0;

  return (
    <>
      {hasValidationErrors ? (
        <div className="mb-8 flex items-start gap-4 rounded-xl border border-red-200 bg-red-50 p-5">
          <span className="material-symbols-outlined text-2xl text-red-600">
            error
          </span>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-red-800">
              Hồ sơ cầu thủ chưa hợp lệ
            </h3>
            <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
              {totalSelected < minPlayersReq && (
                <li>
                  Thiếu cầu thủ: Đã chọn {totalSelected} cầu thủ (cần tối thiểu{" "}
                  {minPlayersReq}).
                </li>
              )}
              {totalSelected > maxPlayersReq && (
                <li>
                  Vượt quá giới hạn: Đã chọn {totalSelected} cầu thủ (tối đa cho
                  phép {maxPlayersReq}).
                </li>
              )}
              {invalidAgePlayers.length > 0 && (
                <li>
                  Độ tuổi không hợp lệ:{" "}
                  {invalidAgePlayers
                    .map(
                      (p) => `${p.name} (${calculateAge(p.dateOfBirth)} tuổi)`,
                    )
                    .join(", ")}{" "}
                  (yêu cầu từ {minAgeReq} đến {maxAgeReq} tuổi).
                </li>
              )}
              {foreignPlayers.length > maxForeignReq && (
                <li>
                  Vượt số lượng ngoại binh: Đã chọn {foreignPlayers.length}{" "}
                  ngoại binh (tối đa cho phép {maxForeignReq}).
                </li>
              )}
              {duplicateShirts.length > 0 && (
                <li>
                  Trùng số áo: Số áo {duplicateShirts.join(", ")} bị trùng lặp.
                  Vui lòng kiểm tra lại.
                </li>
              )}
              {duplicatePlayers.length > 0 && (
                <li>
                  Trùng cầu thủ: Cầu thủ {duplicatePlayers.join(", ")} được chọn
                  nhiều lần.
                </li>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <div className="mb-8 flex items-start gap-4 rounded-xl border border-green-200 bg-green-50 p-5">
          <span className="material-symbols-outlined text-2xl text-green-600">
            check_circle
          </span>
          <div>
            <h3 className="text-sm font-bold text-green-800">
              Danh sách cầu thủ hợp lệ
            </h3>
            <p className="mt-1 text-xs text-green-700/80">
              Đã chọn {totalSelected} cầu thủ, tất cả đều thỏa mãn quy định của
              giải đấu.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-8 pb-24">
        <div className="col-span-12 xl:col-span-7">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              Đội hình Chính thức{" "}
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({mainPlayers.length}/11 cầu thủ)
              </span>
            </h3>
            <button
              onClick={() => openAddModal("main")}
              disabled={mainPlayers.length >= 11}
              className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-2 text-xs font-bold text-[#0d631b] shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      player.avatar ||
                      `https://placehold.co/100x100?text=${player.position || "Player"}`
                    }
                    alt={player.name}
                    className="h-12 w-12 rounded-lg bg-gray-100 object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{player.name}</h4>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
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
                    className="material-symbols-outlined text-gray-300 transition-colors hover:text-red-500"
                  >
                    delete
                  </button>
                </div>
              </div>
            ))}

            {mainPlayers.length < 11 && (
              <div
                onClick={() => openAddModal("main")}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-8 text-gray-400 transition-all hover:border-[#0d631b]/30 hover:bg-white"
              >
                <span className="material-symbols-outlined mb-1 text-3xl">
                  add_circle
                </span>
                <p className="text-xs font-bold">
                  Nhấn để thêm cầu thủ chính thức
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-5">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Đội hình Dự bị{" "}
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({subPlayers.length}/7 cầu thủ)
                </span>
              </h3>
              <button
                onClick={() => openAddModal("sub")}
                disabled={subPlayers.length >= 7}
                className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-3 py-1.5 text-xs font-bold text-[#0d631b] shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">
                  person_add
                </span>{" "}
                Thêm
              </button>
            </div>

            <div className="min-h-[150px] space-y-3 rounded-2xl border border-gray-200 bg-[#f5f3ef] p-4">
              {subPlayers.map((player) => (
                <div
                  key={player.id}
                  className="group relative flex items-center gap-3 rounded-lg border border-white bg-white/80 p-3 shadow-sm"
                >
                  <img
                    src={
                      player.avatar ||
                      `https://placehold.co/100x100?text=${player.position || "Player"}`
                    }
                    className="h-10 w-10 rounded-full bg-gray-100 object-cover"
                    alt="avatar"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">
                      {player.name}
                    </p>
                    <p className="text-[10px] font-bold uppercase text-[#4c56af]">
                      {player.position || "Cầu thủ"} •{" "}
                      {calculateAge(player.dateOfBirth)} tuổi
                    </p>
                  </div>

                  <button
                    onClick={() => removeSubPlayer(player.id)}
                    className="text-gray-300 transition-colors hover:text-red-500"
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
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white/20 p-3 text-[11px] italic text-gray-400 transition-all hover:bg-white"
                >
                  <span className="material-symbols-outlined text-sm">
                    info
                  </span>
                  Còn trống {7 - subPlayers.length} vị trí dự bị
                </div>
              )}
            </div>
          </section>

          {rule && (
            <section className="rounded-2xl border border-green-100 bg-green-50/20 p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-green-800 text-sm">
                <span className="material-symbols-outlined text-base">
                  gavel
                </span>
                Quy định đăng ký mùa giải
              </h3>
              <ul className="space-y-2 text-xs text-green-700">
                <li className="flex justify-between">
                  <span>Số cầu thủ tối thiểu:</span>
                  <span className="font-bold">{minPlayersReq} cầu thủ</span>
                </li>
                <li className="flex justify-between">
                  <span>Số cầu thủ tối đa:</span>
                  <span className="font-bold">{maxPlayersReq} cầu thủ</span>
                </li>
                <li className="flex justify-between">
                  <span>Độ tuổi quy định:</span>
                  <span className="font-bold">
                    {minAgeReq} - {maxAgeReq} tuổi
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Số ngoại binh tối đa:</span>
                  <span className="font-bold">{maxForeignReq} cầu thủ</span>
                </li>
              </ul>
            </section>
          )}

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 font-bold text-gray-900">
              <span className="material-symbols-outlined text-[#0d631b]">
                fact_check
              </span>{" "}
              Kiểm tra tính hợp lệ
            </h3>

            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <span
                  className={`material-symbols-outlined ${
                    totalSelected >= minPlayersReq &&
                    totalSelected <= maxPlayersReq
                      ? "text-[#0d631b]"
                      : "text-red-500"
                  }`}
                >
                  {totalSelected >= minPlayersReq &&
                  totalSelected <= maxPlayersReq
                    ? "check_circle"
                    : "cancel"}
                </span>
                <div>
                  <p className="text-sm font-bold">Số lượng cầu thủ</p>
                  <p className="text-[11px] text-gray-400">
                    {totalSelected} cầu thủ (yêu cầu {minPlayersReq} -{" "}
                    {maxPlayersReq})
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span
                  className={`material-symbols-outlined ${
                    invalidAgePlayers.length === 0
                      ? "text-[#0d631b]"
                      : "text-red-500"
                  }`}
                >
                  {invalidAgePlayers.length === 0 ? "check_circle" : "cancel"}
                </span>
                <div>
                  <p className="text-sm font-bold">Độ tuổi hợp lệ</p>
                  <p className="text-[11px] text-gray-400">
                    {invalidAgePlayers.length === 0
                      ? "Tất cả hợp lệ"
                      : `${invalidAgePlayers.length} cầu thủ sai độ tuổi`}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span
                  className={`material-symbols-outlined ${
                    foreignPlayers.length <= maxForeignReq
                      ? "text-[#0d631b]"
                      : "text-red-500"
                  }`}
                >
                  {foreignPlayers.length <= maxForeignReq
                    ? "check_circle"
                    : "cancel"}
                </span>
                <div>
                  <p className="text-sm font-bold">Số lượng ngoại binh</p>
                  <p className="text-[11px] text-gray-400">
                    {foreignPlayers.length}/{maxForeignReq} ngoại binh
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span
                  className={`material-symbols-outlined ${
                    duplicateShirts.length === 0
                      ? "text-[#0d631b]"
                      : "text-red-500"
                  }`}
                >
                  {duplicateShirts.length === 0 ? "check_circle" : "cancel"}
                </span>
                <div>
                  <p className="text-sm font-bold">Số áo duy nhất</p>
                  <p className="text-[11px] text-gray-400">
                    {duplicateShirts.length === 0
                      ? "Không bị trùng số áo"
                      : `Bị trùng số áo ${duplicateShirts.join(", ")}`}
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="mb-2 flex justify-between">
                <span className="text-[10px] font-black uppercase text-gray-400">
                  Độ sẵn sàng
                </span>
                <span className="text-xs font-black text-[#0d631b]">
                  {Math.min(
                    Math.round((totalSelected / minPlayersReq) * 100),
                    100,
                  )}
                  %
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-[#0d631b] transition-all"
                  style={{
                    width: `${Math.min((totalSelected / minPlayersReq) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-10 left-64 right-0 z-40 flex justify-center px-10">
        <div className="pointer-events-auto flex w-full max-w-4xl items-center justify-between rounded-full border border-gray-100 bg-white/90 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4 pl-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <span className="material-symbols-outlined text-green-700">
                groups
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {totalSelected}/18 cầu thủ
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Danh sách hiện tại
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="rounded-full px-8 py-3 text-sm font-bold text-gray-500 transition-all hover:bg-gray-50"
            >
              Quay lại
            </button>

            <button
              onClick={() => setStep(4)}
              disabled={hasValidationErrors}
              className="rounded-full bg-green-700 px-10 py-3 text-sm font-bold text-white shadow-lg shadow-green-700/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl bg-white p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
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

          <p className="mb-4 text-sm text-gray-500">
            Danh sách cầu thủ thuộc biên chế đội bóng (chưa được chọn)
          </p>

          <div className="flex-1 space-y-2 overflow-y-auto pr-2">
            {isLoading ? (
              <LoadingSpinner
                message="Đang tải danh sách cầu thủ"
                description="Dữ liệu cầu thủ thuộc câu lạc bộ đang được đồng bộ để bạn chọn nhanh cho hồ sơ đăng ký."
                fullHeight
              />
            ) : errorMessage ? (
              <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-600">
                {errorMessage}
              </div>
            ) : unselectedAvailablePlayers.length === 0 ? (
              <div className="py-10 text-center font-bold text-gray-400">
                Không còn cầu thủ nào để chọn
              </div>
            ) : (
              unselectedAvailablePlayers.map((player) => (
                <div
                  key={player.id}
                  onClick={() => toggleSelectPlayer(player.id)}
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border p-3 transition-all ${
                    selectedPlayerIds.includes(player.id)
                      ? "border-green-500 bg-green-50"
                      : "border-gray-100 hover:border-green-300"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                      selectedPlayerIds.includes(player.id)
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {selectedPlayerIds.includes(player.id) && (
                      <span className="material-symbols-outlined text-xs font-bold text-white">
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
                    className="h-10 w-10 rounded-full border border-gray-100 bg-white object-cover"
                  />

                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">
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

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl px-5 py-2.5 font-bold text-gray-500 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={selectedPlayerIds.length === 0}
              className="rounded-xl bg-green-700 px-6 py-2.5 font-bold text-white shadow-md transition-all hover:bg-green-800 disabled:opacity-50"
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
