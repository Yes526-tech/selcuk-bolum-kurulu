import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateQuorum } from "@/lib/legislation";
import { AttendanceStatus } from "@prisma/client";
import { createAuditLog } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { memberId, status, excuseReason, bulkUpdates, userName, userEmail } = body;

    const existingMeeting = await prisma.meeting.findUnique({
      where: { id },
      include: { department: true },
    });

    if (!existingMeeting) {
      return NextResponse.json({ success: false, error: "Toplantı bulunamadı" }, { status: 404 });
    }

    if (existingMeeting.isSealed) {
      return NextResponse.json(
        { success: false, error: "Mühürlenmiş toplantı hazirunu değiştirilemez." },
        { status: 400 }
      );
    }

    // İlk oy kilit kontrolü (Rapor Çizelge 3.4 & 4.1 A3/B2)
    if (existingMeeting.isAttendanceLocked) {
      return NextResponse.json(
        {
          success: false,
          error: "Bu toplantıda oylama başladığı için katılım listesi (hazirun) kilitlenmiştir. Katılım durumu değiştirilemez.",
        },
        { status: 409 }
      );
    }

    if (bulkUpdates && Array.isArray(bulkUpdates)) {
      for (const update of bulkUpdates) {
        await prisma.meetingAttendance.updateMany({
          where: { meetingId: id, memberId: update.memberId },
          data: {
            status: update.status as AttendanceStatus,
            excuseReason: update.excuseReason || null,
            signedAt: update.status === AttendanceStatus.KATILDI ? new Date() : null,
          },
        });
      }
    } else if (memberId && status) {
      await prisma.meetingAttendance.updateMany({
        where: { meetingId: id, memberId },
        data: {
          status: status as AttendanceStatus,
          excuseReason: excuseReason || null,
          signedAt: status === AttendanceStatus.KATILDI ? new Date() : null,
        },
      });
    }

    // Güncel hazirun üzerinden salt çoğunluğu otomatik tekrar hesapla
    const allAttendances = await prisma.meetingAttendance.findMany({
      where: { meetingId: id, isBoardMember: true },
    });

    const totalEligible = allAttendances.length;
    const presentCount = allAttendances.filter((a) => a.status === AttendanceStatus.KATILDI).length;
    const quorumCalc = calculateQuorum(totalEligible, presentCount);

    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: {
        totalEligibleMembers: totalEligible,
        quorumRequired: quorumCalc.quorumRequired,
        actualAttendeesCount: presentCount,
        isQuorumMet: quorumCalc.isQuorumMet,
        rowVersion: { increment: 1 },
      },
    });

    await createAuditLog({
      departmentId: existingMeeting.departmentId,
      userName: userName || "Yetkili / Sekreterlik",
      userEmail,
      action: "HAZIRUN_GUNCELENDI",
      level: "INFO",
      details: `Toplantı #${existingMeeting.meetingNumber} hazirun yoklaması güncellendi (${presentCount}/${totalEligible} hazır, Salt Çoğunluk: ${quorumCalc.isQuorumMet ? "Sağlandı" : "Sağlanamadı"}).`,
    });

    return NextResponse.json({
      success: true,
      quorumCalc,
      meeting: updatedMeeting,
    });
  } catch (error: any) {
    console.error("Attendance POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
