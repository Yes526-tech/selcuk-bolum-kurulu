import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { MeetingStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { reason, userName, userEmail } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: "Süreci iptal etmek için zorunlu bir iptal gerekçesi girmelisiniz." },
        { status: 400 }
      );
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: { department: true },
    });

    if (!meeting) {
      return NextResponse.json({ success: false, error: "Toplantı bulunamadı" }, { status: 404 });
    }

    if (meeting.isSealed) {
      return NextResponse.json(
        { success: false, error: "Tamamlanmış ve resmi olarak mühürlenmiş kurul kararları iptal edilemez." },
        { status: 400 }
      );
    }

    const updated = await prisma.meeting.update({
      where: { id },
      data: {
        status: MeetingStatus.IPTAL,
        cancelledReason: reason.trim(),
        cancelledAt: new Date(),
        rowVersion: { increment: 1 },
      },
    });

    await createAuditLog({
      departmentId: meeting.departmentId,
      userName: userName || "Bölüm Başkanı / Yetkili",
      userEmail,
      action: "SUREC_IPTAL_EDILDI",
      level: "WARN",
      details: `Toplantı #${meeting.meetingNumber} gerekçeli olarak iptal edildi. Gerekçe: "${reason.trim()}"`,
    });

    return NextResponse.json({
      success: true,
      meeting: updated,
    });
  } catch (error: any) {
    console.error("Meeting Cancel Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
