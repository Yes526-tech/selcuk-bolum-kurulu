import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        items: true,
        attendances: {
          include: { member: true }
        }
      }
    });

    if (!meeting) {
      return NextResponse.json({ success: false, error: "Toplantı bulunamadı" }, { status: 404 });
    }

    // Çağrı evrak numarası üret
    const callDocNo = meeting.callDocumentNo || `E-64134190-${meeting.department.ebysUnitCode}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Toplantıyı güncelle
    const updated = await prisma.meeting.update({
      where: { id },
      data: {
        callDocumentNo: callDocNo,
        callSentAt: new Date(),
      }
    });

    // Kurul üyeleri için bildirim logları oluştur
    const boardAttendees = meeting.attendances.filter(a => a.isBoardMember);
    const notificationLogs: any[] = [];

    for (const att of boardAttendees) {
      const log = await prisma.bildirimLog.create({
        data: {
          toplantiId: meeting.id,
          personelId: null, // FacultyMember and AkademikPersonel bridge
          aliciEposta: att.member.email,
          aliciUnvanAd: `${att.member.title} ${att.member.firstName} ${att.member.lastName}`,
          bildirimTuru: "TOPLANTI_CAGRISI",
          baslik: `${meeting.department.name} Bölüm Kurulu Toplantı Çağrısı ve Gündemi`,
          mesaj: `Sayın ${att.member.title} ${att.member.firstName} ${att.member.lastName},\n\n${meeting.title} toplantısı ${new Date(meeting.scheduledDate).toLocaleString("tr-TR")} tarihinde "${meeting.location}" adresinde yapılacaktır. Toplantıda ${meeting.items.length} adet gündem maddesi görüşülecektir.\n\nBilgilerinize arz/rica olunur.\n\nBölüm Başkanlığı (EBYS No: ${callDocNo})`,
          iletildiMi: true,
          iletilmeZamani: new Date(),
        }
      });
      notificationLogs.push(log);
    }

    return NextResponse.json({
      success: true,
      callDocumentNo: callDocNo,
      sentCount: notificationLogs.length,
      logs: notificationLogs
    });
  } catch (error: any) {
    console.error("Notify Call Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
