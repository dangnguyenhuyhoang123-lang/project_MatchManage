import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmModal from "../../components/ConfirmModal";
import { AppLayout } from "../../layouts/AppLayout";
import {
  Search,
  Plus,
  Eye,
  Lock,
  Unlock,
  Trash2,
  ChevronDown,
} from "lucide-react";
import UserService from "../../services/UserService";
import type { AuthUser } from "../../types/AuthUser";
import TeamService from "../../services/TeamService";
import { TeamModel } from "../../model/TeamModel";
import { UserModal } from "./UserModal";
import { useRealtimeEvent } from "../../hooks/useRealtimeEvent";
import type { RealtimeEventDTO } from "../../model/RealtimeEvent";
import LoadingSpinner from "../../components/Spinner/LoadingSpinner";

export default function SystemSettingsPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [teams, setTeams] = useState<TeamModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    user: AuthUser;
    role: string;
  } | null>(null);
  const [pendingStatusToggle, setPendingStatusToggle] = useState<{
    userId: number;
    currentStatus: boolean;
  } | null>(null);
  const [pendingDeleteUserId, setPendingDeleteUserId] = useState<number | null>(
    null,
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await TeamService.getAllTeamsNormalized(0, 100);
      setTeams(res.content || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách CLB:", error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await UserService.getAllUsers(0, 100);
      const data = res.data?.content || res.data || [];
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, [fetchTeams, fetchUsers]);

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEventDTO) => {
      if (event.action === "REFETCH_USERS") {
        void fetchUsers();
      }
    },
    [fetchUsers],
  );

  useRealtimeEvent(handleRealtimeEvent);

  const handleRoleChange = async (user: AuthUser, role: string) => {
    try {
      let roles: string[] = [];
      if (role === "Admin") roles = ["ROLE_ADMIN"];
      else if (role === "Club Manager") roles = ["ROLE_CLUB_MANAGER"];
      else roles = ["ROLE_USER"];

      if (role === "Club Manager" && !user.teamId) {
        toast.warning(
          "Để cấp quyền Club Manager, người dùng này cần có một CLB đại diện. Vui lòng cập nhật CLB trong form chi tiết!",
        );
        setSelectedUser(user);
        setIsModalOpen(true);
        return;
      }

      const teamId = role === "Club Manager" ? user.teamId || null : null;
      await UserService.updateUserRoles(user.id, { roles, teamId });
      toast.success("Đã cập nhật vai trò người dùng.");
      fetchUsers();
    } catch (error) {
      console.error("Lỗi khi cập nhật quyền:", error);
      toast.error("Không thể cập nhật quyền người dùng.");
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!pendingRoleChange) return;

    try {
      setConfirmLoading(true);
      await handleRoleChange(pendingRoleChange.user, pendingRoleChange.role);
      setPendingRoleChange(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleTeamChange = async (user: AuthUser, teamIdStr: string) => {
    try {
      const teamId = teamIdStr ? Number(teamIdStr) : null;
      await UserService.updateUserRoles(user.id, { roles: user.roles, teamId });
      toast.success("Đã cập nhật CLB liên kết.");
      fetchUsers();
    } catch (error) {
      console.error("Lỗi khi cập nhật CLB:", error);
      toast.error("Không thể cập nhật CLB liên kết.");
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    setPendingStatusToggle({ userId, currentStatus });
  };

  const handleConfirmStatusToggle = async () => {
    if (!pendingStatusToggle) return;

    try {
      setConfirmLoading(true);
      await UserService.updateUserStatus(pendingStatusToggle.userId, {
        status: !pendingStatusToggle.currentStatus,
      });
      toast.success("Đã cập nhật trạng thái người dùng.");
      setPendingStatusToggle(null);
      fetchUsers();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast.error("Không thể cập nhật trạng thái người dùng.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleSaveUser = async (payload: any, isEdit: boolean) => {
    try {
      console.log(payload);
      if (isEdit) {
        if (!payload.id) {
          toast.error("Không tìm thấy ID người dùng.");
          return;
        }

        await UserService.updateUser(payload.id, {
          fullName: payload.fullName,
          displayName: payload.displayName,
          email: payload.email,
        });

        const roles = payload.roles ?? [];
        const isClubManager = roles.includes("ROLE_CLUB_MANAGER");

        if (isClubManager && !payload.teamId) {
          toast.warning("Vui lòng chọn CLB cho Club Manager.");
          return;
        }
        console.log(payload);
        await UserService.updateUserRoles(payload.id, {
          roles,
          teamId: isClubManager ? Number(payload.teamId) : null,
        });
      } else {
        await UserService.createUser(payload);
      }

      await fetchUsers();
    } catch (error: any) {
      console.error("Lỗi khi lưu người dùng:", error);
      console.error("Status:", error?.response?.status);
      console.error("Response data:", error?.response?.data);

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Lưu người dùng thất bại.",
      );

      throw error;
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setPendingDeleteUserId(userId);
  };

  const handleConfirmDeleteUser = async () => {
    if (!pendingDeleteUserId) return;

    try {
      setConfirmLoading(true);
      await UserService.deleteUser(pendingDeleteUserId);
      toast.success("Đã xóa người dùng.");
      setPendingDeleteUserId(null);
      fetchUsers();
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      toast.error("Không thể xóa người dùng.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesRole = true;
    if (roleFilter === "Admin")
      matchesRole = user.roles?.includes("ROLE_ADMIN");
    else if (roleFilter === "Club Manager")
      matchesRole = user.roles?.includes("ROLE_CLUB_MANAGER");
    else if (roleFilter === "User")
      matchesRole =
        user.roles?.includes("ROLE_USER") ||
        !user.roles ||
        user.roles.length === 0;

    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status).length;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Quản lý Người dùng & Phân quyền
          </h1>
        </div>
        <button
          onClick={() => {
            setSelectedUser(null);
            setIsModalOpen(true);
          }}
          className="cursor-pointer flex items-center gap-2 bg-[#1a6e38] text-white px-5 py-2.5 rounded-full font-bold hover:bg-green-800 transition-colors"
        >
          <Plus size={20} /> Thêm người dùng mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#f8f9fa] rounded-2xl p-6 flex flex-col justify-between border border-gray-100 relative overflow-hidden">
          <div className="absolute -right-2.5 -top-2.5 text-gray-200">
            <span className="material-symbols-outlined text-8xl">groups</span>
          </div>
          <h3 className="text-sm font-bold text-blue-600 mb-2 z-10">
            Tổng số người dùng
          </h3>
          <div className="flex items-baseline gap-3 z-10">
            <span className="text-4xl font-extrabold text-gray-900">
              {totalUsers}
            </span>
          </div>
        </div>

        <div className="bg-[#f8f9fa] rounded-2xl p-6 flex flex-col justify-between border border-gray-100 relative overflow-hidden">
          <div className="absolute -right-2.5 -top-2.5 text-gray-200">
            <span className="material-symbols-outlined text-8xl">
              check_circle
            </span>
          </div>
          <h3 className="text-sm font-bold text-blue-600 mb-2 z-10">
            Tài khoản hoạt động
          </h3>
          <span className="text-4xl font-extrabold text-gray-900 z-10">
            {activeUsers}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 flex flex-col justify-between border border-gray-100 shadow-sm relative">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5 text-sm font-bold text-red-600">
              <span className="material-symbols-outlined text-[18px]">
                error
              </span>
              Chưa kích hoạt
            </div>
            <button className="cursor-pointer text-xs font-bold text-green-700 hover:underline">
              Xem tất cả
            </button>
          </div>
          <span className="text-4xl font-extrabold text-gray-900">
            {inactiveUsers}
          </span>
        </div>
      </div>

      <div className="w-full">
        <div className="col-span-12">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#F5F3EF] p-4 rounded-2xl mb-6">
            <div className="relative w-full sm:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#40493D]"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#E4E2DE] rounded-sm py-2 pl-10 pr-4 text-sm font-medium text-[#1B1C1A] placeholder:text-[#707A6C] border-none outline-none focus:ring-1 focus:ring-[#BFCABA]"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setRoleFilter("All")}
                className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${roleFilter === "All" ? "bg-[#E4E2DE] text-[#1B1C1A]" : "bg-white text-[#40493D] border border-[#BFCABA]/40 hover:bg-[#E4E2DE]"}`}
              >
                Tất cả
              </button>

              <button
                onClick={() => setRoleFilter("Admin")}
                className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${roleFilter === "Admin" ? "bg-[#E4E2DE] text-[#1B1C1A]" : "bg-white text-[#40493D] border border-[#BFCABA]/40 hover:bg-[#E4E2DE]"}`}
              >
                Admin
              </button>

              <button
                onClick={() => setRoleFilter("Club Manager")}
                className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${roleFilter === "Club Manager" ? "bg-[#E4E2DE] text-[#1B1C1A]" : "bg-white text-[#40493D] border border-[#BFCABA]/40 hover:bg-[#E4E2DE]"}`}
              >
                CLB Manager
              </button>

              <button
                onClick={() => setRoleFilter("User")}
                className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${roleFilter === "User" ? "bg-[#E4E2DE] text-[#1B1C1A]" : "bg-white text-[#40493D] border border-[#BFCABA]/40 hover:bg-[#E4E2DE]"}`}
              >
                User
              </button>
            </div>
          </div>

          {/* Table Header */}
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-2 text-xs font-bold text-[#40493D] uppercase tracking-wider mb-2">
            <div className="col-span-3">Người dùng</div>
            <div className="col-span-3">Vai trò / Phân quyền</div>
            <div className="col-span-3">CLB Liên kết</div>
            <div className="col-span-1">Trạng thái</div>
            <div className="col-span-2 text-right">Thao tác</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2">
            {loading ? (
              <LoadingSpinner />
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Không tìm thấy người dùng nào.
              </div>
            ) : (
              filteredUsers.map((user) => {
                let userRoleDisplay = "User";
                if (user.roles?.includes("ROLE_ADMIN"))
                  userRoleDisplay = "Admin";
                else if (user.roles?.includes("ROLE_CLUB_MANAGER"))
                  userRoleDisplay = "Club Manager";

                return (
                  <div
                    key={user.id}
                    className={`bg-white rounded-2xl p-4 grid grid-cols-12 gap-4 items-center hover:shadow-[0_4px_20px_-4px_rgba(27,28,26,0.08)] transition-shadow ${!user.status ? "opacity-70 hover:opacity-100 transition-opacity" : ""}`}
                  >
                    <div className="col-span-3 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center font-bold text-sm text-gray-600">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.fullName?.charAt(0).toUpperCase() || "U"
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-[#1B1C1A] text-sm">
                          {user.fullName || user.username}
                        </h4>
                        <p className="text-[#707A6C] text-xs">{user.email}</p>
                      </div>
                    </div>

                    <div className="col-span-3">
                      <div className="relative inline-block">
                        <select
                          value={userRoleDisplay}
                          onChange={(e) =>
                            setPendingRoleChange({
                              user,
                              role: e.target.value,
                            })
                          }
                          className={`appearance-none text-xs font-semibold rounded-full pl-3 pr-8 py-1 outline-none cursor-pointer ${
                            userRoleDisplay === "Admin"
                              ? "bg-[#2E7D32]/10 text-[#005312] border border-[#2E7D32]/20 focus:ring-2 focus:ring-green-600/20"
                              : userRoleDisplay === "Club Manager"
                                ? "bg-indigo-100 text-indigo-700 border border-indigo-200 focus:ring-2 focus:ring-indigo-400/20"
                                : "bg-[#E4E2DE] text-[#40493D] border border-[#BFCABA]/50 focus:ring-2 focus:ring-gray-300"
                          }`}
                        >
                          <option value="Admin">Admin</option>
                          <option value="Club Manager">Club Manager</option>
                          <option value="User">User</option>
                        </select>

                        <ChevronDown
                          size={14}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1B1C1A] pointer-events-none"
                        />
                      </div>
                    </div>

                    <div className="col-span-3">
                      {userRoleDisplay === "Club Manager" ? (
                        <div className="relative inline-block w-full">
                          <select
                            value={user.teamId || ""}
                            onChange={(e) =>
                              handleTeamChange(user, e.target.value)
                            }
                            className="appearance-none w-full bg-[#E4E2DE] text-[#40493D] border border-[#BFCABA]/50 text-xs font-semibold rounded-full pl-3 pr-8 py-1 outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                          >
                            <option value="">Chọn CLB</option>
                            {teams.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1B1C1A] pointer-events-none"
                          />
                        </div>
                      ) : (
                        <span className="text-[#707A6C] text-xs font-semibold">
                          N/A
                        </span>
                      )}
                    </div>

                    <div className="col-span-1">
                      <span
                        className={`flex items-center gap-2 text-sm font-semibold ${user.status ? "text-[#0D631B]" : "text-[#707A6C]"}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${user.status ? "bg-[#0D631B]" : "bg-[#BFCABA]"}`}
                        ></span>
                        {user.status ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="col-span-2 flex justify-end gap-3 text-[#40493D]">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsModalOpen(true);
                        }}
                        className="cursor-pointer p-1 hover:text-[#0D631B] transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => handleStatusToggle(user.id, user.status)}
                        className={`cursor-pointer p-1 transition-colors ${user.status ? "hover:text-red-600" : "hover:text-[#0D631B]"}`}
                        title={user.status ? "Vô hiệu hóa" : "Khôi phục"}
                      >
                        {user.status ? (
                          <Lock size={18} />
                        ) : (
                          <Unlock size={18} />
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="cursor-pointer p-1 hover:text-red-600 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        teams={teams}
      />
      <ConfirmModal
        open={pendingRoleChange !== null}
        title="Đổi vai trò người dùng"
        message={`Bạn có chắc chắn muốn đổi vai trò người dùng này thành ${pendingRoleChange?.role ?? ""}?`}
        confirmText="Đổi vai trò"
        cancelText="Hủy"
        loading={confirmLoading}
        onConfirm={handleConfirmRoleChange}
        onClose={() => {
          if (!confirmLoading) setPendingRoleChange(null);
        }}
      />
      <ConfirmModal
        open={pendingStatusToggle !== null}
        title="Đổi trạng thái tài khoản"
        message={`Bạn có chắc chắn muốn ${
          pendingStatusToggle?.currentStatus ? "vô hiệu hóa" : "kích hoạt"
        } người dùng này?`}
        confirmText={
          pendingStatusToggle?.currentStatus ? "Vô hiệu hóa" : "Kích hoạt"
        }
        cancelText="Hủy"
        danger={Boolean(pendingStatusToggle?.currentStatus)}
        loading={confirmLoading}
        onConfirm={handleConfirmStatusToggle}
        onClose={() => {
          if (!confirmLoading) setPendingStatusToggle(null);
        }}
      />
      <ConfirmModal
        open={pendingDeleteUserId !== null}
        title="Xóa người dùng"
        message="Bạn có chắc chắn muốn xóa người dùng này?"
        confirmText="Xóa người dùng"
        cancelText="Hủy"
        danger
        loading={confirmLoading}
        onConfirm={handleConfirmDeleteUser}
        onClose={() => {
          if (!confirmLoading) setPendingDeleteUserId(null);
        }}
      />
    </AppLayout>
  );
}
