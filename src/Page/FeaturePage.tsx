import {
  ArrowRight,
  CalendarDays,
  BarChart2,
  Shield,
  Smartphone,
  CloudSync,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Header_HomePage } from "../components/Header/Header_HomePage";
import { Footer } from "../components/Footer/Footer_HomePage";

const FeaturePage = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      <Header_HomePage />

      <div className="pt-12">
        <div className="max-w-360 mx-auto px-6 md:px-12">
          <section className="mb-16 text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-6 tracking-wide shadow-sm">
              <Shield size={14} />
              ELITE SOCCER MANAGEMENT
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Tính Năng <br />
              <span className="text-[#1a6e38]">Vượt Trội</span>
            </h1>

            <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Nâng tầm quản lý bóng đá chuyên nghiệp với hệ sinh thái công nghệ
              hiện đại, được thiết kế để tối ưu hóa mọi khía cạnh từ sân cỏ đến
              văn phòng điều hành.
            </p>
          </section>

          <section className="mb-24 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100/50 flex flex-col justify-between overflow-hidden relative group">
              <div className="z-10 relative">
                <div className="w-14 h-14 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center mb-8">
                  <CalendarDays size={28} />
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Quản lý giải đấu tự động
                </h3>

                <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
                  Tự động sắp xếp lịch thi đấu, phân bổ trọng tài và cập nhật
                  bảng xếp hạng chỉ trong một cú click. Giảm thiểu 90% khối
                  lượng công việc hành chính.
                </p>

                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-green-700 font-bold hover:text-green-800 transition-colors"
                >
                  Khám phá chi tiết <ArrowRight size={18} />
                </a>
              </div>

              <div
                className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-cover bg-center rounded-tl-[3rem] opacity-90 group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundImage:
                    'url("https://images.unsplash.com/photo-1574629810360-1e3c83756d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")',
                  transformOrigin: "bottom right",
                }}
              >
                <div className="absolute inset-0 bg-linear-to-t from-white via-white/20 to-transparent" />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100/50 flex flex-col justify-between overflow-hidden">
              <div>
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Dữ liệu thời gian thực
                </h3>

                <p className="text-gray-500 text-lg leading-relaxed mb-12">
                  Mọi diễn biến trên sân được cập nhật tức thì. Theo dõi chỉ số
                  cầu thủ, tỷ lệ kiểm soát bóng và bản đồ nhiệt ngay khi trận
                  đấu đang diễn ra.
                </p>
              </div>

              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 mt-auto">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">
                    Live Stats
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-red-500">
                      Đang diễn ra
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                      <span>Kiểm soát bóng</span>
                      <span>68% / 32%</span>
                    </div>

                    <div className="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-blue-600 w-[68%]" />
                      <div className="bg-gray-400 w-[32%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                      <span>Dứt điểm trúng đích</span>
                      <span>12 / 4</span>
                    </div>

                    <div className="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-blue-600 w-[75%]" />
                      <div className="bg-gray-400 w-[25%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100/50 flex flex-col justify-between overflow-hidden">
              <div>
                <div className="w-14 h-14 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center mb-8">
                  <BarChart2 size={28} />
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Báo cáo thông minh
                </h3>

                <p className="text-gray-500 text-lg leading-relaxed mb-8">
                  Hệ thống AI phân tích chuyên sâu phong độ cầu thủ và tài chính
                  câu lạc bộ. Xuất báo cáo trực quan dưới dạng PDF hoặc tương
                  tác trực tiếp.
                </p>
              </div>

              <div className="bg-gray-50 rounded-3xl h-48 mt-auto flex items-center justify-center relative overflow-hidden border border-gray-100">
                <div className="w-32 h-32 bg-green-200 rounded-full absolute -top-10 -right-10 blur-2xl opacity-50" />
                <div className="w-32 h-32 bg-blue-200 rounded-full absolute -bottom-10 -left-10 blur-2xl opacity-50" />

                <img
                  src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Report"
                  className="w-[80%] h-auto rounded-xl shadow-sm object-cover"
                />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100/50 flex flex-col justify-between relative overflow-hidden">
              <div className="z-10 relative">
                <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center mb-8">
                  <Shield size={28} />
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Bảo mật dữ liệu
                </h3>

                <p className="text-gray-500 text-lg leading-relaxed mb-8">
                  Công nghệ mã hóa chuẩn quân đội bảo vệ thông tin cá nhân của
                  cầu thủ và dữ liệu chiến thuật của câu lạc bộ. Quyền riêng tư
                  là ưu tiên hàng đầu của chúng tôi.
                </p>

                <ul className="space-y-4 mb-8 text-gray-600 font-medium">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-green-600" />
                    Mã hóa AES-256 đầu cuối
                  </li>

                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-green-600" />
                    Xác thực đa yếu tố (MFA)
                  </li>

                  <li className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-green-600" />
                    Sao lưu dữ liệu tự động hằng ngày
                  </li>
                </ul>
              </div>

              <div className="absolute top-1/2 right-0 translate-x-1/4 -translate-y-1/2 w-80 h-80 bg-gray-50 rounded-full flex items-center justify-center">
                <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center">
                  <Shield size={48} className="text-green-600" />
                </div>
              </div>
            </div>
          </section>

          <section className="mb-24 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
              <div>
                <div className="w-12 h-12 bg-green-700 text-white rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                  <Smartphone size={24} />
                </div>

                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Ứng dụng Di động
                </h4>

                <p className="text-gray-500 leading-relaxed">
                  Điều hành mọi lúc, mọi nơi với ứng dụng mượt mà trên iOS và
                  Android.
                </p>
              </div>

              <div>
                <div className="w-12 h-12 bg-green-700 text-white rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                  <CloudSync size={24} />
                </div>

                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Đồng bộ Đám mây
                </h4>

                <p className="text-gray-500 leading-relaxed">
                  Truy cập dữ liệu từ bất kỳ thiết bị nào với tốc độ đồng bộ hóa
                  tức thì.
                </p>
              </div>

              <div>
                <div className="w-12 h-12 bg-green-700 text-white rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                  <Users size={24} />
                </div>

                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Quản lý Thành viên
                </h4>

                <p className="text-gray-500 leading-relaxed">
                  Tích hợp đăng ký, quản lý hồ sơ và thanh toán hội phí tự động.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-24">
            <div className="bg-[#1a6e38] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                  Sẵn sàng để thay đổi
                  <br />
                  cuộc chơi?
                </h2>

                <p className="text-green-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                  Bắt đầu hành trình chuyên nghiệp hóa câu lạc bộ của bạn ngay
                  hôm nay với bản dùng thử 14 ngày hoàn toàn miễn phí.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button className="bg-white text-[#1a6e38] px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors w-full sm:w-auto shadow-lg text-lg">
                    Dùng thử miễn phí
                  </button>

                  <button className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-colors w-full sm:w-auto text-lg">
                    Liên hệ tư vấn
                  </button>
                </div>
              </div>

              <div className="absolute top-0 right-0 w-160 h-160 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-120 h-120 bg-black opacity-10 rounded-full translate-y-1/2 -translate-x-1/4" />
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FeaturePage;
