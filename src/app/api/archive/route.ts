import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim() || "";
    const category = searchParams.get("category");
    const academicYear = searchParams.get("academicYear");
    const departmentCode = searchParams.get("departmentCode");

    // MeetingItem üzerinden arama
    const whereClause: any = {
      isAcceptedToAgenda: true,
    };

    if (category && category !== "ALL") {
      whereClause.category = category;
    }

    if (academicYear && academicYear !== "ALL") {
      whereClause.meeting = {
        ...(whereClause.meeting || {}),
        academicYear,
      };
    }

    if (departmentCode && departmentCode !== "ALL") {
      whereClause.meeting = {
        ...(whereClause.meeting || {}),
        department: { code: departmentCode }
      };
    }

    const items = await prisma.meetingItem.findMany({
      where: whereClause,
      include: {
        meeting: {
          include: {
            department: true,
          }
        },
        votes: {
          include: { member: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Query filtreleme (Başlık, Karar No, Karar Metni, Ek Tablo Verisi)
    let filtered = items;
    if (query) {
      const q = query.toLowerCase();
      filtered = items.filter((item) => {
        const titleMatch = item.title?.toLowerCase().includes(q);
        const numMatch = item.decisionNumber?.toLowerCase().includes(q);
        const textMatch = item.decisionText?.toLowerCase().includes(q);
        const legalMatch = item.legalBasis?.toLowerCase().includes(q);
        const jsonMatch = item.attachmentsData
          ? JSON.stringify(item.attachmentsData).toLowerCase().includes(q)
          : false;

        return titleMatch || numMatch || textMatch || legalMatch || jsonMatch;
      });
    }

    const formattedResults = filtered.map((item) => ({
      id: item.id,
      meetingId: item.meeting.id,
      decisionNumber: item.decisionNumber || `${item.meeting.academicYear}/${item.meeting.meetingNumber}-${item.itemNumber}`,
      academicYear: item.meeting.academicYear,
      term: item.meeting.term,
      meetingNumber: item.meeting.meetingNumber,
      meetingDate: item.meeting.scheduledDate,
      departmentName: item.meeting.department.name,
      departmentCode: item.meeting.department.code,
      facultyName: item.meeting.department.facultyName,
      category: item.category,
      title: item.title,
      legalBasis: item.legalBasis,
      decisionText: item.decisionText,
      decisionResult: item.decisionResult,
      votesInFavor: item.votesInFavor,
      votesAgainst: item.votesAgainst,
      dissentingOpinion: item.dissentingOpinion,
      attachmentsData: item.attachmentsData,
    }));

    return NextResponse.json({
      success: true,
      totalCount: formattedResults.length,
      results: formattedResults
    });
  } catch (error: any) {
    console.error("Archive Search GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
