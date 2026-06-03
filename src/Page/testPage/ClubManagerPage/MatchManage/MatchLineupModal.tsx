import React, { useEffect, useMemo, useState } from "react";
import ConfirmModal from "../../../../components/ConfirmModal";
import LoadingSpinner from "../../../../components/Spinner/LoadingSpinner";
import { useCallback } from "react";
import { MatchStatus } from "../../../../model/enum";
import type { TeamLineupResponse } from "../../../../model/Lineup";
import type { PlayerSeason } from "../../../../model/PlayerSeason";
import LineupService from "../../../../services/LineupService";
import PlayerSeasonService from "../../../../services/PlayerSeasonService";
import PlayerSuspensionService from "../../../../services/PlayerSuspensionService";
import { useRealtimeEvent } from "../../../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../../../services/websocket/NotificationSocketService";
type PositionGroup = "GK" | "DF" | "MF" | "FW";
type PlayerFilter = "ALL" | PositionGroup;

export interface MatchLineupModalMatch {
  id: number;
  status: MatchStatus;
  matchDate: string;
  competition: string;
  stadium: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  homeScore?: number;
  awayScore?: number;
}

interface MatchLineupModalProps {
  match: MatchLineupModalMatch;
  mode: "edit" | "view";
  teamId: number;
  teamName: string;
  teamSeasonId: number;
  onClose: () => void;
  onSaved?: () => void;
}

interface FormationSlot {
  key: string;
  label: string;
  position: PositionGroup;
  top: number;
  left: number;
}

interface SlotPlayer {
  id: number;
  name: string;
  avatar?: string | null;
  shirtNumber?: number;
  position: PositionGroup;
  status: PlayerStatusKey;
}

type SlotMap = Record<string, SlotPlayer | null>;
type PlayerStatusKey = "available" | "injured" | "redCard";

const FORMATIONS: Record<string, FormationSlot[]> = {
  "4-3-3": [
    slot("LW", "LW", "FW", 13, 24),
    slot("ST", "ST", "FW", 10, 50),
    slot("RW", "RW", "FW", 13, 76),
    slot("LCM", "LCM", "MF", 38, 28),
    slot("CM", "CM", "MF", 42, 50),
    slot("RCM", "RCM", "MF", 38, 72),
    slot("LB", "LB", "DF", 64, 16),
    slot("LCB", "LCB", "DF", 67, 38),
    slot("RCB", "RCB", "DF", 67, 62),
    slot("RB", "RB", "DF", 64, 84),
    slot("GK", "GK", "GK", 86, 50),
  ],
  "4-4-2": [
    slot("LS", "LS", "FW", 13, 39),
    slot("RS", "RS", "FW", 13, 61),
    slot("LM", "LM", "MF", 39, 15),
    slot("LCM", "LCM", "MF", 42, 38),
    slot("RCM", "RCM", "MF", 42, 62),
    slot("RM", "RM", "MF", 39, 85),
    slot("LB", "LB", "DF", 65, 16),
    slot("LCB", "LCB", "DF", 68, 38),
    slot("RCB", "RCB", "DF", 68, 62),
    slot("RB", "RB", "DF", 65, 84),
    slot("GK", "GK", "GK", 86, 50),
  ],
  "3-5-2": [
    slot("LS", "LS", "FW", 13, 39),
    slot("RS", "RS", "FW", 13, 61),
    slot("LWB", "LWB", "MF", 38, 10),
    slot("LCM", "LCM", "MF", 41, 30),
    slot("CM", "CM", "MF", 43, 50),
    slot("RCM", "RCM", "MF", 41, 70),
    slot("RWB", "RWB", "MF", 38, 90),
    slot("LCB", "LCB", "DF", 67, 28),
    slot("CB", "CB", "DF", 70, 50),
    slot("RCB", "RCB", "DF", 67, 72),
    slot("GK", "GK", "GK", 86, 50),
  ],
  "4-2-3-1": [
    slot("ST", "ST", "FW", 10, 50),
    slot("LAM", "LAM", "MF", 31, 25),
    slot("CAM", "CAM", "MF", 34, 50),
    slot("RAM", "RAM", "MF", 31, 75),
    slot("LDM", "LDM", "MF", 53, 38),
    slot("RDM", "RDM", "MF", 53, 62),
    slot("LB", "LB", "DF", 70, 16),
    slot("LCB", "LCB", "DF", 73, 38),
    slot("RCB", "RCB", "DF", 73, 62),
    slot("RB", "RB", "DF", 70, 84),
    slot("GK", "GK", "GK", 88, 50),
  ],
};

const fallbackAvatar =
  "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=200&h=200&fit=crop";
const fallbackLogo =
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=200&fit=crop";

function slot(
  key: string,
  label: string,
  position: PositionGroup,
  top: number,
  left: number,
): FormationSlot {
  return { key, label, position, top, left };
}

const MatchLineupModal: React.FC<MatchLineupModalProps> = ({
  match,
  mode,
  teamId,
  teamName,
  teamSeasonId,
  onClose,
  onSaved,
}) => {
  const [formation, setFormation] = useState("4-3-3");
  const [slotMap, setSlotMap] = useState<SlotMap>(() =>
    createEmptySlotMap("4-3-3"),
  );
  const [players, setPlayers] = useState<SlotPlayer[]>([]);
  const [benchPlayers, setBenchPlayers] = useState<SlotPlayer[]>([]);
  const [suspendedPlayerIds, setSuspendedPlayerIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);
  const [positionFilter, setPositionFilter] = useState<PlayerFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [hasExistingLineup, setHasExistingLineup] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const isReadOnly = mode === "view";
  const slots = FORMATIONS[formation];
  const filledSlots = slots.filter((item) => slotMap[item.key]).length;
  const selectedSlot = selectedSlotKey
    ? slots.find((item) => item.key === selectedSlotKey)
    : null;

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        setNotice("");

        const normalizedTeamSeasonId = Number(teamSeasonId);

        if (
          !Number.isFinite(normalizedTeamSeasonId) ||
          normalizedTeamSeasonId <= 0
        ) {
          throw new Error("Invalid teamSeasonId");
        }
        const [registeredPlayers, lineupData, suspensionRes] = await Promise.all([
          PlayerSeasonService.getPlayerSeasonsByTeamSeason(
            normalizedTeamSeasonId,
          ),
          loadLineup(match.id, teamId),
          PlayerSuspensionService.getActiveByMatch(match.id),
        ]);

        if (!mounted) return;
        const suspendedIds = new Set(
          (Array.isArray(suspensionRes.data) ? suspensionRes.data : []).map(
            (item) => item.playerId,
          ),
        );
        setSuspendedPlayerIds(suspendedIds);
        setPlayers(
          extractPlayerSeasons(registeredPlayers)
            .filter((playerSeason) =>
              hasTeamSeasonId(playerSeason, normalizedTeamSeasonId),
            )
            .map((playerSeason) =>
              normalizeRegisteredPlayer(playerSeason, suspendedIds),
            )
            .filter((player: SlotPlayer | null): player is SlotPlayer =>
              Boolean(player),
            ),
        );

        if (lineupData) {
          hydrateLineup(lineupData);
          setHasExistingLineup(true);
        } else {
          setHasExistingLineup(false);
          const initialFormation = "4-3-3";
          setFormation(initialFormation);
          setSlotMap(createEmptySlotMap(initialFormation));
          setBenchPlayers([]);
          setSelectedSlotKey(null);

          if (isReadOnly) {
            setNotice("Trận đấu này chưa có đội hình đã lưu.");
          }
        }
      } catch (err) {
        console.error("Cannot load lineup modal data", err);
        if (mounted) {
          setError(
            "Không thể tải dữ liệu đội hình hoặc cầu thủ đã đăng ký từ API.",
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [match.id, teamId, teamSeasonId, isReadOnly, reloadKey]);

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEventDTO) => {
      if (
        event.referenceId === match.id &&
        (event.action === "REFETCH_LINEUPS" ||
          event.referenceType === "MATCH_LINEUP")
      ) {
        setReloadKey((current) => current + 1);
      }
    },
    [match.id],
  );

  useRealtimeEvent(handleRealtimeEvent);

  const selectedPlayerIds = useMemo(
    () =>
      new Set(
        [...Object.values(slotMap), ...benchPlayers]
          .filter(Boolean)
          .map((player) => player!.id),
      ),
    [benchPlayers, slotMap],
  );

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      if (positionFilter !== "ALL" && player.position !== positionFilter) {
        return false;
      }
      if (selectedSlot && player.position !== selectedSlot.position) {
        return false;
      }
      return true;
    });
  }, [players, positionFilter, selectedSlot]);

  const handleFormationChange = (value: string) => {
    setFormation(value);
    setSlotMap(createEmptySlotMap(value));
    setSelectedSlotKey(null);
    setPositionFilter("ALL");
  };

  const handleSlotSelect = (slotKey: string) => {
    setSelectedSlotKey(slotKey);
    const nextSlot = slots.find((item) => item.key === slotKey);
    if (nextSlot) {
      setPositionFilter(nextSlot.position);
    }
  };

  const assignPlayer = (player: SlotPlayer) => {
    if (isReadOnly || player.status !== "available") return;

    const exactSelectedSlot = selectedSlotKey
      ? (FORMATIONS[formation].find((item) => item.key === selectedSlotKey) ??
        null)
      : null;
    const targetSlot =
      exactSelectedSlot ??
      slots.find(
        (item) => !slotMap[item.key] && item.position === player.position,
      );

    if (!targetSlot) {
      setNotice("Hãy chọn đúng ô vị trí trong sơ đồ trước khi thêm cầu thủ.");
      return;
    }

    if (targetSlot.position !== player.position) {
      setNotice(
        `Ô ${targetSlot.label} chỉ nhận cầu thủ nhóm vị trí ${targetSlot.position}.`,
      );
      return;
    }

    setNotice("");
    setSlotMap((current) => {
      const next: SlotMap = { ...current };
      Object.keys(next).forEach((key) => {
        if (next[key]?.id === player.id) next[key] = null;
      });
      next[targetSlot.key] = player;
      return next;
    });
    setSelectedSlotKey(targetSlot.key);
  };

  const removePlayer = (slotKey: string) => {
    if (isReadOnly) return;
    setSlotMap((current) => ({ ...current, [slotKey]: null }));
  };

  const toggleBenchPlayer = (player: SlotPlayer) => {
    if (isReadOnly || player.status !== "available") return;

    setBenchPlayers((current) => {
      if (current.some((item) => item.id === player.id)) {
        return current.filter((item) => item.id !== player.id);
      }

      if (selectedPlayerIds.has(player.id)) {
        setNotice("Cầu thủ đã có trong đội hình chính hoặc danh sách dự bị.");
        return current;
      }

      if (current.length >= 5) {
        setNotice("Chỉ được chọn đúng 5 cầu thủ dự bị.");
        return current;
      }

      setNotice("");
      return [...current, player];
    });
  };

  const saveLineup = async () => {
    const missingSlots = slots.filter((item) => !slotMap[item.key]);
    if (missingSlots.length > 0) {
      setNotice(
        `Cần chọn đủ 11 cầu thủ. Còn thiếu ${missingSlots.length} vị trí.`,
      );
      return;
    }

    if (benchPlayers.length !== 5) {
      setNotice(`Cần chọn đúng 5 cầu thủ dự bị. Hiện có ${benchPlayers.length}/5.`);
      return;
    }

    const suspendedSelected = [...Object.values(slotMap), ...benchPlayers]
      .filter(Boolean)
      .find((player) => suspendedPlayerIds.has(player!.id));
    if (suspendedSelected) {
      setNotice("Đội hình có cầu thủ bị treo giò. Vui lòng bỏ cầu thủ đó trước khi lưu.");
      return;
    }

    try {
      setSaving(true);
      setNotice("");
      setError("");
      await LineupService.submitLineup(match.id, teamId, {
        formationName: formation,
        description: `Đội hình ${formation} của ${teamName}`,
        lineups: [
          ...slots.map((item, index) => {
            const player = slotMap[item.key]!;
            return {
              playerId: player.id,
              position: item.label,
              shirtNumber: player.shirtNumber,
              isStarting: true,
              lineupOrder: index + 1,
              role: item.position,
            };
          }),
          ...benchPlayers.map((player, index) => ({
            playerId: player.id,
            position: player.position,
            shirtNumber: player.shirtNumber,
            isStarting: false,
            lineupOrder: slots.length + index + 1,
            role: player.position,
          })),
        ],
      });

      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Cannot submit lineup", err);
      setError(
        "Không thể lưu đội hình. Vui lòng kiểm tra cầu thủ bị treo giò hoặc dữ liệu đội hình.",
      );
    } finally {
      setSaving(false);
    }
  };

  const hydrateLineup = (lineup: TeamLineupResponse) => {
    const nextFormation = getKnownFormation(lineup.formationName);
    const nextSlots = FORMATIONS[nextFormation];
    const nextMap = createEmptySlotMap(nextFormation);

    const rawLineups = lineup.lineups ?? lineup.players ?? [];

    const sortedPlayers = [...rawLineups]
      .filter((player) => player.isStarting !== false)
      .sort((a, b) => (a.lineupOrder ?? 0) - (b.lineupOrder ?? 0));

    const nextBenchPlayers: SlotPlayer[] = [...rawLineups]
      .filter((player) => player.isStarting === false)
      .sort((a, b) => (a.lineupOrder ?? 0) - (b.lineupOrder ?? 0))
      .map((lineupPlayer) => ({
        id: lineupPlayer.playerId,
        name: lineupPlayer.playerName,
        avatar: lineupPlayer.avatar,
        shirtNumber: lineupPlayer.shirtNumber,
        position: normalizePosition(lineupPlayer.role ?? lineupPlayer.position ?? ""),
        status: suspendedPlayerIds.has(lineupPlayer.playerId)
          ? "redCard"
          : "available",
      }));

    sortedPlayers.forEach((lineupPlayer) => {
      const targetSlot =
        nextSlots.find((slot) => slot.label === lineupPlayer.position) ??
        nextSlots[(lineupPlayer.lineupOrder ?? 1) - 1];

      if (!targetSlot) return;

      nextMap[targetSlot.key] = {
        id: lineupPlayer.playerId,
        name: lineupPlayer.playerName,
        avatar: lineupPlayer.avatar,
        shirtNumber: lineupPlayer.shirtNumber,
        position: targetSlot.position,
        status: "available",
      };
    });

    setFormation(nextFormation);
    setSlotMap(nextMap);
    setBenchPlayers(nextBenchPlayers);
    setSelectedSlotKey(null);
  };

  const deleteLineupAction = async () => {
    try {
      setSaving(true);
      setNotice("");
      setError("");
      await LineupService.deleteLineup(match.id, teamId);

      setHasExistingLineup(false);
      setSlotMap(createEmptySlotMap(formation));
      setBenchPlayers([]);

      onSaved?.();
      setDeleteConfirmOpen(false);
      setNotice("Đã xóa đội hình thành công.");
    } catch (err) {
      console.error("Cannot delete lineup", err);
      setError("Không thể xóa đội hình. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <MatchHeader match={match} />

      {error && (
        <div className="rounded-sm border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-sm border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          {notice}
        </div>
      )}

      <StrategyRow
        formation={formation}
        filledSlots={filledSlots}
        isReadOnly={isReadOnly}
        onFormationChange={handleFormationChange}
      />

      {loading ? (
        <LoadingSpinner
          message="Đang tải dữ liệu đội hình"
          description="Danh sách cầu thủ đăng ký và đội hình đã lưu đang được đồng bộ từ backend."
          fullHeight
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          <section className="xl:col-span-8">
            <PitchCard
              slots={slots}
              slotMap={slotMap}
              selectedSlotKey={selectedSlotKey}
              isReadOnly={isReadOnly}
              onSlotSelect={handleSlotSelect}
              onRemovePlayer={removePlayer}
            />
          </section>

          <aside className="xl:col-span-4">
            <AvailablePlayersPanel
              players={filteredPlayers}
              allCount={players.length}
              positionFilter={positionFilter}
              selectedPlayerIds={selectedPlayerIds}
              benchPlayers={benchPlayers}
              selectedSlot={selectedSlot}
              isReadOnly={isReadOnly}
              onFilterChange={setPositionFilter}
              onSelectPlayer={assignPlayer}
              onToggleBenchPlayer={toggleBenchPlayer}
            />
          </aside>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        {!isReadOnly && hasExistingLineup && (
          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={saving || loading}
            className="rounded-full bg-red-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-900/15 transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 sm:mr-auto"
          >
            {saving ? "Đang xử lý..." : "Xóa đội hình"}
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-gray-200 px-6 py-3 text-sm font-black text-gray-600 transition hover:bg-gray-50"
        >
          {isReadOnly ? "Đóng" : "Hủy bỏ"}
        </button>

        {!isReadOnly && (
          <button
            type="button"
            onClick={saveLineup}
            disabled={saving || loading}
            className="rounded-full bg-[#008C2F] px-7 py-3 text-sm font-black text-white shadow-lg shadow-green-900/15 transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu đội hình"}
          </button>
        )}
      </div>
      <ConfirmModal
        open={deleteConfirmOpen}
        title="Xóa đội hình"
        message="Bạn có chắc chắn muốn xóa đội hình này?"
        confirmText="Xóa đội hình"
        cancelText="Hủy"
        danger
        loading={saving}
        onConfirm={deleteLineupAction}
        onClose={() => {
          if (!saving) setDeleteConfirmOpen(false);
        }}
      />
    </div>
  );
};

export default MatchLineupModal;

function MatchHeader({ match }: { match: MatchLineupModalMatch }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-[#f5f3ef] px-6 py-7 shadow-sm">
      <div className="absolute right-4 top-4">
        <span
          className={`rounded-full border px-4 py-1 text-xs font-black uppercase tracking-widest ${
            match.status === MatchStatus.SCHEDULED
              ? "border-[#008C2F]/20 bg-[#008C2F]/10 text-[#008C2F]"
              : match.status === MatchStatus.LIVE
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-gray-200 bg-white text-gray-500"
          }`}
        >
          {getStatusLabel(match.status)}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center gap-8 lg:flex-row">
        <TeamHeader
          logo={match.homeTeamLogo}
          name={match.homeTeamName}
          role="CHỦ NHÀ"
          roleClassName="text-indigo-500"
        />

        <div className="w-full border-y border-gray-200 py-6 text-center lg:w-auto lg:border-x lg:border-y-0 lg:px-14 lg:py-0">
          {match.status === MatchStatus.FINISHED ? (
            <p className="font-['Be_Vietnam_Pro'] text-4xl font-black text-gray-700">
              {match.homeScore ?? 0} - {match.awayScore ?? 0}
            </p>
          ) : (
            <p className="font-['Be_Vietnam_Pro'] text-4xl font-black text-gray-700">
              VS
            </p>
          )}

          <div className="mt-4 space-y-2">
            <p className="flex items-center justify-center gap-2 text-sm font-bold text-gray-600">
              <span className="material-symbols-outlined text-base">
                calendar_today
              </span>
              {formatDateTime(match.matchDate)}
            </p>

            <p className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-400">
              <span className="material-symbols-outlined text-base">
                location_on
              </span>
              {match.stadium || "Chưa cập nhật sân vận động"}
            </p>
          </div>
        </div>

        <TeamHeader
          logo={match.awayTeamLogo}
          name={match.awayTeamName}
          role="ĐỘI KHÁCH"
          roleClassName="text-gray-400"
        />
      </div>
    </section>
  );
}

function TeamHeader({
  logo,
  name,
  role,
  roleClassName,
}: {
  logo?: string;
  name: string;
  role: string;
  roleClassName: string;
}) {
  return (
    <div className="min-w-[220px] text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white p-2 shadow-sm">
        <img
          src={logo || fallbackLogo}
          alt={name}
          className="h-14 w-14 rounded-full object-cover"
        />
      </div>

      <h2 className="mt-4 font-['Be_Vietnam_Pro'] text-xl font-black text-gray-900">
        {name}
      </h2>

      <p className={`mt-2 text-xs font-black tracking-wide ${roleClassName}`}>
        {role}
      </p>
    </div>
  );
}

function StrategyRow({
  formation,
  filledSlots,
  isReadOnly,
  onFormationChange,
}: {
  formation: string;
  filledSlots: number;
  isReadOnly: boolean;
  onFormationChange: (value: string) => void;
}) {
  return (
    <section className="grid grid-cols-1 items-end gap-6 xl:grid-cols-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end xl:col-span-8">
        <div>
          <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
            Chiến thuật chủ đạo
          </label>

          <div className="relative mt-1">
            <select
              value={formation}
              disabled={isReadOnly}
              onChange={(event) => onFormationChange(event.target.value)}
              className="h-12 w-52 appearance-none rounded-full border border-gray-100 bg-white px-5 pr-10 text-sm font-black text-[#008C2F] shadow-sm outline-none focus:ring-2 focus:ring-[#008C2F]/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
            >
              {Object.keys(FORMATIONS).map((item) => (
                <option key={item} value={item}>
                  Sơ đồ {item}
                </option>
              ))}
            </select>

            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#008C2F]">
              expand_more
            </span>
          </div>
        </div>
      </div>

      <div className="xl:col-span-4 xl:flex xl:justify-end">
        <div
          className={`flex items-center gap-3 rounded-[1.5rem] px-5 py-4 ${
            filledSlots === 11
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          <span className="material-symbols-outlined">
            {filledSlots === 11 ? "check_circle" : "warning"}
          </span>
          <p className="text-xs font-bold">
            Đã chọn {filledSlots}/11 vị trí trong đội hình chính.
          </p>
        </div>
      </div>
    </section>
  );
}

function PitchCard({
  slots,
  slotMap,
  selectedSlotKey,
  isReadOnly,
  onSlotSelect,
  onRemovePlayer,
}: {
  slots: FormationSlot[];
  slotMap: SlotMap;
  selectedSlotKey: string | null;
  isReadOnly: boolean;
  onSlotSelect: (slotKey: string) => void;
  onRemovePlayer: (slotKey: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-white p-5 shadow-xl shadow-gray-900/5">
      <div className="relative min-h-[620px] overflow-hidden rounded-[1.5rem] border-4 border-white/20 bg-[radial-gradient(circle_at_center,#2e7d32_0%,#0d631b_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:40px_40px] opacity-30" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/20" />
        <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />

        {slots.map((slotItem) => (
          <PlayerSlotItem
            key={slotItem.key}
            slot={slotItem}
            player={slotMap[slotItem.key]}
            selected={selectedSlotKey === slotItem.key}
            isReadOnly={isReadOnly}
            onSelect={() => onSlotSelect(slotItem.key)}
            onRemove={() => onRemovePlayer(slotItem.key)}
          />
        ))}
      </div>
    </section>
  );
}

function PlayerSlotItem({
  slot,
  player,
  selected,
  isReadOnly,
  onSelect,
  onRemove,
}: {
  slot: FormationSlot;
  player: SlotPlayer | null;
  selected: boolean;
  isReadOnly: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="absolute w-24 -translate-x-1/2 -translate-y-1/2 text-center outline-none"
      style={{ top: `${slot.top}%`, left: `${slot.left}%` }}
    >
      <div
        className={`relative mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 shadow-lg transition ${
          selected
            ? "scale-110 border-yellow-300 bg-yellow-100"
            : player
              ? "border-white/70 bg-white/10 hover:scale-105"
              : "border-red-300/70 bg-red-500/10 hover:scale-105"
        }`}
      >
        {player ? (
          <>
            <img
              src={player.avatar || fallbackAvatar}
              alt={player.name}
              className="h-full w-full object-cover"
            />
            {!isReadOnly && (
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onRemove();
                  }
                }}
                className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white"
              >
                ×
              </span>
            )}
          </>
        ) : (
          <span className="material-symbols-outlined text-3xl text-red-100">
            add_circle
          </span>
        )}
      </div>

      <div
        className={`mt-2 truncate rounded px-2 py-1 text-[10px] font-black shadow-sm ${
          player ? "bg-white/90 text-gray-700" : "bg-red-600 text-white"
        }`}
      >
        {player ? player.name : slot.label}
      </div>

      <span className="mt-1 inline-flex rounded-full bg-black/20 px-2 py-0.5 text-[9px] font-black text-white">
        {slot.position}
      </span>
    </button>
  );
}

function AvailablePlayersPanel({
  players,
  allCount,
  positionFilter,
  selectedPlayerIds,
  benchPlayers,
  selectedSlot,
  isReadOnly,
  onFilterChange,
  onSelectPlayer,
  onToggleBenchPlayer,
}: {
  players: SlotPlayer[];
  allCount: number;
  positionFilter: PlayerFilter;
  selectedPlayerIds: Set<number>;
  benchPlayers: SlotPlayer[];
  selectedSlot?: FormationSlot | null;
  isReadOnly: boolean;
  onFilterChange: (filter: PlayerFilter) => void;
  onSelectPlayer: (player: SlotPlayer) => void;
  onToggleBenchPlayer: (player: SlotPlayer) => void;
}) {
  return (
    <section className="flex h-[620px] min-h-[620px] flex-col rounded-[2rem] bg-[#f5f3ef] p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-['Be_Vietnam_Pro'] text-xl font-black text-gray-900">
            Cầu thủ đã đăng ký
          </h3>
          {selectedSlot && !isReadOnly && (
            <p className="mt-1 text-xs font-bold text-gray-500">
              Đang chọn ô {selectedSlot.label} ({selectedSlot.position})
            </p>
          )}
        </div>

        <span className="rounded-full bg-[#008C2F]/10 px-3 py-1 text-xs font-black text-[#008C2F]">
          {allCount} Tổng
        </span>
      </div>

      <div className="mb-6 flex gap-2">
        {(["ALL", "GK", "DF", "MF", "FW"] as PlayerFilter[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onFilterChange(item)}
            className={`flex-1 rounded-full py-2 text-xs font-black transition ${
              positionFilter === item
                ? "bg-[#008C2F] text-white"
                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
            }`}
          >
            {item === "ALL" ? "TẤT CẢ" : item}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
        {players.length === 0 ? (
          <div className="rounded-[1.5rem] bg-white p-5 text-center text-sm font-bold text-gray-500">
            Không có cầu thủ phù hợp bộ lọc.
          </div>
        ) : (
          players.map((player) => (
            <AvailablePlayerRow
              key={player.id}
              player={player}
              selected={selectedPlayerIds.has(player.id)}
              benchSelected={benchPlayers.some((item) => item.id === player.id)}
              disabled={
                isReadOnly ||
                player.status !== "available" ||
                selectedPlayerIds.has(player.id)
              }
              onSelect={() => onSelectPlayer(player)}
              onToggleBench={() => onToggleBenchPlayer(player)}
            />
          ))
        )}
      </div>

      <div className="mt-5 rounded-[1.5rem] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">
            Dự bị
          </p>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black text-amber-700">
            {benchPlayers.length}/5
          </span>
        </div>
        {benchPlayers.length === 0 ? (
          <p className="text-xs font-bold text-gray-400">
            Chưa chọn cầu thủ dự bị.
          </p>
        ) : (
          <div className="space-y-2">
            {benchPlayers.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => onToggleBenchPlayer(player)}
                disabled={isReadOnly}
                className="flex w-full items-center justify-between rounded-xl bg-[#f5f3ef] px-3 py-2 text-left text-xs font-bold text-gray-700 disabled:cursor-not-allowed"
              >
                <span className="truncate">{player.name}</span>
                {!isReadOnly && (
                  <span className="material-symbols-outlined text-sm text-red-500">
                    close
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 text-[10px] font-black">
        <StatusLegend
          label="Thi đấu được"
          className="bg-emerald-100 text-emerald-700"
        />
        <StatusLegend label="Chấn thương" className="bg-red-100 text-red-600" />
        <StatusLegend label="Thẻ đỏ" className="bg-gray-200 text-gray-600" />
      </div>
    </section>
  );
}

function StatusLegend({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span className={`rounded-full px-2 py-2 text-center ${className}`}>
      {label}
    </span>
  );
}

function AvailablePlayerRow({
  player,
  selected,
  benchSelected,
  disabled,
  onSelect,
  onToggleBench,
}: {
  player: SlotPlayer;
  selected: boolean;
  benchSelected: boolean;
  disabled: boolean;
  onSelect: () => void;
  onToggleBench: () => void;
}) {
  const status = getPlayerStatusMeta(player.status);

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => {
        if (!disabled) onSelect();
      }}
      onKeyDown={(event) => {
        if (!disabled && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`group flex w-full items-center gap-3 rounded-[1.5rem] bg-white p-3 text-left transition hover:shadow-md disabled:cursor-not-allowed ${
        selected ? "border-l-4 border-indigo-300" : ""
      } ${disabled && !selected ? "opacity-60" : ""}`}
    >
      <div
        className={`h-11 w-11 overflow-hidden rounded-xl ${
          player.status !== "available" ? "grayscale" : ""
        }`}
      >
        <img
          src={player.avatar || fallbackAvatar}
          alt={player.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-black text-gray-800">
            {player.name}
          </p>
          <span className="text-[10px] font-black text-indigo-600">
            {player.position}
          </span>
        </div>

        <p
          className={`mt-1 flex items-center gap-1 text-[10px] font-black ${status.className}`}
        >
          <span className="material-symbols-outlined text-xs">
            {status.icon}
          </span>
          {selected ? "Đã chọn" : status.label}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleBench();
          }}
          disabled={disabled && !benchSelected}
          className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700 disabled:opacity-40"
        >
          {benchSelected ? "Bỏ DB" : "Dự bị"}
        </button>
        <span
          className={`material-symbols-outlined transition ${
            disabled
              ? "text-gray-300"
              : "text-gray-300 group-hover:text-[#008C2F]"
          }`}
        >
          {selected
            ? "check_circle"
            : disabled
              ? "do_not_disturb_on"
              : "add_circle"}
        </span>
      </div>
    </div>
  );
}

function createEmptySlotMap(formation: string): SlotMap {
  return FORMATIONS[formation].reduce<SlotMap>((map, item) => {
    map[item.key] = null;
    return map;
  }, {});
}

async function loadLineup(matchId: number, teamId: number) {
  try {
    const response = await LineupService.getLineupByMatchAndTeam(
      matchId,
      teamId,
    );
    if (response.status === 404) return null;
    const resData: any = response.data;
    if (resData && resData.data && !Array.isArray(resData.data))
      return resData.data;
    return resData;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    return null;
  }
}

function extractPlayerSeasons(data: any): Array<PlayerSeason | any> {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  return [];
}

function hasTeamSeasonId(
  playerSeason: PlayerSeason | any,
  teamSeasonId: number,
) {
  const rawTeamSeasonId =
    playerSeason?.teamSeasonId ??
    playerSeason?.teamseasonId ??
    playerSeason?.teamSeasonID ??
    playerSeason?.teamSeason?.id ??
    playerSeason?.teamseason?.id;

  return Number(rawTeamSeasonId) === teamSeasonId;
}

function normalizeRegisteredPlayer(
  playerSeason: PlayerSeason | any,
  suspendedPlayerIds: Set<number> = new Set(),
): SlotPlayer | null {
  const player = playerSeason?.player ?? {};
  const playerId = Number(
    playerSeason?.playerId ?? player?.id ?? playerSeason?.id,
  );

  if (!playerId) return null;

  return {
    id: playerId,
    name: playerSeason?.playerName ?? player?.name ?? "Cầu thủ chưa cập nhật",
    avatar:
      playerSeason?.avatar ?? playerSeason?.playerAvatar ?? player?.avatar,
    shirtNumber: playerSeason?.shirtNumber ?? player?.shirtNumber,
    position: normalizePosition(
      playerSeason?.primaryPosition ??
        playerSeason?.position ??
        player?.position ??
        player?.detailPosition ??
        "",
    ),
    status: suspendedPlayerIds.has(playerId)
      ? "redCard"
      : normalizePlayerStatus(
          playerSeason?.playerStatus ??
            playerSeason?.status ??
            player?.status ??
            "ACTIVE",
        ),
  };
}

function normalizePosition(value: string): PositionGroup {
  const normalized = removeVietnameseMark(value).toUpperCase();
  const compact = normalized.replace(/[^A-Z0-9]/g, "");

  if (matchesPosition(compact, ["GK", "GOALKEEPER", "THUMON"])) {
    return "GK";
  }

  if (
    matchesPosition(compact, [
      "DF",
      "DEF",
      "DEFENDER",
      "BACK",
      "HAUVE",
      "CB",
      "LCB",
      "RCB",
      "LB",
      "RB",
      "SW",
      "SWEEPER",
      "CENTERBACK",
      "CENTREBACK",
      "FULLBACK",
    ])
  ) {
    return "DF";
  }

  if (
    matchesPosition(compact, [
      "FW",
      "ST",
      "CF",
      "SS",
      "RW",
      "LW",
      "RF",
      "LF",
      "FORWARD",
      "TIENDAO",
      "WINGER",
      "STRIKER",
    ])
  ) {
    return "FW";
  }

  return "MF";
}

function matchesPosition(value: string, candidates: string[]) {
  return candidates.some((candidate) => value.includes(candidate));
}

function normalizePlayerStatus(value: string): PlayerStatusKey {
  const normalized = removeVietnameseMark(value).toUpperCase();
  if (normalized.includes("INJURED") || normalized.includes("CHAN THUONG")) {
    return "injured";
  }
  if (
    normalized.includes("RED") ||
    normalized.includes("THE DO") ||
    normalized.includes("SUSPENDED") ||
    normalized.includes("TREO GIO")
  ) {
    return "redCard";
  }
  return "available";
}

function getPlayerStatusMeta(status: PlayerStatusKey) {
  if (status === "injured") {
    return {
      label: "Chấn thương",
      icon: "medical_services",
      className: "text-red-500",
    };
  }

  if (status === "redCard") {
    return {
      label: "Thẻ đỏ",
      icon: "style",
      className: "text-gray-500",
    };
  }

  return {
    label: "Thi đấu được",
    icon: "check_circle",
    className: "text-emerald-600",
  };
}

function getKnownFormation(value?: string) {
  const normalized = value?.match(/\d-\d-\d(?:-\d)?/)?.[0] ?? value ?? "4-3-3";
  return FORMATIONS[normalized] ? normalized : "4-3-3";
}

function getStatusLabel(status: MatchStatus) {
  if (status === MatchStatus.SCHEDULED) return "Sắp thi đấu";
  if (status === MatchStatus.LIVE) return "Đang diễn ra";
  if (status === MatchStatus.FINISHED) return "Đã kết thúc";
  return "Tạm hoãn";
}

function formatDateTime(value: string) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function removeVietnameseMark(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}
