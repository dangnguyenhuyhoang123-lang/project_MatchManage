import React, { useCallback, useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../../components/Spinner/LoadingSpinner";
import { Modal } from "../../../components/Modal";
import PlayerService from "../../../services/PlayerService";
import type { SelectedPlayer } from "./RegisterFormMatch";
import { useCurrentClubId } from "../InfoClubManage/clubInfoHelpers";
import { useRealtimeEvent } from "../../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../../model/RealtimeEvent";
import { calculateAge } from "../../../utils/registrationValidationUtils";

type Props = {
  setStep: (step: number) => void;
  rule?: any;
  players?: SelectedPlayer[];
  mainPlayers?: SelectedPlayer[];
  subPlayers?: SelectedPlayer[];
  onPlayersChange?: (players: SelectedPlayer[]) => void;
};

// Lấy player id code.
const getPlayerIdCode = (player: any) =>
  String(
    player.idCode ?? player.id_code ?? player.identityCode ?? player.cccd ?? "",
  ).trim();

// Lấy player birth date.
const getPlayerBirthDate = (player: any) =>
  player.birthDay ?? player.birthDate ?? player.dateOfBirth ?? "";

// Chuẩn hóa text.
const normalizeText = (value?: string | null) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase()
    .trim();

// Xử lý players.
function mergePlayers(...groups: Array<SelectedPlayer[] | undefined>) {
  const map = new Map<number, SelectedPlayer>();

  groups
    .flatMap((group) => group ?? [])
    .forEach((player) => {
      if (player?.id != null && !map.has(player.id)) {
        map.set(player.id, player);
      }
    });

  return Array.from(map.values());
}

// Xử lý is foreign player.
function isForeignPlayer(player: any) {
  const type = String(player.playerType ?? player.type ?? "").toUpperCase();
  if (type === "FOREIGN") return true;
  if (type === "DOMESTIC") return false;

  const nationality = normalizeText(player.nationality);
  return (
    Boolean(nationality) && !["viet nam", "vietnam", "vn"].includes(nationality)
  );
}

// Xử lý player type label(Hiển thị nội , ngoài binh).
function playerTypeLabel(player: any) {
  const type = String(player.playerType ?? player.type ?? "").toUpperCase();
  if (type === "FOREIGN") return "Ngoại binh";
  if (type === "DOMESTIC") return "Nội binh";
  return isForeignPlayer(player) ? "Ngoại binh" : "Nội binh";
}

// Lấy vị trí hiển thị cầu thủ.
function getPlayerPosition(player: any) {
  return player.detailPosition || player.position || "Cầu thủ";
}

// Xử lý matches player filters.
function matchesPlayerFilters(
  player: SelectedPlayer,
  searchValue: string,
  positionFilter: string,
  typeFilter: string,
) {
  const keyword = normalizeText(searchValue);

  if (
    keyword &&
    ![
      player.name,
      getPlayerIdCode(player),
      player.nationality,
      getPlayerPosition(player),
      playerTypeLabel(player),
      player.shirtNumber,
      player.number,
    ].some((value) => normalizeText(String(value ?? "")).includes(keyword))
  ) {
    return false;
  }

  if (positionFilter && getPlayerPosition(player) !== positionFilter) {
    return false;
  }

  if (typeFilter && playerTypeLabel(player) !== typeFilter) {
    return false;
  }

  return true;
}

// (Tạo cảnh báo).
function getPlayerWarnings(
  player: SelectedPlayer,
  minAge: number,
  maxAge: number,
) {
  const warnings: string[] = [];
  const idCode = getPlayerIdCode(player);
  const age = calculateAge(getPlayerBirthDate(player));

  if (!idCode) {
    warnings.push("Thiếu mã dịnh danh");
  }

  if (age === null) {
    warnings.push("Chưa có ngày sinh hợp lệ");
  } else if (age < minAge || age > maxAge) {
    warnings.push(`Tuổi ${age} không nằm trong quy định`);
  }

  return warnings;
}

const getPlayerKey = (player: SelectedPlayer) =>
  `${player.id ?? ""}-${player.playerId ?? ""}-${player.type ?? ""}-${player.position ?? ""}`;

const areSamePlayers = (a: SelectedPlayer[], b: SelectedPlayer[]) => {
  if (a.length !== b.length) return false;

  return a.every((player, index) => {
    return getPlayerKey(player) === getPlayerKey(b[index]);
  });
};

const PlayerRegistration: React.FC<Props> = ({
  setStep,
  rule,
  players,
  mainPlayers = [],
  subPlayers = [],
  onPlayersChange,
}) => {
  const { currentClubId, authLoading } = useCurrentClubId();

  // Lưu trữ danh sách cầu thủ được chọn
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>(
    () =>
      players ? mergePlayers(players) : mergePlayers(mainPlayers, subPlayers),
  );

  // Lưu trữ danh sách cầu thủ dddang thuộc CLB
  const [availablePlayers, setAvailablePlayers] = useState<SelectedPlayer[]>(
    [],
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lưu trữ danh sách cầu thủ được chọn ở trong Modal
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Các biến lưu trữ bộ lọc danh sách cầu thủ
  const [selectedSearchTerm, setSelectedSearchTerm] = useState("");
  const [selectedPositionFilter, setSelectedPositionFilter] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("");

  // Cácb biến lưu trữ bộ lọc danh sách cầu thủ có thể chọn trong Modal
  const [availableSearchTerm, setAvailableSearchTerm] = useState("");
  const [availablePositionFilter, setAvailablePositionFilter] = useState("");
  const [availableTypeFilter, setAvailableTypeFilter] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const nextPlayers = players
      ? mergePlayers(players)
      : mergePlayers(mainPlayers, subPlayers);

    setSelectedPlayers((prevPlayers) => {
      if (areSamePlayers(prevPlayers, nextPlayers)) {
        return prevPlayers;
      }

      return nextPlayers;
    });
  }, [players, mainPlayers, subPlayers]);

  useEffect(() => {
    // Lấy danh sách cầu thủ .
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
  }, [authLoading, currentClubId, reloadKey]);

  const handleRealtimeEvent = useCallback((event: RealtimeEventDTO) => {
    if (
      event.action === "REFETCH_PLAYERS" ||
      event.action === "REFETCH_TEAM_SEASON" ||
      event.action === "REFETCH_SEASON_TEAMS"
    ) {
      setReloadKey((current) => current + 1);
    }
  }, []);

  useRealtimeEvent(handleRealtimeEvent);

  // Số lượng cầu thủ tối thiểu theo luật
  const minPlayersReq = rule?.minRegistrationPlayers ?? rule?.minPlayers ?? 14;

  // Số lượng cầu thủ tối đa
  const maxPlayersReq = rule?.maxPlayers ?? 30;

  // Số tuổi nhỏ nhất
  const minAgeReq = rule?.minAge ?? 16;

  // Số tuổi lớn nhất
  const maxAgeReq = rule?.maxAge ?? 40;
  const maxForeignReq =
    rule?.maxForeignPlayers !== null && rule?.maxForeignPlayers !== undefined
      ? rule.maxForeignPlayers
      : 3;

  //Set id các cầu thủ đã chọn, dùng loại khỏi availablePlayers.
  const selectedIds = useMemo(
    () => new Set(selectedPlayers.map((player) => player.id)),
    [selectedPlayers],
  );

  const selectedPositions = useMemo(() => {
    const values = selectedPlayers
      .map((player) => getPlayerPosition(player))
      .filter(Boolean);
    return Array.from(new Set(values));
  }, [selectedPlayers]);

  const availablePositions = useMemo(() => {
    const values = availablePlayers
      .map((player) => getPlayerPosition(player))
      .filter(Boolean);
    return Array.from(new Set(values));
  }, [availablePlayers]);

  // Danh sách chọn sau khi lọc
  const filteredSelectedPlayers = useMemo(
    () =>
      selectedPlayers.filter((player) =>
        matchesPlayerFilters(
          player,
          selectedSearchTerm,
          selectedPositionFilter,
          selectedTypeFilter,
        ),
      ),
    [
      selectedPlayers,
      selectedPositionFilter,
      selectedSearchTerm,
      selectedTypeFilter,
    ],
  );
  // Danh sách còn lại sau khi lọc(nhữung cầu thủ còn lại trong Modal )
  const filteredAvailablePlayers = useMemo(() => {
    return availablePlayers.filter((player) => {
      if (selectedIds.has(player.id)) return false;

      return matchesPlayerFilters(
        player,
        availableSearchTerm,
        availablePositionFilter,
        availableTypeFilter,
      );
    });
  }, [
    availablePlayers,
    availablePositionFilter,
    availableSearchTerm,
    availableTypeFilter,
    selectedIds,
  ]);

  // Danh sách cầu thủ không có ngày sinh
  const missingBirthDatePlayers = useMemo(
    () =>
      selectedPlayers.filter(
        (player) => calculateAge(getPlayerBirthDate(player)) === null,
      ),
    [selectedPlayers],
  );

  // Danh sách cầu thủ cầu thủ ngoài đội tổi quy định
  const invalidAgePlayers = useMemo(
    () =>
      selectedPlayers.filter((player) => {
        const age = calculateAge(getPlayerBirthDate(player));
        return age !== null && (age < minAgeReq || age > maxAgeReq);
      }),
    [maxAgeReq, minAgeReq, selectedPlayers],
  );

  // Danh sách cầu thủ thiếu idCode
  const missingIdCodePlayers = useMemo(
    () => selectedPlayers.filter((player) => !getPlayerIdCode(player)),
    [selectedPlayers],
  );

  const duplicatePlayers = useMemo(() => {
    const ids = new Set<number>();
    const duplicates: string[] = [];

    selectedPlayers.forEach((player) => {
      if (ids.has(player.id)) {
        duplicates.push(player.name);
      } else {
        ids.add(player.id);
      }
    });

    return duplicates;
  }, [selectedPlayers]);

  const duplicateShirts = useMemo(() => {
    const counts: Record<number, number> = {};

    selectedPlayers.forEach((player) => {
      const shirtNumber = player.shirtNumber ?? player.number;
      if (shirtNumber != null) {
        counts[shirtNumber] = (counts[shirtNumber] || 0) + 1;
      }
    });

    return Object.keys(counts)
      .map(Number)
      .filter((shirtNumber) => counts[shirtNumber] > 1);
  }, [selectedPlayers]);

  // Danh sách ngoại binh
  const foreignPlayers = useMemo(
    () => selectedPlayers.filter((player) => isForeignPlayer(player)),
    [selectedPlayers],
  );

  // Tổng hợp validate
  const hasValidationErrors =
    selectedPlayers.length < minPlayersReq ||
    selectedPlayers.length > maxPlayersReq ||
    missingBirthDatePlayers.length > 0 ||
    invalidAgePlayers.length > 0 ||
    missingIdCodePlayers.length > 0 ||
    duplicatePlayers.length > 0 ||
    duplicateShirts.length > 0 ||
    foreignPlayers.length > maxForeignReq;

  // Xử lý select player.
  const toggleSelectPlayer = (id: number) => {
    setSelectedPlayerIds((current) =>
      current.includes(id)
        ? current.filter((playerId) => playerId !== id)
        : [...current, id],
    );
  };

  // Mở modal hoac khung thao tác.
  const openAddModal = () => {
    setSelectedPlayerIds([]);
    setIsModalOpen(true);
  };

  // Xử lý emit players change.
  const emitPlayersChange = (nextPlayers: SelectedPlayer[]) => {
    setSelectedPlayers(nextPlayers);
    onPlayersChange?.(nextPlayers);
  };

  // Xử lý xác nhận thao tác(lấy các cầu thủ được chọn(filteredAvailablePlayers) và đưa vào
  // danh sách đăng ký).
  const handleConfirmSelection = () => {
    const playersToAdd = filteredAvailablePlayers.filter((player) =>
      selectedPlayerIds.includes(player.id),
    );

    emitPlayersChange(mergePlayers(selectedPlayers, playersToAdd));
    setIsModalOpen(false);
    setSelectedPlayerIds([]);
  };

  // Xóa player.
  const removePlayer = (id: number) => {
    emitPlayersChange(selectedPlayers.filter((player) => player.id !== id));
  };

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
              {(selectedPlayers.length < minPlayersReq ||
                selectedPlayers.length > maxPlayersReq) && (
                <li>
                  Danh sách đăng ký phải có từ {minPlayersReq} đến{" "}
                  {maxPlayersReq} cầu thủ theo quy định mùa giải.
                </li>
              )}
              {missingBirthDatePlayers.length > 0 && (
                <li>
                  Cầu thủ chưa có ngày sinh hợp lệ:{" "}
                  {missingBirthDatePlayers
                    .map((player) => player.name)
                    .join(", ")}
                  .
                </li>
              )}
              {invalidAgePlayers.length > 0 && (
                <li>
                  Cầu thủ không nằm trong độ tuổi quy định:{" "}
                  {invalidAgePlayers
                    .map((player) => {
                      const age = calculateAge(getPlayerBirthDate(player));
                      return `${player.name} (${age} tuổi)`;
                    })
                    .join(", ")}{" "}
                  (yêu cầu từ {minAgeReq} đến {maxAgeReq} tuổi).
                </li>
              )}
              {missingIdCodePlayers.length > 0 && (
                <li>
                  Thiếu mã định danh cầu thủ:{" "}
                  {missingIdCodePlayers.map((player) => player.name).join(", ")}
                  .
                </li>
              )}
              {foreignPlayers.length > maxForeignReq && (
                <li>
                  Vượt số lượng ngoại binh: đã chọn {foreignPlayers.length}/
                  {maxForeignReq}.
                </li>
              )}
              {/* {duplicateShirts.length > 0 && (
                <li>
                  Trùng số áo: số áo {duplicateShirts.join(", ")} bị trùng lặp.
                </li>
              )} */}
              {duplicatePlayers.length > 0 && (
                <li>Trùng cầu thủ: {duplicatePlayers.join(", ")}.</li>
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
              Đã chọn {selectedPlayers.length} cầu thủ, tất cả đều thỏa mãn quy
              định của mùa giải.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-8 pb-24">
        <div className="col-span-12 xl:col-span-8">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Danh sách cầu thủ đăng ký mùa giải
                </h3>
                <p
                  className={`mt-1 text-sm font-bold ${
                    selectedPlayers.length < minPlayersReq ||
                    selectedPlayers.length > maxPlayersReq
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  Đã chọn {selectedPlayers.length} cầu thủ, yêu cầu từ{" "}
                  {minPlayersReq} đến {maxPlayersReq}. Ngoại binh:{" "}
                  {foreignPlayers.length}/{maxForeignReq}.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddModal}
                disabled={isLoading}
                className="flex w-fit items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-2 text-xs font-bold text-[#0d631b] shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">
                  person_add
                </span>
                Thêm cầu thủ
              </button>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              <input
                value={selectedSearchTerm}
                onChange={(event) => setSelectedSearchTerm(event.target.value)}
                placeholder="Tìm cầu thủ, idCode..."
                className="h-11 rounded-xl border border-gray-100 bg-[#f5f3ef] px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-green-700/20"
              />
              <select
                value={selectedPositionFilter}
                onChange={(event) =>
                  setSelectedPositionFilter(event.target.value)
                }
                className="h-11 rounded-xl border border-gray-100 bg-[#f5f3ef] px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-green-700/20"
              >
                <option value="">Tất cả vị trí</option>
                {selectedPositions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
              <select
                value={selectedTypeFilter}
                onChange={(event) => setSelectedTypeFilter(event.target.value)}
                className="h-11 rounded-xl border border-gray-100 bg-[#f5f3ef] px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-green-700/20"
              >
                <option value="">Tất cả loại cầu thủ</option>
                <option value="Nội binh">Nội binh</option>
                <option value="Ngoại binh">Ngoại binh</option>
              </select>
            </div>

            <div className="space-y-3">
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
              ) : selectedPlayers.length === 0 ? (
                <div
                  onClick={openAddModal}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-10 text-gray-400 transition-all hover:border-[#0d631b]/30 hover:bg-white"
                >
                  <span className="material-symbols-outlined mb-2 text-4xl">
                    group_add
                  </span>
                  <p className="text-sm font-bold">
                    Nhấn để chọn cầu thủ đăng ký mùa giải
                  </p>
                </div>
              ) : filteredSelectedPlayers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                  <p className="text-sm font-bold text-gray-500">
                    Khong co cau thu phu hop voi bo loc
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSearchTerm("");
                      setSelectedPositionFilter("");
                      setSelectedTypeFilter("");
                    }}
                    className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#0d631b] shadow-sm transition-all hover:shadow-md"
                  >
                    Xoa bo loc
                  </button>
                </div>
              ) : (
                <div className="max-h-[724px] space-y-3 overflow-y-auto pr-2">
                  {filteredSelectedPlayers.map((player) => {
                    const age = calculateAge(getPlayerBirthDate(player));
                    const warnings = getPlayerWarnings(
                      player,
                      minAgeReq,
                      maxAgeReq,
                    );

                    return (
                      <div
                        key={player.id}
                        className={`flex items-start justify-between gap-4 rounded-xl border bg-white p-4 transition-all hover:scale-[1.01] ${
                          warnings.length > 0
                            ? "border-red-100"
                            : "border-gray-100"
                        }`}
                      >
                        <div className="flex min-w-0 items-start gap-4">
                          <img
                            src={
                              player.avatar ||
                              `https://placehold.co/100x100?text=${getPlayerPosition(player)}`
                            }
                            alt={player.name}
                            className="h-12 w-12 rounded-lg bg-gray-100 object-cover"
                          />
                          <div className="min-w-0">
                            <h4 className="truncate font-bold text-gray-900">
                              {player.name}
                            </h4>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge>{getPlayerPosition(player)}</Badge>
                              <Badge>{playerTypeLabel(player)}</Badge>
                              <Badge>
                                {age === null ? "Tuổi N/A" : `${age} tuổi`}
                              </Badge>
                              <Badge>
                                ID:{" "}
                                {getPlayerIdCode(player) ||
                                  "Thiếu mã định danh"}
                              </Badge>
                            </div>
                            {warnings.length > 0 && (
                              <p className="mt-2 text-xs font-bold text-red-600">
                                {warnings.join(" • ")}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removePlayer(player.id)}
                          className="material-symbols-outlined text-gray-300 transition-colors hover:text-red-500"
                        >
                          delete
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-4">
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
                  <span>Số cầu thủ:</span>
                  <span className="font-bold">
                    {minPlayersReq} - {maxPlayersReq}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Độ tuổi:</span>
                  <span className="font-bold">
                    {minAgeReq} - {maxAgeReq} tuổi
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Ngoại binh tối đa:</span>
                  <span className="font-bold">{maxForeignReq}</span>
                </li>
              </ul>
            </section>
          )}

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 font-bold text-gray-900">
              <span className="material-symbols-outlined text-[#0d631b]">
                fact_check
              </span>
              Kiểm tra tính hợp lệ
            </h3>

            <ul className="space-y-5">
              <CheckItem
                passed={
                  selectedPlayers.length >= minPlayersReq &&
                  selectedPlayers.length <= maxPlayersReq
                }
              >
                <p className="text-sm font-bold">Số lượng cầu thủ</p>
                <p className="text-[11px] text-gray-400">
                  {selectedPlayers.length} cầu thủ (yêu cầu {minPlayersReq} -{" "}
                  {maxPlayersReq})
                </p>
              </CheckItem>

              <CheckItem
                passed={
                  missingBirthDatePlayers.length === 0 &&
                  invalidAgePlayers.length === 0
                }
              >
                <p className="text-sm font-bold">Độ tuổi hợp lệ</p>
                <p className="text-[11px] text-gray-400">
                  {missingBirthDatePlayers.length + invalidAgePlayers.length ===
                  0
                    ? "Tất cả hợp lệ"
                    : `${
                        missingBirthDatePlayers.length +
                        invalidAgePlayers.length
                      } cầu thủ cần kiểm tra`}
                </p>
              </CheckItem>

              <CheckItem passed={missingIdCodePlayers.length === 0}>
                <p className="text-sm font-bold">Mã định danh</p>
                <p className="text-[11px] text-gray-400">
                  {missingIdCodePlayers.length === 0
                    ? "Tất cả cầu thủ đã có idCode"
                    : `${missingIdCodePlayers.length} cầu thủ thiếu idCode`}
                </p>
              </CheckItem>

              <CheckItem passed={foreignPlayers.length <= maxForeignReq}>
                <p className="text-sm font-bold">Số lượng ngoại binh</p>
                <p className="text-[11px] text-gray-400">
                  {foreignPlayers.length}/{maxForeignReq} ngoại binh
                </p>
              </CheckItem>
            </ul>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="mb-2 flex justify-between">
                <span className="text-[10px] font-black uppercase text-gray-400">
                  Độ sẵn sàng
                </span>
                <span className="text-xs font-black text-[#0d631b]">
                  {Math.min(
                    Math.round((selectedPlayers.length / minPlayersReq) * 100),
                    100,
                  )}
                  %
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-[#0d631b] transition-all"
                  style={{
                    width: `${Math.min((selectedPlayers.length / minPlayersReq) * 100, 100)}%`,
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
                Đã chọn {selectedPlayers.length} cầu thủ
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Danh sách đăng ký mùa giải
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-full px-8 py-3 text-sm font-bold text-gray-500 transition-all hover:bg-gray-50"
            >
              Quay lại
            </button>

            <button
              type="button"
              onClick={() => setStep(4)}
              disabled={isLoading}
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
              Chọn cầu thủ đăng ký mùa giải
            </h2>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <p className="mb-4 text-sm text-gray-500">
            Danh sách cầu thủ thuộc biên chế đội bóng, chưa được chọn vào hồ sơ.
          </p>

          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              value={availableSearchTerm}
              onChange={(event) => setAvailableSearchTerm(event.target.value)}
              placeholder="Tìm cầu thủ..."
              className="h-10 rounded-xl border border-gray-100 bg-[#f5f3ef] px-4 text-xs font-bold outline-none"
            />
            <select
              value={availablePositionFilter}
              onChange={(event) =>
                setAvailablePositionFilter(event.target.value)
              }
              className="h-10 rounded-xl border border-gray-100 bg-[#f5f3ef] px-4 text-xs font-bold outline-none"
            >
              <option value="">Tất cả vị trí</option>
              {availablePositions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
            <select
              value={availableTypeFilter}
              onChange={(event) => setAvailableTypeFilter(event.target.value)}
              className="h-10 rounded-xl border border-gray-100 bg-[#f5f3ef] px-4 text-xs font-bold outline-none"
            >
              <option value="">Tất cả loại</option>
              <option value="Nội binh">Nội binh</option>
              <option value="Ngoại binh">Ngoại binh</option>
            </select>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-2">
            {isLoading ? (
              <LoadingSpinner
                message="Đang tải danh sách cầu thủ"
                description="Dữ liệu cầu thủ thuộc câu lạc bộ đang được đồng bộ."
                fullHeight
              />
            ) : errorMessage ? (
              <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-600">
                {errorMessage}
              </div>
            ) : filteredAvailablePlayers.length === 0 ? (
              <div className="py-10 text-center font-bold text-gray-400">
                Không còn cầu thủ phù hợp để chọn
              </div>
            ) : (
              filteredAvailablePlayers.map((player) => {
                const age = calculateAge(getPlayerBirthDate(player));
                const warnings = getPlayerWarnings(
                  player,
                  minAgeReq,
                  maxAgeReq,
                );

                return (
                  <div
                    key={player.id}
                    onClick={() => toggleSelectPlayer(player.id)}
                    className={`flex cursor-pointer items-start gap-4 rounded-xl border p-3 transition-all ${
                      selectedPlayerIds.includes(player.id)
                        ? "border-green-500 bg-green-50"
                        : warnings.length > 0
                          ? "border-red-100 hover:border-red-300"
                          : "border-gray-100 hover:border-green-300"
                    }`}
                  >
                    <div
                      className={`mt-2 flex h-5 w-5 items-center justify-center rounded-md border ${
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
                        `https://placehold.co/100x100?text=${getPlayerPosition(player)}`
                      }
                      alt={player.name}
                      className="h-10 w-10 rounded-full border border-gray-100 bg-white object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold text-gray-900">
                        {player.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {getPlayerPosition(player)} •{" "}
                        {age === null ? "Tuổi N/A" : `${age} tuổi`} •{" "}
                        {playerTypeLabel(player)}
                      </p>
                      {warnings.length > 0 && (
                        <p className="mt-1 text-xs font-bold text-red-600">
                          {warnings.join(" • ")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl px-5 py-2.5 font-bold text-gray-500 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="button"
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

// Hiển thị Badge.
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
      {children}
    </span>
  );
}

// Hiển thị CheckItem.
function CheckItem({
  passed,
  children,
}: {
  passed: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={`material-symbols-outlined ${
          passed ? "text-[#0d631b]" : "text-red-500"
        }`}
      >
        {passed ? "check_circle" : "cancel"}
      </span>
      <div>{children}</div>
    </li>
  );
}

export default PlayerRegistration;
