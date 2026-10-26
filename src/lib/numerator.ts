import { prisma } from "./prisma";

export interface NumeratorConfig {
  academicYear: string;
  term: string;
  meetingNumber: number;
  itemNumber: number;
}

/**
 * Resmi Karar Numarası Üretici (2026/01-01 Formatı)
 * Format: [Yıl]/[ToplantıNo-2 hane]-[KararNo-2 hane]
 * Örnek: 2026/01-01, 2026/01-02, 2026/02-01
 */
export function formatDecisionNumber(
  academicYear: string,
  meetingNo: number,
  itemNo: number
): string {
  // Yıl kısmı: "2026-2027" -> "2026" veya doğrudan yıl
  const yearPart = academicYear ? academicYear.split("-")[0] : new Date().getFullYear().toString();
  const paddedMeeting = String(meetingNo).padStart(2, "0");
  const paddedItem = String(itemNo).padStart(2, "0");
  return `${yearPart}/${paddedMeeting}-${paddedItem}`;
}

/**
 * Bir bölüm için bir sonraki ardışık Toplantı Numarasını belirler
 */
export async function getNextMeetingNumber(departmentId: string, academicYear: string): Promise<number> {
  try {
    const lastMeeting = await prisma.meeting.findFirst({
      where: {
        departmentId,
        academicYear,
      },
      orderBy: {
        meetingNumber: "desc",
      },
    });

    if (!lastMeeting) {
      return 1;
    }
    return lastMeeting.meetingNumber + 1;
  } catch (error) {
    console.error("getNextMeetingNumber error:", error);
    return 1;
  }
}

/**
 * Bir toplantı içindeki bir sonraki Karar / Gündem Sıra Numarasını belirler
 */
export async function getNextItemNumber(meetingId: string): Promise<number> {
  try {
    const lastItem = await prisma.meetingItem.findFirst({
      where: { meetingId },
      orderBy: { itemNumber: "desc" },
    });

    if (!lastItem) {
      return 1;
    }
    return lastItem.itemNumber + 1;
  } catch (error) {
    console.error("getNextItemNumber error:", error);
    return 1;
  }
}
