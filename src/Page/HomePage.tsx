import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getListMatches } from "../services/MatchAPI";
import type { MatchModel } from "../model/Match/MatchModel";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  BarChart2,
  Contact2,
  Shield,
} from "lucide-react";

import { Footer } from "../components/Footer/Footer_HomePage";

const HomePage = () => {
  const [dsSanPham, setDsSanPham] = useState<MatchModel[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy 2 trận đấu nổi bật
    getListMatches(1).then((data) => {
      if (data && data.ketQua) {
        setDsSanPham(data.ketQua.slice(0, 2));
      }
    });
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")} • ${date.getDate()} Thg ${date.getMonth() + 1}`;
  };

  return (
    <div>
      <section className="relative max-w-360 mx-auto px-6 md:px-12 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-6 tracking-wide shadow-sm">
            <Shield size={14} />
            NỀN TẢNG QUẢN LÝ BÓNG ĐÁ THẾ HỆ MỚI
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
            Quản lý giải đấu <br />
            <span className="text-[#1a6e38] italic">chuyên nghiệp</span> <br />
            từ A-Z
          </h1>

          <p className="text-gray-600 text-lg lg:text-xl mb-8 max-w-lg leading-relaxed">
            Tự động hóa mọi quy trình từ xếp lịch, thống kê realtime đến quản lý
            hồ sơ cầu thủ. Mang trải nghiệm đẳng cấp quốc tế đến sân chơi của
            bạn.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button className="flex items-center gap-2 bg-[#1a6e38] hover:bg-green-800 text-white px-8 py-3.5 rounded-full font-semibold transition-colors shadow-lg shadow-green-900/20 text-lg">
              Bắt đầu ngay <ArrowRight size={20} />
            </button>

            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3.5 rounded-full font-semibold transition-colors text-lg">
              Xem bản demo
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative px-4"
        >
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-green-900/10 relative border-8 border-white">
            <img
              src="https://images.unsplash.com/photo-1518605368461-1ee125ac3dbf?q=80&w=1200&auto=format&fit=crop"
              alt="Stadium"
              className="w-full h-auto object-cover aspect-4/3"
            />

            <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/60">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-800 text-sm">
                  Thống kê trực tiếp
                </span>
                <span className="text-[10px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                  Live
                </span>
              </div>

              <div className="w-full flex items-center justify-between text-xs text-gray-500 mb-2 font-medium">
                <span>Tỉ lệ kiểm soát bóng</span>
                <span>67% - 33%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5 flex overflow-hidden">
                <div className="bg-[#1a6e38] h-full" style={{ width: "67%" }} />
                <div className="bg-gray-400 h-full" style={{ width: "33%" }} />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="max-w-360 mx-auto px-6 md:px-12 py-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-4xl p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <h3 className="text-[3rem] font-black text-[#1a6e38] mb-3 leading-none">
              50+
            </h3>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">
              GIẢI ĐẤU TỔ CHỨC
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-4xl p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <h3 className="text-[3rem] font-black text-[#1a6e38] mb-3 leading-none">
              1000+
            </h3>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">
              CÂU LẠC BỘ THAM GIA
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-4xl p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <h3 className="text-[3rem] font-black text-[#1a6e38] mb-3 leading-none">
              25000+
            </h3>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">
              CẦU THỦ CHUYÊN NGHIỆP
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-360 mx-auto px-6 md:px-12 py-16 text-center">
        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
          Tính năng vượt trội
        </h2>

        <p className="text-gray-500 max-w-2xl mx-auto mb-16 text-lg">
          Tất cả những gì bạn cần để vận hành một hệ thống bóng đá chuyên nghiệp
          ngay trong tầm tay.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-10 rounded-4xl shadow-sm border border-gray-100 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
            <div className="w-14 h-14 bg-green-100 text-[#1a6e38] rounded-2xl flex items-center justify-center mb-8 relative z-10">
              <CalendarDays size={28} />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-4">
              Lịch thi đấu tự động
            </h4>
            <p className="text-gray-500 leading-relaxed">
              Xếp lịch thi đấu thông minh chỉ với vài click, tránh trùng lịch
              sân và lịch đội bóng.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-10 rounded-4xl shadow-sm border border-gray-100 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8 relative z-10">
              <BarChart2 size={28} />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-4">
              Dữ liệu Realtime
            </h4>
            <p className="text-gray-500 leading-relaxed">
              Cập nhật kết quả, thẻ phạt và bảng xếp hạng ngay lập tức khi trận
              đấu đang diễn ra.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-10 rounded-4xl shadow-sm border border-gray-100 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
            <div className="w-14 h-14 bg-[#e8f5ed] text-[#1a6e38] rounded-2xl flex items-center justify-center mb-8 relative z-10">
              <Contact2 size={28} />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-4">
              Hồ sơ cầu thủ
            </h4>
            <p className="text-gray-500 leading-relaxed">
              Lưu trữ lịch sử thi đấu, phong độ và chỉ số kỹ thuật chi tiết cho
              từng cầu thủ.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#EFEFEF] py-24 rounded-t-[3rem]">
        <div className="max-w-360 mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <p className="text-[#1a6e38] font-bold text-xs uppercase tracking-widest mb-3">
                TRẬN CẦU TÂM ĐIỂM
              </p>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                Sắp diễn ra
              </h2>
            </div>

            <Link
              to="/matches"
              className="text-sm font-semibold text-gray-600 hover:text-[#1a6e38] flex items-center gap-2 group"
            >
              Xem tất cả lịch thi đấu
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dsSanPham.length > 0 ? (
              dsSanPham.map((match) => (
                <div
                  key={match.id}
                  className="bg-white rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-row items-center justify-between hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/matches/${match.id}`)}
                >
                  <div className="flex flex-col items-center w-1/3">
                    <img
                      src={match.homeTeam?.logo || "/default.png"}
                      alt={match.homeTeam?.name}
                      className="w-20 h-20 object-contain mb-4 drop-shadow-md"
                    />
                    <span className="font-bold text-gray-900 text-center">
                      {match.homeTeam?.name || "Home Team"}
                    </span>
                  </div>

                  <div className="flex flex-col items-center w-1/3">
                    <span className="text-sm text-gray-500 font-medium mb-1">
                      {formatTime(match.matchDate.toString())}
                    </span>
                    <span className="text-3xl font-black text-gray-900 my-2">
                      VS
                    </span>
                    <span className="text-xs text-gray-400 text-center max-w-30 truncate">
                      Sân Vận Động Mỹ Đình
                    </span>
                  </div>

                  <div className="flex flex-col items-center w-1/3">
                    <img
                      src={match.awayTeam?.logo || "/default.png"}
                      alt={match.awayTeam?.name}
                      className="w-20 h-20 object-contain mb-4 drop-shadow-md"
                    />
                    <span className="font-bold text-gray-900 text-center">
                      {match.awayTeam?.name || "Away Team"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-white rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-row items-center justify-between hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex flex-col items-center w-1/3">
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <Shield size={40} />
                    </div>
                    <span className="font-bold text-gray-900 text-center">
                      Red Dragons FC
                    </span>
                  </div>

                  <div className="flex flex-col items-center w-1/3">
                    <span className="text-sm text-gray-500 font-medium mb-1">
                      20:00 • 15 Thg 10
                    </span>
                    <span className="text-3xl font-black text-gray-900 my-2">
                      VS
                    </span>
                    <span className="text-xs text-gray-400 text-center">
                      Sân Vận Động Mỹ Đình
                    </span>
                  </div>

                  <div className="flex flex-col items-center w-1/3">
                    <div className="w-20 h-20 bg-blue-900 text-white rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <Shield size={40} />
                    </div>
                    <span className="font-bold text-gray-900 text-center">
                      Blue Storm SC
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-row items-center justify-between hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex flex-col items-center w-1/3">
                    <div className="w-20 h-20 bg-yellow-600 text-black rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <Shield size={40} />
                    </div>
                    <span className="font-bold text-gray-900 text-center">
                      Golden Lions
                    </span>
                  </div>

                  <div className="flex flex-col items-center w-1/3">
                    <span className="text-sm text-gray-500 font-medium mb-1">
                      18:30 • 16 Thg 10
                    </span>
                    <span className="text-3xl font-black text-gray-900 my-2">
                      VS
                    </span>
                    <span className="text-xs text-gray-400 text-center">
                      Sân Tao Đàn
                    </span>
                  </div>

                  <div className="flex flex-col items-center w-1/3">
                    <div className="w-20 h-20 bg-[#1a6e38] text-white rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <Shield size={40} />
                    </div>
                    <span className="font-bold text-gray-900 text-center">
                      Green Shields
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-300 mx-auto px-6 md:px-12">
          <div className="bg-linear-to-br from-[#1a6e38] to-green-800 rounded-[3rem] p-16 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-[0.07] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-[0.07] rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 relative z-10 tracking-tight">
              Sẵn sàng để nâng tầm giải đấu của bạn?
            </h2>

            <p className="text-green-100 text-lg max-w-2xl mx-auto mb-10 relative z-10 leading-relaxed">
              Tham gia cùng hàng trăm nhà tổ chức giải đấu chuyên nghiệp đã tin
              dùng PitchPro.
            </p>

            <button className="relative z-10 bg-white text-[#1a6e38] px-10 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-lg">
              Đăng ký trải nghiệm miễn phí
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;
