import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMeetingMinutePdf } from "@/lib/pdf-generator";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        department: true,
        items: {
          where: { isAcceptedToAgenda: true },
          orderBy: { itemNumber: "asc" }
        },
        attendances: {
          include: { member: true },
          orderBy: [
            { isBoardMember: "desc" },
            { member: { role: "asc" } }
          ]
        }
      }
    });

    if (!meeting) {
      return NextResponse.json({ success: false, error: "Toplantı bulunamadı" }, { status: 404 });
    }

    const pdfData = {
      facultyName: meeting.department.facultyName,
      departmentName: meeting.department.name,
      departmentType: meeting.department.departmentType,
      ebysUnitCode: meeting.department.ebysUnitCode,
      meetingNumber: meeting.meetingNumber,
      academicYear: meeting.academicYear,
      term: meeting.term,
      title: meeting.title,
      scheduledDate: meeting.scheduledDate,
      location: meeting.location,
      status: meeting.status,
      ebysDocumentNo: meeting.ebysDocumentNo || undefined,
      ebysVerificationCode: meeting.ebysVerificationCode || undefined,
      headTitle: meeting.department.headTitle,
      headName: meeting.department.headName,
      quorumInfo: {
        total: meeting.totalEligibleMembers,
        quorum: meeting.quorumRequired,
        actual: meeting.actualAttendeesCount,
        isMet: meeting.isQuorumMet
      },
      items: meeting.items.map(item => ({
        itemNumber: item.itemNumber,
        decisionNumber: item.decisionNumber || undefined,
        title: item.title,
        legalBasis: item.legalBasis,
        decisionText: item.decisionText,
        decisionResult: item.decisionResult,
        votesInFavor: item.votesInFavor,
        votesAgainst: item.votesAgainst,
        dissentingOpinion: item.dissentingOpinion || undefined
      })),
      attendances: meeting.attendances.map(att => ({
        title: att.member.title,
        name: `${att.member.firstName} ${att.member.lastName}`,
        boardTitle: att.boardTitle,
        isBoardMember: att.isBoardMember,
        status: att.status,
        excuse: att.excuseReason || undefined
      }))
    };

    const pdfBytes = await generateMeetingMinutePdf(pdfData);

    const filename = `Selcuk_Bolum_Kurulu_Karar_${meeting.academicYear.replace("-", "_")}_No${meeting.meetingNumber}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache"
      }
    });
  } catch (error: any) {
    console.error("PDF Export Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
