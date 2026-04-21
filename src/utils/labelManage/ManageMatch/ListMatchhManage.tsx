import { useState, useEffect } from "react";
import { getAdminMatches } from "../../../services/AdminMatchAPI";
import LoadingSpinner from "../../../components/Spinner/LoadingSpinner";
import { PhanTrang } from "../../PhanTrang";
export const ListMatchManage = ({
  matches,
  options,
  formatStatusLabel,
  handleDelete,
  handleEdit,
  onFilterChange,
  isLoading,
}) => {
  // Add states for league and season filters
  const [selectedLeague, setSelectedLeague] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  // const filteredMatches = useMemo(() => {
  //   const leagueId = selectedLeague ? Number(selectedLeague) : null;
  //   const seasonId = selectedSeason ? Number(selectedSeason) : null;

  //   return matches.filter((match) => {
  //     const matchesLeague = leagueId ? match.league?.id === leagueId : true;
  //     const matchesSeason = seasonId ? match.season?.id === seasonId : true;
  //     return matchesLeague && matchesSeason;
  //   });
  // }, [matches, selectedLeague, selectedSeason]);

  // Handlers for filter changes
  const handleLeagueFilterChange = (e) => {
    const value = e.target.value;
    setSelectedLeague(value);

    onFilterChange({
      leagueName: value || undefined,
      season: selectedSeason || undefined,
    });
  };

  const handleSeasonFilterChange = (e) => {
    const value = e.target.value;
    setSelectedSeason(value);

    onFilterChange({
      leagueName: selectedLeague || undefined,
      season: value || undefined,
    });
  };
  // const handleLeagueFilterChange = (
  //   event: React.ChangeEvent<HTMLSelectElement>,
  // ) => {
  //   setSelectedLeague(event.target.value);
  // };

  // const handleSeasonFilterChange = (
  //   event: React.ChangeEvent<HTMLSelectElement>,
  // ) => {
  //   setSelectedSeason(event.target.value);
  // };

  // Filter matches based on selected league and season

  return (
    <section className="rounded-3xl bg-white p-8 shadow-lg">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Match List
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Danh sach tran dau
          </h2>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Tong so
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {matches.length}
          </p>
        </div>
      </div>

      {/* Filter dropdowns */}
      <div className="mb-6 grid md:grid-cols-2 gap-5">
        <div>
          <select
            value={selectedLeague}
            onChange={handleLeagueFilterChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
          >
            <option value="">Tat ca giai dau</option>
            {options.leagues.map((league) => (
              <option key={league.id} value={league.label}>
                {league.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedSeason}
            onChange={handleSeasonFilterChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
          >
            <option value="">Tat ca mua giai</option>
            {options.seasons.map((season) => (
              <option key={season.id} value={season.label}>
                {season.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <article
            key={match.id}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-emerald-200 hover:bg-white hover:shadow-md"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {match.league?.name} • {match.season?.year}
                </p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  {match.homeTeam?.name} vs {match.awayTeam?.name}
                </h3>
                <p className="mt-2 text-slate-600">
                  {new Date(match.matchDate).toLocaleString()} •{" "}
                  {formatStatusLabel(match.status)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Ti so
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {match.homeScore ?? "-"} : {match.awayScore ?? "-"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleEdit(match)}
                  className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  Sua
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(match.id)}
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Xoa
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
