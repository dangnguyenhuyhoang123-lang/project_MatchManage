import type { MatchEvent } from "../model/Match/MatchEvents";

export const formatEventMinute = (
  event: Pick<MatchEvent, "minute" | "extraMinute">,
): string => {
  if (event.extraMinute && event.extraMinute > 0) {
    return `${event.minute}+${event.extraMinute}'`;
  }

  return `${event.minute}'`;
};

export const getEventTypeLabel = (eventType?: string | null): string => {
  switch (eventType) {
    case "GOAL":
      return "Bàn thắng";
    case "YELLOW_CARD":
      return "Thẻ vàng";
    case "RED_CARD":
      return "Thẻ đỏ";
    case "SUBSTITUTION":
      return "Thay người";
    default:
      return eventType ?? "Sự kiện";
  }
};

export const getEventIconText = (eventType?: string | null): string => {
  switch (eventType) {
    case "GOAL":
      return "⚽";
    case "YELLOW_CARD":
      return "🟨";
    case "RED_CARD":
      return "🟥";
    case "SUBSTITUTION":
      return "🔁";
    default:
      return "•";
  }
};

export const sortMatchEvents = <
  T extends Pick<MatchEvent, "minute" | "extraMinute" | "eventOrder" | "id">,
>(
  events: T[],
): T[] => {
  return [...events].sort((a, b) => {
    const minuteDiff = Number(a.minute ?? 0) - Number(b.minute ?? 0);
    if (minuteDiff !== 0) return minuteDiff;

    const extraDiff = Number(a.extraMinute ?? 0) - Number(b.extraMinute ?? 0);
    if (extraDiff !== 0) return extraDiff;

    return Number(a.eventOrder ?? a.id ?? 0) - Number(b.eventOrder ?? b.id ?? 0);
  });
};
