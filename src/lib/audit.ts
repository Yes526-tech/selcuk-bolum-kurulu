import { prisma } from "./prisma";

export type AuditLogLevel = "INFO" | "WARN" | "ERROR" | "SECURITY";

export interface CreateAuditLogParams {
  departmentId?: string | null;
  userId?: string | null;
  userName: string;
  userEmail?: string | null;
  action: string;
  level?: AuditLogLevel;
  details: string;
  ipAddress?: string | null;
}

export async function createAuditLog({
  departmentId,
  userId,
  userName,
  userEmail,
  action,
  level = "INFO",
  details,
  ipAddress = "127.0.0.1",
}: CreateAuditLogParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        departmentId: departmentId || null,
        userId: userId || null,
        userName: userName || "Sistem Kullanıcısı",
        userEmail: userEmail || null,
        action,
        level,
        details,
        ipAddress: ipAddress || "127.0.0.1",
      },
    });
  } catch (err) {
    console.error("Audit log creation error:", err);
    return null;
  }
}
