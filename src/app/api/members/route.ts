import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { determineBoardMembership, calculateQuorum } from "@/lib/legislation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");

    const whereClause: any = { isActive: true };
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    const members = await prisma.facultyMember.findMany({
      where: whereClause,
      include: {
        department: true,
        academicUnit: true,
      },
      orderBy: [
        { role: "asc" },
        { title: "asc" },
        { lastName: "asc" }
      ]
    });

    // Her üyenin Madde 15 durumunu dinamik hesapla
    const enhancedMembers = members.map(m => {
      const membership = determineBoardMembership(m.department.departmentType, m.role);
      return {
        ...m,
        isBoardMember: membership.isMember,
        boardTitle: membership.boardTitle,
        boardExplanation: membership.explanation
      };
    });

    // Nisap İstatistikleri (İzinli/Görevli olan üyeler Madde 15 uyarınca düşülür)
    const boardMembers = enhancedMembers.filter(m => m.isBoardMember);
    const totalBoardMembers = boardMembers.length; // N
    const onLeaveBoardMembers = boardMembers.filter(m => m.onLeave).length; // L
    const effectiveBoardMembers = totalBoardMembers - onLeaveBoardMembers; // N - L
    const requiredQuorum = Math.floor(effectiveBoardMembers / 2) + 1;

    return NextResponse.json({
      success: true,
      members: enhancedMembers,
      stats: {
        totalStaff: enhancedMembers.length,
        totalBoardMembers,
        onLeaveBoardMembers,
        effectiveBoardMembers,
        requiredQuorum,
        quorumFormula: `floor((${totalBoardMembers} - ${onLeaveBoardMembers}) / 2) + 1 = ${requiredQuorum}`
      }
    });
  } catch (error: any) {
    console.error("Members GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      departmentId,
      academicUnitId,
      title,
      firstName,
      lastName,
      email,
      phone,
      sicilNo,
      role
    } = body;

    if (!departmentId || !title || !firstName || !lastName || !email || !role) {
      return NextResponse.json(
        { success: false, error: "Zorunlu alanlar eksik (Bölüm, Unvan, Ad, Soyad, E-posta, Rol)" },
        { status: 400 }
      );
    }

    const newMember = await prisma.facultyMember.create({
      data: {
        departmentId,
        academicUnitId: academicUnitId || null,
        title,
        firstName,
        lastName,
        email,
        phone,
        sicilNo,
        role,
        isActive: true,
        onLeave: false,
      },
      include: {
        department: true,
        academicUnit: true,
      }
    });

    return NextResponse.json({ success: true, member: newMember });
  } catch (error: any) {
    console.error("Member POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
