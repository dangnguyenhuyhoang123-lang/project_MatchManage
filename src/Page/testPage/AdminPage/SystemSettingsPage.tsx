import { useState } from "react";
import { Search, Plus, Edit2, Trash2, ChevronRight } from "lucide-react";
import { AppLayout } from "../../../layouts/AppLayout";

export default function SystemSettingsPage() {
    const [permissions, setPermissions] = useState({
        viewLeagues: true,
        editLeagues: false,
        manageClub: true,
        registerPlayers: true,
        approveTransfers: false,
        viewMatches: true,
        updateScores: false,
    });

    const togglePermission = (key: keyof typeof permissions) => {
        setPermissions((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <AppLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Quản lý Người dùng & Phân quyền</h1>
                </div>
                <button className="cursor-pointer flex items-center gap-2 bg-[#1a6e38] text-white px-5 py-2.5 rounded-full font-bold hover:bg-green-800 transition-colors">
                    <Plus size={20} /> Thêm người dùng mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#f8f9fa] rounded-2xl p-6 flex flex-col justify-between border border-gray-100 relative overflow-hidden">
                    <div className="absolute -right-2.5 -top-2.5 text-gray-200">
                        <span className="material-symbols-outlined text-8xl">groups</span>
                    </div>
                    <h3 className="text-sm font-bold text-blue-600 mb-2 z-10">Tổng số người dùng</h3>
                    <div className="flex items-baseline gap-3 z-10">
                        <span className="text-4xl font-extrabold text-gray-900">1,248</span>
                        <span className="text-sm font-bold text-green-600 flex items-center">↑ 12%</span>
                    </div>
                </div>

                <div className="bg-[#f8f9fa] rounded-2xl p-6 flex flex-col justify-between border border-gray-100 relative overflow-hidden">
                    <div className="absolute -right-2.5 -top-2.5 text-gray-200">
                        <span className="material-symbols-outlined text-8xl">check_circle</span>
                    </div>
                    <h3 className="text-sm font-bold text-blue-600 mb-2 z-10">Tài khoản hoạt động</h3>
                    <span className="text-4xl font-extrabold text-gray-900 z-10">1,102</span>
                </div>

                <div className="bg-white rounded-2xl p-6 flex flex-col justify-between border border-gray-100 shadow-sm relative">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-red-600">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            Đang chờ phê duyệt
                        </div>
                        <button className="cursor-pointer text-xs font-bold text-green-700 hover:underline">Xem tất cả</button>
                    </div>
                    <span className="text-4xl font-extrabold text-gray-900">14</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="col-span-2">
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="relative flex-1 min-w-50">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm người dùng..."
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="cursor-pointer px-5 py-2.5 bg-gray-200 text-gray-700 rounded-full font-bold text-sm">Tất cả</button>
                            <button className="cursor-pointer px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-full font-bold text-sm hover:bg-gray-50">Admin</button>
                            <button className="cursor-pointer px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-full font-bold text-sm hover:bg-gray-50">CLB Manager</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 text-xs font-bold text-gray-600 tracking-wider">
                        <div className="col-span-5">NGƯỜI DÙNG</div>
                        <div className="col-span-3">VAI TRÒ</div>
                        <div className="col-span-2">TRẠNG THÁI</div>
                        <div className="col-span-2 text-right">THAO TÁC</div>
                    </div>

                    <div className="space-y-3 mt-4">
                        <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
                            <div className="grid grid-cols-12 gap-4 w-full items-center px-2">
                                <div className="col-span-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                        <img src="https://ui-avatars.com/api/?name=VA&background=334155&color=fff" alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Nguyễn Văn An</h4>
                                        <p className="text-gray-500 text-xs">an.nguyen@vff.org.vn</p>
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">System Admin</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="flex items-center gap-1.5 text-sm font-bold text-green-600">
                                        <div className="w-2 h-2 rounded-full bg-green-600"></div>
                                        Active
                                    </span>
                                </div>
                                <div className="col-span-2 flex justify-end gap-2 text-gray-500">
                                    <button className="cursor-pointer hover:text-gray-800 p-1"><Edit2 size={18} /></button>
                                    <button className="cursor-pointer hover:text-red-500 p-1"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
                            <div className="grid grid-cols-12 gap-4 w-full items-center px-2">
                                <div className="col-span-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-400 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                        TL
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Trần Thị Linh</h4>
                                        <p className="text-gray-500 text-xs">linh.tran@hanoicfc.com</p>
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">CLB Manager</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="flex items-center gap-1.5 text-sm font-bold text-green-600">
                                        <div className="w-2 h-2 rounded-full bg-green-600"></div>
                                        Active
                                    </span>
                                </div>
                                <div className="col-span-2 flex justify-end gap-2 text-gray-500">
                                    <button className="cursor-pointer hover:text-gray-800 p-1"><Edit2 size={18} /></button>
                                    <button className="cursor-pointer hover:text-red-500 p-1"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 opacity-70">
                            <div className="grid grid-cols-12 gap-4 w-full items-center px-2">
                                <div className="col-span-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0">
                                        HM
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Lê Hoàng Minh</h4>
                                        <p className="text-gray-500 text-xs">minh.referee@vff.org.vn</p>
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <span className="bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">Referee</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="flex items-center gap-1.5 text-sm font-bold text-gray-400">
                                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                        Inactive
                                    </span>
                                </div>
                                <div className="col-span-2 flex justify-end gap-2 text-gray-400">
                                    <button className="cursor-pointer hover:text-gray-800 p-1"><Edit2 size={18} /></button>
                                    <button className="cursor-pointer hover:text-red-500 p-1"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="col-span-1">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">Quyền hạn (Roles)</h2>
                            <button className="cursor-pointer text-sm font-bold text-green-700 text-right hover:underline leading-tight">Lưu thay đổi</button>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            Cấu hình ma trận phân quyền nhanh cho nhóm CLB Manager.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-[#f8f9fa] rounded-xl p-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-3">
                                    <span className="material-symbols-outlined text-[18px]">emoji_events</span> Giải Đấu
                                </div>
                                <div className="space-y-3 pl-1">
                                    <label
                                        onClick={() => togglePermission("viewLeagues")}
                                        className="flex items-center gap-3 cursor-pointer"
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${permissions.viewLeagues
                                                ? "bg-green-700"
                                                : "border-2 border-gray-300 bg-white"
                                                }`}
                                        >
                                            {permissions.viewLeagues && (
                                                <span className="material-symbols-outlined text-white text-[14px]">check</span>
                                            )}
                                        </div>
                                        <span
                                            className={`text-sm ${permissions.viewLeagues
                                                ? "text-gray-800 font-medium"
                                                : "text-gray-600"
                                                }`}
                                        >
                                            Xem danh sách giải
                                        </span>
                                    </label>

                                    <label
                                        onClick={() => togglePermission("editLeagues")}
                                        className="flex items-center gap-3 cursor-pointer"
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${permissions.editLeagues
                                                ? "bg-green-700"
                                                : "border-2 border-gray-300 bg-white"
                                                }`}
                                        >
                                            {permissions.editLeagues && (
                                                <span className="material-symbols-outlined text-white text-[14px]">check</span>
                                            )}
                                        </div>
                                        <span
                                            className={`text-sm ${permissions.editLeagues
                                                ? "text-gray-800 font-medium"
                                                : "text-gray-600"
                                                }`}
                                        >
                                            Tạo/Sửa giải đấu
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-[#f8f9fa] rounded-xl p-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-3">
                                    <span className="material-symbols-outlined text-[18px]">groups</span> Đội Bóng & Cầu Thủ
                                </div>
                                <div className="space-y-3 pl-1">
                                    <label
                                        onClick={() => togglePermission("manageClub")}
                                        className="flex items-center gap-3 cursor-pointer"
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${permissions.manageClub
                                                ? "bg-green-700"
                                                : "border-2 border-gray-300 bg-white"
                                                }`}
                                        >
                                            {permissions.manageClub && (
                                                <span className="material-symbols-outlined text-white text-[14px]">check</span>
                                            )}
                                        </div>
                                        <span
                                            className={`text-sm ${permissions.manageClub
                                                ? "text-gray-800 font-medium"
                                                : "text-gray-600"
                                                }`}
                                        >
                                            Quản lý CLB của mình
                                        </span>
                                    </label>

                                    <label
                                        onClick={() => togglePermission("registerPlayers")}
                                        className="flex items-center gap-3 cursor-pointer"
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${permissions.registerPlayers
                                                ? "bg-green-700"
                                                : "border-2 border-gray-300 bg-white"
                                                }`}
                                        >
                                            {permissions.registerPlayers && (
                                                <span className="material-symbols-outlined text-white text-[14px]">check</span>
                                            )}
                                        </div>
                                        <span
                                            className={`text-sm ${permissions.registerPlayers
                                                ? "text-gray-800 font-medium"
                                                : "text-gray-600"
                                                }`}
                                        >
                                            Đăng ký cầu thủ
                                        </span>
                                    </label>

                                    <label
                                        onClick={() => togglePermission("approveTransfers")}
                                        className="flex items-center gap-3 cursor-pointer"
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${permissions.approveTransfers
                                                ? "bg-green-700"
                                                : "border-2 border-gray-300 bg-white"
                                                }`}
                                        >
                                            {permissions.approveTransfers && (
                                                <span className="material-symbols-outlined text-white text-[14px]">check</span>
                                            )}
                                        </div>
                                        <span
                                            className={`text-sm ${permissions.approveTransfers
                                                ? "text-gray-800 font-medium"
                                                : "text-gray-600"
                                                }`}
                                        >
                                            Phê duyệt chuyển nhượng
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-[#f8f9fa] rounded-xl p-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-3">
                                    <span className="material-symbols-outlined text-[18px]">scoreboard</span> Kết Quả Trận Đấu
                                </div>
                                <div className="space-y-3 pl-1">
                                    <label
                                        onClick={() => togglePermission("viewMatches")}
                                        className="flex items-center gap-3 cursor-pointer"
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${permissions.viewMatches
                                                ? "bg-green-700"
                                                : "border-2 border-gray-300 bg-white"
                                                }`}
                                        >
                                            {permissions.viewMatches && (
                                                <span className="material-symbols-outlined text-white text-[14px]">check</span>
                                            )}
                                        </div>
                                        <span
                                            className={`text-sm ${permissions.viewMatches
                                                ? "text-gray-800 font-medium"
                                                : "text-gray-600"
                                                }`}
                                        >
                                            Xem chi tiết trận
                                        </span>
                                    </label>

                                    <label
                                        onClick={() => togglePermission("updateScores")}
                                        className="flex items-center gap-3 cursor-pointer"
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${permissions.updateScores
                                                ? "bg-green-700"
                                                : "border-2 border-gray-300 bg-white"
                                                }`}
                                        >
                                            {permissions.updateScores && (
                                                <span className="material-symbols-outlined text-white text-[14px]">check</span>
                                            )}
                                        </div>
                                        <span
                                            className={`text-sm ${permissions.updateScores
                                                ? "text-gray-800 font-medium"
                                                : "text-gray-600"
                                                }`}
                                        >
                                            Cập nhật tỷ số
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}