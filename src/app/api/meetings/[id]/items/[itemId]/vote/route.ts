import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DecisionResult } from "@prisma/client";
import { appendOfficialStatutoryConclusion } from "@/lib/template-engine";
import { createAuditLog } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { id, itemId } = params;
    const body = await req.json();
    const {
      decisionResult,
      votesInFavor,
      votesAgainst,
      votesAbstain,
      dissentingOpinion,
      decisionText,
      userName,
      userEmail,
    } = body;

    const existingItem = await prisma.meetingItem.findUnique({
      where: { id: itemId },
      include: {
        meeting: true,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ success: false, error: "Gündem maddesi bulunamadı" }, { status: 404 });
    }

    if (existingItem.meeting.isSealed) {
      return NextResponse.json(
        { success: false, error: "Mühürlenmiş toplantı kararı üzerinde değişiklik yapılamaz." },
        { status: 400 }
      );
    }

    let finalDecisionText = decisionText !== undefined ? decisionText : existingItem?.decisionText || "";

    // Karar sonucuna göre mevzuat ifadesini otomatik tamamla
    if (decisionResult && finalDecisionText) {
      finalDecisionText = appendOfficialStatutoryConclusion(
        finalDecisionText,
        decisionResult as DecisionResult,
        {
          favor: Number(votesInFavor ?? 0),
          against: Number(votesAgainst ?? 0),
          abstain: Number(votesAbstain ?? 0),
        },
        dissentingOpinion ? [{ memberName: "Karşı Oy Kullanan Üye", reason: dissentingOpinion }] : undefined
      );
    }

    const updatedItem = await prisma.meetingItem.update({
      where: { id: itemId },
      data: {
        ...(decisionResult && { decisionResult: decisionResult as DecisionResult }),
        ...(votesInFavor !== undefined && { votesInFavor: Number(votesInFavor) }),
        ...(votesAgainst !== undefined && { votesAgainst: Number(votesAgainst) }),
        ...(votesAbstain !== undefined && { votesAbstain: Number(votesAbstain) }),
        ...(dissentingOpinion !== undefined && { dissentingOpinion }),
        decisionText: finalDecisionText,
        rowVersion: { increment: 1 },
      },
    });

    // İlk oyla birlikte toplantının katılım listesini kilitle (Rapor 3.7 & Çizelge 3.4 Katılım Kilidi Kuralı)
    if (!existingItem.meeting.isAttendanceLocked) {
      await prisma.meeting.update({
        where: { id },
        data: {
          isAttendanceLocked: true,
          attendanceLockedAt: new Date(),
        },
      });
    }

    await createAuditLog({
      departmentId: existingItem.meeting.departmentId,
      userName: userName || "Kurul Başkanı / Üye",
      userEmail,
      action: "MADDE_OYLANDI",
      level: "INFO",
      details: `Madde #${existingItem.itemNumber} ("${existingItem.title}") oylandı: ${decisionResult} (${votesInFavor} Kabul, ${votesAgainst} Ret, ${votesAbstain} Çekimser).`,
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error: any) {
    console.error("Item Vote POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
