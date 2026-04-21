import { useEffect, useState } from "react";

import { PhanTrang } from "../utils/PhanTrang";
import { Link, useNavigate } from "react-router-dom";
import { getListMatches } from "../services/MatchAPI";
import type { MatchModel } from "../model/MatchModel";
import { getTeamDetailPath } from "../utils/teamRoute";
import ButtonLink from "../components/Button/ButtonLink";

const HomePage = () => {
  // const [trangHienTai, setTrangHienTai] = useState(1);

  // const [dsSanPham, setDsSanPham] = useState();

  // const handleNagivation = (trang: number) => {
  //   console.log("Trang được click:", trang);
  //   setTrangHienTai(trang);
  //   // setDsSanPham(matchesToday.slice((trang - 1) * 6, trang * 6));
  // };
  // useEffect(() => {
  //   getListMatches().then((data) => {
  //     setDsSanPham(data);
  //   });
  // }, []);

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
    <>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Football Prediction Platform
          </h1>

          <p className="text-xl mb-8">
            AI powered football match predictions and statistics
          </p>

          <ButtonLink
            label="View Matches"
            to="/leagues"
            className="bg-white text-green-700"
          />
        </section>
        {/* Matches Section */}
        <section className="max-w-6xl mx-auto py-16 px-6">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Today's Matches
          </h2>
        </section>

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
        {/* Stats Section */}
        {/* <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 text-center gap-10">
          <div>
            <h3 className="text-4xl font-bold text-green-600">1200+</h3>
            <p className="text-gray-600">Matches Analyzed</p>
          </div>

          <div>
            <h3 className="text-4xl font-bold text-green-600">85%</h3>
            <p className="text-gray-600">Prediction Accuracy</p>
          </div>

          <div>
            <h3 className="text-4xl font-bold text-green-600">50+</h3>
            <p className="text-gray-600">Leagues Covered</p>
          </div>
        </div>
      </section> */}
        {/* Footer */}
        <footer className="bg-gray-900 text-white text-center py-6">
          © 2026 Football AI Prediction
        </footer>
      </div>
    </>
  );
};

export default HomePage;
