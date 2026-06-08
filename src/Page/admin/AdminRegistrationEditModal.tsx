import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  AdminUpdateRegistrationPayload,
  RegistrationDetailDTO,
} from "../../model/Registration";
import type { Player } from "../../model/Player";
import type { Coach } from "../../model/CoachModel";
import RegistrationService from "../../services/RegistrationService";
import { getErrorMessage } from "../../utils/errorUtils";
import { getRegistrationStatusLabel } from "../../utils/statusUtils";

type SelectedPlayer = {
  playerId: number;
  shirtNumber: number | "";
  position: string;
};

type SelectedCoach = {
  coachId: number;
  role: string;
};

type AdminRegistrationEditModalProps = {
  open: boolean;
  registrationId: number | null;
  teamId: number | null;
  registrationDetail: RegistrationDetailDTO | null;
  players: Player[];
  coaches: Coach[];
  isLoading: boolean;
  errorMessage: string;
  onClose: () => void;
  onSaved: () => void;
};

const getPlayerId = (player: any) => player?.id ?? player?.playerId;
const getCoachId = (coach: any) => coach?.id ?? coach?.coachId;

const getIdCode = (item: any) =>
  item?.idCode ??
  item?.IDCode ??
  item?.idcode ??
  item?.id_code ??
  item?.playerIdCode ??
  item?.coachIdCode ??
  "";

const getName = (item: any) =>
  item?.name ?? item?.fullName ?? item?.playerName ?? item?.coachName ?? "";

const normalizeText = (value?: string | null) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

const toValidNumber = (value: any) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

const findPlayerId = (registeredPlayer: any, players: Player[]) => {
  /*
   * Ưu tiên playerId do BE trả về từ RegistrationPlayerViewDTO.
   * Tuyệt đối không dùng registeredPlayer.id vì đó có thể là id của bảng registration_player.
   */
  const explicitPlayerId = toValidNumber(
    registeredPlayer?.playerId ??
      registeredPlayer?.player?.id ??
      registeredPlayer?.player?.playerId,
  );

  if (explicitPlayerId) {
    return explicitPlayerId;
  }

  /*
   * Fallback chỉ dùng khi dữ liệu cũ chưa có playerId.
   * Ưu tiên map bằng CCCD/idCode vì name có thể trùng.
   */
  const idCode = normalizeText(getIdCode(registeredPlayer));
  const name = normalizeText(getName(registeredPlayer));

  if (idCode) {
    const matchedByIdCode = players.find(
      (player) => normalizeText(getIdCode(player)) === idCode,
    );

    if (matchedByIdCode) {
      return toValidNumber(getPlayerId(matchedByIdCode));
    }

    /*
     * Nếu đã có idCode nhưng không tìm thấy trong danh sách biên chế,
     * không fallback theo tên để tránh map nhầm người trùng tên.
     */
    return null;
  }

  if (name) {
    const matchedPlayersByName = players.filter(
      (player) => normalizeText(getName(player)) === name,
    );

    /*
     * Chỉ map theo tên nếu tên là duy nhất.
     * Nếu có nhiều người trùng tên thì trả null để FE báo cần chọn lại.
     */
    if (matchedPlayersByName.length === 1) {
      return toValidNumber(getPlayerId(matchedPlayersByName[0]));
    }
  }

  return null;
};

const findCoachId = (registeredCoach: any, coaches: Coach[]) => {
  /*
   * Ưu tiên coachId do BE trả về từ RegistrationCoachViewDTO.
   * Tuyệt đối không dùng registeredCoach.id vì đó có thể là id của bảng registration_coach.
   */
  const explicitCoachId = toValidNumber(
    registeredCoach?.coachId ??
      registeredCoach?.coach?.id ??
      registeredCoach?.coach?.coachId,
  );

  if (explicitCoachId) {
    return explicitCoachId;
  }

  /*
   * Fallback chỉ dùng khi dữ liệu cũ chưa có coachId.
   * Ưu tiên map bằng CCCD/idCode vì name có thể trùng.
   */
  const idCode = normalizeText(getIdCode(registeredCoach));
  const name = normalizeText(getName(registeredCoach));

  if (idCode) {
    const matchedByIdCode = coaches.find(
      (coach) => normalizeText(getIdCode(coach)) === idCode,
    );

    if (matchedByIdCode) {
      return toValidNumber(getCoachId(matchedByIdCode));
    }

    return null;
  }

  if (name) {
    const matchedCoachesByName = coaches.filter(
      (coach) => normalizeText(getName(coach)) === name,
    );

    /*
     * Chỉ map theo tên nếu tên là duy nhất.
     * Nếu có nhiều HLV trùng tên thì trả null để FE báo cần chọn lại.
     */
    if (matchedCoachesByName.length === 1) {
      return toValidNumber(getCoachId(matchedCoachesByName[0]));
    }
  }

  return null;
};

const AdminRegistrationEditModal = ({
  open,
  registrationId,
  teamId,
  registrationDetail,
  players,
  coaches,
  isLoading,
  errorMessage,
  onClose,
  onSaved,
}: AdminRegistrationEditModalProps) => {
  const [note, setNote] = useState("");
  const [homeKitColor, setHomeKitColor] = useState("");
  const [awayKitColor, setAwayKitColor] = useState("");
  const [homeKitImageUrl, setHomeKitImageUrl] = useState("");
  const [awayKitImageUrl, setAwayKitImageUrl] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
  const [selectedCoaches, setSelectedCoaches] = useState<SelectedCoach[]>([]);
  const [playerToAdd, setPlayerToAdd] = useState("");
  const [coachToAdd, setCoachToAdd] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open || !registrationDetail) return;

    setNote(registrationDetail.note ?? "");
    setHomeKitColor(registrationDetail.homeKitColor ?? "");
    setAwayKitColor(registrationDetail.awayKitColor ?? "");
    setHomeKitImageUrl(registrationDetail.homeKitImageUrl ?? "");
    setAwayKitImageUrl(registrationDetail.awayKitImageUrl ?? "");

    // MapPlayer
    const mappedPlayers: SelectedPlayer[] = [];
    const mappedPlayerIds = new Set<number>();
    const missingPlayers: string[] = [];

    registrationDetail.players?.forEach((player) => {
      const playerId = findPlayerId(player, players);

      if (!playerId) {
        missingPlayers.push(
          getName(player) || getIdCode(player) || "unknown player",
        );
        return;
      }

      /*
       * Chặn trường hợp nhiều dòng bị map nhầm về cùng một playerId,
       * thường xảy ra khi fallback theo tên.
       */
      if (mappedPlayerIds.has(playerId)) {
        missingPlayers.push(
          `${getName(player) || getIdCode(player) || "unknown player"} bị map trùng`,
        );
        return;
      }

      mappedPlayerIds.add(playerId);

      mappedPlayers.push({
        playerId,
        shirtNumber: player.shirtNumber ?? "",
        position: player.position ?? "",
      });
    });

    // Map Coach
    const mappedCoaches: SelectedCoach[] = [];
    const mappedCoachIds = new Set<number>();
    const missingCoaches: string[] = [];

    registrationDetail.coaches?.forEach((coach) => {
      const coachId = findCoachId(coach, coaches);

      if (!coachId) {
        missingCoaches.push(
          getName(coach) || getIdCode(coach) || "unknown coach",
        );
        return;
      }

      if (mappedCoachIds.has(coachId)) {
        missingCoaches.push(
          `${getName(coach) || getIdCode(coach) || "unknown coach"} bị map trùng`,
        );
        return;
      }

      mappedCoachIds.add(coachId);

      mappedCoaches.push({
        coachId,
        role: coach.role ?? coach.tournamentRole ?? "",
      });
    });

    setSelectedPlayers(mappedPlayers);
    setSelectedCoaches(mappedCoaches);
    setPlayerToAdd("");
    setCoachToAdd("");

    if (missingPlayers.length > 0 || missingCoaches.length > 0) {
      console.warn(
        "Cannot map some registration players/coaches because detail data is missing ids.",
        { missingPlayers, missingCoaches },
      );
      toast.warning(
        "Không thể map một số cầu thủ/HLV do thiếu ID trong dữ liệu chi tiết.",
      );
    }
  }, [coaches, open, players, registrationDetail]);

  const playerMap = useMemo(() => {
    return new Map(
      players.map((player) => [Number(getPlayerId(player)), player]),
    );
  }, [players]);

  const coachMap = useMemo(() => {
    return new Map(coaches.map((coach) => [Number(getCoachId(coach)), coach]));
  }, [coaches]);

  const availablePlayers = players.filter((player) => {
    const playerId = Number(getPlayerId(player));
    return (
      playerId &&
      !selectedPlayers.some((selected) => selected.playerId === playerId)
    );
  });

  const availableCoaches = coaches.filter((coach) => {
    const coachId = Number(getCoachId(coach));
    return (
      coachId &&
      !selectedCoaches.some((selected) => selected.coachId === coachId)
    );
  });

  if (!open) return null;

  const addPlayer = () => {
    const playerId = Number(playerToAdd);
    if (!playerId) return;
    const player = playerMap.get(playerId);

    setSelectedPlayers((current) => [
      ...current,
      {
        playerId,
        shirtNumber: player?.shirtNumber || "",
        position: player?.position || "",
      },
    ]);
    setPlayerToAdd("");
  };

  const addCoach = () => {
    const coachId = Number(coachToAdd);
    if (!coachId) return;
    const coach = coachMap.get(coachId);

    setSelectedCoaches((current) => [
      ...current,
      {
        coachId,
        role: coach?.description || "",
      },
    ]);
    setCoachToAdd("");
  };

  const validate = () => {
    if (!registrationId) return "Thiếu mã đơn đăng ký.";
    if (!teamId) return "Không xác định được CLB của đơn đăng ký.";
    if (selectedPlayers.length === 0) return "Vui lòng chọn ít nhất 1 cầu thủ.";
    if (selectedCoaches.length === 0) return "Vui lòng chọn ít nhất 1 HLV.";

    const invalidSelectedPlayer = selectedPlayers.find(
      (selected) => !playerMap.has(selected.playerId),
    );

    if (invalidSelectedPlayer) {
      return "Có cầu thủ không map được với danh sách biên chế hiện tại. Vui lòng xóa và chọn lại cầu thủ đó.";
    }

    const invalidSelectedCoach = selectedCoaches.find(
      (selected) => !coachMap.has(selected.coachId),
    );

    if (invalidSelectedCoach) {
      return "Có HLV không map được với danh sách biên chế hiện tại. Vui lòng xóa và chọn lại HLV đó.";
    }

    // const shirtNumbers = new Set<number>();
    for (const player of selectedPlayers) {
      if (!player.playerId) return "Danh sách cầu thủ có dữ liệu không hợp lệ.";
      if (
        player.shirtNumber === "" ||
        Number.isNaN(Number(player.shirtNumber))
      ) {
        return "Số áo của cầu thủ phải là số.";
      }
      if (!player.position.trim()) return "Vị trí cầu thủ không được để trống.";

      // const shirtNumber = Number(player.shirtNumber);
      // if (shirtNumbers.has(shirtNumber))
      //   return "Số áo cầu thủ không được trùng.";
      // shirtNumbers.add(shirtNumber);
    }

    for (const coach of selectedCoaches) {
      if (!coach.coachId) return "Danh sách HLV có dữ liệu không hợp lệ.";
      if (!coach.role.trim()) return "Vai trò HLV không được để trống.";
    }

    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload: AdminUpdateRegistrationPayload = {
      teamInfo: {
        id: Number(teamId),
        note: note.trim() || null,
        homeKitColor: homeKitColor.trim() || null,
        awayKitColor: awayKitColor.trim() || null,
        homeKitImageUrl: homeKitImageUrl.trim() || null,
        awayKitImageUrl: awayKitImageUrl.trim() || null,
      },
      listPlayerInfo: selectedPlayers.map((player) => ({
        playerId: Number(player.playerId),
        shirtNumber: Number(player.shirtNumber),
        position: player.position.trim(),
      })),
      listCoachInfo: selectedCoaches.map((coach) => ({
        coachId: Number(coach.coachId),
        role: coach.role.trim(),
      })),
    };

    setIsSaving(true);
    try {
      await RegistrationService.updateRegistrationByAdmin(
        Number(registrationId),
        payload,
      );
      toast.success("Cập nhật đơn đăng ký thành công.");
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể cập nhật đơn đăng ký."));
    } finally {
      setIsSaving(false);
    }
  };

  const isBusy = isLoading || isSaving;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={isBusy ? undefined : onClose}
      />

      <div className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#fbf9f5] shadow-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-green-700">
              Admin
            </p>
            <h3 className="mt-1 text-2xl font-black text-gray-900 font-['Be_Vietnam_Pro']">
              Sửa đơn đăng ký
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f3ef] text-gray-600 hover:bg-gray-200 disabled:opacity-60"
            aria-label="Dong form sua don"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="rounded-2xl bg-white p-8 text-center font-bold text-gray-600">
              Đang tải thông tin đơn đăng ký...
            </div>
          ) : errorMessage ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center font-bold text-red-600">
              {errorMessage}
            </div>
          ) : registrationDetail ? (
            <div className="space-y-6">
              <section className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <ReadonlyInfo
                    label="CLB"
                    value={registrationDetail.teamName}
                  />
                  <ReadonlyInfo
                    label="Mùa giải"
                    value={registrationDetail.seasonName}
                  />
                  <ReadonlyInfo
                    label="Trạng thái"
                    value={getRegistrationStatusLabel(
                      registrationDetail.status,
                    )}
                  />
                  <ReadonlyInfo
                    label="Sân vận động"
                    value={registrationDetail.stadiumName || "--"}
                  />
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm">
                <h4 className="text-lg font-black text-gray-900 font-['Be_Vietnam_Pro']">
                  Thông tin áo đấu
                </h4>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <LabeledInput
                    label="Ghi chú"
                    value={note}
                    onChange={setNote}
                  />
                  <LabeledInput
                    label="Màu áo sân nhà"
                    value={homeKitColor}
                    onChange={setHomeKitColor}
                  />
                  <LabeledInput
                    label="Màu áo sân khách"
                    value={awayKitColor}
                    onChange={setAwayKitColor}
                  />
                  <LabeledInput
                    label="Ảnh áo sân nhà"
                    value={homeKitImageUrl}
                    onChange={setHomeKitImageUrl}
                  />
                  <LabeledInput
                    label="Ảnh áo sân khách"
                    value={awayKitImageUrl}
                    onChange={setAwayKitImageUrl}
                  />
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h4 className="text-lg font-black text-gray-900 font-['Be_Vietnam_Pro']">
                      Danh sách cầu thủ
                    </h4>
                    <p className="text-sm text-gray-500">
                      {selectedPlayers.length} cầu thủ đã chọn
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={playerToAdd}
                      onChange={(event) => setPlayerToAdd(event.target.value)}
                      className="min-w-64 rounded-xl border border-[#E4E2DE] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20"
                    >
                      <option value="">Thêm cầu thủ</option>
                      {availablePlayers.map((player) => {
                        const playerId = Number(getPlayerId(player));
                        return (
                          <option key={playerId} value={playerId}>
                            {player.name}{" "}
                            {player.idCode ? `- ${player.idCode}` : ""}
                          </option>
                        );
                      })}
                    </select>
                    <button
                      type="button"
                      onClick={addPlayer}
                      disabled={!playerToAdd}
                      className="rounded-xl bg-[#008C2F] px-4 py-2 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-50"
                    >
                      Thêm
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedPlayers.length === 0 ? (
                    <EmptyText text="Chưa có cầu thủ nào trong đơn." />
                  ) : (
                    selectedPlayers.map((selected, index) => {
                      const player = playerMap.get(selected.playerId);
                      return (
                        <div
                          key={selected.playerId}
                          className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-[#fbf9f5] p-4 md:grid-cols-12 md:items-center"
                        >
                          <div className="md:col-span-5">
                            <p className="font-black text-gray-900">
                              {player?.name ??
                                `Không tìm thấy cầu thủ #${selected.playerId}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {player
                                ? `${player.idCode || "--"} - ${player.nationality || "--"}`
                                : "Cầu thủ này không còn trong danh hiện tại"}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <SmallInput
                              label="Số áo"
                              value={selected.shirtNumber}
                              type="number"
                              onChange={(value) =>
                                setSelectedPlayers((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          shirtNumber:
                                            value === "" ? "" : Number(value),
                                        }
                                      : item,
                                  ),
                                )
                              }
                            />
                          </div>
                          <div className="md:col-span-4">
                            <SmallInput
                              label="Vị trí"
                              value={selected.position}
                              onChange={(value) =>
                                setSelectedPlayers((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, position: value }
                                      : item,
                                  ),
                                )
                              }
                            />
                          </div>
                          <div className="md:col-span-1 flex md:justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPlayers((current) =>
                                  current.filter(
                                    (item) =>
                                      item.playerId !== selected.playerId,
                                  ),
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"
                              aria-label="Xóa cầu thủ"
                            >
                              <span className="material-symbols-outlined text-sm">
                                close
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h4 className="text-lg font-black text-gray-900 font-['Be_Vietnam_Pro']">
                      Ban huấn luyện
                    </h4>
                    <p className="text-sm text-gray-500">
                      {selectedCoaches.length} HLV đã chọn
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={coachToAdd}
                      onChange={(event) => setCoachToAdd(event.target.value)}
                      className="min-w-64 rounded-xl border border-[#E4E2DE] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20"
                    >
                      <option value="">Thêm HLV</option>
                      {availableCoaches.map((coach) => {
                        const coachId = Number(getCoachId(coach));
                        return (
                          <option key={coachId} value={coachId}>
                            {coach.name}{" "}
                            {coach.idCode ? `- ${coach.idCode}` : ""}
                          </option>
                        );
                      })}
                    </select>
                    <button
                      type="button"
                      onClick={addCoach}
                      disabled={!coachToAdd}
                      className="rounded-xl bg-[#008C2F] px-4 py-2 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-50"
                    >
                      Thêm
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedCoaches.length === 0 ? (
                    <EmptyText text="Chưa có HLV nào trong đơn." />
                  ) : (
                    selectedCoaches.map((selected, index) => {
                      const coach = coachMap.get(selected.coachId);
                      return (
                        <div
                          key={selected.coachId}
                          className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-[#fbf9f5] p-4 md:grid-cols-12 md:items-center"
                        >
                          <div className="md:col-span-5">
                            <p className="font-black text-gray-900">
                              {coach?.name ?? `HLV #${selected.coachId}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {coach?.idCode || "--"} -{" "}
                              {coach?.nationality || "--"}
                            </p>
                          </div>
                          <div className="md:col-span-6">
                            <SmallInput
                              label="Vai trò"
                              value={selected.role}
                              onChange={(value) =>
                                setSelectedCoaches((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, role: value }
                                      : item,
                                  ),
                                )
                              }
                            />
                          </div>
                          <div className="md:col-span-1 flex md:justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedCoaches((current) =>
                                  current.filter(
                                    (item) => item.coachId !== selected.coachId,
                                  ),
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"
                              aria-label="Xóa HLV"
                            >
                              <span className="material-symbols-outlined text-sm">
                                close
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-3 border-t border-gray-100 bg-white/95 px-6 py-4 backdrop-blur">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isBusy}
                  className="rounded-xl border border-[#E4E2DE] px-5 py-2.5 text-sm font-bold text-[#1B1C1A] hover:bg-[#F5F3EF] disabled:opacity-60"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isBusy}
                  className="rounded-xl bg-[#008C2F] px-5 py-2.5 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-60"
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const ReadonlyInfo = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="rounded-2xl bg-[#f5f3ef] p-4">
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-black text-gray-900">{value}</p>
  </div>
);

const LabeledInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="text-xs font-black uppercase tracking-widest text-gray-500">
      {label}
    </span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 w-full rounded-xl border border-[#E4E2DE] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-700/20"
    />
  </label>
);

const SmallInput = ({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string | number;
  type?: string;
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-1 w-full rounded-xl border border-[#E4E2DE] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-700/20"
    />
  </label>
);

const EmptyText = ({ text }: { text: string }) => (
  <div className="rounded-2xl border border-dashed border-gray-200 bg-[#fbf9f5] p-6 text-center text-sm font-bold text-gray-400">
    {text}
  </div>
);

export default AdminRegistrationEditModal;
