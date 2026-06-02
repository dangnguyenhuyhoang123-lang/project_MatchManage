import type { SystemRule } from "../model/SystemRule";

export function parseAllowedGoalTypes(rule?: SystemRule | null): string[] {
  if (!rule || !rule.allowedGoalTypes) return [];
  return rule.allowedGoalTypes
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isRuleActive(rule?: SystemRule | null): boolean {
  if (!rule) return false;
  return rule.status === "ACTIVE";
}

export function getRuleValidationSummary(rule: SystemRule): string {
  const parts: string[] = [];
  if (rule.maxTeams) parts.push(`Số đội tối đa: ${rule.maxTeams}`);
  if (rule.minAge || rule.maxAge)
    parts.push(
      `Độ tuổi: ${rule.minAge || 0} - ${rule.maxAge || "Không giới hạn"}`,
    );
  if (rule.minPlayers || rule.maxPlayers)
    parts.push(
      `Số cầu thủ: ${rule.minPlayers || 0} - ${rule.maxPlayers || "Không giới hạn"}`,
    );
  if (rule.minRegistrationPlayers)
    parts.push(`Đăng ký tối thiểu: ${rule.minRegistrationPlayers}`);
  if (rule.maxForeignPlayers !== null && rule.maxForeignPlayers !== undefined)
    parts.push(`Ngoại binh tối đa: ${rule.maxForeignPlayers}`);
  if (rule.maxSubstitution !== null && rule.maxSubstitution !== undefined)
    parts.push(`Thay người tối đa: ${rule.maxSubstitution}`);
  return parts.join(" | ");
}
