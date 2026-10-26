import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        academicUnits: true,
        members: {
          where: { isActive: true },
          orderBy: { role: "asc" }
        },
        _count: {
          select: {
            meetings: true,
            members: true,
            academicUnits: true,
          }
        }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ success: true, departments });
  } catch (error: any) {
    console.error("Departments GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, departmentType, currentAcademicYear, currentTerm } = body;

    const updated = await prisma.department.update({
      where: { id },
      data: {
        ...(departmentType && { departmentType }),
        ...(currentAcademicYear && { currentAcademicYear }),
        ...(currentTerm && { currentTerm }),
      }
    });

    return NextResponse.json({ success: true, department: updated });
  } catch (error: any) {
    console.error("Department PATCH Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
