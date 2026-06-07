import type { MatchEvent } from "../../../../model/Match/MatchEvents";
import EmptyState from "../../../../components/common/EmptyState";
import { formatEventMinute } from "../../../../utils/matchEventUtils";

type GoalEventCardProps = {
  goals: MatchEvent[];
  onDeleteEvent: (eventId: number) => void | Promise<void>;
  deletingEventId?: number | null;
  homeTeamId?: number | null;
  onAddEvent?: () => void;
};

export default function GoalEventCard({
  goals,
  onDeleteEvent,
  homeTeamId,
  onAddEvent,
}: GoalEventCardProps) {
  return (
    <section className="bg-[#f5f3ef] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
          <span className="material-symbols-outlined fill-1 text-green-700">
            sports_soccer
          </span>{" "}
          Danh sách bàn thắng
        </h3>
        {onAddEvent && (
          <button
            type="button"
            onClick={onAddEvent}
            className="text-green-700 font-bold text-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">
              add_circle
            </span>
            Thêm sự kiện
          </button>
        )}
      </div>
      <div className="space-y-3">
        {goals.map((goal) => (
          <GoalRow
            key={goal.id}
            goal={goal}
            team={goal.teamId === homeTeamId ? "home" : "away"}
            onDelete={onDeleteEvent}
          />
        ))}
        {goals.length === 0 && (
          <EmptyState
            title="Chưa có bàn thắng nào được ghi nhận."
            className="border-0 bg-transparent py-4"
          />
        )}
      </div>
    </section>
  );
}

const GoalRow = ({
  goal,
  team,
  onDelete,
}: {
  goal: MatchEvent;
  team: "home" | "away";
  onDelete: (id: number) => void | Promise<void>;
}) => (
  <div
    className={`bg-white p-3 md:p-4 rounded-xl flex items-center gap-3 md:gap-4 shadow-sm ${team === "away" ? "border-l-4 border-indigo-500" : "border-l-4 border-green-500"}`}
  >
    <div
      className={`w-8 h-8 md:w-10 md:h-10 shrink-0 ${team === "home" ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"} flex items-center justify-center rounded-full`}
    >
      <span className="material-symbols-outlined fill-1 text-[18px] md:text-[24px]">
        sports_soccer
      </span>
    </div>
    <div className="flex-1 grid grid-cols-3 gap-2 md:gap-4">
      <div>
        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase mb-0.5">
          Cầu thủ
        </p>
        <p className="text-xs md:text-sm font-bold truncate">
          {goal.playerName}
        </p>
      </div>
      <div>
        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase mb-0.5">
          Thời điểm
        </p>
        <p className="text-xs md:text-sm font-bold">
          {formatEventMinute(goal)}
        </p>
      </div>
      <div>
        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase mb-0.5">
          Loại
        </p>
        <p className="text-xs md:text-sm font-bold truncate">
          {goal.goalType === "OWN_GOAL"
            ? "Phản lưới nhà"
            : goal.goalType === "PENALTY"
              ? "Penalty"
              : "Bàn thắng thường"}
        </p>
      </div>
    </div>
    <button
      type="button"
      onClick={() => onDelete(goal.id)}
      className="text-gray-300 hover:text-red-500 shrink-0 p-1"
    >
      <span className="material-symbols-outlined text-[20px]">delete</span>
    </button>
  </div>
);
