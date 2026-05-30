import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/useAuth";
import UserService from "../services/UserService";

interface UpdateProfilePayload {
  username: string;
  fullName: string;
  displayName: string;
  email: string;
  avatar?: string;
}

function extractResponseData<T>(response: any): T {
  return response?.data ?? response;
}

const buildFormData = (source: any): UpdateProfilePayload => ({
  username: source?.username || "",
  fullName: source?.fullName || "",
  displayName: source?.displayName || source?.fullName || "",
  email: source?.email || "",
  avatar: source?.avatar || "",
});

const UserProfilePage = () => {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UpdateProfilePayload>({
    username: "",
    fullName: "",
    displayName: "",
    email: "",
    avatar: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!user) {
      setIsFetching(false);
      return;
    }

    let isMounted = true;

    setFormData(buildFormData(user));

    const loadProfile = async () => {
      try {
        // Đã xóa setIsFetching(true) ở đây để UX mượt hơn, không bị chớp màn hình loading
        setError("");

        const currentUserResponse = await UserService.getCurrentUser();
        const currentUser = extractResponseData<any>(currentUserResponse);

        if (!isMounted) return;

        setUser(currentUser);
        setFormData(buildFormData(currentUser));
      } catch (fetchError) {
        if (isMounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Không thể tải thông tin người dùng.",
          );
        }
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
    // Sử dụng comment eslint để bỏ qua cảnh báo dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Hàm xử lý khi người dùng chọn ảnh hoặc chụp xong
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn đúng file hình ảnh.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước ảnh không được vượt quá 5MB.");
      event.target.value = "";
      return;
    }

    // Hiển thị ảnh ngay lập tức lên giao diện (tốc độ mili-giây)
    const objectUrl = URL.createObjectURL(file);
    setPreviewAvatar(objectUrl);

    // Xử lý ngầm: Đọc file ra chuỗi Base64 để gửi xuống Backend
    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        avatar: String(reader.result),
      }));
    };

    reader.onerror = () => {
      setError("Không thể đọc file ảnh. Vui lòng thử lại.");
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  const handleChange =
    (field: keyof UpdateProfilePayload) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      setError("");
      setMessage("");
    };

  // const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];

  //   if (!file) return;

  //   setError("");
  //   setMessage("");

  //   if (!file.type.startsWith("image/")) {
  //     setError("Vui lòng chọn đúng file hình ảnh.");
  //     event.target.value = "";
  //     return;
  //   }

  //   if (file.size > 5 * 1024 * 1024) {
  //     setError("Kích thước ảnh không được vượt quá 5MB.");
  //     event.target.value = "";
  //     return;
  //   }

  //   const reader = new FileReader();

  //   reader.onloadend = () => {
  //     setFormData((prev) => ({
  //       ...prev,
  //       avatar: String(reader.result),
  //     }));
  //   };

  //   reader.onerror = () => {
  //     setError("Không thể đọc file ảnh. Vui lòng thử lại.");
  //     event.target.value = "";
  //   };

  //   reader.readAsDataURL(file);
  // };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setError("");
    setMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!user?.id) {
      setError("Không tìm thấy ID người dùng.");
      return;
    }

    try {
      setIsSaving(true);

      // Sử dụng hàm updateUser có sẵn, truyền vào userId và formData
      await UserService.updateUser(user.id, formData);

      // Lấy lại thông tin mới nhất
      const currentUserResponse = await UserService.getCurrentUser();
      const refreshedUser = extractResponseData<any>(currentUserResponse);

      setUser(refreshedUser);
      setFormData(buildFormData(refreshedUser));
      setMessage("Cập nhật thông tin thành công.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể cập nhật thông tin người dùng.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-green-600" />
          <p className="text-slate-600">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  const avatarLetter = (formData.displayName || formData.username || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center rounded-xl border border-emerald-200 bg-white px-5 py-3 font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
        >
          Quay về trang chủ
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
          <section className="rounded-3xl bg-gradient-to-br from-green-700 via-emerald-600 to-lime-500 p-8 text-white shadow-lg">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-white/15 text-4xl font-bold uppercase shadow-inner ring-4 ring-white/20"
                title="Đổi ảnh đại diện"
              >
                {previewAvatar || formData.avatar ? (
                  <img
                    src={previewAvatar || formData.avatar}
                    alt={formData.displayName || formData.username || "Avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarLetter
                )}

                <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-black opacity-0 transition group-hover:opacity-100">
                  Đổi ảnh
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                capture="user" /* Thuộc tính này sẽ gọi camera trước trên điện thoại */
                onChange={handleAvatarChange}
                className="hidden"
              />

              <h1 className="mt-6 text-center text-3xl font-bold">
                {formData.displayName || formData.username || "Người dùng"}
              </h1>

              <p className="mt-2 text-center text-green-50">
                {formData.email || "Chưa cập nhật email"}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full bg-white/20 px-4 py-2 text-xs font-black text-white transition hover:bg-white/30"
                >
                  Chọn ảnh
                </button>

                {formData.avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="rounded-full bg-black/20 px-4 py-2 text-xs font-black text-white transition hover:bg-black/30"
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>

              <p className="mt-3 text-center text-xs font-medium text-green-50/90">
                Hỗ trợ JPG, PNG, WEBP. Tối đa 5MB.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <div className="rounded-2xl bg-white/15 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-green-100">
                  Username
                </p>
                <p className="mt-1 font-semibold">
                  {formData.username || "Đang cập nhật"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/15 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-green-100">
                  Role
                </p>
                <p className="mt-1 font-semibold">
                  {user?.roles?.includes("ROLE_ADMIN")
                    ? "Admin"
                    : user?.roles?.includes("ROLE_STAFF")
                      ? "Staff"
                      : user?.roles?.includes("ROLE_CLUB_MANAGER")
                        ? "Quản lý CLB"
                        : "User"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-lg">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                  Account Settings
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  Thông tin người dùng
                </h2>
                <p className="mt-2 text-slate-500">
                  Chỉnh sửa thông tin cá nhân và cập nhật hồ sơ của bạn.
                </p>
              </div>
            </div>

            {message && (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={handleChange("username")}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={handleChange("displayName")}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange("fullName")}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  disabled={isSaving}
                  className="rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Hủy
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
