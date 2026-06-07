import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ConfirmModal from "../../../components/ConfirmModal";
import { Modal } from "../../../components/Modal";

import RefereeService, {
  type Referee,
  type RefereeRequest,
} from "../../../services/RefereeService";
import LoadingSpinner from "../../../components/Spinner/LoadingSpinner";
import { getErrorMessage } from "../../../utils/errorUtils";

const emptyForm: RefereeRequest = {
  name: "",
  dateOfBirth: "",
  birthYear: null,
  nationality: "Việt Nam",
  phone: "",
  email: "",
  level: "NATIONAL",
  certification: "",
  avatar: "",
  status: "ACTIVE",
  note: "",
};

const levelOptions = ["FIFA", "NATIONAL", "REGIONAL", "TRAINEE"];

// Hiển thị RefereeManagementPage.
export default function RefereeManagementPage() {
  const [items, setItems] = useState<Referee[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [level, setLevel] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState<Referee | null>(null);
  const [editing, setEditing] = useState<Referee | null>(null);
  const [form, setForm] = useState<RefereeRequest>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Tải data.
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await RefereeService.getAll();
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xử lý trọng tài."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !keyword ||
        [item.name, item.email, item.phone, item.nationality, item.level].some(
          (value) => (value ?? "").toLowerCase().includes(keyword),
        );
      const matchesStatus =
        status === "ALL" || (item.status ?? "ACTIVE").toUpperCase() === status;
      const matchesLevel =
        level === "ALL" || (item.level ?? "").toUpperCase() === level;
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [items, search, status, level]);

  // Mở modal hoac khung thao tác.
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  // Mở modal hoac khung thao tác.
  const openEdit = (item: Referee) => {
    setEditing(item);
    setForm({
      name: item.name ?? "",
      dateOfBirth: item.dateOfBirth ?? "",
      birthYear: item.birthYear ?? null,
      nationality: item.nationality ?? "",
      phone: item.phone ?? "",
      email: item.email ?? "",
      level: item.level ?? "NATIONAL",
      certification: item.certification ?? "",
      avatar: item.avatar ?? "",
      status: item.status ?? "ACTIVE",
      note: item.note ?? "",
    });
    setModalOpen(true);
  };

  // Cập nhật field.
  const updateField = (field: keyof RefereeRequest, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  // Xử lý lưu dữ liệu.
  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast.warning("Vui lòng nhập tên trọng tài.");
      return;
    }
    try {
      setSaving(true);
      const payload: RefereeRequest = {
        ...form,
        name: form.name.trim(),
        birthYear: form.birthYear ? Number(form.birthYear) : null,
        dateOfBirth: form.dateOfBirth || null,
      };
      if (editing?.id) {
        await RefereeService.update(editing.id, payload);
        toast.success("Đã cập nhật trọng tài.");
      } else {
        await RefereeService.create(payload);
        toast.success("Đã thêm trọng tài.");
      }
      setModalOpen(false);
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xử lý trọng tài."));
    } finally {
      setSaving(false);
    }
  };

  // Xử lý xóa dữ liệu.
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await RefereeService.remove(deleteId);
      toast.success("Đã xóa hoặc tạm ngưng trọng tài.");
      setDeleteId(null);
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xử lý trọng tài."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#008C2F]">
            Quản lý nhân sự trận đấu
          </p>
          <h1 className="mt-2 text-3xl font-black text-gray-900">Trọng tài</h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            CRUD trọng tài và dùng cho phân công trước trận.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-full bg-[#008C2F] px-5 py-3 text-sm font-black text-white hover:bg-green-800"
        >
          Thêm trọng tài
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-3xl bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_180px]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, email, SĐT..."
          className="rounded-2xl bg-[#f5f3ef] px-4 py-3 text-sm font-bold outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-2xl bg-[#f5f3ef] px-4 py-3 text-sm font-bold outline-none"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="INACTIVE">Tạm ngưng</option>
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="rounded-2xl bg-[#f5f3ef] px-4 py-3 text-sm font-bold outline-none"
        >
          <option value="ALL">Tất cả cấp độ</option>
          {levelOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-[2rem] bg-white shadow-sm">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="bg-[#f5f3ef] text-xs font-black uppercase tracking-widest text-gray-500">
            <tr>
              <th className="p-4">Trọng tài</th>
              <th className="p-4">Liên hệ</th>
              <th className="p-4">Cấp độ</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center font-bold text-gray-500"
                >
                  <LoadingSpinner />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center font-bold text-gray-500"
                >
                  Chưa có trọng tài phù hợp.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.avatar || "https://placehold.co/80x80?text=REF"
                        }
                        className="h-11 w-11 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-black text-gray-900">{item.name}</p>
                        <p className="text-xs font-bold text-gray-500">
                          {item.nationality || "--"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-gray-600">
                    <p>{item.phone || "--"}</p>
                    <p className="text-xs">{item.email || "--"}</p>
                  </td>
                  <td className="p-4 font-black text-green-700">
                    {item.level || "--"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${item.status === "INACTIVE" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}
                    >
                      {item.status === "INACTIVE" ? "Tạm ngưng" : "Hoạt động"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setDetail(item)}
                      className="mr-2 rounded-full bg-gray-100 px-3 py-2 text-xs font-black"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="mr-2 rounded-full bg-green-50 px-3 py-2 text-xs font-black text-green-700"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-600"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RefereeFormModal
        open={modalOpen}
        editing={editing}
        form={form}
        saving={saving}
        updateField={updateField}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
      />
      <DetailModal item={detail} onClose={() => setDetail(null)} />
      <ConfirmModal
        open={deleteId !== null}
        title="Xóa trọng tài"
        message="Nếu trọng tài đã được phân công, hệ thống sẽ tạm ngưng thay vì xóa cứng."
        confirmText="Xác nhận"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}

// Hiển thị RefereeFormModal.
function RefereeFormModal({
  open,
  editing,
  form,
  saving,
  updateField,
  onSave,
  onClose,
}: {
  open: boolean;
  editing: Referee | null;
  form: RefereeRequest;
  saving: boolean;
  updateField: (field: keyof RefereeRequest, value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} size="lg" contentClassName="p-0">
      <div className="p-6">
        <h2 className="text-2xl font-black text-gray-900">
          {editing ? "Cập nhật trọng tài" : "Thêm trọng tài"}
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Họ tên"
            value={form.name ?? ""}
            onChange={(v) => updateField("name", v)}
          />
          <Field
            label="Ngày sinh"
            type="date"
            value={form.dateOfBirth ?? ""}
            onChange={(v) => updateField("dateOfBirth", v)}
          />
          <Field
            label="Quốc tịch"
            value={form.nationality ?? ""}
            onChange={(v) => updateField("nationality", v)}
          />
          <Field
            label="Số điện thoại"
            value={form.phone ?? ""}
            onChange={(v) => updateField("phone", v)}
          />
          <Field
            label="Email"
            value={form.email ?? ""}
            onChange={(v) => updateField("email", v)}
          />
          <label>
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
              Cấp độ
            </span>
            <select
              value={form.level ?? "NATIONAL"}
              onChange={(e) => updateField("level", e.target.value)}
              className="w-full rounded-2xl bg-[#f5f3ef] px-4 py-3 text-sm font-bold outline-none"
            >
              {levelOptions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Chứng chỉ"
            value={form.certification ?? ""}
            onChange={(v) => updateField("certification", v)}
          />
          <label>
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
              Trạng thái
            </span>
            <select
              value={form.status ?? "ACTIVE"}
              onChange={(e) => updateField("status", e.target.value)}
              className="w-full rounded-2xl bg-[#f5f3ef] px-4 py-3 text-sm font-bold outline-none"
            >
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Tạm ngưng</option>
            </select>
          </label>
          <Field
            label="URL ảnh"
            value={form.avatar ?? ""}
            onChange={(v) => updateField("avatar", v)}
          />
          <label className="md:col-span-2">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
              Ghi chú
            </span>
            <textarea
              value={form.note ?? ""}
              onChange={(e) => updateField("note", e.target.value)}
              rows={3}
              className="w-full rounded-2xl bg-[#f5f3ef] px-4 py-3 text-sm font-bold outline-none"
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-black text-gray-600 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            disabled={saving}
            onClick={onSave}
            className="rounded-full bg-[#008C2F] px-6 py-2.5 text-sm font-black text-white disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Hiển thị DetailModal.
function DetailModal({
  item,
  onClose,
}: {
  item: Referee | null;
  onClose: () => void;
}) {
  if (!item) return null;
  return (
    <Modal open={!!item} onClose={onClose} size="md" contentClassName="p-0">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <img
            src={item.avatar || "https://placehold.co/96x96?text=REF"}
            className="h-20 w-20 rounded-3xl object-cover"
          />
          <div>
            <h3 className="text-2xl font-black text-gray-900">{item.name}</h3>
            <p className="text-sm font-bold text-gray-500">
              {item.level || "--"} • {item.nationality || "--"}
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-2 text-sm font-bold text-gray-600">
          <p>SĐT: {item.phone || "--"}</p>
          <p>Email: {item.email || "--"}</p>
          <p>Chứng chỉ: {item.certification || "--"}</p>
          <p>Ghi chú: {item.note || "--"}</p>
        </div>
      </div>
    </Modal>
  );
}

// Hiển thị Field.
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl bg-[#f5f3ef] px-4 py-3 text-sm font-bold outline-none"
      />
    </label>
  );
}
