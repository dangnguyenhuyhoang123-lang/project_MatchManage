import { Calendar, User, LayoutGrid, List } from "lucide-react";
import { Header_HomePage } from "../components/Header/Header_HomePage";
import { Footer } from "../components/Footer/Footer_HomePage";

export const NewsPage = () => {
    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans">
            <Header_HomePage />

            <div className="pt-12">
                <div className="max-w-360 mx-auto px-6 md:px-12">
                    <section className="mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">
                            Tin nổi bật
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-125">
                            <div className="lg:col-span-2 relative rounded-3xl overflow-hidden group cursor-pointer h-100 lg:h-full">
                                <div
                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                                    style={{
                                        backgroundImage:
                                            'url("https://images.unsplash.com/photo-1511886929837-354d827aae26?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")',
                                    }} />

                                <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

                                <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end">
                                    <span className="inline-block bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 w-fit">
                                        PHÂN TÍCH CHUYÊN MÔN
                                    </span>

                                    <h3 className="text-white text-3xl md:text-4xl font-extrabold leading-tight mb-3">
                                        Chiến thuật "High-Pressing" đã định hình lại cục diện
                                        Premier League mùa này như thế nào?
                                    </h3>

                                    <p className="text-gray-200 mb-6 text-sm md:text-base max-w-2xl line-clamp-2">
                                        Sự trỗi dậy của các khối đội hình linh hoạt và tốc độ
                                        chuyển trạng thái chóng mặt đang tạo ra những cuộc cách
                                        mạng trên sân cỏ châu Âu.
                                    </p>

                                    <div className="flex items-center gap-6 text-gray-300 text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            <span>15 tháng 5, 2024</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <User size={16} />
                                            <span>Nguyễn Minh Anh</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 lg:h-full">
                                <div className="flex-1 relative rounded-3xl overflow-hidden group cursor-pointer min-h-62.5">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                                        style={{
                                            backgroundImage:
                                                'url("https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")',
                                        }} />

                                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/20 to-transparent" />

                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <span className="inline-block bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-full mb-3 w-fit">
                                            CHUYỂN NHƯỢNG
                                        </span>

                                        <h3 className="text-white text-xl font-bold leading-snug">
                                            Siêu bom tấn 150 triệu Euro sắp nổ ra tại Madrid?
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex-1 relative rounded-3xl overflow-hidden group cursor-pointer min-h-62.5">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                                        style={{
                                            backgroundImage:
                                                'url("https://images.unsplash.com/photo-1543351611-58f69d7c1781?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")',
                                        }} />

                                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/20 to-transparent" />

                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <span className="inline-block bg-green-700 text-white text-[10px] font-bold px-2 py-1 rounded-full mb-3 w-fit">
                                            CÂU LẠC BỘ
                                        </span>

                                        <h3 className="text-white text-xl font-bold leading-snug">
                                            Hành trình tái thiết: Kế hoạch 5 năm của Gã khổng lồ
                                            nước Đức
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mb-24 flex flex-col xl:flex-row gap-10">
                        <div className="xl:w-2/3">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900 relative">
                                    Tin mới cập nhật
                                    <span className="absolute -bottom-4.5 left-0 w-16 h-1 bg-[#1a6e38]" />
                                </h2>

                                <div className="flex items-center gap-3 text-gray-400">
                                    <button className="p-1 hover:text-gray-800 transition-colors text-gray-800">
                                        <LayoutGrid size={20} />
                                    </button>

                                    <button className="p-1 hover:text-gray-800 transition-colors">
                                        <List size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100/50 flex flex-col">
                                    <div className="h-48 bg-blue-100 overflow-hidden relative">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{
                                                backgroundImage:
                                                    'url("https://images.unsplash.com/photo-1434626881859-194d67b2b86f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80")',
                                            }} />
                                    </div>

                                    <div className="p-6 flex flex-col grow">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-bold text-blue-600 tracking-wider">
                                                KẾT QUẢ TRẬN ĐẤU
                                            </span>
                                            <span className="text-xs text-gray-400">2 giờ trước</span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
                                            Ngược dòng ngoạn mục, Arsenal khẳng định bản lĩnh ứng
                                            viên vô địch
                                        </h3>

                                        <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                                            Sau bàn thua sớm, Pháo thủ đã có màn trình diễn bùng
                                            nổ trong hiệp 2 để giữ vững ngôi đầu bảng.
                                        </p>

                                        <div className="mt-auto flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                                <img
                                                    src="https://i.pravatar.cc/150?img=11"
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover" />
                                            </div>

                                            <span className="text-xs font-semibold text-gray-700">
                                                Lê Hoàng Nam
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100/50 flex flex-col">
                                    <div className="h-48 bg-blue-100 overflow-hidden relative">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{
                                                backgroundImage:
                                                    'url("https://images.unsplash.com/photo-1508344928928-7165b67de128?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80")',
                                            }} />
                                    </div>

                                    <div className="p-6 flex flex-col grow">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-bold text-indigo-600 tracking-wider">
                                                PHỎNG VẤN ĐỘC QUYỀN
                                            </span>
                                            <span className="text-xs text-gray-400">5 giờ trước</span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
                                            Mbappé: "Thành công tại Champions League là nỗi ám ảnh
                                            lớn nhất của tôi"
                                        </h3>

                                        <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                                            Ngôi sao người Pháp chia sẻ về những dự định tương lai
                                            và áp lực khi thi đấu tại CLB hàng đầu châu Âu.
                                        </p>

                                        <div className="mt-auto flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                                <img
                                                    src="https://i.pravatar.cc/150?img=5"
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover" />
                                            </div>

                                            <span className="text-xs font-semibold text-gray-700">
                                                Trần Thu Hà
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100/50 flex flex-col">
                                    <div className="h-48 bg-blue-100 overflow-hidden relative">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{
                                                backgroundImage:
                                                    'url("https://images.unsplash.com/photo-1518605368461-1e1e38ce71ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80")',
                                            }} />
                                    </div>

                                    <div className="p-6 flex flex-col grow">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-bold text-amber-600 tracking-wider">
                                                CHIẾN THUẬT
                                            </span>
                                            <span className="text-xs text-gray-400">8 giờ trước</span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
                                            Sơ đồ 3-4-3: Vũ khí bí mật giúp Leverkusen không thể bị
                                            đánh bại
                                        </h3>

                                        <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                                            Phân tích chi tiết cách vận hành hệ thống của Xabi
                                            Alonso và sự linh hoạt của cặp hậu vệ biên.
                                        </p>

                                        <div className="mt-auto flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                                <img
                                                    src="https://i.pravatar.cc/150?img=8"
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover" />
                                            </div>

                                            <span className="text-xs font-semibold text-gray-700">
                                                Phạm Quốc Bảo
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Feed Card 4 */}
                                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100/50 flex flex-col">
                                    <div className="h-48 bg-blue-100 overflow-hidden relative">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{
                                                backgroundImage:
                                                    'url("https://images.unsplash.com/photo-1600250395178-40fe1529ce21?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80")',
                                            }} />
                                    </div>

                                    <div className="p-6 flex flex-col grow">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-bold text-red-600 tracking-wider">
                                                TIN Y TẾ
                                            </span>
                                            <span className="text-xs text-gray-400">Hôm qua</span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
                                            Hung tin cho Real Madrid: Courtois tái phát chấn thương
                                            nghiêm trọng
                                        </h3>

                                        <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                                            Thủ thành người Bỉ sẽ phải nghỉ thi đấu ít nhất 3 tháng
                                            tới, đẩy Kền kền trắng vào cuộc khủng hoảng.
                                        </p>

                                        <div className="mt-auto flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                                <img
                                                    src="https://i.pravatar.cc/150?img=33"
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover" />
                                            </div>

                                            <span className="text-xs font-semibold text-gray-700">
                                                Dr. Đặng Văn Tú
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-8 py-3 rounded-full transition-colors text-sm">
                                    Xem thêm tin tức
                                </button>
                            </div>
                        </div>

                        <div className="xl:w-1/3 flex flex-col gap-8">
                            <div className="bg-white rounded-3xl p-8 border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">
                                    Danh mục
                                </h3>

                                <div className="flex flex-wrap gap-3">
                                    {[
                                        "Tất cả",
                                        "Chuyển nhượng",
                                        "Kết quả",
                                        "Phân tích",
                                        "Câu lạc bộ",
                                        "Cầu thủ",
                                        "Hậu trường",
                                    ].map((tag, idx) => (
                                        <button
                                            key={idx}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${idx === 0
                                                ? "bg-gray-800 text-white"
                                                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-8 border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">
                                    Xu hướng
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <span className="text-4xl font-black text-gray-200 leading-none">
                                            01
                                        </span>
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-1 leading-snug hover:text-green-700 cursor-pointer transition-colors">
                                                Gia hạn hợp đồng của Salah: Những diễn biến mới nhất
                                            </h4>
                                            <span className="text-xs text-gray-400">
                                                1.2k lượt xem
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <span className="text-4xl font-black text-gray-200 leading-none">
                                            02
                                        </span>
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-1 leading-snug hover:text-green-700 cursor-pointer transition-colors">
                                                Danh sách rút gọn QBV 2024: Haaland dẫn đầu?
                                            </h4>
                                            <span className="text-xs text-gray-400">
                                                980 lượt xem
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <span className="text-4xl font-black text-gray-200 leading-none">
                                            03
                                        </span>
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-1 leading-snug hover:text-green-700 cursor-pointer transition-colors">
                                                European Super League: Sự trở lại đầy tranh cãi
                                            </h4>
                                            <span className="text-xs text-gray-400">
                                                850 lượt xem
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-700 rounded-3xl p-8 text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold mb-4">
                                        Đừng bỏ lỡ nhịp đập bóng đá!
                                    </h3>

                                    <p className="text-green-100 text-sm mb-6 leading-relaxed">
                                        Đăng ký nhận bản tin hàng ngày với những tin tức sốt dẻo
                                        nhất được gửi thẳng tới email của bạn.
                                    </p>

                                    <div className="flex flex-col gap-3">
                                        <input
                                            type="email"
                                            placeholder="Email của bạn..."
                                            className="w-full bg-green-800/50 border border-green-600 rounded-full px-5 py-3 text-sm text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400" />

                                        <button className="w-full bg-white text-green-800 font-bold rounded-full px-5 py-3 hover:bg-green-50 transition-colors">
                                            Đăng ký ngay
                                        </button>
                                    </div>
                                </div>

                                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-10 translate-x-10" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-10 rounded-full translate-y-10 -translate-x-10" />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default NewsPage;