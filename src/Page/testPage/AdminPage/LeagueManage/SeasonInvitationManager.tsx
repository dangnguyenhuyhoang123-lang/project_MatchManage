import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../../../../layouts/AppLayout";
import SeasonInvitationService, {
  type InvitationStatus,
  type SeasonInvitationResponse,
} from "../../../../services/SeasonInvitationService";
import SeasonService from "../../../../services/SeasonService";
import TeamService from "../../../../services/TeamService";
import { extractApiErrorMessage } from "../../../../utils/apiError";

type SeasonOption = {
  id: number;
  name?: string;
  year?: string;
  leagueName?: string;
};

type TeamOption = {
  id?: number;
  name: string;
};

type PageData<T> = {
  content?: T[];
};

const statusMeta: Record<InvitationStatus, { label: string; className: string }> =
  {
    INVITED: {
      label: "Đã mời",
      className: "bg-blue-50 text-blue-700",
    },
    ACCEPTED: {
      label: "Đã chấp nhận",
      className: "bg-emerald-50 text-emerald-700",
    },
    DECLINED: {
      label: "Đã từ chối",
      className: "bg-amber-50 text-amber-700",
    },
    EXPIRED: {
      label: "Hết hạn",
      className: "bg-red-50 text-red-700",
    },
  };

function readArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const page = data as PageData<T> | undefined;
  return Array.isArray(page?.content) ? page.content : [];
}

function formatDateTime(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SeasonInvitationManager() {
  const [seasons, setSeasons] = useState<SeasonOption[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | "">("");
  const [selectedTeamId, setSelectedTeamId] = useState<number | "">("");
  const [responseDeadline, setResponseDeadline] = useState("");
  const [invitations, setInvitations] = useState<SeasonInvitationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [seasonRes, teamRes] = await Promise.all([
          SeasonService.getAllSeasons(0, 100),
          TeamService.getAllTeamsNormalized(0, 200),
        ]);
        const seasonList = readArray<SeasonOption>(seasonRes.data);
        const teamList = readArray<TeamOption>(teamRes);

        setSeasons(seasonList);
        setTeams(teamList.filter((team) => team.id != null));
        setSelectedSeasonId((current) => current || seasonList[0]?.id || "");
      } catch (error) {
        console.error("Cannot load seasons or teams", error);
        setErrorMessage(extractApiErrorMessage(error));
      }
    };

    loadInitialData();
  }, []);

  const selectedSeason = useMemo(
    () => seasons.find((season) => season.id === selectedSeasonId),
    [seasons, selectedSeasonId],
  );

  const loadInvitations = async (seasonId: number) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await SeasonInvitationService.getBySeason(seasonId);
      setInvitations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Cannot load season invitations", error);
      setInvitations([]);
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSeasonId) {
      loadInvitations(Number(selectedSeasonId));
    } else {
      setInvitations([]);
    }
  }, [selectedSeasonId]);

  const handleInvite = async () => {
    const nextErrors: Record<string, string> = {};
    if (!selectedSeasonId) nextErrors.selectedSeasonId = "Vui lòng chọn mùa giải.";
    if (!selectedTeamId) nextErrors.selectedTeamId = "Vui lòng chọn đội bóng cần mời.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setSubmitting(true);
      setErrorMessage("");
      await SeasonInvitationService.invite(Number(selectedSeasonId), {
        teamId: Number(selectedTeamId),
        responseDeadline: responseDeadline || null,
      });
      setSelectedTeamId("");
      setResponseDeadline("");
      await loadInvitations(Number(selectedSeasonId));
      toast.success("Đã gửi lời mời tham gia mùa giải.");
    } catch (error) {
      console.error("Cannot invite team to season", error);
      toast.error(extractApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900">
              Lời mời mùa giải
            </h2>
            <p className="mt-1 text-sm font-semibold text-gray-500">
              Mời câu lạc bộ tham gia và theo dõi phản hồi theo từng mùa giải.
            </p>
          </div>

          <select
            value={selectedSeasonId}
            onChange={(event) =>
              {
                setSelectedSeasonId(
                  event.target.value ? Number(event.target.value) : "",
                );
                setErrors((current) => ({ ...current, selectedSeasonId: "" }));
              }
            }
            className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-green-700/20 md:w-80"
          >
            <option value="">-- Chọn mùa giải --</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name || season.year || `Mùa giải #${season.id}`}
              </option>
            ))}
          </select>
          {errors.selectedSeasonId && (
            <p className="text-xs font-bold text-red-600">
              {errors.selectedSeasonId}
            </p>
          )}
        </header>

        <section className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-widest text-green-700">
              {selectedSeason?.leagueName || "Mùa giải"}
            </p>
            <h3 className="mt-1 text-xl font-black text-gray-900">
              Gửi lời mời mới
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto]">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
                Đội bóng
              </span>
              <select
                value={selectedTeamId}
                onChange={(event) =>
                  {
                    setSelectedTeamId(
                      event.target.value ? Number(event.target.value) : "",
                    );
                    setErrors((current) => ({ ...current, selectedTeamId: "" }));
                  }
                }
                className="w-full rounded-2xl border border-transparent bg-[#f5f3ef] px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-green-700/20"
              >
                <option value="">-- Chọn đội --</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              {errors.selectedTeamId && (
                <p className="mt-1 text-xs font-bold text-red-600">
                  {errors.selectedTeamId}
                </p>
              )}
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
                Hạn phản hồi
              </span>
              <input
                type="datetime-local"
                value={responseDeadline}
                onChange={(event) => setResponseDeadline(event.target.value)}
                className="w-full rounded-2xl border border-transparent bg-[#f5f3ef] px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-green-700/20"
              />
            </label>

            <button
              type="button"
              onClick={handleInvite}
              disabled={submitting || !selectedSeasonId}
              className="self-end rounded-2xl bg-[#008C2F] px-6 py-3 text-sm font-black text-white shadow-lg shadow-green-900/15 transition hover:bg-green-800 disabled:opacity-50"
            >
              {submitting ? "Đang gửi..." : "Gửi lời mời"}
            </button>
          </div>
        </section>

        {errorMessage && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
            {errorMessage}
          </div>
        )}

        <section className="rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900">
              Danh sách lời mời
            </h3>
            <span className="rounded-full bg-[#f5f3ef] px-4 py-2 text-xs font-black text-gray-500">
              {invitations.length} lời mời
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm font-bold text-gray-500">
              Đang tải lời mời...
            </div>
          ) : invitations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-[#f5f3ef] p-10 text-center text-sm font-bold text-gray-500">
              Chưa có lời mời nào cho mùa giải này.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400">
                    <th className="px-4 py-3">Đội bóng</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ngày mời</th>
                    <th className="px-4 py-3">Hạn phản hồi</th>
                    <th className="px-4 py-3">Ngày phản hồi</th>
                    <th className="px-4 py-3">Ghi chú phản hồi</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((invitation) => {
                    const meta = statusMeta[invitation.status] ?? {
                      label: invitation.status,
                      className: "bg-gray-100 text-gray-600",
                    };

                    return (
                      <tr
                        key={invitation.id}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="px-4 py-4 font-black text-gray-900">
                          {invitation.teamName}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${meta.className}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-600">
                          {formatDateTime(invitation.invitedAt)}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-600">
                          {formatDateTime(invitation.responseDeadline)}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-600">
                          {formatDateTime(invitation.respondedAt)}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-600">
                          {invitation.responseNote || "--"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
