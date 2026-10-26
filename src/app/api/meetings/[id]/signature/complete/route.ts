import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { createAuditLog } from "@/lib/audit";
import { AttendanceStatus, MeetingStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { memberId, prepToken, userName, userEmail } = body;

    if (!memberId) {
      return NextResponse.json({ success: false, error: "Üye kimliği (memberId) gereklidir." }, { status: 400 });
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        department: true,
        items: {
          where: { isAcceptedToAgenda: true },
          orderBy: { itemNumber: "asc" },
        },
        attendances: {
          where: { isBoardMember: true },
          include: { member: true },
        },
        signatures: true,
      },
    });

    if (!meeting) {
      return NextResponse.json({ success: false, error: "Toplantı bulunamadı" }, { status: 404 });
    }

    if (meeting.isSealed) {
      return NextResponse.json(
        { success: false, error: "Toplantı tutanağı zaten tüm üyelerce imzalanmış ve mühürlenmiştir." },
        { status: 400 }
      );
    }

    // İlgili üyenin hazırlık kaydını bul
    let sigRecord = await prisma.decisionSignature.findUnique({
      where: {
        meetingId_memberId: {
          meetingId: id,
          memberId,
        },
      },
    });

    // Eğer önceden prepare çağrılmamışsa, anlık olarak güvenli bir hazırlık kaydı oluştur
    if (!sigRecord) {
      const initialDigest = meeting.contentDigest || crypto.createHash("sha256").update(id + meeting.meetingNumber).digest("hex");
      sigRecord = await prisma.decisionSignature.create({
        data: {
          meetingId: id,
          memberId,
          prepToken: "prep-" + crypto.randomUUID(),
          contentDigest: initialDigest,
          status: "PREPARED",
        },
      });
    }

    // Demo e-imza özeti üretimi (PAdES uyumlu simülasyon)
    const effectiveToken = prepToken || sigRecord.prepToken;
    const signatureDigest = crypto
      .createHash("sha256")
      .update(`${effectiveToken}:${memberId}:${sigRecord.contentDigest}:${Date.now()}`)
      .digest("hex");

    const now = new Date();

    // İmzayı tamamla
    const updatedSig = await prisma.decisionSignature.update({
      where: { id: sigRecord.id },
      data: {
        status: "COMPLETED",
        signatureDigest,
        signedAt: now,
      },
    });

    // Hazirun cetvelindeki imzayı da güncelle
    await prisma.meetingAttendance.updateMany({
      where: {
        meetingId: id,
        memberId,
      },
      data: {
        signedAt: now,
      },
    });

    await createAuditLog({
      departmentId: meeting.departmentId,
      userId: memberId,
      userName: userName || "Kurul Üyesi",
      userEmail,
      action: "E_IMZA_TAMAMLANDI",
      level: "INFO",
      details: `Toplantı #${meeting.meetingNumber} karar tutanağı imzalandı. İmza özeti: ${signatureDigest.slice(0, 16)}...`,
    });

    // Tüm katılan kurul üyelerinin imza durumunu kontrol et
    const allEligibleAttendees = meeting.attendances.filter(
      (a) => a.isBoardMember && a.status === AttendanceStatus.KATILDI
    );
    const totalRequiredSignatures = allEligibleAttendees.length;

    // Güncel tamamlanmış imzaları çek
    const completedSignatures = await prisma.decisionSignature.findMany({
      where: {
        meetingId: id,
        status: "COMPLETED",
      },
    });

    const isAllSigned = completedSignatures.length >= totalRequiredSignatures;
    let finalSeal = meeting.sha256Seal;

    if (isAllSigned && !meeting.isSealed) {
      // Tüm kurul üyeleri imzaladı: Belgeyi SHA-256 ile mühürle!
      const sealPayload = JSON.stringify({
        meetingId: meeting.id,
        contentDigest: meeting.contentDigest,
        signatures: completedSignatures.map((s) => s.signatureDigest),
        sealedAt: now.toISOString(),
      });
      finalSeal = crypto.createHash("sha256").update(sealPayload).digest("hex");

      await prisma.meeting.update({
        where: { id },
        data: {
          isSealed: true,
          sha256Seal: finalSeal,
          signedAt: now,
          status: MeetingStatus.EBYS_SEVK_EDILDI,
          currentStep: 6,
        },
      });

      await createAuditLog({
        departmentId: meeting.departmentId,
        userName: "Sistem Kripto Motoru",
        action: "BELGE_MUHURLENDI",
        level: "SECURITY",
        details: `Toplantı #${meeting.meetingNumber} tutanağı tüm üyelerce imzalandı ve SHA-256 ile mühürlendi (${finalSeal.slice(0, 16)}...).`,
      });
    }

    return NextResponse.json({
      success: true,
      signature: updatedSig,
      isAllSigned,
      isSealed: isAllSigned,
      sha256Seal: finalSeal,
    });
  } catch (error: any) {
    console.error("Signature Complete Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
