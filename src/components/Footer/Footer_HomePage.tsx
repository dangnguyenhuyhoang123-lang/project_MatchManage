import { Award, PlaySquare, AtSign } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
    return (
        <footer className="bg-[#FAF9F9] pt-20 pb-10 border-t border-gray-100">
            <div className="max-w-360 mx-auto px-6 md:px-12">
                <div className="flex flex-col lg:flex-row justify-between mb-20 gap-16 lg:gap-8">
                    <div className="w-full lg:w-2/5">
                        <h3 className="text-2xl font-black text-[#1a6e38] mb-6 tracking-tight">
                            PitchPro
                        </h3>

                        <p className="text-gray-600 text-[15px] leading-relaxed mb-8 max-w-sm font-medium">
                            Nền tảng quản lý bóng đá hàng đầu khu vực, giúp các nhà tổ chức
                            vận hành giải đấu mượt mà và chuyên nghiệp hơn.
                        </p>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-green-700 hover:bg-green-50 cursor-pointer transition-colors">
                                <Award size={18} />
                            </div>

                            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-green-700 hover:bg-green-50 cursor-pointer transition-colors">
                                <PlaySquare size={18} />
                            </div>

                            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-green-700 hover:bg-green-50 cursor-pointer transition-colors">
                                <AtSign size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-3/5 flex flex-wrap md:flex-nowrap justify-between lg:justify-end lg:gap-32">
                        <div className="w-1/2 md:w-auto mb-10 md:mb-0">
                            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-widest">
                                HỆ THỐNG
                            </h4>

                            <ul className="space-y-4">
                                <li>
                                    <Link
                                        to="/features"
                                        className="text-gray-500 hover:text-[#1a6e38] transition-colors font-medium">
                                        Tính năng
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        to="/pricing"
                                        className="text-gray-500 hover:text-[#1a6e38] transition-colors font-medium">
                                        Bảng giá
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        to="/public-leagues"
                                        className="text-gray-500 hover:text-[#1a6e38] transition-colors font-medium">
                                        Giải đấu
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="w-1/2 md:w-auto mb-10 md:mb-0">
                            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-widest">
                                HỖ TRỢ
                            </h4>

                            <ul className="space-y-4">
                                <li>
                                    <Link
                                        to="/help-center"
                                        className="text-gray-500 hover:text-[#1a6e38] transition-colors font-medium">
                                        Help Center
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        to="/contact"
                                        className="text-gray-500 hover:text-[#1a6e38] transition-colors font-medium">
                                        Liên hệ
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        to="/guide"
                                        className="text-gray-500 hover:text-[#1a6e38] transition-colors font-medium">
                                        Hướng dẫn
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="w-full md:w-auto">
                            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-widest">
                                PHÁP LÝ
                            </h4>

                            <ul className="space-y-4">
                                <li>
                                    <Link
                                        to="/privacy-policy"
                                        className="text-gray-500 hover:text-[#1a6e38] transition-colors font-medium">
                                        Privacy Policy
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        to="/terms-of-service"
                                        className="text-gray-500 hover:text-[#1a6e38] transition-colors font-medium">
                                        Terms of Service
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[13px] text-gray-500 font-medium">
                        © 2024 Tactical Organicism. All rights reserved.
                    </p>

                    <div className="flex gap-8 text-[13px] text-gray-500 font-medium">
                        <span>Ngôn ngữ: Tiếng Việt</span>
                        <span>Trạng thái: Hoạt động bình thường</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};