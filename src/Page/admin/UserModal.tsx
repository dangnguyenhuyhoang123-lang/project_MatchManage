import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Modal } from "../../components/Modal";
import type { AuthUser } from "../../types/AuthUser";
import { TeamModel } from "../../model/TeamModel";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any, isEdit: boolean) => Promise<void>;
  user: AuthUser | null;
  teams: TeamModel[];
}

export function UserModal({
  isOpen,
  onClose,
  onSave,
  user,
  teams,
}: UserModalProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    displayName: "",
    password: "",
    status: true,
    roles: ["ROLE_USER"],
    teamId: null as number | null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEdit = !!user;

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        fullName: user.fullName || "",
        displayName: user.displayName || "",
        password: "", // Don't show password when editing
        status: user.status,
        roles: user.roles?.length ? user.roles : ["ROLE_USER"],
        teamId: user.teamId || null,
      });
    } else if (!user && isOpen) {
      // Reset form on add
      setFormData({
        username: "",
        email: "",
        fullName: "",
        displayName: "",
        password: "",
        status: true,
        roles: ["ROLE_USER"],
        teamId: null,
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "roles") {
      setFormData((prev) => ({ ...prev, roles: [value] }));
    } else if (name === "teamId") {
      setFormData((prev) => ({
        ...prev,
        teamId: value ? Number(value) : null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload: any = {
        ...formData,
        ...(user?.id ? { id: user.id } : {}),
      };
      if (isEdit) {
        delete payload.password;
      }

      if (!payload.roles.includes("ROLE_CLUB_MANAGER")) {
        payload.teamId = null;
      }

      if (payload.roles.includes("ROLE_CLUB_MANAGER") && !payload.teamId) {
        setErrors({ teamId: "Vui lòng chọn CLB liên kết cho Club Manager." });
        return;
      }

      await onSave(payload, isEdit);
      onClose();
    } catch (error) {
      console.error("Lỗi lưu user", error);
      toast.error("Đã xảy ra lỗi khi lưu thông tin người dùng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="md" className="p-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? "Chi tiết / Cập nhật Người Dùng" : "Thêm Người Dùng Mới"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              required
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isEdit}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              placeholder="user@example.com"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              required
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tên hiển thị
            </label>
            <input
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              placeholder="0912345678"
            />
          </div>

          {!isEdit && (
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                placeholder="Nhập mật khẩu"
              />
            </div>
          )}

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Vai trò
            </label>
            <select
              name="roles"
              value={formData.roles[0] || "ROLE_USER"}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            >
              <option value="ROLE_ADMIN">Admin</option>
              <option value="ROLE_CLUB_MANAGER">Club Manager</option>
              <option value="ROLE_USER">User</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              CLB Liên kết
            </label>
            <select
              name="teamId"
              value={formData.teamId || ""}
              onChange={handleChange}
              disabled={!formData.roles.includes("ROLE_CLUB_MANAGER")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 disabled:bg-gray-100"
            >
              <option value="">Chọn CLB...</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {errors.teamId && (
              <p className="mt-1 text-xs font-bold text-red-600">
                {errors.teamId}
              </p>
            )}
          </div>

          <div className="col-span-2 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-600"
              />
              <span className="text-sm font-semibold text-gray-700">
                Tài khoản hoạt động (Active)
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-bold text-white bg-[#1a6e38] rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Lưu"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
