export const getMatchStatusLabel = (status?: string | null): string => {
  switch (status) {
    case "SCHEDULED":
      return "Sắp diễn ra";
    case "LIVE":
      return "Đang diễn ra";
    case "FINISHED":
      return "Đã kết thúc";
    case "POSTPONED":
      return "Tạm hoãn";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return "Không xác định";
  }
};

export const getRegistrationStatusLabel = (
  status?: string | null,
): string => {
  switch (status) {
    case "PENDING":
      return "Chờ duyệt";
    case "APPROVED":
      return "Đã duyệt";
    case "REJECTED":
      return "Từ chối";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return "Không xác định";
  }
};

export const getInvitationStatusLabel = (status?: string | null): string => {
  switch (status) {
    case "INVITED":
    case "PENDING":
      return "Chờ phản hồi";
    case "ACCEPTED":
      return "Đã chấp nhận";
    case "DECLINED":
      return "Đã từ chối";
    case "EXPIRED":
      return "Đã hết hạn";
    default:
      return "Không xác định";
  }
};

export const getSystemRuleStatusLabel = (
  status?: string | null,
): string => {
  switch (status) {
    case "ACTIVE":
      return "Đang áp dụng";
    case "INACTIVE":
      return "Tạm ngưng";
    default:
      return "Không xác định";
  }
};

export const getUserStatusLabel = (
  status?: boolean | string | null,
): string => {
  if (status === true || status === "ACTIVE" || status === "true") {
    return "Đang hoạt động";
  }

  if (status === false || status === "INACTIVE" || status === "false") {
    return "Tạm khóa";
  }

  return "Không xác định";
};

export type StatusTone = "default" | "success" | "warning" | "danger" | "info";

export const getStatusTone = (
  status?: string | boolean | null,
): StatusTone => {
  if (
    status === "APPROVED" ||
    status === "ACCEPTED" ||
    status === "ACTIVE" ||
    status === "FINISHED" ||
    status === true
  ) {
    return "success";
  }

  if (status === "PENDING" || status === "SCHEDULED" || status === "LIVE") {
    return "warning";
  }

  if (status === "INVITED") {
    return "info";
  }

  if (
    status === "REJECTED" ||
    status === "DECLINED" ||
    status === "CANCELLED" ||
    status === "INACTIVE" ||
    status === false
  ) {
    return "danger";
  }

  if (status === "POSTPONED") {
    return "info";
  }

  return "default";
};
