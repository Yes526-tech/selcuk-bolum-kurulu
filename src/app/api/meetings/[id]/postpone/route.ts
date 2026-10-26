import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePostponementMinuteDoc } from "@/lib/legislation";
import { MeetingStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { postponedToDate, customReason } = body;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: { department: true }
    });

    if (!meeting) {
      return NextResponse.json({ success: false, error: "Toplantı bulunamadı" }, { status: 404 });
    }

    const newDate = postponedToDate ? new Date(postponedToDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const reason = customReason || `Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 ve Bölüm Kurulu Süreci İş Akışı uyarınca aranan salt çoğunluk (${meeting.quorumRequired} üye) sağlanamamıştır (Mevcut katılım: ${meeting.actualAttendeesCount} üye).`;

    const docText = generatePostponementMinuteDoc({
      facultyName: meeting.department.facultyName,
      departmentName: meeting.department.name,
      meetingNumber: meeting.meetingNumber,
      academicYear: meeting.academicYear,
      term: meeting.term,
      scheduledDate: meeting.scheduledDate,
      postponedToDate: newDate,
      totalMembers: meeting.totalEligibleMembers,
      quorumRequired: meeting.quorumRequired,
      actualAttendees: meeting.actualAttendeesCount,
      headTitle: meeting.department.headTitle,
      headName: meeting.department.headName,
      location: meeting.location,
    });

    const updated = await prisma.meeting.update({
      where: { id },
      data: {
        status: MeetingStatus.ERTELENDI,
        postponedReason: reason,
        postponedToDate: newDate,
        postponedMinuteDoc: docText,
        isQuorumMet: false
      }
    });

    return NextResponse.json({
      success: true,
      meeting: updated,
      minuteDoc: docText
    });
  } catch (error: any) {
    console.error("Postpone POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
