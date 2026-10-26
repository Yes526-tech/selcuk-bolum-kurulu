import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const updated = await prisma.talepGundemHavuzu.update({
      where: { id },
      data: body,
      include: {
        bolum: true,
      }
    });

    return NextResponse.json({ success: true, talep: updated });
  } catch (error: any) {
    console.error("Agenda Pool PATCH Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.talepGundemHavuzu.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Talep silindi" });
  } catch (error: any) {
    console.error("Agenda Pool DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
