import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");

    const where: any = {};
    if (departmentId && departmentId !== "ALL") {
      where.departmentId = departmentId;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: {
        department: true,
      },
    });

    return NextResponse.json({
      success: true,
      announcements,
    });
  } catch (error: any) {
    console.error("GET /api/announcements Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { departmentId, title, content, authorName, authorEmail, id } = body;

    if (!departmentId || !title || !content) {
      return NextResponse.json(
        { success: false, error: "Bölüm, başlık ve içerik alanları zorunludur." },
        { status: 400 }
      );
    }

    let announcement;
    if (id) {
      // Sürüm artırma (Rapor 3.18 uyarınca duyuru değiştiğinde sürüm artırılır)
      const existing = await prisma.announcement.findUnique({ where: { id } });
      const nextVersion = (existing?.version || 1) + 1;
      announcement = await prisma.announcement.update({
        where: { id },
        data: {
          title,
          content,
          version: nextVersion,
          publishedAt: new Date(),
          authorName: authorName || "Bölüm Sekreterliği",
        },
      });

      await createAuditLog({
        departmentId,
        userName: authorName || "Bölüm Sekreterliği",
        userEmail: authorEmail,
        action: "DUYURU_GUNCELLENDI",
        level: "INFO",
        details: `Kurul duyurusu güncellendi (Sürüm v${nextVersion}): "${title}"`,
      });
    } else {
      announcement = await prisma.announcement.create({
        data: {
          departmentId,
          title,
          content,
          version: 1,
          isPublished: true,
          publishedAt: new Date(),
          authorName: authorName || "Bölüm Başkanlığı",
        },
      });

      await createAuditLog({
        departmentId,
        userName: authorName || "Bölüm Başkanlığı",
        userEmail: authorEmail,
        action: "DUYURU_YAYIMLANDI",
        level: "INFO",
        details: `Yeni kurul toplantı duyurusu yayımlandı: "${title}"`,
      });
    }

    return NextResponse.json({
      success: true,
      announcement,
    });
  } catch (error: any) {
    console.error("POST /api/announcements Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
