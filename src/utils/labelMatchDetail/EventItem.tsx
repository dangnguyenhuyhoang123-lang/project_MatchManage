import { MatchEvent } from "../../model/MatchEvents";
import type { Player } from "../../model/Player";
import { getPlayerById } from "../../services/PlayerAPI";
import { useState, useEffect } from "react";
import { SubstitutionEvent } from "./SubstitutionEvent";
const EVENT_ICONS: Record<string, string> = {
  GOAL: "⚽",
  YELLOW_CARD: "🟨",
  RED_CARD: "🟥",
  SUBSTITUTION: "🔄",
  PENALTY: "⚽",
};

export const EventItem = ({
  event,
  homeTeam,
}: {
  event: MatchEvent;
  homeTeam?: string;
}) => {
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (!event.playerId) return;

    getPlayerById(event.playerId).then(setPlayer);
  }, [event.playerId]);

  const isHome = event.teamName === homeTeam;

  // return (
  //   <div
  //     className={`flex justify-between items-center py-3 border-b ${
  //       isGoal ? "bg-white text-black rounded-lg px-2" : ""
  //     }`}
  //   >
  //     {/* HOME */}
  //     <div className="w-1/2 flex justify-end pr-4">
  //       {isHome && (
  //         <div className="flex items-center gap-2">
  //           {/* Avatar */}
  //           <img
  //             src={player?.avatar || "/default.png"}
  //             className="w-9 h-9 rounded-full object-cover object-[center_20%]"
  //           />

  //           {/* Name */}
  //           <span className="font-medium text-sm">
  //             {player?.name || "Loading..."}
  //           </span>
  //         </div>
  //       )}
  //     </div>

  //     {/* CENTER */}
  //     <div className="flex flex-col items-center w-16">
  //       <span className="text-sm font-bold">{event.minute}'</span>
  //       <span className="text-lg">{EVENT_ICONS[event.eventType] || "•"}</span>
  //     </div>

  //     {/* AWAY */}
  //     <div className="w-1/2 flex justify-start pl-4">
  //       {!isHome && (
  //         <div className="flex items-center gap-2">
  //           {/* Name */}
  //           <span className="font-medium text-sm">
  //             {player?.name || "Loading..."}
  //           </span>
  //           {/* Avatar */}
  //           <img
  //             src={player?.avatar || "/default.png"}
  //             className="w-9 h-9 rounded-full object-cover object-[center_20%]"
  //           />
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
  const getEventStyle = () => {
    switch (event.eventType) {
      case "GOAL":
        return "bg-green-50 border border-green-200";
      case "YELLOW_CARD":
        return "bg-yellow-50 border border-yellow-200";
      case "RED_CARD":
        return "bg-red-50 border border-red-200";
      default:
        return "bg-white";
    }
  };
  if (event.eventType === "SUBSTITUTION") {
    return (
      <SubstitutionEvent
        event={event}
        isHome={isHome}
        getEnventStyle={getEventStyle}
      />
    );
  }
  return (
    <div
      className={`
    relative py-4 rounded-lg animate-match-detail-event
    transition-all duration-300
    hover:scale-[1.02] hover:bg-gray-50 hover:shadow-md
    ${getEventStyle()}
  `}
      style={{ animationDelay: `${event.minute * 5}ms` }}
    >
      {/* vertical line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gray-200 -translate-x-1/2" />

      <div className="flex items-center">
        {/* HOME */}
        <div className="w-1/2 flex justify-end pr-6">
          {isHome && (
            <div className="flex items-center gap-3 max-w-[280px]">
              <div className="text-right">
                <p className="font-semibold text-sm text-gray-900">
                  {player?.name}
                </p>
                <p className="text-xs text-gray-500">{event.description}</p>
              </div>

              <img
                src={player?.avatar || "/default.png"}
                className="w-10 h-10 rounded-full object-cover object-[center_20%] 
             transition-transform duration-300 hover:scale-110"
              />
            </div>
          )}
        </div>

        {/* CENTER */}
        <div className="w-16 flex flex-col items-center z-10">
          <div className="bg-white px-2 py-1 rounded-full shadow text-xs font-bold">
            {event.minute}'
          </div>

          <div className="mt-1 text-lg">
            {EVENT_ICONS[event.eventType] || "•"}
          </div>
        </div>

        {/* AWAY */}
        <div className="w-1/2 flex justify-start pl-6">
          {!isHome && (
            <div className="flex items-center gap-3 max-w-[280px]">
              <img
                src={player?.avatar || "/default.png"}
                className="w-10 h-10 rounded-full object-cover object-[center_20%] 
             transition-transform duration-300 hover:scale-110"
              />

              <div>
                <p className="font-semibold text-sm text-gray-900">
                  {player?.name}
                </p>
                <p className="text-xs text-gray-500">{event.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
