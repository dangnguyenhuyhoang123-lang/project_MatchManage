import { Award, Compass, Zap, Target } from "lucide-react";

import { Footer } from "../components/Footer/Footer_HomePage";

const AboutPage = () => {
  return (
    <>
      <div className="pt-12">
        <div className="max-w-360 mx-auto px-6 md:px-12">
          <section className="mb-24 flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <span className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4 block">
                VỀ CHÚNG TÔI
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-8">
                Định nghĩa lại <br />
                <span className="text-[#1a6e38] italic">Dòng chảy</span>
                <br />
                bóng đá.
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed max-w-md">
                PitchPro ra đời với sứ mệnh tối ưu hóa quản lý thể thao, mang
                lại sự chuyên nghiệp chuẩn quốc tế cho mọi cấp độ bóng đá tại
                Việt Nam.
              </p>
            </div>
            <div className="w-full md:w-1/2">
              <div className="rounded-[3rem] overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="CEO"
                  className="w-full h-125 object-cover"
                />
              </div>
            </div>
          </section>

          <section className="mb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-12 border border-gray-100/50 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="mb-6">
                  <Award className="text-green-700" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Sứ mệnh của chúng tôi
                </h2>
                <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mb-12">
                  Cung cấp nền tảng công nghệ toàn diện giúp các câu lạc bộ,
                  giải đấu và cầu thủ kết nối, phát triển tài năng và tối ưu hóa
                  hiệu suất thông qua dữ liệu phân tích chuyên sâu.
                </p>
                <div className="flex gap-4">
                  <div className="w-16 h-1 bg-gray-900 rounded-full"></div>
                  <div className="w-16 h-1 bg-gray-200 rounded-full"></div>
                  <div className="w-16 h-1 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-[#1a6e38] rounded-[2.5rem] p-12 text-white flex flex-col justify-center gap-10">
              <div>
                <h3 className="text-5xl font-extrabold mb-2">500+</h3>
                <p className="text-green-100 text-sm font-bold tracking-widest uppercase">
                  GIẢI ĐẤU TỔ CHỨC
                </p>
              </div>
              <div>
                <h3 className="text-5xl font-extrabold mb-2">10k+</h3>
                <p className="text-green-100 text-sm font-bold tracking-widest uppercase">
                  CẦU THỦ THAM GIA
                </p>
              </div>
            </div>
          </section>

          <section className="mb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#4d5db8] rounded-[2.5rem] p-10 text-white flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-4">Tầm nhìn 2030</h3>
                <p className="text-indigo-100 leading-relaxed">
                  Trở thành hệ sinh thái quản lý bóng đá số 1 Đông Nam Á, nơi
                  mọi giấc mơ bóng đá đều được ghi nhận và hỗ trợ bởi công nghệ.
                </p>
              </div>
              <div className="self-end mt-8">
                <Compass size={32} className="text-indigo-200" />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100/50 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Zap size={20} className="text-green-700" />
                <h3 className="font-bold text-gray-900 text-2xl">
                  Đam mê & Tốc độ
                </h3>
              </div>
              <p className="text-gray-500 leading-relaxed text-sl">
                Chúng tôi hành động nhanh chóng để đáp ứng nhu cầu thay đổi của
                thế giới thể thao hiện đại.
              </p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100/50 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Target size={20} className="text-[#4d5db8]" />
                <h3 className="font-bold text-gray-900 text-2xl">Chính xác</h3>
              </div>
              <p className="text-gray-500 leading-relaxed text-sl">
                Dữ liệu là trái tim của mọi quyết định. Chúng tôi tin vào sự
                minh bạch và khách quan.
              </p>
            </div>
          </section>

          <section className="mb-32">
            <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-16">
              Hành trình <span className="text-[#1a6e38]">PitchPro</span>
            </h2>
            <div className="max-w-4xl mx-auto relative border-l-2 border-gray-200 ml-4 md:mx-auto">
              <div className="mb-16 md:flex justify-between items-center w-full relative">
                <div className="hidden md:block w-5/12 text-right pr-8">
                  <h4 className="text-sm font-bold text-gray-500 mb-1">2021</h4>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Khởi nguồn ý tưởng
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-3">
                    Dự án PitchPro được thành lập bởi một nhóm chuyên gia phân
                    tích dữ liệu thể thao và các cựu cầu thủ chuyên nghiệp.
                  </p>
                </div>
                <div className="absolute -left-2.25 md:left-1/2 md:-ml-4.25 mt-1.5 md:mt-0 w-8 h-8 rounded-full bg-green-700 border-4 border-white flex items-center justify-center -translate-y-4 md:translate-y-0">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                </div>
                <div className="md:w-5/12 pl-8 md:pl-8">
                  <div className="md:hidden mb-4">
                    <h4 className="text-sm font-bold text-gray-500 mb-1">
                      2021
                    </h4>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Khởi nguồn ý tưởng
                    </h3>
                  </div>
                  <div className="h-32 rounded-2xl overflow-hidden bg-gray-200">
                    <img
                      src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-16 md:flex justify-between items-center w-full relative">
                <div className="md:w-5/12 pl-8 md:pl-0 md:pr-8 text-left md:text-right order-2 md:order-1 hidden md:block">
                  <div className="h-32 rounded-2xl overflow-hidden bg-gray-200">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -left-2.25 md:left-1/2 md:-ml-4.25 mt-1.5 md:mt-0 w-8 h-8 rounded-full bg-[#4d5db8] border-4 border-white flex items-center justify-center -translate-y-4 md:translate-y-0 order-1 md:order-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                </div>
                <div className="md:w-5/12 pl-8 md:pl-8 order-3">
                  <h4 className="text-sm font-bold text-gray-500 mb-1">2022</h4>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Beta Launch
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-3">
                    Thử nghiệm thành công với 50 câu lạc bộ phong trào tại TP.
                    Hồ Chí Minh và Hà Nội.
                  </p>
                  <div className="md:hidden mt-4 h-32 rounded-2xl overflow-hidden bg-gray-200">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="md:flex justify-between items-center w-full relative">
                <div className="hidden md:block w-5/12 text-right pr-8">
                  <h4 className="text-sm font-bold text-gray-500 mb-1">2024</h4>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Hệ sinh thái Elite
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-3">
                    Ra mắt phân hệ quản lý Tournament Pro và Player Scouting
                    tích hợp AI.
                  </p>
                </div>
                <div className="absolute -left-2.25 md:left-1/2 md:-ml-4.25 mt-1.5 md:mt-0 w-8 h-8 rounded-full bg-green-700 border-4 border-white flex items-center justify-center -translate-y-4 md:translate-y-0">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                </div>
                <div className="md:w-5/12 pl-8 md:pl-8">
                  <div className="md:hidden mb-4">
                    <h4 className="text-sm font-bold text-gray-500 mb-1">
                      2024
                    </h4>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Hệ sinh thái Elite
                    </h3>
                  </div>
                  <div className="h-32 rounded-2xl overflow-hidden bg-gray-200">
                    <img
                      src="https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=400"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TEAM */}
          <section className="mb-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <span className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2 block">
                  ĐỘI NGŨ
                </span>
                <h2 className="text-4xl font-extrabold text-gray-900">
                  Những người kiến tạo
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="bg-gray-900 rounded-3xl overflow-hidden h-72 mb-4 relative aspect-3/4">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex items-end p-6">
                    <p className="text-white font-bold text-sm">Safe at work</p>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Lê Minh Tuấn
                </h3>
                <p className="text-sm text-gray-500">Founder & CEO</p>
              </div>
              <div>
                <div className="bg-gray-900 rounded-3xl overflow-hidden h-72 mb-4 relative aspect-3/4">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 border border-white/20 rounded-full flex flex-col items-center justify-center">
                      <span className="text-white/50 text-[10px] font-bold">
                        CTO
                      </span>
                      <span className="text-white font-bold text-xs mt-1">
                        PITCHPRO
                      </span>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Trần Thu Hà</h3>
                <p className="text-sm text-gray-500">CTO</p>
              </div>
              <div>
                <div className="bg-gray-200 rounded-3xl overflow-hidden h-72 mb-4 relative aspect-3/4">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Nguyễn Hoàng Nam
                </h3>
                <p className="text-sm text-gray-500">Giám đốc Thể thao</p>
              </div>
              <div>
                <div className="bg-gray-200 rounded-3xl overflow-hidden h-72 mb-4 relative aspect-3/4">
                  <img
                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Phạm Bảo Long
                </h3>
                <p className="text-sm text-gray-500">Product Designer</p>
              </div>
            </div>
          </section>

          {/* BOTTOM CTA */}
          <section className="mb-24">
            <div className="bg-[#1a6e38] rounded-[3rem] p-12 md:p-20 text-center">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-10 leading-tight">
                Sẵn sàng đưa bóng đá
                <br />
                của bạn lên tầm cao mới?
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="bg-white text-[#1a6e38] px-8 py-3.5 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-lg">
                  Bắt đầu ngay
                </button>
                <button className="bg-transparent border border-white/30 text-white px-8 py-3.5 rounded-full font-bold hover:bg-white/10 transition-colors">
                  Liên hệ tư vấn
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutPage;
