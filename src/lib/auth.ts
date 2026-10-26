import { RoleKey, ROLES } from "./permissions/matrix";
import { OFFICIAL_FACULTY_LIST, OfficialFacultyMember } from "./faculty-list";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  title: string;
  role: RoleKey;
  departmentId: string;
  departmentName: string;
  academicUnitName?: string;
  isHead: boolean;
  duty?: string;
  avatarUrl?: string;
}

export const PRESET_USERS: UserSession[] = OFFICIAL_FACULTY_LIST.map((fac) => {
  let roleKey: RoleKey = "OGRETIM_ELEMANI";
  if (fac.defaultRole === "BOLUM_BASKANI") roleKey = "BOLUM_BASKANI";
  else if (fac.defaultRole === "BOLUM_BASKAN_YARDIMCISI") roleKey = "BOLUM_BASKAN_YARDIMCISI";
  else if (fac.defaultRole === "ABD_BASKANI") roleKey = "ABD_BASKANI";
  else if (fac.defaultRole === "SEKRETERYA") roleKey = "BOLUM_SEKRETERI";

  return {
    id: fac.id,
    email: fac.email,
    name: `${fac.firstName} ${fac.lastName}`,
    title: fac.title,
    role: roleKey,
    departmentId: "ceng-dept",
    departmentName: "Bilgisayar Mühendisliği Bölümü",
    academicUnitName: fac.duty || "Bilgisayar Mühendisliği",
    isHead: fac.defaultRole === "BOLUM_BASKANI",
    duty: fac.duty,
  };
});

// Varsayılan Kullanıcı: Prof. Dr. Şakir TAŞDEMİR (Bölüm Başkanı - Rapor Referansı)
export const DEFAULT_USER: UserSession =
  PRESET_USERS.find((u) => u.name.includes("Şakir") || u.name.includes("Taşdemir") || u.name.includes("TAŞDEMİR")) ||
  PRESET_USERS.find((u) => u.name.includes("Güğül") || u.name.includes("GÜĞÜL")) ||
  PRESET_USERS[0];

export function isSelcukEmail(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean.endsWith("@selcuk.edu.tr") || clean.endsWith(".selcuk.edu.tr");
}

export function isAuthorizedFacultyEmail(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return OFFICIAL_FACULTY_LIST.some((f) => f.email.toLowerCase() === clean);
}
