import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { determineBoardMembership, calculateQuorum } from "@/lib/legislation";
import { AttendanceStatus, MeetingStatus } from "@prisma/client";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");

    const whereClause: any = {};
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    const meetings = await prisma.meeting.findMany({
      where: whereClause,
      include: {
        department: true,
        items: {
          orderBy: { itemNumber: "asc" }
        },
        attendances: {
          include: {
            member: true
          }
        },
        _count: {
          select: {
            items: true,
            attendances: true
          }
        }
      },
      orderBy: { scheduledDate: "desc" }
    });

    // İstatistikler
    const totalMeetings = meetings.length;
    const completedCount = meetings.filter(m => m.status === MeetingStatus.EBYS_SEVK_EDILDI || m.status === MeetingStatus.TAMAMLANDI).length;
    const postponedCount = meetings.filter(m => m.status === MeetingStatus.ERTELENDI).length;
    const activeCount = meetings.filter(m => m.status === MeetingStatus.CAGRI_YAPILDI || m.status === MeetingStatus.OTURUM_ACILDI || m.status === MeetingStatus.MADDELER_GORUSULUYOR).length;

    let totalDecisions = 0;
    meetings.forEach(m => {
      totalDecisions += m.items.filter(i => i.decisionResult.startsWith("KABUL")).length;
    });

    return NextResponse.json({
      success: true,
      meetings,
      stats: {
        totalMeetings,
        completedCount,
        postponedCount,
        activeCount,
        totalDecisions
      }
    });
  } catch (error: any) {
    console.error("Meetings GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      departmentId,
      academicYear,
      term,
      title,
      scheduledDate,
      location,
      initialItems = []
    } = body;

    if (!departmentId || !scheduledDate || !title) {
      return NextResponse.json({ success: false, error: "Gerekli alanlar eksik" }, { status: 400 });
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: { members: { where: { isActive: true } } }
    });

    if (!department) {
      return NextResponse.json({ success: false, error: "Bölüm bulunamadı" }, { status: 404 });
    }

    // Son toplantı numarasını bulup 1 artır
    const lastMeeting = await prisma.meeting.findFirst({
      where: { departmentId, academicYear: academicYear || department.currentAcademicYear },
      orderBy: { meetingNumber: "desc" }
    });
    const nextMeetingNumber = lastMeeting ? lastMeeting.meetingNumber + 1 : 1;

    // Madde 15'e göre asıl Kurul Üyelerini belirle
    const eligibleMembers = department.members.filter(m => {
      const check = determineBoardMembership(department.departmentType, m.role);
      return check.isMember;
    });

    const totalEligible = eligibleMembers.length;
    const quorumCalc = calculateQuorum(totalEligible, totalEligible); // Başlangıçta tüm üyeler davetli

    const dateObj = new Date(scheduledDate);
    const dateFormatted = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short" }).format(dateObj);
    const callDocNo = `E-64134190-${department.ebysUnitCode}-${Math.floor(100000 + Math.random() * 900000)}`;

    const callDocText = `T.C.
SELÇUK ÜNİVERSİTESİ
${department.facultyName.toUpperCase()}
${department.name.toUpperCase()}

Sayı   : ${callDocNo}
Konu   : Bölüm Kurulu Toplantı Çağrısı ve Gündemi
Tarih  : ${new Intl.DateTimeFormat("tr-TR").format(new Date())}

DAĞITIM: ${department.name} Bölüm Kurulu Üyelerine

Bölümümüz Bölüm Kurulu, ${academicYear || department.currentAcademicYear} Eğitim-Öğretim Yılı ${term || department.currentTerm} Yarıyılı gündem maddelerini görüşmek üzere ${dateFormatted} tarihinde ${location || "Bölüm Başkanlığı Toplantı Salonu"} adresinde toplanacaktır.
Toplantıya asil kurul üyesi olarak katılımınızı ve ekli gündem maddelerine ilişkin müzakerelere hazırlıklı bulunmanızı rica ederim.

${department.headTitle} ${department.headName}
Bölüm Başkanı`;

    // Yeni Toplantıyı Oluştur
    const newMeeting = await prisma.meeting.create({
      data: {
        departmentId,
        meetingNumber: nextMeetingNumber,
        academicYear: academicYear || department.currentAcademicYear,
        term: term || department.currentTerm,
        title,
        scheduledDate: dateObj,
        location: location || "Bölüm Başkanlığı Toplantı Salonu",
        status: MeetingStatus.CAGRI_YAPILDI,
        currentStep: 1,
        totalEligibleMembers: totalEligible,
        quorumRequired: quorumCalc.quorumRequired,
        actualAttendeesCount: totalEligible,
        isQuorumMet: true,
        callDocumentNo: callDocNo,
        callDocumentText: callDocText,
        callSentAt: new Date(),
      }
    });

    // Hazirun (Katılım Cetveli) Kayıtlarını Oluştur (Bölümdeki tüm üyeleri ekle, ama Madde 15'e göre isBoardMember işaretle)
    for (const member of department.members) {
      const membership = determineBoardMembership(department.departmentType, member.role);
      await prisma.meetingAttendance.create({
        data: {
          meetingId: newMeeting.id,
          memberId: member.id,
          isBoardMember: membership.isMember,
          boardTitle: membership.boardTitle,
          status: AttendanceStatus.KATILDI, // Varsayılan katıldı
        }
      });
    }

    // Başlangıç Gündem Maddeleri varsa ekle
    if (Array.isArray(initialItems) && initialItems.length > 0) {
      for (let i = 0; i < initialItems.length; i++) {
        const item = initialItems[i];
        await prisma.meetingItem.create({
          data: {
            meetingId: newMeeting.id,
            itemNumber: i + 1,
            category: item.category,
            title: item.title,
            legalBasis: item.legalBasis || "İlgili Mevzuat Hükümleri",
            decisionText: item.decisionText || "",
            templateData: item.templateData || null,
            attachmentsData: item.attachmentsData || null,
            isAcceptedToAgenda: true,
          }
        });
      }
    }

    await createAuditLog({
      departmentId,
      userName: department.headTitle + " " + department.headName,
      action: "TOPLANTI_OLUSTURULDU",
      level: "INFO",
      details: `Toplantı #${nextMeetingNumber} ("${title}") oluşturuldu. EBYS Çağrı No: ${callDocNo}.`,
    });

    return NextResponse.json({ success: true, meetingId: newMeeting.id, meeting: newMeeting });
  } catch (error: any) {
    console.error("Meetings POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
