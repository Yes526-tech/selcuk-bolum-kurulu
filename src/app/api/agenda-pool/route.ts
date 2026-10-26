import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { KararKategorisi, TalepDurumu } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentCode = searchParams.get("departmentCode") || "CENG";
    const status = searchParams.get("status"); // BEKLIYOR, TOPLANTIYA_EKLENDI, etc.
    const category = searchParams.get("category");

    // İlgili Bolum kaydını bul
    const bolum = await prisma.bolum.findFirst({
      where: { kod: departmentCode }
    });

    const whereClause: any = {};
    if (bolum) {
      whereClause.bolumId = bolum.id;
    }
    if (status && status !== "ALL") {
      whereClause.durum = status as TalepDurumu;
    }
    if (category && category !== "ALL") {
      whereClause.kategori = category as KararKategorisi;
    }

    const talepler = await prisma.talepGundemHavuzu.findMany({
      where: whereClause,
      include: {
        bolum: true,
        eklenenToplanti: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, talepler });
  } catch (error: any) {
    console.error("Agenda Pool GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      departmentCode = "CENG",
      kategori = "DERS_GOREVLENDIRME",
      baslik,
      talepTuru,
      basvuranAd,
      basvuranNo,
      aciklama,
      oneriKararMetni,
      ekBelgeAdi,
    } = body;

    if (!baslik || !talepTuru || !basvuranAd) {
      return NextResponse.json(
        { success: false, error: "Zorunlu alanlar eksik (Başlık, Talep Türü, Başvuran)" },
        { status: 400 }
      );
    }

    let bolum = await prisma.bolum.findFirst({
      where: { kod: departmentCode }
    });

    if (!bolum) {
      bolum = await prisma.bolum.findFirst();
    }

    if (!bolum) {
      return NextResponse.json({ success: false, error: "Bölüm bulunamadı" }, { status: 404 });
    }

    const yeniTalep = await prisma.talepGundemHavuzu.create({
      data: {
        bolumId: bolum.id,
        kategori: kategori as KararKategorisi,
        baslik,
        talepTuru,
        basvuranAd,
        basvuranNo: basvuranNo || null,
        aciklama: aciklama || null,
        oneriKararMetni: oneriKararMetni || null,
        ekBelgeAdi: ekBelgeAdi || null,
        durum: TalepDurumu.BEKLIYOR,
      },
    });

    return NextResponse.json({ success: true, talep: yeniTalep });
  } catch (error: any) {
    console.error("Agenda Pool POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
