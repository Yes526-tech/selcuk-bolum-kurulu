import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || searchParams.get("kod");
    return handleVerification(code);
  } catch (error: any) {
    console.error("GET /api/verify Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = body.code || body.kod;
    return handleVerification(code);
  } catch (error: any) {
    console.error("POST /api/verify Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function handleVerification(code?: string | null) {
  if (!code || !code.trim()) {
    return NextResponse.json(
      { success: false, error: "Lütfen doğrulamak için bir EBYS Doğrulama Kodu, Evrak No veya Belge SHA-256 Özeti giriniz." },
      { status: 400 }
    );
  }

  const clean = code.trim();

  // Arama öncelikleri:
  const meeting = await prisma.meeting.findFirst({
    where: {
      OR: [
        { ebysVerificationCode: { equals: clean, mode: "insensitive" } },
        { ebysDocumentNo: { equals: clean, mode: "insensitive" } },
        { ebysBarcode: { equals: clean, mode: "insensitive" } },
        { sha256Seal: { equals: clean, mode: "insensitive" } },
        { id: clean },
      ],
    },
    include: {
      department: true,
      items: {
        where: { isAcceptedToAgenda: true },
        orderBy: { itemNumber: "asc" },
      },
      attendances: {
        where: { isBoardMember: true },
        include: {
          member: true,
        },
        orderBy: { member: { lastName: "asc" } },
      },
      signatures: {
        include: {
          member: true,
        },
      },
      attachments: true,
    },
  });

  if (!meeting) {
    return NextResponse.json(
      {
        success: false,
        isVerified: false,
        message: "Girilen koda ait Selçuk Üniversitesi resmi kurul kararı bulunamadı veya henüz mühürlenmedi.",
      },
      { status: 404 }
    );
  }

  // Belirle hangi eşleşmeyle bulundu
  let matchedBy = "EBYS Doğrulama Kodu";
  if (meeting.sha256Seal?.toLowerCase() === clean.toLowerCase()) {
    matchedBy = "SHA-256 Kriptografik Belge Mührü";
  } else if (meeting.ebysDocumentNo?.toLowerCase() === clean.toLowerCase()) {
    matchedBy = "Resmi EBYS Evrak Numarası";
  } else if (meeting.ebysBarcode?.toLowerCase() === clean.toLowerCase()) {
    matchedBy = "EBYS Barkod Numarası";
  }

  const meetingNoFormatted = `${meeting.academicYear}/${meeting.meetingNumber < 10 ? "0" + meeting.meetingNumber : meeting.meetingNumber}`;

  return NextResponse.json({
    success: true,
    isVerified: true,
    verificationTimestamp: new Date().toISOString(),
    matchedBy,
    certificate: {
      institution: "T.C. SELÇUK ÜNİVERSİTESİ",
      faculty: meeting.department.facultyName,
      department: meeting.department.name,
      meetingNumber: meetingNoFormatted,
      title: meeting.title,
      scheduledDate: meeting.scheduledDate,
      location: meeting.location,
      status: meeting.status,
      isSealed: meeting.isSealed,
      sha256Seal: meeting.sha256Seal || "Henüz mühürlenmedi",
      contentDigest: meeting.contentDigest,
      ebysDocumentNo: meeting.ebysDocumentNo,
      ebysVerificationCode: meeting.ebysVerificationCode,
      ebysBarcode: meeting.ebysBarcode,
      signedAt: meeting.signedAt,
      departmentHead: `${meeting.department.headTitle} ${meeting.department.headName}`,
      quorumInfo: {
        totalEligible: meeting.totalEligibleMembers,
        attendees: meeting.actualAttendeesCount,
        requiredQuorum: meeting.quorumRequired,
        isQuorumMet: meeting.isQuorumMet,
      },
      items: meeting.items.map((it) => ({
        decisionNumber: it.decisionNumber || `${meetingNoFormatted}-${it.itemNumber}`,
        title: it.title,
        legalBasis: it.legalBasis,
        result: it.decisionResult,
        votes: {
          favor: it.votesInFavor,
          against: it.votesAgainst,
          abstain: it.votesAbstain,
        },
        dissentingOpinion: it.dissentingOpinion,
      })),
      signers: meeting.attendances.map((att) => {
        const sig = meeting.signatures.find((s) => s.memberId === att.memberId && s.status === "COMPLETED");
        return {
          title: att.member.title,
          name: `${att.member.firstName} ${att.member.lastName}`,
          boardTitle: att.boardTitle,
          status: att.status,
          isSigned: Boolean(sig || att.status === "KATILDI"),
          signedAt: sig?.signedAt || att.signedAt,
          signatureDigest: sig?.signatureDigest || null,
        };
      }),
      attachments: meeting.attachments.map((att) => ({
        originalName: att.originalName,
        fileSize: att.fileSize,
        sha256Hash: att.sha256Hash,
      })),
    },
  });
}
