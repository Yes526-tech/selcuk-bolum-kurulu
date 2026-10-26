import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    const level = searchParams.get("level");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const where: any = {};
    if (departmentId && departmentId !== "ALL") {
      where.departmentId = departmentId;
    }
    if (level && level !== "ALL") {
      where.level = level;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { action: { contains: q, mode: "insensitive" } },
        { details: { contains: q, mode: "insensitive" } },
        { userName: { contains: q, mode: "insensitive" } },
        { userEmail: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          department: true,
        },
      }),
    ]);

    // İstatistikler
    const [infoCount, warnCount, errorCount, securityCount] = await Promise.all([
      prisma.auditLog.count({ where: { ...where, level: "INFO" } }),
      prisma.auditLog.count({ where: { ...where, level: "WARN" } }),
      prisma.auditLog.count({ where: { ...where, level: "ERROR" } }),
      prisma.auditLog.count({ where: { ...where, level: "SECURITY" } }),
    ]);

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: {
        total,
        infoCount,
        warnCount,
        errorCount,
        securityCount,
      },
    });
  } catch (error: any) {
    console.error("GET /api/logs Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
