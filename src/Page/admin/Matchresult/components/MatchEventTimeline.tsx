import type { MatchEvent } from "../../../../model/Match/MatchEvents";
import {
  formatEventMinute,
  getEventIconText,
  getEventTypeLabel,
  sortMatchEvents,
} from "../../../../utils/matchEventUtils";

type MatchEventTimelineProps = {
  events: MatchEvent[];
};

const visibleEventTypes = ["GOAL", "YELLOW_CARD", "RED_CARD", "SUBSTITUTION"];

export default function MatchEventTimeline({ events }: MatchEventTimelineProps) {
  const timelineEvents = sortMatchEvents(
    events.filter((event) => visibleEventTypes.includes(event.eventType)),
  );

  return (
    <section className="bg-[#f5f3ef] rounded-2xl p-6 hidden md:block">
      <h3 className="text-lg font-bold text-green-900 mb-8 flex items-center gap-2">
        <span className="material-symbols-outlined text-green-700">
          timeline
        </span>{" "}
        Timeline trận đấu trực quan
      </h3>
      <div className="relative pt-12 pb-16 px-4">
        <div className="h-1.5 w-full bg-gray-300 rounded-full"></div>
        {timelineEvents.map((event) => (
          <TimelineMarker key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}

const TimelineMarker = ({ event }: { event: MatchEvent }) => {
  const safeMinute = Math.min(Math.max(Number(event.minute ?? 0) || 0, 0), 120);
  const leftPos = `${(safeMinute / 120) * 100}%`;
  const isSubstitution = event.eventType === "SUBSTITUTION";
  const isGoal = event.eventType === "GOAL";
  const markerColor =
    event.eventType === "RED_CARD"
      ? "bg-red-500"
      : event.eventType === "YELLOW_CARD"
        ? "bg-yellow-400"
        : "bg-green-500";
  const materialIcon = getMaterialIcon(event.eventType);
  const detailText = getEventDetailText(event);

  return (
    <div
      className="absolute top-12 -translate-x-1/2 flex max-w-32 flex-col items-center"
      style={{ left: leftPos }}
    >
      <div
        className={`w-0.5 ${isGoal ? "h-10" : "h-6"} bg-green-600 mb-1`}
      ></div>
      {isGoal || isSubstitution ? (
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white shadow-lg">
          <span className="material-symbols-outlined text-xs">
            {materialIcon}
          </span>
        </div>
      ) : (
        <div
          className={`w-5 h-7 rounded-sm ${markerColor} border border-gray-300 shadow-sm`}
        ></div>
      )}
      <span className="text-center text-[10px] font-bold mt-1">
        {formatEventMinute(event)} {getEventTypeLabel(event.eventType)}
      </span>
      <span className="mt-1 line-clamp-2 text-center text-[9px] font-semibold text-gray-500">
        {event.teamName ? `${event.teamName}: ` : ""}
        {detailText}
      </span>
    </div>
  );
};

function getMaterialIcon(eventType?: string | null) {
  const iconText = getEventIconText(eventType);

  switch (iconText) {
    case "⚽":
      return "sports_soccer";
    case "🔁":
      return "sync_alt";
    case "🟨":
    case "🟥":
      return "style";
    default:
      return "fiber_manual_record";
  }
}

function getEventDetailText(event: MatchEvent) {
  if (event.eventType === "SUBSTITUTION") {
    return `${event.playerInName || "--"} vào sân, ${event.playerName || "--"} rời sân`;
  }

  if (event.eventType === "GOAL") {
    const parts = [event.playerName || "--"];

    if (event.assistPlayerName) {
      parts.push(`kiến tạo: ${event.assistPlayerName}`);
    }

    if (event.goalType) {
      parts.push(getGoalTypeLabel(event.goalType));
    }

    return parts.join(" · ");
  }

  if (event.eventType === "YELLOW_CARD" || event.eventType === "RED_CARD") {
    return `${event.playerName || "--"} · ${getEventTypeLabel(event.eventType)}`;
  }

  return event.playerName || "";
}

function getGoalTypeLabel(goalType?: string | null) {
  if (goalType === "OWN_GOAL") return "Phản lưới nhà";
  if (goalType === "PENALTY") return "Penalty";
  if (goalType === "NORMAL") return "Bàn thắng thường";
  return goalType ?? "";
}
