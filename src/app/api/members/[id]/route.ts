import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const updated = await prisma.facultyMember.update({
      where: { id },
      data: body,
      include: {
        department: true,
        academicUnit: true,
      }
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error: any) {
    console.error("Member PUT Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.facultyMember.delete({
      where: { id }
    });
    return NextResponse.json({ success: true, message: "Personel kaydı silindi" });
  } catch (error: any) {
    console.error("Member DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
