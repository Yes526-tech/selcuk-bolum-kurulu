import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LEGISLATION_TEMPLATES } from "@/lib/legislation";
import { DecisionCategory } from "@prisma/client";

export async function GET() {
  try {
    const templates = await prisma.decisionTemplate.findMany({
      orderBy: { category: "asc" }
    });

    return NextResponse.json({ success: true, templates, legislationTemplates: LEGISLATION_TEMPLATES });
  } catch (error: any) {
    console.error("Templates GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, params } = body;

    const catEnum = category as DecisionCategory;
    const templateDef = LEGISLATION_TEMPLATES[catEnum];

    if (!templateDef) {
      return NextResponse.json({ success: false, error: "Geçersiz karar kategorisi" }, { status: 400 });
    }

    const generatedText = templateDef.defaultTemplate(params || {});

    return NextResponse.json({
      success: true,
      category,
      title: templateDef.title,
      legalBasis: templateDef.legalBasis,
      generatedText
    });
  } catch (error: any) {
    console.error("Templates POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
