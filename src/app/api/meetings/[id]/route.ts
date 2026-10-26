import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateQuorum } from "@/lib/legislation";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        department: {
          include: {
            academicUnits: true,
            members: { where: { isActive: true } }
          }
        },
        items: {
          orderBy: { itemNumber: "asc" },
          include: {
            votes: {
              include: { member: true }
            }
          }
        },
        attendances: {
          include: {
            member: {
              include: { academicUnit: true }
            }
          },
          orderBy: [
            { isBoardMember: "desc" },
            { member: { role: "asc" } }
          ]
        },
        attachments: {
          orderBy: { createdAt: "desc" }
        },
        signatures: {
          include: { member: true }
        }
      }
    });

    if (!meeting) {
      return NextResponse.json({ success: false, error: "Toplantı bulunamadı" }, { status: 404 });
    }

    // Gerçek zamanlı salt çoğunluk kontrolü
    const boardAttendees = meeting.attendances.filter(a => a.isBoardMember);
    const presentCount = boardAttendees.filter(a => a.status === "KATILDI").length;
    const totalEligible = boardAttendees.length;
    const quorumStats = calculateQuorum(totalEligible, presentCount);

    return NextResponse.json({
      success: true,
      meeting,
      quorumStats
    });
  } catch (error: any) {
    console.error("Meeting GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const updated = await prisma.meeting.update({
      where: { id },
      data: body
    });

    return NextResponse.json({ success: true, meeting: updated });
  } catch (error: any) {
    console.error("Meeting PATCH Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.meeting.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Toplantı silindi" });
  } catch (error: any) {
    console.error("Meeting DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
