import { useEffect, useState } from "react";

import { PhanTrang } from "../../utils/PhanTrang";
import { Link, useNavigate } from "react-router-dom";

import { getListMatches } from "../../services/MatchAPI";

import { MatchModel } from "../../model/MatchModel";

import { getTeamDetailPath } from "../../utils/teamRoute";
import { Sidebar } from "../../utils/SideBar";
import { Container } from "../../utils/Container";
import ButtonLink from "../../components/Button/ButtonLink";

export default function DashBoardPage() {
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [dsSanPham, setDsSanPham] = useState<MatchModel[]>([]);
  const [tongSoTrang, setTongSoTrang] = useState(0);
  const navigate = useNavigate();

  const handleNagivation = (trang: number) => {
    setTrangHienTai(trang);
  };

  useEffect(() => {
    getListMatches(trangHienTai).then((data) => {
      setDsSanPham(data.ketQua);
      setTongSoTrang(data.tongSoTrang);
    });
  }, [trangHienTai]);
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="flex-1 py-6">
        <Container>
          <div className="space-y-8">
            {/* Title */}
            <h2 className="text-2xl font-bold">Bảng Điều Khiển Tổng Quan</h2>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Số giải đấu", value: "3" },
                { label: "Số CLB", value: "20" },
                { label: "Số cầu thủ", value: "500+" },
                { label: "Trận đã đá", value: "120" },
                { label: "Bàn thắng", value: "342" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-xl shadow-sm border"
                >
                  <p className="text-xs opacity-60">{stat.label}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Charts + Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white p-6 rounded-xl shadow-sm">
                <h4 className="font-bold mb-4">Xu hướng bàn thắng</h4>
                <div className="h-40 flex items-end gap-2">
                  {[30, 45, 40, 65, 80].map((h, i) => (
                    <div
                      key={i}
                      className="bg-green-600 w-full rounded"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-6 rounded-xl shadow-sm">
                <h4 className="font-bold mb-4">Top 5 CLB</h4>
                {[95, 88, 82, 75].map((v, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between text-sm">
                      <span>CLB {i + 1}</span>
                      <span>{v}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded">
                      <div
                        className="h-2 bg-green-600 rounded"
                        style={{ width: `${v}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Matches + Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <h4 className="font-bold mb-3">Trận đấu sắp diễn ra</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  {dsSanPham.map((match) => (
                    <div
                      key={match.id}
                      onClick={() => navigate(`/matches/${match.id}`)}
                      className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition cursor-pointer"
                    >
                      <div className="flex justify-between mb-4">
                        <div className="flex flex-col items-center">
                          <Link
                            to={getTeamDetailPath(match.homeTeam)}
                            onClick={(event) => event.stopPropagation()}
                            className="flex flex-col items-center"
                          >
                            <img
                              src={match.homeTeam?.logo || "/default.png"}
                              className="w-12 h-12 mb-2"
                            />
                            <p className="text-center hover:text-green-600">
                              {match.homeTeam?.name}
                            </p>
                          </Link>
                        </div>
                        <span>vs</span>
                        <div className="flex flex-col items-center">
                          <Link
                            to={getTeamDetailPath(match.awayTeam)}
                            onClick={(event) => event.stopPropagation()}
                            className="flex flex-col items-center"
                          >
                            <img
                              src={match.awayTeam?.logo || "/default.png"}
                              className="w-12 h-12 mb-2"
                            />
                            <p className="text-center hover:text-green-600">
                              {match.awayTeam?.name}
                            </p>
                          </Link>
                        </div>
                      </div>

                      <div className="text-center text-gray-500 mb-4">
                        {new Date(match.matchDate).toLocaleString()} -{" "}
                        {match.league.name}
                      </div>
                    </div>
                  ))}
                </div>
                <PhanTrang
                  tongSoTrang={tongSoTrang}
                  trangHienTai={trangHienTai}
                  xuLyTrang={handleNagivation}
                ></PhanTrang>
              </div>

              <div className="lg:col-span-4">
                <h4 className="font-bold mb-3">Thông báo</h4>
                <div className="space-y-2">
                  {["Cập nhật lịch", "Kỷ luật cầu thủ"].map((n, i) => (
                    <div key={i} className="bg-gray-100 p-3 rounded">
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
