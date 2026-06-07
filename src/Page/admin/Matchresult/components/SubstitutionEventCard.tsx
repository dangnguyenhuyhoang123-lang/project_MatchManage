import type { MatchEvent } from "../../../../model/Match/MatchEvents";
import EmptyState from "../../../../components/common/EmptyState";
import { formatEventMinute } from "../../../../utils/matchEventUtils";

type SubstitutionEventCardProps = {
  substitutions: MatchEvent[];
  onDeleteEvent: (eventId: number) => void | Promise<void>;
  deletingEventId?: number | null;
  homeTeamId?: number | null;
};

export default function SubstitutionEventCard({
  substitutions,
  onDeleteEvent,
  homeTeamId,
}: SubstitutionEventCardProps) {
  return (
    <section className="bg-[#f5f3ef] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-green-700">
            sync_alt
          </span>{" "}
          Danh sách thay người
        </h3>
      </div>
      <div className="space-y-3">
        {substitutions.map((event) => (
          <SubstitutionRow
            key={event.id}
            event={event}
            team={event.teamId === homeTeamId ? "home" : "away"}
            onDelete={onDeleteEvent}
          />
        ))}
        {substitutions.length === 0 && (
          <EmptyState
            title="Chưa có sự kiện thay người."
            className="border-0 bg-transparent py-4"
          />
        )}
      </div>
    </section>
  );
}

const SubstitutionRow = ({
  event,
  team,
  onDelete,
}: {
  event: MatchEvent;
  team: "home" | "away";
  onDelete: (id: number) => void | Promise<void>;
}) => (
  <div
    className={`bg-white p-3 md:p-4 rounded-xl flex items-center gap-3 md:gap-4 shadow-sm ${team === "away" ? "border-l-4 border-indigo-500" : "border-l-4 border-green-500"}`}
  >
    <div
      className={`w-8 h-8 md:w-10 md:h-10 shrink-0 ${team === "home" ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"} flex items-center justify-center rounded-full`}
    >
      <span className="material-symbols-outlined text-[18px] md:text-[24px]">
        sync_alt
      </span>
    </div>
    <div className="flex-1 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
      <div>
        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase mb-0.5">
          Thời điểm
        </p>
        <p className="text-xs md:text-sm font-bold">
          {formatEventMinute(event)}
        </p>
      </div>
      <div>
        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase mb-0.5">
          Đội
        </p>
        <p className="text-xs md:text-sm font-bold truncate">
          {event.teamName || "--"}
        </p>
      </div>
      <div>
        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase mb-0.5">
          Rời sân
        </p>
        <p className="text-xs md:text-sm font-bold truncate">
          {event.playerName || "--"}
        </p>
      </div>
      <div>
        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase mb-0.5">
          Vào sân
        </p>
        <p className="text-xs md:text-sm font-bold truncate">
          {event.playerInName || "--"}
        </p>
      </div>
      {event.note && (
        <p className="col-span-2 md:col-span-4 text-xs font-semibold text-gray-500">
          {event.note}
        </p>
      )}
    </div>
    <button
      type="button"
      onClick={() => onDelete(event.id)}
      className="text-gray-300 hover:text-red-500 shrink-0 p-1"
    >
      <span className="material-symbols-outlined text-[20px]">delete</span>
    </button>
  </div>
);
