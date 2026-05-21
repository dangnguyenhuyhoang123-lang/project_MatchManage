import { useAuth } from "../../../../utils/useAuth";

export const CURRENT_TEAM_SEASON_ID = 60;

export function useCurrentClubId() {
  const { user, loading } = useAuth();

  return {
    currentClubId: user?.teamId,
    authLoading: loading,
  };
}

export const fallbackClubLogo =
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=240&h=240&fit=crop";

export const fallbackAvatar =
  "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=200&h=200&fit=crop";

export const fallbackStadiumImage =
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&h=800&fit=crop";

export function extractList<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  return [];
}

export function formatNumber(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "Chưa cập nhật";
  return new Intl.NumberFormat("vi-VN").format(number);
}

export function formatDate(value?: string | null) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function calculateAge(value?: string | null) {
  if (!value) return "N/A";
  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return "N/A";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return String(age);
}

export function statusLabel(status?: string | null) {
  const normalized = removeVietnameseMark(status ?? "").toUpperCase();
  if (!normalized || normalized === "ACTIVE") return "Đang hoạt động";
  if (normalized === "INACTIVE") return "Tạm ngưng";
  if (normalized.includes("INJURED")) return "Chấn thương";
  if (normalized.includes("SUSPENDED")) return "Bị treo giò";
  return status ?? "Chưa cập nhật";
}

export function positionLabel(position?: string | null) {
  const normalized = removeVietnameseMark(position ?? "").toUpperCase();
  if (!normalized) return "Chưa cập nhật";
  if (
    normalized.includes("GK") ||
    normalized.includes("GOAL") ||
    normalized.includes("THU MON")
  ) {
    return "Thủ môn";
  }
  if (
    normalized.includes("DF") ||
    normalized.includes("DEF") ||
    normalized.includes("BACK") ||
    normalized.includes("HAU VE")
  ) {
    return "Hậu vệ";
  }
  if (
    normalized.includes("FW") ||
    normalized.includes("ST") ||
    normalized.includes("FORWARD") ||
    normalized.includes("TIEN DAO")
  ) {
    return "Tiền đạo";
  }
  return "Tiền vệ";
}

export function initials(name?: string | null) {
  return (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function getStadiumName(stadium: any, fallback?: string | null) {
  return (
    stadium?.name ??
    stadium?.stadiumName ??
    stadium?.stadium_name ??
    fallback ??
    "Chưa cập nhật sân"
  );
}

export function getStadiumAddress(stadium: any) {
  return (
    stadium?.address ??
    stadium?.location ??
    stadium?.city ??
    "Chưa cập nhật địa chỉ"
  );
}

export function removeVietnameseMark(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}
