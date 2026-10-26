import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; attachmentId: string } }
) {
  try {
    const { id, attachmentId } = params;

    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting) {
      return NextResponse.json({ success: false, error: "Toplantı bulunamadı" }, { status: 404 });
    }

    if (meeting.isSealed) {
      return NextResponse.json(
        { success: false, error: "Mühürlenmiş kararın ek dosyaları silinemez." },
        { status: 400 }
      );
    }

    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) {
      return NextResponse.json({ success: false, error: "Ek dosya bulunamadı" }, { status: 404 });
    }

    await prisma.attachment.delete({ where: { id: attachmentId } });

    await createAuditLog({
      departmentId: meeting.departmentId,
      userName: "Yetkili",
      action: "EK_DOSYA_SILINDI",
      level: "INFO",
      details: `Toplantı #${meeting.meetingNumber}'dan "${attachment.originalName}" ek dosyası kaldırıldı.`,
    });

    return NextResponse.json({ success: true, deletedId: attachmentId });
  } catch (error: any) {
    console.error("DELETE Attachment Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
