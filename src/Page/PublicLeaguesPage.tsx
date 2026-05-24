import { useState } from "react";
import { ChevronDown, Trophy, MoreHorizontal, Calendar, MapPin, Shield, Zap, Award, Filter, ChevronLeft, ChevronRight } from "lucide-react";

import { Footer } from "../components/Footer/Footer_HomePage";

export const PublicLeaguesPage = () => {
  const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "finished">("live");

  return (
    <div>
      <div className="pt-12">
        <div className="max-w-360 mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                Trung tâm trận đấu
              </h1>
              <p className="text-gray-500 text-lg">
                Cập nhật tỷ số trực tiếp, lịch thi đấu sắp tới và kết quả chi tiết của tất cả các giải đấu hàng đầu.
              </p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div>
                <span className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-1 block">
                  NĂM
                </span>
                <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center justify-between w-32 cursor-pointer font-bold text-gray-700">
                  2024
                  <ChevronDown size={16} />
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-1 block">
                  CẤP ĐỘ GIẢI
                </span>
                <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center justify-between w-40 cursor-pointer font-bold text-gray-700 text-sm">
                  Tất cả cấp độ
                  <svg
                    className="w-5 h-5 ml-2 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M7 12h10M10 18h4"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-gray-900 h-[320px]">
              <img
                src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800"
                className="w-full h-full object-cover opacity-60"
                alt="V League"
              />
              <div className="absolute top-6 left-6">
                <span className="bg-[#1a6e38] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Đang diễn ra
                </span>
              </div>
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-3xl font-bold mb-1">V-League Championship 2024</h2>
                <p className="text-gray-300 font-semibold mb-6">Hạng đấu cao nhất Việt Nam</p>
                <div className="flex gap-12">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">Mùa giải</p>
                    <p className="font-bold text-lg">2023 - 2024</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">Số đội</p>
                    <p className="font-bold text-lg">14 Đội</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f9fa] rounded-3xl p-6 border border-gray-100 flex flex-col justify-between h-[320px]">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-[#6ef08e] rounded-full flex items-center justify-center">
                  <Trophy className="text-[#1a6e38]" size={20} />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={24} />
                </button>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Cúp Sinh Viên Toàn Quốc</h2>
                <p className="text-gray-500 text-sm mb-6">Giải học đường</p>
                <div className="flex justify-between border-t border-gray-200 pt-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1">Mùa giải</p>
                    <p className="font-bold text-gray-900 text-lg">2024</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1">Số đội</p>
                    <p className="font-bold text-gray-900 text-lg">32 Đội</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-12 mb-16">
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors border border-gray-200 bg-white">
                <ChevronLeft size={20} />
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1a6e38] text-white font-bold shadow-sm">
                1
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100 transition-colors bg-white border border-gray-100">
                2
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100 transition-colors bg-white border border-gray-100">
                3
              </button>
              <span className="text-gray-400 font-bold px-1">...</span>
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100 transition-colors bg-white border border-gray-100">
                8
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors border border-gray-200 bg-white">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="bg-[#f4f5f4] rounded-3xl p-6 md:p-8 mb-24">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div className="flex bg-white rounded-full p-1 shadow-sm w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("live")}
                  className={`cursor-pointer flex-1 md:flex-none px-6 py-2 rounded-full font-bold text-sm transition-colors flex items-center gap-2 justify-center ${activeTab === "live"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${activeTab === "live" ? "bg-green-500" : "bg-gray-300"
                      }`}
                  ></div>
                  Trực tiếp
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("upcoming")}
                  className={`cursor-pointer flex-1 md:flex-none px-6 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === "upcoming"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  Sắp diễn ra
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("finished")}
                  className={`cursor-pointer flex-1 md:flex-none px-6 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === "finished"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  Đã diễn ra
                </button>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center justify-between gap-2 bg-white px-4 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  <Trophy size={16} className="text-gray-400" />
                  <span>Tất cả giải đấu</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                <button className="flex-1 md:flex-none flex items-center justify-between gap-2 bg-white px-4 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Vòng hiện tại</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {activeTab === "live" && (
                <div>
                  <h3 className="text-xm font-bold text-green-700 tracking-widest uppercase mb-4">Đang diễn ra</h3>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="text-xm font-bold text-gray-500 tracking-wider mb-6 text-center md:text-left">
                      V-LEAGUE 2024 • VÒNG 1
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                      <div className="flex flex-col items-center gap-3 w-full md:w-1/3">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                          NFC
                        </div>
                        <span className="text-lg font-bold text-gray-900 text-center">Northside FC</span>
                      </div>

                      <div className="flex flex-col items-center justify-center w-full md:w-1/3 space-y-3">
                        <div className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                          68' <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-5xl font-black text-green-700">2</span>
                          <span className="text-gray-300 text-3xl font-light">-</span>
                          <span className="text-5xl font-black text-gray-900">1</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-xm font-semibold">
                          <MapPin size={12} /> The Grand Arena
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-3 w-full md:w-1/3">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl">
                          UC
                        </div>
                        <span className="text-lg font-bold text-gray-900 text-center">United City</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "upcoming" && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 tracking-widest uppercase mb-4">Ngày mai</h3>
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-6 md:px-10 shadow-sm border border-gray-100">
                      <div className="text-sm font-bold text-gray-500 tracking-wider mb-6 text-center md:text-left">
                        CÚP SINH VIÊN TOÀN QUỐC • VÒNG 2
                      </div>
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-1/3">
                          <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center">
                            <Shield size={20} />
                          </div>
                          <span className="text-lg font-bold text-gray-900 text-center md:text-left">Metro Rovers</span>
                        </div>

                        <div className="flex flex-col items-center justify-center w-full md:w-1/3 space-y-3">
                          <div className="bg-gray-100 text-gray-600 text-xs font-bold px-4 py-1.5 rounded-full">
                            18:30 GMT
                          </div>
                          <div className="flex items-center gap-4 text-gray-400 font-bold">
                            <span>-</span>
                            <span className="text-gray-900 text-xl font-black">VS</span>
                            <span>-</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 text-xm font-semibold">
                            <MapPin size={12} /> Riverside Stadium
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center md:justify-end gap-4 w-full md:w-1/3">
                          <span className="text-lg font-bold text-gray-900 text-center md:text-right hidden md:block">Eastside Blaze</span>
                          <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center">
                            <Zap size={20} />
                          </div>
                          <span className="text-lg font-bold text-gray-900 text-center md:text-right block md:hidden">Eastside Blaze</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 md:px-10 shadow-sm border border-gray-100">
                      <div className="text-sm font-bold text-gray-500 tracking-wider mb-6 text-center md:text-left">
                        HANOI ELITE LEAGUE S5 • VÒNG 4
                      </div>
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-1/3">
                          <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center">
                            <Award size={20} />
                          </div>
                          <span className="text-lg font-bold text-gray-900 text-center md:text-left">Valley Kings</span>
                        </div>

                        <div className="flex flex-col items-center justify-center w-full md:w-1/3 space-y-3">
                          <div className="bg-gray-100 text-gray-600 text-xs font-bold px-4 py-1.5 rounded-full">
                            20:00 GMT
                          </div>
                          <div className="flex items-center gap-4 text-gray-400 font-bold">
                            <span>-</span>
                            <span className="text-gray-900 text-xl font-black">VS</span>
                            <span>-</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 text-xm font-semibold">
                            <MapPin size={12} /> Highland Pitch
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center md:justify-end gap-4 w-full md:w-1/3">
                          <span className="text-lg font-bold text-gray-900 text-center md:text-right hidden md:block">Thunder FC</span>
                          <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center">
                            <Zap size={20} />
                          </div>
                          <span className="text-lg font-bold text-gray-900 text-center md:text-right block md:hidden">Thunder FC</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "finished" && (
                <div>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 tracking-widest uppercase mb-4">
                        21/5/2026
                      </h3>

                      <div className="bg-white rounded-2xl p-6 md:px-10 shadow-sm border border-gray-100">
                        <div className="text-sm font-bold text-gray-500 tracking-wider mb-6 text-center md:text-left">
                          CÚP QUỐC GIA 2024 • VÒNG 1
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-1/3">
                            <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center">
                              <Shield size={20} />
                            </div>
                            <span className="text-lg font-bold text-gray-900 text-center md:text-left">
                              Capital FC
                            </span>
                          </div>

                          <div className="flex flex-col items-center justify-center w-full md:w-1/3 space-y-3">
                            <div className="bg-gray-100 text-gray-600 text-xs font-bold px-4 py-1.5 rounded-full">
                              18:30 GMT
                            </div>

                            <div className="flex items-center gap-4 font-bold">
                              <span className="text-4xl font-black text-green-700">3</span>
                              <span className="text-gray-300 text-3xl font-light">-</span>
                              <span className="text-4xl font-black text-gray-900">2</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-gray-400 text-xm font-semibold">
                              <MapPin size={12} /> National Stadium
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row items-center md:justify-end gap-4 w-full md:w-1/3">
                            <span className="text-lg font-bold text-gray-900 text-center md:text-right hidden md:block">
                              Ocean United
                            </span>
                            <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center">
                              <Zap size={20} />
                            </div>
                            <span className="text-lg font-bold text-gray-900 text-center md:text-right block md:hidden">
                              Ocean United
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-500 tracking-widest uppercase mb-4">
                        20/5/2026
                      </h3>

                      <div className="bg-white rounded-2xl p-6 md:px-10 shadow-sm border border-gray-100">
                        <div className="text-sm font-bold text-gray-500 tracking-wider mb-6 text-center md:text-left">
                          HANOI ELITE LEAGUE S5 • VÒNG 3
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-1/3">
                            <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center">
                              <Award size={20} />
                            </div>
                            <span className="text-lg font-bold text-gray-900 text-center md:text-left">
                              River Town
                            </span>
                          </div>

                          <div className="flex flex-col items-center justify-center w-full md:w-1/3 space-y-3">
                            <div className="bg-gray-100 text-gray-600 text-xs font-bold px-4 py-1.5 rounded-full">
                              20:00 GMT
                            </div>

                            <div className="flex items-center gap-4 font-bold">
                              <span className="text-4xl font-black text-gray-900">1</span>
                              <span className="text-gray-300 text-3xl font-light">-</span>
                              <span className="text-4xl font-black text-green-700">4</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-gray-400 text-xm font-semibold">
                              <MapPin size={12} /> Riverside Stadium
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row items-center md:justify-end gap-4 w-full md:w-1/3">
                            <span className="text-lg font-bold text-gray-900 text-center md:text-right hidden md:block">
                              Storm United
                            </span>
                            <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center">
                              <Zap size={20} />
                            </div>
                            <span className="text-lg font-bold text-gray-900 text-center md:text-right block md:hidden">
                              Storm United
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PublicLeaguesPage;