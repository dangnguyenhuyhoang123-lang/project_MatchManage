import { useState } from "react";

const leagues = ["Premier League", "La Liga", "Serie A"];

const LeaguesPage = () => {
  const [selectedLeague, setSelectedLeague] = useState("Premier League");
  const [tab, setTab] = useState("matches");
  const [season, setSeason] = useState("2024-2025");
  // matches | standings | results

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="flex max-w-7xl mx-auto mt-6 gap-6 px-4">
        {/* SIDEBAR */}
        <div className="w-1/4 bg-white rounded-xl shadow p-4">
          <h2 className="font-bold mb-4">Leagues</h2>

          {leagues.map((lg) => (
            <div
              key={lg}
              onClick={() => setSelectedLeague(lg)}
              className={`p-2 rounded cursor-pointer
                ${
                  selectedLeague === lg
                    ? "bg-green-500 text-white"
                    : "hover:bg-gray-100"
                }`}
            >
              {lg}
            </div>
          ))}
        </div>

        {/* MAIN */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            {/* League name */}
            <h2 className="text-xl font-bold">{selectedLeague}</h2>

            {/* Season selector */}
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="appearance-none bg-white border px-4 py-2 pr-10 rounded-lg shadow focus:ring-2 focus:ring-green-500"
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2022-2023">2022-2023</option>
            </select>
          </div>
          {/* TABS */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setTab("standings")}
              className={`px-4 py-2 rounded-lg ${
                tab === "standings" ? "bg-green-600 text-white" : "bg-white"
              }`}
            >
              Bảng xếp hạng
            </button>

            <button
              onClick={() => setTab("matches")}
              className={`px-4 py-2 rounded-lg ${
                tab === "matches" ? "bg-green-600 text-white" : "bg-white"
              }`}
            >
              Trận hôm nay
            </button>

            <button
              onClick={() => setTab("results")}
              className={`px-4 py-2 rounded-lg ${
                tab === "results" ? "bg-green-600 text-white" : "bg-white"
              }`}
            >
              Kết quả
            </button>
          </div>

          {/* CONTENT */}
          <div className="bg-white p-6 rounded-xl shadow">
            {/* STANDINGS */}
            {tab === "standings" && (
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Team</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Arsenal</td>
                    <td>65</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Liverpool</td>
                    <td>60</td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* MATCHES */}
            {tab === "matches" && (
              <div>
                <p>Danh sách trận hôm nay...</p>
              </div>
            )}

            {/* RESULTS */}
            {tab === "results" && (
              <div>
                <p>Kết quả các trận đã diễn ra...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaguesPage;
