import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DecisionResult } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { itemId, isAcceptedToAgenda, agendaVoteNotes } = body;

    if (!itemId) {
      return NextResponse.json({ success: false, error: "Madde ID gereklidir" }, { status: 400 });
    }

    const updatedItem = await prisma.meetingItem.update({
      where: { id: itemId },
      data: {
        isAcceptedToAgenda: Boolean(isAcceptedToAgenda),
        agendaVoteNotes: agendaVoteNotes || (isAcceptedToAgenda ? "Gündeme kabul edildi." : "Kurul oyuyla gündemden çıkarıldı."),
        decisionResult: isAcceptedToAgenda ? DecisionResult.BEKLIYOR : DecisionResult.GUNDEMDEN_CIKARILDI
      }
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error: any) {
    console.error("Agenda Vote POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
