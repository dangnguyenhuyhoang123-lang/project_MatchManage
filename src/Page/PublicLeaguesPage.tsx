import { ChevronDown, Trophy, Briefcase, Medal, Award } from "lucide-react";
import { Header_HomePage } from "../components/Header/Header_HomePage";
import { Footer } from "../components/Footer/Footer_HomePage";

export const PublicLeaguesPage = () => {
    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans">
            <Header_HomePage />

            <div className="pt-12">
                <div className="max-w-360 mx-auto px-6 md:px-12">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Hệ thống Giải đấu</h1>
                            <p className="text-gray-500 text-lg">Khám phá và tham gia các giải đấu bóng đá phong trào hàng đầu.</p>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div>
                                <span className="text-xs font-bold text-green-700 tracking-widest uppercase mb-1 block">NĂM</span>
                                <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center justify-between w-32 cursor-pointer font-bold text-gray-700">
                                    2024
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-green-700 tracking-widest uppercase mb-1 block">CẤP ĐỘ GIẢI</span>
                                <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center justify-between w-40 cursor-pointer font-bold text-gray-700 text-sm">
                                    Tất cả cấp độ
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">

                        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100/50 shadow-sm flex flex-col justify-between h-125">
                            <div className="relative rounded-2xl overflow-hidden h-3/5 bg-gray-900 mb-6">
                                <img src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-80" alt="V League" />
                                <div className="absolute top-4 left-4 bg-green-700 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                                    ĐANG DIỄN RA
                                </div>
                            </div>

                            <div className="flex gap-4 mb-4 items-center">
                                <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
                                    <Trophy className="text-yellow-500" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">V-League Championship 2024</h2>
                                    <p className="text-green-700 text-sm font-semibold">Hạng đấu cao nhất Việt Nam</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-4">
                                <div className="flex gap-8">
                                    <div>
                                        <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mb-1">MÙA GIẢI</p>
                                        <p className="font-bold text-gray-900">2023 - 2024</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mb-1">SỐ ĐỘI</p>
                                        <p className="font-bold text-gray-900">14 Đội</p>
                                    </div>
                                </div>
                                <button className="bg-[#1a6e38] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-green-800 transition-colors">
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-gray-100/50 shadow-sm flex flex-col justify-between h-125">
                            <div className="relative rounded-2xl overflow-hidden h-3/5 bg-gray-200 mb-6">
                                <div className="w-full h-full bg-[#75B29B] flex items-center justify-center">
                                    <div className="w-24 h-32 bg-amber-400 rounded-t-xl rounded-b-md relative flex items-center justify-center">
                                        <div className="w-24 h-4 bg-white/20 absolute top-2"></div>
                                        <span className="text-gray-900 font-bold text-xs mt-8">STUDENT</span>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 bg-white text-gray-800 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                                    SẮP BẮT ĐẦU
                                </div>
                            </div>

                            <div className="flex gap-4 mb-4">
                                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                                    <Award className="text-green-700" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 mb-1 leading-tight">Cúp Sinh Viên Toàn Quốc</h2>
                                    <p className="text-gray-500 text-xs">Giải học đường</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-4">
                                <div>
                                    <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mb-1">MÙA GIẢI</p>
                                    <p className="font-bold text-gray-900 text-sm">2024</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mb-1">SỐ ĐỘI</p>
                                    <p className="font-bold text-gray-900 text-sm">32 Đội</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-gray-100/50 shadow-sm flex flex-col justify-between h-125">
                            <div className="relative rounded-2xl overflow-hidden h-3/5 bg-gray-900 mb-6 flex items-center justify-center">
                                <Trophy size={100} className="text-yellow-600" />
                                <div className="absolute top-4 left-4 bg-green-700 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                                    ĐANG DIỄN RA
                                </div>
                            </div>

                            <div className="flex gap-4 mb-4">
                                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                                    <Trophy className="text-green-700" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 mb-1 leading-tight">Hanoi Elite League S5</h2>
                                    <p className="text-gray-500 text-xs">Giải bán chuyên</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-4">
                                <div>
                                    <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mb-1">MÙA GIẢI</p>
                                    <p className="font-bold text-gray-900 text-sm">2023-2024</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mb-1">SỐ ĐỘI</p>
                                    <p className="font-bold text-gray-900 text-sm">12 Đội</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-gray-100/50 shadow-sm flex flex-col justify-between h-125">
                            <div className="relative rounded-2xl overflow-hidden h-3/5 bg-gray-900 mb-6 flex items-center justify-center">
                                <Briefcase size={100} className="text-gray-400" />
                                <div className="absolute top-4 right-4 bg-gray-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                                    ĐÃ KẾT THÚC
                                </div>
                            </div>

                            <div className="flex gap-4 mb-4">
                                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                                    <Briefcase className="text-green-700" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 mb-1 leading-tight">Cúp Doanh Nghiệp 2023</h2>
                                    <p className="text-gray-500 text-xs">Giải phong trào</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-4">
                                <div>
                                    <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mb-1">MÙA GIẢI</p>
                                    <p className="font-bold text-gray-900 text-sm">2023</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mb-1">SỐ ĐỘI</p>
                                    <p className="font-bold text-gray-900 text-sm">20 Đội</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-gray-100/50 shadow-sm flex flex-col justify-between h-125 relative">
                            <div className="relative rounded-2xl overflow-hidden h-3/5 bg-gray-900 mb-6 flex items-center justify-center">
                                <Medal size={100} className="text-yellow-500" />
                                <div className="absolute top-4 right-4 bg-white text-gray-800 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                                    SẮP BẮT ĐẦU
                                </div>
                            </div>

                            <div className="flex gap-4 mb-4">
                                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                                    <Medal className="text-green-700" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 mb-1 leading-tight">Lão Tướng Miền Bắc</h2>
                                    <p className="text-gray-500 text-xs">Giải lão tướng</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-4">
                                <div>
                                    <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mb-1">MÙA GIẢI</p>
                                    <p className="font-bold text-gray-900 text-sm">2024</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mb-1">SỐ ĐỘI</p>
                                    <p className="font-bold text-gray-900 text-sm">8 Đội</p>
                                </div>
                            </div>
                        </div>


                    </div>

                    <div className="flex justify-center mb-24">
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-2.5 rounded-full transition-colors text-sm flex items-center gap-2">
                            Xem thêm giải đấu <ChevronDown size={16} />
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PublicLeaguesPage;
