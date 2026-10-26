import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DecisionCategory, DecisionResult } from "@prisma/client";
import { formatDecisionNumber } from "@/lib/numerator";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      category = DecisionCategory.DERS_GOREVLENDIRME,
      title,
      legalBasis,
      decisionText,
      templateData,
      attachmentsData,
      talepId // Havuzdan ekleniyorsa
    } = body;

    const count = await prisma.meetingItem.count({ where: { meetingId: id } });
    const meeting = await prisma.meeting.findUnique({ where: { id } });

    const itemNumber = count + 1;
    const decisionNumber = formatDecisionNumber(
      meeting ? meeting.academicYear : "2026-2027",
      meeting ? meeting.meetingNumber : 1,
      itemNumber
    );

    const newItem = await prisma.meetingItem.create({
      data: {
        meetingId: id,
        itemNumber,
        decisionNumber,
        category: category as DecisionCategory,
        title: title || `Gündem Maddesi ${itemNumber}`,
        legalBasis: legalBasis || "İlgili Mevzuat Hükümleri",
        decisionText: decisionText || "",
        templateData: templateData || null,
        attachmentsData: attachmentsData || null,
        isAcceptedToAgenda: true,
        decisionResult: DecisionResult.BEKLIYOR,
      }
    });

    // Eğer talep havuzundan geldiyse, talep durumunu TOPLANTIYA_EKLENDI yap
    if (talepId) {
      await prisma.talepGundemHavuzu.update({
        where: { id: talepId },
        data: {
          durum: "TOPLANTIYA_EKLENDI",
          secilenToplantiId: id,
        }
      }).catch(err => console.warn("Talep update error:", err));
    }

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error("Meeting Item POST Error:", error);
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
    const { reorderedItemIds } = body;

    if (!reorderedItemIds || !Array.isArray(reorderedItemIds)) {
      return NextResponse.json({ success: false, error: "reorderedItemIds dizisi gereklidir" }, { status: 400 });
    }

    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting) {
      return NextResponse.json({ success: false, error: "Toplantı bulunamadı" }, { status: 404 });
    }

    // Sıralamayı güncelle
    for (let i = 0; i < reorderedItemIds.length; i++) {
      const itemId = reorderedItemIds[i];
      const itemNumber = i + 1;
      const decisionNumber = formatDecisionNumber(
        meeting.academicYear,
        meeting.meetingNumber,
        itemNumber
      );

      await prisma.meetingItem.update({
        where: { id: itemId },
        data: {
          itemNumber,
          decisionNumber,
        }
      });
    }

    return NextResponse.json({ success: true, message: "Gündem sırası güncellendi" });
  } catch (error: any) {
    console.error("Meeting Item Reorder PATCH Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { itemId, ...updateData } = body;

    if (!itemId) {
      return NextResponse.json({ success: false, error: "itemId gereklidir" }, { status: 400 });
    }

    const updated = await prisma.meetingItem.update({
      where: { id: itemId },
      data: updateData
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error("Meeting Item PUT Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ success: false, error: "itemId gereklidir" }, { status: 400 });
    }

    await prisma.meetingItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true, message: "Madde silindi" });
  } catch (error: any) {
    console.error("Meeting Item DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
