import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import {
  getCurrentUser,
  updateCurrentUserProfile,
  type UpdateProfilePayload,
} from "../services/UserAccountAPI";

const UserProfilePage = () => {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UpdateProfilePayload>({
    username: "",
    fullName: "",
    displayName: "",
    email: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

    setFormData({
      username: user.username || "",
      fullName: user.fullName || "",
      displayName: user.displayName || user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
    });

    let isMounted = true;

    const loadProfile = async () => {
      try {
        setIsFetching(true);
        const currentUser = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        setUser(currentUser);
        setFormData({
          username: currentUser.username || "",
          fullName: currentUser.fullName || "",
          displayName: currentUser.displayName || currentUser.fullName || "",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
        });
      } catch (fetchError) {
        if (isMounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Khong the tai thong tin nguoi dung.",
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
  }, [
    setUser,
    user?.username,
    user?.fullName,
    user?.displayName,
    user?.email,
    user?.phone,
  ]);

  const handleChange =
    (field: keyof UpdateProfilePayload) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      setIsSaving(true);
      await updateCurrentUserProfile(formData);
      const refreshedUser = await getCurrentUser();

      setUser(refreshedUser);
      setFormData({
        username: refreshedUser.username || "",
        fullName: refreshedUser.fullName || "",
        displayName: refreshedUser.displayName || refreshedUser.fullName || "",
        email: refreshedUser.email || "",
        phone: refreshedUser.phone || "",
      });
      setMessage("Cap nhat thong tin thanh cong.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Khong the cap nhat thong tin nguoi dung.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isFetching) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="rounded-3xl bg-white p-8 shadow-lg text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-slate-200 border-t-green-600 animate-spin" />
          <p className="text-slate-600">Dang tai thong tin nguoi dung...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center rounded-xl border border-emerald-200 bg-white px-5 py-3 font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
        >
          ← Quay ve trang chu
        </Link>

        <div className="mt-6 grid lg:grid-cols-[1.1fr_1.9fr] gap-6">
          <section className="rounded-3xl bg-gradient-to-br from-green-700 via-emerald-600 to-lime-500 p-8 text-white shadow-lg">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-3xl font-bold uppercase">
              {(formData.displayName || formData.username || "U").charAt(0)}
            </div>

            <h1 className="mt-6 text-3xl font-bold">
              {formData.displayName || formData.username}
            </h1>
            <p className="mt-2 text-green-50">
              {formData.email || "Chua cap nhat email"}
            </p>

            <div className="mt-8 space-y-3">
              <div className="rounded-2xl bg-white/15 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-green-100">
                  Username
                </p>
                <p className="mt-1 font-semibold">
                  {formData.username || "Dang cap nhat"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/15 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-green-100">
                  Role
                </p>
                <p className="mt-1 font-semibold">
                  {user?.roles.includes("ROLE_ADMIN")
                    ? "Admin"
                    : user?.roles.includes("ROLE_STAFF")
                      ? "Staff"
                      : "User"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-lg">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                  Account Settings
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  Thong tin nguoi dung
                </h2>
                <p className="mt-2 text-slate-500">
                  Chinh sua thong tin ca nhan va cap nhat ho so cua ban.
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
              <div className="grid md:grid-cols-2 gap-5">
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

              <div className="grid md:grid-cols-2 gap-5">
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
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={handleChange("phone")}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                  />
                </div>
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
                  {isSaving ? "Dang luu..." : "Luu thay doi"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Huy
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
