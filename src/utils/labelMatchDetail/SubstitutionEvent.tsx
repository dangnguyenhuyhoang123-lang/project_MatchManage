import { useState, useEffect } from "react";
import { MatchEvent } from "../../model/MatchEvents";
import { Player } from "../../model/Player";
import { getPlayerById } from "../../services/PlayerAPI";
export const SubstitutionEvent = ({
  event,
  isHome,
  getEnventStyle,
}: {
  event: MatchEvent;
  isHome: boolean;
  getEnventStyle?: () => string;
}) => {
  const [playerIn, setPlayerIn] = useState<Player | null>(null);
  const [playerOut, setPlayerOut] = useState<Player | null>(null);

  useEffect(() => {
    if (!event.playerInId || !event.playerOutId) return;

    Promise.all([
      getPlayerById(event.playerInId),
      getPlayerById(event.playerOutId),
    ]).then(([pIn, pOut]) => {
      setPlayerIn(pIn);
      setPlayerOut(pOut);
    });
  }, [event.playerInId, event.playerOutId]);

  return (
    <div
      className={`
      relative py-4 rounded-lg animate-match-detail-event
      transition-all duration-300
      hover:scale-[1.02] hover:shadow-md
      ${getEnventStyle ? getEnventStyle() : ""}
    `}
      style={{ animationDelay: `${event.minute * 5}ms` }}
    >
      {/* vertical line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gray-300 -translate-x-1/2" />

      <div className="flex items-center">
        {/* HOME */}
        <div className="w-1/2 flex justify-end pr-6">
          {isHome && (
            <div className="flex flex-col items-end gap-4 max-w-[280px]">
              {/* OUT */}
              <div className="flex items-center gap-3 text-red-600">
                <span className="font-medium text-sm">
                  {playerOut?.name || "Loading..."}
                </span>
                <img
                  src={playerOut?.avatar || "/default.png"}
                  className="w-9 h-9 rounded-full object-cover object-[center_20%]"
                />
                <span>⬇</span>
              </div>

              {/* IN */}
              <div className="flex items-center gap-3 text-green-600">
                <span className="font-medium text-sm">
                  {playerIn?.name || "Loading..."}
                </span>
                <img
                  src={playerIn?.avatar || "/default.png"}
                  className="w-9 h-9 rounded-full object-cover object-[center_20%]"
                />
                <span>⬆</span>
              </div>
            </div>
          )}
        </div>

        {/* CENTER */}
        <div className="w-16 flex flex-col items-center z-10">
          <div className="bg-white px-2 py-1 rounded-full shadow text-xs font-bold">
            {event.minute}'
          </div>

          <div className="mt-1 text-lg bg-white w-8 h-8 flex items-center justify-center rounded-full shadow">
            🔄
          </div>
        </div>

        {/* AWAY */}
        <div className="w-1/2 flex justify-start pl-6">
          {!isHome && (
            <div className="flex flex-col items-start gap-2 max-w-[280px]">
              {/* IN */}
              <div className="flex items-center gap-2 text-green-600">
                <span>⬆</span>
                <img
                  src={playerIn?.avatar || "/default.png"}
                  className="w-9 h-9 rounded-full object-cover object-[center_20%]"
                />
                <span className="font-medium text-sm">
                  {playerIn?.name || "Loading..."}
                </span>
              </div>

              {/* OUT */}
              <div className="flex items-center gap-2 text-red-500">
                <span>⬇</span>
                <img
                  src={playerOut?.avatar || "/default.png"}
                  className="w-9 h-9 rounded-full object-cover object-[center_20%]"
                />
                <span className="font-medium text-sm">
                  {playerOut?.name || "Loading..."}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
