import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { MeetingStatus, DecisionResult } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { newTitle, newDate, userName, userEmail } = body;

    const sourceMeeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        department: true,
        items: true,
        attendances: true,
      },
    });

    if (!sourceMeeting) {
      return NextResponse.json({ success: false, error: "Kaynak toplantı bulunamadı" }, { status: 404 });
    }

    // Yeni toplantı numarası belirle
    const lastMeeting = await prisma.meeting.findFirst({
      where: {
        departmentId: sourceMeeting.departmentId,
        academicYear: sourceMeeting.academicYear,
      },
      orderBy: { meetingNumber: "desc" },
    });
    const nextMeetingNo = (lastMeeting?.meetingNumber || 0) + 1;

    const scheduledDate = newDate ? new Date(newDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const title =
      newTitle ||
      `${sourceMeeting.academicYear} ${sourceMeeting.term} Yarıyılı ${nextMeetingNo}. Olağan Bölüm Kurulu Toplantısı (Yeniden Değerlendirme)`;

    const newMeeting = await prisma.meeting.create({
      data: {
        departmentId: sourceMeeting.departmentId,
        meetingNumber: nextMeetingNo,
        academicYear: sourceMeeting.academicYear,
        term: sourceMeeting.term,
        title,
        scheduledDate,
        location: sourceMeeting.location,
        status: MeetingStatus.CAGRI_YAPILDI,
        currentStep: 1,
        quorumRequired: sourceMeeting.quorumRequired,
        totalEligibleMembers: sourceMeeting.totalEligibleMembers,
        actualAttendeesCount: sourceMeeting.actualAttendeesCount,
        isQuorumMet: sourceMeeting.isQuorumMet,
        reconsideredFromId: sourceMeeting.id,
      },
    });

    // Hazirun cetvelini kopyala
    for (const att of sourceMeeting.attendances) {
      await prisma.meetingAttendance.create({
        data: {
          meetingId: newMeeting.id,
          memberId: att.memberId,
          isBoardMember: att.isBoardMember,
          boardTitle: att.boardTitle,
          status: att.status,
          excuseReason: att.excuseReason,
        },
      });
    }

    // İptal edilen toplantının maddelerini yeni taslağa aktar
    for (const item of sourceMeeting.items) {
      await prisma.meetingItem.create({
        data: {
          meetingId: newMeeting.id,
          itemNumber: item.itemNumber,
          category: item.category,
          title: item.title,
          legalBasis: item.legalBasis,
          description: item.description,
          templateData: item.templateData || undefined,
          attachmentsData: item.attachmentsData || undefined,
          decisionText: item.decisionText,
          isAcceptedToAgenda: true,
          decisionResult: DecisionResult.BEKLIYOR,
          votesInFavor: 0,
          votesAgainst: 0,
          votesAbstain: 0,
        },
      });
    }

    await createAuditLog({
      departmentId: sourceMeeting.departmentId,
      userName: userName || "Bölüm Başkanı / Yetkili",
      userEmail,
      action: "YENIDEN_DEGERLENDIRME_TASLAK",
      level: "INFO",
      details: `İptal edilen Toplantı #${sourceMeeting.meetingNumber}'dan Toplantı #${newMeeting.meetingNumber} numaralı yeni taslak oluşturuldu.`,
    });

    return NextResponse.json({
      success: true,
      newMeetingId: newMeeting.id,
      meetingNumber: nextMeetingNo,
    });
  } catch (error: any) {
    console.error("Meeting Reconsider Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
