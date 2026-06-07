import type { MatchEvent } from "../../../model/Match/MatchEvents";
import {
  formatEventMinute,
  getEventIconText,
  getEventTypeLabel,
  sortMatchEvents,
} from "../../../utils/matchEventUtils";

type MatchDetailTimelineProps = {
  events: MatchEvent[];
  homeTeamId?: number | null;
  homeTeamName?: string | null;
};

const visibleEventTypes = ["GOAL", "YELLOW_CARD", "RED_CARD", "SUBSTITUTION"];

export default function MatchDetailTimeline({
  events,
  homeTeamId,
  homeTeamName,
}: MatchDetailTimelineProps) {
  const timelineEvents = sortMatchEvents(
    events.filter((event) => visibleEventTypes.includes(event.eventType)),
  );

  if (timelineEvents.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-6xl text-[#D8D4CE] mb-4">
          sports_score
        </span>
        <p className="text-[#707A6C] font-bold">
          Chưa có sự kiện nào được ghi nhận cho trận đấu này.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto relative before:absolute before:inset-y-0 before:left-1/2 before:w-0.5 before:bg-[#E4E2DE] before:-translate-x-1/2 space-y-6">
      {timelineEvents.map((event, index) => {
        const isHome =
          event.teamId === homeTeamId || event.teamName === homeTeamName;

        return (
          <TimelineEventRow
            key={`${event.id ?? index}-${event.eventType}-${event.minute}`}
            event={event}
            isHome={isHome}
          />
        );
      })}
    </div>
  );
}

function TimelineEventRow({
  event,
  isHome,
}: {
  event: MatchEvent;
  isHome: boolean;
}) {
  const eventIcon = getEventIconText(event.eventType);
  const eventMinute = formatEventMinute(event);
  const title = getEventTitle(event);
  const subtitle = getEventSubtitle(event);

  return (
    <div className="relative grid grid-cols-[1fr_48px_1fr] items-center w-full gap-4">
      <div className="flex justify-end">
        {isHome && (
          <TimelineEventContent
            align="right"
            icon={eventIcon}
            title={title}
            subtitle={subtitle}
          />
        )}
      </div>

      <div className="z-10 w-11 h-11 bg-white border-4 border-[#1B1C1A] rounded-full flex items-center justify-center font-black text-xs shadow-md mx-auto">
        {eventMinute}
      </div>

      <div className="flex justify-start">
        {!isHome && (
          <TimelineEventContent
            align="left"
            icon={eventIcon}
            title={title}
            subtitle={subtitle}
          />
        )}
      </div>
    </div>
  );
}

function TimelineEventContent({
  align,
  icon,
  title,
  subtitle,
}: {
  align: "left" | "right";
  icon: string;
  title: string;
  subtitle?: string;
}) {
  const content = (
    <div className="flex-1 min-w-0">
      <p className="font-bold text-[#1B1C1A] truncate">{title}</p>

      {subtitle && (
        <p className="text-[11px] text-[#707A6C] font-medium mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  );

  const iconNode = (
    <span className="text-2xl bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0">
      {icon}
    </span>
  );

  return (
    <div
      className={`bg-[#fbf9f5] border border-[#E4E2DE] p-3 rounded-2xl shadow-sm ${align === "right" ? "text-right" : "text-left"} flex items-center gap-3 max-w-[260px]`}
    >
      {align === "left" && iconNode}
      {content}
      {align === "right" && iconNode}
    </div>
  );
}

function getEventTitle(event: MatchEvent) {
  if (event.eventType === "SUBSTITUTION") {
    return `${event.playerInName || "--"} vào sân, ${event.playerName || "--"} rời sân`;
  }

  return event.playerName || "Cầu thủ";
}

function getEventSubtitle(event: MatchEvent) {
  if (event.eventType === "SUBSTITUTION") {
    return event.note ?? undefined;
  }

  const parts: string[] = [getEventTypeLabel(event.eventType)];

  if (event.eventType === "GOAL") {
    if (event.assistPlayerName) {
      parts.push(`Kiến tạo: ${event.assistPlayerName}`);
    }

    if (event.goalType) {
      parts.push(getGoalTypeLabel(event.goalType));
    }
  }

  if (event.note) {
    parts.push(event.note);
  }

  return parts.join(" · ");
}

function getGoalTypeLabel(goalType?: string | null) {
  if (goalType === "OWN_GOAL") return "Phản lưới nhà";
  if (goalType === "PENALTY") return "Penalty";
  if (goalType === "NORMAL") return "Bàn thắng thường";
  return goalType ?? "";
}
