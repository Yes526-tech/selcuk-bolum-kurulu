import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateMinuteDocx,
  generateLetterDocx,
  generateAttendanceDocx,
  DocxMeetingData
} from "@/lib/docx-generator";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "minute"; // minute, letter, attendance

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        department: true,
        items: {
          orderBy: { itemNumber: "asc" }
        },
        attendances: {
          include: { member: true }
        }
      }
    });

    if (!meeting) {
      return NextResponse.json({ success: false, error: "Toplantı bulunamadı" }, { status: 404 });
    }

    const docxData: DocxMeetingData = {
      facultyName: meeting.department.facultyName,
      departmentName: meeting.department.name,
      academicYear: meeting.academicYear,
      term: meeting.term,
      meetingNumber: meeting.meetingNumber,
      scheduledDate: meeting.scheduledDate,
      location: meeting.location,
      ebysDocumentNo: meeting.ebysDocumentNo || undefined,
      ebysUnitCode: meeting.department.ebysUnitCode,
      items: meeting.items.map((item) => ({
        itemNumber: item.itemNumber,
        decisionNumber: item.decisionNumber || undefined,
        title: item.title,
        legalBasis: item.legalBasis,
        decisionText: item.decisionText,
        decisionResult: item.decisionResult,
        votesInFavor: item.votesInFavor,
        votesAgainst: item.votesAgainst,
        dissentingOpinion: item.dissentingOpinion || undefined,
        attachmentsData: item.attachmentsData,
      })),
      attendances: meeting.attendances.map((a) => ({
        isBoardMember: a.isBoardMember,
        boardTitle: a.boardTitle,
        status: a.status,
        excuseReason: a.excuseReason || undefined,
        member: {
          title: a.member.title,
          firstName: a.member.firstName,
          lastName: a.member.lastName,
          role: a.member.role,
          onLeave: a.member.onLeave,
        }
      })),
      headTitle: meeting.department.headTitle,
      headName: meeting.department.headName,
    };

    let buffer: Buffer;
    let filename = `Selcuk_Bolum_Kurulu_${meeting.academicYear}_Toplanti_${meeting.meetingNumber}`;

    if (type === "letter") {
      buffer = await generateLetterDocx(docxData);
      filename += "_EBYS_Ust_Yazi.docx";
    } else if (type === "attendance") {
      buffer = await generateAttendanceDocx(docxData);
      filename += "_Katilim_Tutanagi.docx";
    } else {
      buffer = await generateMinuteDocx(docxData);
      filename += "_Karar_Tutanagi.docx";
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      }
    });
  } catch (error: any) {
    console.error("Export DOCX Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
