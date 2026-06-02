import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { MatchModel } from "../../model/Match/MatchModel";
import { MatchStatus } from "../../model/enum";
import { ListMatchManage } from "../../utils/labelManage/ManageMatch/ListMatchhManage";
import { MatchForm } from "../../utils/labelManage/ManageMatch/MatchForm";
import { useAuth } from "../../utils/useAuth";
import {
  createAdminMatch,
  deleteAdminMatch,
  getAdminMatches,
  type MatchAdminOptions,
  type MatchFormValues,
  updateAdminMatch,
} from "../../services/AdminMatchAPI";
import LoadingSpinner from "../../components/Spinner/LoadingSpinner";

type MatchFilters = {
  status?: string;
  search?: string;
  seasonId?: number;
  roundId?: number;
  teamId?: number;
};
const toDatetimeLocalValue = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const toFormValues = (match: MatchModel): MatchFormValues => ({
  id: match.id,
  matchDate: toDatetimeLocalValue(new Date(match.matchDate)),
  status: match.status,
  homeScore: match.homeScore != null ? String(match.homeScore) : "",
  awayScore: match.awayScore != null ? String(match.awayScore) : "",
  homeTeamId: match.homeTeam?.id != null ? String(match.homeTeam.id) : "",
  awayTeamId: match.awayTeam?.id != null ? String(match.awayTeam.id) : "",
  leagueId: match.league?.id != null ? String(match.league.id) : "",
  seasonId: match.season?.id != null ? String(match.season.id) : "",
});

const createEmptyMatchFormValues = (): MatchFormValues => ({
  matchDate: "",
  status: MatchStatus.SCHEDULED,
  homeScore: "",
  awayScore: "",
  homeTeamId: "",
  awayTeamId: "",
  leagueId: "",
  seasonId: "",
});

const formatStatusLabel = (status: string) =>
  status.charAt(0) + status.slice(1).toLowerCase();

// const getOptionLabel = (options: MatchOptionItem[], id: string) =>
//   options.find((option) => option.id === id)?.label || "Dang cap nhat";

const MatchManagementPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchModel[]>([]);
  const [options, setOptions] = useState<MatchAdminOptions>({
    teams: [],
    leagues: [],
    seasons: [],
  });
  console.log(options);
  const [formData, setFormData] = useState<MatchFormValues>(
    createEmptyMatchFormValues(),
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  // const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<MatchFilters>({});

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    if (
      !loading &&
      user &&
      !user.roles.includes("ROLE_ADMIN") &&
      !user.roles.includes("ROLE_STAFF")
    ) {
      navigate("/");
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!user) {
      setIsPageLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      try {
        if (matches.length === 0) {
          setIsPageLoading(true);
        } else {
          setIsListLoading(true);
        }

        const response = await getAdminMatches({
          page: 0,
          size: 20,
          ...filters,
        });

        if (!isMounted) return;

        const matchList = Array.isArray(response?.content)
          ? response.content
          : Array.isArray(response)
            ? response
            : [];

        setMatches(matchList);
      } catch (err) {
        if (isMounted) setError("Khong the tai du lieu");
      } finally {
        if (isMounted) {
          setIsPageLoading(false);
          setIsListLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, filters]);

  // useEffect(() => {
  //   if (!user) {
  //     setIsLoading(false);
  //     return;
  //   }

  //   let isMounted = true;

  //   const loadData = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await getAdminMatches();

  //       if (!isMounted) {
  //         return;
  //       }

  //       setMatches(response.matches);
  //       setOptions(response.options);
  //     } catch (fetchError) {
  //       if (isMounted) {
  //         setError(
  //           fetchError instanceof Error
  //             ? fetchError.message
  //             : "Khong the tai danh sach tran dau.",
  //         );
  //       }
  //     } finally {
  //       if (isMounted) {
  //         setIsLoading(false);
  //       }
  //     }
  //   };

  //   loadData();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, [user]);

  const selectedHomeTeam = useMemo(
    () => options.teams.find((team) => team.id === formData.homeTeamId),
    [formData.homeTeamId, options.teams],
  );

  const selectedAwayTeam = useMemo(
    () => options.teams.find((team) => team.id === formData.awayTeamId),
    [formData.awayTeamId, options.teams],
  );

  const handleChange =
    (field: keyof MatchFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const resetForm = () => {
    setFormData(createEmptyMatchFormValues());
    setEditingId(null);
    setError("");
    setMessage("");
  };

  const handleEdit = (match: MatchModel) => {
    setFormData(toFormValues(match));
    setEditingId(match.id ?? null);
    setMessage("");
    setError("");
  };

  const reloadMatches = async () => {
    const response = await getAdminMatches({
      page: 0,
      size: 20,
      ...filters,
    });

    const matchList = Array.isArray(response?.content)
      ? response.content
      : Array.isArray(response)
        ? response
        : [];

    setMatches(matchList);
  };

  const validateForm = () => {
    if (
      !formData.matchDate ||
      !formData.homeTeamId ||
      !formData.awayTeamId ||
      !formData.leagueId ||
      !formData.seasonId
    ) {
      throw new Error("Vui long nhap day du thong tin tran dau.");
    }

    if (formData.homeTeamId === formData.awayTeamId) {
      throw new Error("Hai doi bong khong duoc trung nhau.");
    }

    if (
      formData.status === MatchStatus.FINISHED &&
      (formData.homeScore.trim() === "" || formData.awayScore.trim() === "")
    ) {
      throw new Error("Tran dau da ket thuc can co ti so.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      validateForm();
      setIsSubmitting(true);

      const payload = {
        matchDate: formData.matchDate,
        status: formData.status,
        homeScore:
          formData.homeScore.trim() === "" ? null : Number(formData.homeScore),
        awayScore:
          formData.awayScore.trim() === "" ? null : Number(formData.awayScore),
        homeTeamId: Number(formData.homeTeamId),
        awayTeamId: Number(formData.awayTeamId),
        leagueId: Number(formData.leagueId),
        seasonId: Number(formData.seasonId),
      };

      if (editingId) {
        await updateAdminMatch(editingId, payload);
        setMessage("Cap nhat tran dau thanh cong.");
      } else {
        await createAdminMatch(payload);
        setMessage("Them tran dau thanh cong.");
      }

      await reloadMatches();
      resetForm();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Khong the luu tran dau.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (matchId?: number) => {
    if (!matchId) {
      return;
    }

    const shouldDelete = window.confirm(
      "Ban co chac muon xoa tran dau nay khong?",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await deleteAdminMatch(matchId);

      if (editingId === matchId) {
        resetForm();
      }

      await reloadMatches();
      setMessage("Xoa tran dau thanh cong.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Khong the xoa tran dau.",
      );
    }
  };

  type MatchFilters = {
    status?: string;
    search?: string;
    seasonId?: number;
    roundId?: number;
    teamId?: number;
  };

  const handleFilterChange = (newFilters: MatchFilters) => {
    setFilters(newFilters);
  };
  if (loading || isPageLoading) {
    return <LoadingSpinner message="Dang tai du lieu..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center rounded-xl border border-emerald-200 bg-white px-5 py-3 font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
        >
          ← Quay ve trang chu
        </Link>

        <div className="mt-6 grid xl:grid-cols-[420px_1fr] gap-6">
          <MatchForm
            formData={formData}
            options={options}
            editingId={editingId}
            isSubmitting={isSubmitting}
            message={message}
            error={error}
            selectedHomeTeam={selectedHomeTeam}
            selectedAwayTeam={selectedAwayTeam}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            resetForm={resetForm}
            formatStatusLabel={formatStatusLabel}
          />
          <ListMatchManage
            matches={matches}
            options={options}
            formatStatusLabel={formatStatusLabel}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            onFilterChange={handleFilterChange}
            isLoading={isListLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default MatchManagementPage;
