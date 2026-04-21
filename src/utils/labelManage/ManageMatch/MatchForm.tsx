import { MatchStatus } from "../../../model/enum";
export const MatchForm = ({
  formData,
  options,
  editingId,
  isSubmitting,
  message,
  error,
  selectedHomeTeam,
  selectedAwayTeam,
  handleChange,
  handleSubmit,
  resetForm,
  formatStatusLabel,
}) => {
  const matchStatusOptions = Object.values(MatchStatus);
  return (
    <section className="rounded-3xl bg-white p-8 shadow-lg w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
          Admin Match Manager
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {editingId ? "Chinh sua tran dau" : "Them tran dau moi"}
        </h1>
        <p className="mt-2 text-slate-500">
          Trang nay duoc xay dung san de sau nay ban noi them chuc nang admin.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Ngay gio thi dau
          </label>
          <input
            type="datetime-local"
            value={formData.matchDate}
            onChange={handleChange("matchDate")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Doi nha
            </label>
            <select
              value={formData.homeTeamId}
              onChange={handleChange("homeTeamId")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
            >
              <option value="">Chon doi nha</option>
              {options.teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Doi khach
            </label>
            <select
              value={formData.awayTeamId}
              onChange={handleChange("awayTeamId")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
            >
              <option value="">Chon doi khach</option>
              {options.teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Giai dau
            </label>
            <select
              value={formData.leagueId}
              onChange={handleChange("leagueId")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
            >
              <option value="">Chon giai dau</option>
              {options.leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Mua giai
            </label>
            <select
              value={formData.seasonId}
              onChange={handleChange("seasonId")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
            >
              <option value="">Chon mua giai</option>
              {options.seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Trang thai
            </label>
            <select
              value={formData.status}
              onChange={handleChange("status")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
            >
              {matchStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Ti so doi nha
            </label>
            <input
              type="number"
              min="0"
              value={formData.homeScore}
              onChange={handleChange("homeScore")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Ti so doi khach
            </label>
            <input
              type="number"
              min="0"
              value={formData.awayScore}
              onChange={handleChange("awayScore")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          <p>
            Doi nha:{" "}
            <span className="font-semibold">
              {selectedHomeTeam?.label || "Chua chon"}
            </span>
          </p>
          <p className="mt-2">
            Doi khach:{" "}
            <span className="font-semibold">
              {selectedAwayTeam?.label || "Chua chon"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? "Dang xu ly..."
              : editingId
                ? "Cap nhat tran dau"
                : "Them tran dau"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Lam moi form
          </button>
        </div>
      </form>
    </section>
  );
};
