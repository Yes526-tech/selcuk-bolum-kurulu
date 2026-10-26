import { PrismaClient, MemberRole } from "@prisma/client";
import { OFFICIAL_FACULTY_LIST } from "../src/lib/faculty-list";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Selçuk Üniversitesi Resmi Fakülte Kadrosu Veritabanı Senkronizasyonu Başlatıldı...");

  const cengDept = await prisma.department.findFirst({
    where: { code: "CENG" }
  });

  if (!cengDept) {
    console.error("❌ CENG bölümü bulunamadı.");
    return;
  }

  // 1. Bölüm Yönetim Bilgilerini Güncelle (Doç. Dr. Gül Nihal GÜĞÜL - Bölüm Başkanı)
  await prisma.department.update({
    where: { id: cengDept.id },
    data: {
      headTitle: "Doç. Dr.",
      headName: "Gül Nihal GÜĞÜL",
      viceHead1: "Doç. Dr. Ali YAŞAR",
      viceHead2: "Doç. Dr. Mehmet Akif ŞAHMAN",
    }
  });
  console.log("✅ Bölüm Başkanı ve Yardımcıları güncellendi.");

  // Anabilim Dalları
  const units = await prisma.academicUnit.findMany({
    where: { departmentId: cengDept.id }
  });
  const unitMap: Record<string, string> = {};
  units.forEach(u => {
    if (u.shortCode) unitMap[u.shortCode] = u.id;
  });

  // Eski placeholder üyeleri temizle (resmi listede olmayanlar)
  const officialEmails = OFFICIAL_FACULTY_LIST.map(f => f.email.toLowerCase());
  const deleted = await prisma.facultyMember.deleteMany({
    where: {
      departmentId: cengDept.id,
      email: { notIn: officialEmails }
    }
  });
  console.log(`🧹 ${deleted.count} adet eski/placeholder personel kaydı temizlendi.`);

  // 2. Resmi Kadrodaki Tüm Hocaları Upsert Et
  let createdCount = 0;
  let updatedCount = 0;

  for (const fac of OFFICIAL_FACULTY_LIST) {
    let academicUnitId: string | null = null;
    let role: MemberRole = MemberRole.OGRETIM_UYESI;

    if (fac.defaultRole === "BOLUM_BASKANI") {
      role = MemberRole.BOLUM_BASKANI;
      academicUnitId = unitMap["BYAZ"] || null;
    } else if (fac.defaultRole === "BOLUM_BASKAN_YARDIMCISI") {
      role = MemberRole.BOLUM_BASKAN_YARDIMCISI;
      academicUnitId = unitMap["BDON"] || unitMap["BBIL"] || null;
    } else if (fac.defaultRole === "ABD_BASKANI") {
      role = MemberRole.ABD_BASKANI;
      if (fac.lastName.includes("BAŞÇİFTÇİ")) academicUnitId = unitMap["BYAZ"] || null;
      else if (fac.lastName.includes("ALTUN")) academicUnitId = unitMap["BDON"] || null;
      else if (fac.lastName.includes("SARITAŞ")) academicUnitId = unitMap["BBIL"] || null;
      else if (fac.lastName.includes("TAŞDEMİR")) academicUnitId = unitMap["BAGL"] || null;
      else academicUnitId = unitMap["BYAZ"] || null;
    } else if (fac.defaultRole === "SEKRETERYA") {
      role = MemberRole.SEKRETERYA;
    } else if (fac.defaultRole === "OGRETIM_GOREVLISI") {
      role = MemberRole.OGRETIM_GOREVLISI;
      academicUnitId = unitMap["BYAZ"] || null;
    } else if (fac.defaultRole === "ARASTIRMA_GOREVLISI") {
      role = MemberRole.ARASTIRMA_GOREVLISI;
      academicUnitId = unitMap["BYAZ"] || null;
    } else {
      role = MemberRole.OGRETIM_UYESI;
      academicUnitId = unitMap["BYAZ"] || null;
    }

    const existing = await prisma.facultyMember.findUnique({
      where: { email: fac.email }
    });

    if (existing) {
      await prisma.facultyMember.update({
        where: { id: existing.id },
        data: {
          title: fac.title,
          firstName: fac.firstName,
          lastName: fac.lastName,
          role,
          sicilNo: fac.sicilNo,
          phone: "0332 223 2100",
          academicUnitId,
          isActive: true,
        }
      });
      updatedCount++;
    } else {
      await prisma.facultyMember.create({
        data: {
          departmentId: cengDept.id,
          academicUnitId,
          title: fac.title,
          firstName: fac.firstName,
          lastName: fac.lastName,
          email: fac.email,
          role,
          sicilNo: fac.sicilNo,
          phone: "0332 223 2100",
          isActive: true,
          onLeave: false,
        }
      });
      createdCount++;
    }
  }

  console.log(`🎉 Senkronizasyon Tamamlandı! Oluşturulan: ${createdCount}, Güncellenen: ${updatedCount}`);
}

main()
  .catch((e) => {
    console.error("Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
