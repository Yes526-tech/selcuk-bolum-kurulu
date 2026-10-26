import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEBYSLetterDoc } from "@/lib/legislation";
import { MeetingStatus } from "@prisma/client";
import { createAuditLog } from "@/lib/audit";
import crypto from "crypto";

export async function POST(
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
          where: { isBoardMember: true },
          include: { member: true }
        }
      }
    });

    if (!meeting) {
      return NextResponse.json({ success: false, error: "Toplantı bulunamadı" }, { status: 404 });
    }

    const meetingNoStr = `${meeting.academicYear}/${meeting.meetingNumber < 10 ? "0" + meeting.meetingNumber : meeting.meetingNumber}`;
    const ebysDocNo = meeting.ebysDocumentNo || `E-64134190-${meeting.department.ebysUnitCode}-${Math.floor(100000 + Math.random() * 900000)}`;
    const ebysVerify = meeting.ebysVerificationCode || `ebys-su-${Math.floor(100000 + Math.random() * 900000)}-${new Date().getFullYear()}`;
    const ebysBarcode = meeting.ebysBarcode || `SU${ebysDocNo.replace(/[^0-9]/g, "")}`;

    // Nihai Karar Tutanağı Metnini Derle
    const meetingDateStr = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short" }).format(meeting.scheduledDate);
    let finalMinute = `T.C.
SELÇUK ÜNİVERSİTESİ
${meeting.department.facultyName.toUpperCase()}
${meeting.department.name.toUpperCase()} BÖLÜM KURULU KARAR TUTANAĞI

Toplantı No    : ${meetingNoStr}
Toplantı Tarihi: ${meetingDateStr}
Toplantı Yeri  : ${meeting.location}
Kurul Başkanı  : ${meeting.department.headTitle} ${meeting.department.headName}
Üye Tamsayısı  : ${meeting.totalEligibleMembers}
Katılan Üye    : ${meeting.actualAttendeesCount} (Salt Çoğunluk Sağlanmıştır)

Selçuk Üniversitesi Bölüm Kurulu, Üniversitelerde Akademik Teşkilat Yönetmeliği'nin 15. maddesi ve Selçuk Üniversitesi Bölüm Kurulu Süreci İş Akışı hükümleri çerçevesinde Bölüm Başkanı ${meeting.department.headTitle} ${meeting.department.headName} başkanlığında toplanmış; gündemdeki maddeler oylanarak kabul edilmiş ve aşağıdaki kararlar alınmıştır:

`;

    meeting.items.forEach((item, index) => {
      finalMinute += `------------------------------------------------------------\n`;
      finalMinute += `KARAR NO: ${item.decisionNumber || `${meetingNoStr}-${index + 1}`}\n`;
      finalMinute += `KONU    : ${item.title}\n`;
      finalMinute += `DAYANAK : ${item.legalBasis}\n\n`;
      finalMinute += `KARAR METNİ:\n${item.decisionText}\n\n`;
      finalMinute += `SONUÇ   : ${item.decisionResult} (${item.votesInFavor} Kabul, ${item.votesAgainst} Ret, ${item.votesAbstain} Çekimser)\n`;
      if (item.dissentingOpinion) {
        finalMinute += `MUHALEFET ŞERHİ: ${item.dissentingOpinion}\n`;
      }
      finalMinute += `\n`;
    });

    finalMinute += `============================================================\n`;
    finalMinute += `HAZİRUN VE İMZA CETVELİ (Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15)\n\n`;

    meeting.attendances.forEach(att => {
      finalMinute += `- ${att.member.title} ${att.member.firstName} ${att.member.lastName} (${att.boardTitle}) : ${att.status === "KATILDI" ? "[E-İMZALANDI]" : `[MAZERETLİ: ${att.excuseReason || "İzinli"}]`}\n`;
    });

    // Dekanlığa Sevk Üst Yazısı
    const upperLetter = generateEBYSLetterDoc({
      facultyName: meeting.department.facultyName,
      departmentName: meeting.department.name,
      ebysUnitCode: meeting.department.ebysUnitCode,
      ebysDocumentNo: ebysDocNo,
      meetingNumber: meeting.meetingNumber,
      academicYear: meeting.academicYear,
      meetingDate: meeting.scheduledDate,
      itemCount: meeting.items.length,
      headTitle: meeting.department.headTitle,
      headName: meeting.department.headName,
    });

    const sha256Seal =
      meeting.sha256Seal ||
      crypto.createHash("sha256").update(finalMinute + ebysDocNo + ebysVerify).digest("hex");

    const updated = await prisma.meeting.update({
      where: { id },
      data: {
        status: MeetingStatus.EBYS_SEVK_EDILDI,
        currentStep: 6,
        ebysDocumentNo: ebysDocNo,
        ebysDocumentDate: new Date(),
        ebysVerificationCode: ebysVerify,
        ebysBarcode: ebysBarcode,
        finalMinuteText: finalMinute,
        upperLetterText: upperLetter,
        signedAt: new Date(),
        isSealed: true,
        sha256Seal,
      }
    });

    await createAuditLog({
      departmentId: meeting.departmentId,
      userName: `${meeting.department.headTitle} ${meeting.department.headName}`,
      action: "EBYS_SEVK_TAMAMLANDI",
      level: "SECURITY",
      details: `Toplantı #${meeting.meetingNumber} resmi tutanağı mühürlendi (SHA-256: ${sha256Seal.slice(0, 16)}...) ve EBYS üzerinden Dekanlığa sevk edildi. Belge No: ${ebysDocNo}`,
    });

    return NextResponse.json({
      success: true,
      meeting: updated,
      finalMinuteText: finalMinute,
      upperLetterText: upperLetter,
      ebysDocumentNo: ebysDocNo,
      ebysVerificationCode: ebysVerify
    });
  } catch (error: any) {
    console.error("Finalize POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
