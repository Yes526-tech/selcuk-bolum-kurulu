import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { createAuditLog } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const attachments = await prisma.attachment.findMany({
      where: { meetingId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, attachments });
  } catch (error: any) {
    console.error("GET Attachments Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { originalName, fileSize, mimeType, itemId, fileContentBase64, userName, userEmail } = body;

    if (!originalName) {
      return NextResponse.json({ success: false, error: "Dosya adı zorunludur." }, { status: 400 });
    }

    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting) {
      return NextResponse.json({ success: false, error: "Toplantı bulunamadı" }, { status: 404 });
    }

    if (meeting.isSealed) {
      return NextResponse.json(
        { success: false, error: "Mühürlenmiş kurul kararına yeni ek dosya yüklenemez." },
        { status: 400 }
      );
    }

    // SHA-256 hash hesapla
    let sha256Hash = "";
    if (fileContentBase64) {
      const buf = Buffer.from(fileContentBase64, "base64");
      sha256Hash = crypto.createHash("sha256").update(buf).digest("hex");
    } else {
      // Simüle edilen dosya için stabil kriptografik özet
      sha256Hash = crypto
        .createHash("sha256")
        .update(`${originalName}-${fileSize || 1024}-${id}`)
        .digest("hex");
    }

    const fileName = `${Date.now()}-${originalName.replace(/\s+/g, "_")}`;
    const fileUrl = `/uploads/${fileName}`;

    const attachment = await prisma.attachment.create({
      data: {
        meetingId: id,
        itemId: itemId || null,
        fileName,
        originalName,
        fileSize: fileSize || 204800,
        mimeType: mimeType || "application/pdf",
        sha256Hash,
        fileUrl,
      },
    });

    await createAuditLog({
      departmentId: meeting.departmentId,
      userName: userName || "Kullanıcı",
      userEmail,
      action: "EK_DOSYA_YUKLENDI",
      level: "INFO",
      details: `Toplantı #${meeting.meetingNumber} için "${originalName}" adlı ek dosya yüklendi (SHA-256: ${sha256Hash.slice(0, 16)}...).`,
    });

    return NextResponse.json({ success: true, attachment });
  } catch (error: any) {
    console.error("POST Attachment Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
