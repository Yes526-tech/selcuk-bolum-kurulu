import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { createAuditLog } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { memberId, userName } = body;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        items: {
          where: { isAcceptedToAgenda: true },
          orderBy: { itemNumber: "asc" },
        },
        attendances: {
          where: { isBoardMember: true },
          include: { member: true },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json({ success: false, error: "Toplantı bulunamadı" }, { status: 404 });
    }

    if (meeting.isSealed) {
      return NextResponse.json(
        { success: false, error: "Bu toplantı ve karar tutanağı önceden mühürlenmiştir, yeni imza hazırlığı yapılamaz." },
        { status: 400 }
      );
    }

    // Kararın içerik özetini (SHA-256) hesapla
    const contentPayload = JSON.stringify({
      meetingId: meeting.id,
      meetingNo: meeting.meetingNumber,
      academicYear: meeting.academicYear,
      items: meeting.items.map((i) => ({
        num: i.itemNumber,
        title: i.title,
        text: i.decisionText,
        result: i.decisionResult,
        votes: [i.votesInFavor, i.votesAgainst, i.votesAbstain],
      })),
      attendees: meeting.attendances.map((a) => ({
        id: a.memberId,
        status: a.status,
      })),
    });

    const contentDigest = crypto.createHash("sha256").update(contentPayload).digest("hex");
    const prepToken = "prep-" + crypto.randomUUID();

    // Toplantının sabit içerik özetini güncelle
    await prisma.meeting.update({
      where: { id },
      data: {
        contentDigest,
        rowVersion: { increment: 1 },
      },
    });

    // İlgili üye veya tüm üyeler için imza hazırlığı oluştur/yenile
    let signatureRecord = null;
    if (memberId) {
      signatureRecord = await prisma.decisionSignature.upsert({
        where: {
          meetingId_memberId: {
            meetingId: id,
            memberId,
          },
        },
        update: {
          prepToken,
          contentDigest,
          status: "PREPARED",
        },
        create: {
          meetingId: id,
          memberId,
          prepToken,
          contentDigest,
          status: "PREPARED",
        },
      });

      await createAuditLog({
        departmentId: meeting.departmentId,
        userId: memberId,
        userName: userName || "Kurul Üyesi",
        action: "IMZA_HAZIRLIGI",
        level: "INFO",
        details: `Toplantı #${meeting.meetingNumber} için imza hazırlığı başlatıldı. İçerik özeti: ${contentDigest.slice(0, 16)}...`,
      });
    }

    return NextResponse.json({
      success: true,
      prepToken,
      contentDigest,
      signature: signatureRecord,
    });
  } catch (error: any) {
    console.error("Signature Prepare Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
