import { useEffect, useMemo } from "react";
import type { RealtimeEventDTO } from "../model/RealtimeEvent";
import PublicSocketService from "../services/websocket/PublicSocketService";

export function usePublicRealtimeEvent(
  topicSuffixes: Array<string | number | null | undefined>,
  handler: (event: RealtimeEventDTO) => void,
) {
  const rawTopicsKey = topicSuffixes
    .filter((topic): topic is string | number => topic != null)
    .map(String)
    .join("|");

  const topics = useMemo(
    () =>
      rawTopicsKey
        .split("|")
        .map((topic) => topic.trim())
        .filter(Boolean),
    [rawTopicsKey],
  );

  const topicsKey = useMemo(() => topics.join("|"), [topics]);

  useEffect(() => {
    if (topics.length === 0) return;

    PublicSocketService.connect(topics, handler);

    return () => {
      PublicSocketService.disconnect();
    };
  }, [topicsKey, handler]);
}
