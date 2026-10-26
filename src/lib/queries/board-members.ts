import { prisma } from "@/lib/prisma";

export interface DynamicBoardMemberResult {
  personel_id: string;
  unvan: string;
  ad: string;
  soyad: string;
  eposta: string;
  sicil_no: string | null;
  rol: string;
  bolum_id: string;
  bolum_adi: string;
  cok_anabilim_dallimi: boolean;
  anabilim_dali_adi: string | null;
  kurul_sifati: string;
  kurul_uyesi_mi: boolean;
}

/**
 * Görev 1.2: Bölümün tek veya çoklu anabilim dalına sahip olma durumuna göre
 * aktif kurul üyelerini dinamik filtreleyen parametreli SQL sorgusu.
 * 
 * Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 Hükmü:
 * - Tek ABD: Bölüm Bşk. + TÜM Öğretim Elemanları (Prof, Doç, Dr. Öğr. Üyesi, Öğr. Gör.)
 * - Çok ABD: Bölüm Bşk. + Bşk. Yrd. + ABD Başkanları
 */
export const DYNAMIC_BOARD_MEMBERS_SQL = `
SELECT 
    p.id AS personel_id,
    p.unvan,
    p.ad,
    p.soyad,
    p.eposta,
    p."sicilNo" AS sicil_no,
    p.rol,
    b.id AS bolum_id,
    b.ad AS bolum_adi,
    b."hasMultipleSpecialties" AS cok_anabilim_dallimi,
    ad.ad AS anabilim_dali_adi,
    CASE
        WHEN p.rol = 'BOLUM_BASKANI' THEN 'Kurul Başkanı'
        WHEN p.rol = 'BOLUM_BASKAN_YARDIMCISI' THEN 'Bölüm Başkan Yardımcısı'
        WHEN p.rol = 'ABD_BASKANI' THEN 'Anabilim Dalı Başkanı'
        WHEN p.rol = 'OGRETIM_ELEMANI' AND b."hasMultipleSpecialties" = FALSE THEN 'Öğretim Elemanı (Kurul Üyesi)'
        WHEN p.rol = 'OGRETIM_ELEMANI' AND b."hasMultipleSpecialties" = TRUE THEN 'Öğretim Elemanı (Kurul Dışı)'
        ELSE 'Bölüm Sekreteri / Raportör'
    END AS kurul_sifati,
    CASE 
        -- Çoklu Anabilim Dalı Kuralı: Bşk + Bşk Yrd + ABD Bşk
        WHEN b."hasMultipleSpecialties" = TRUE 
             AND p.rol IN ('BOLUM_BASKANI', 'BOLUM_BASKAN_YARDIMCISI', 'ABD_BASKANI') 
             THEN TRUE
        -- Tek Anabilim Dalı Kuralı: Bşk + TÜM Öğretim Elemanları
        WHEN b."hasMultipleSpecialties" = FALSE 
             AND p.rol IN ('BOLUM_BASKANI', 'BOLUM_BASKAN_YARDIMCISI', 'ABD_BASKANI', 'OGRETIM_ELEMANI') 
             THEN TRUE
        ELSE FALSE
    END AS kurul_uyesi_mi
FROM akademik_personel p
JOIN bolum b ON p."bolumId" = b.id
LEFT JOIN anabilim_dali ad ON p."anabilimDaliId" = ad.id
WHERE b.id = $1 
  AND p."isActive" = TRUE
ORDER BY 
    CASE p.rol
        WHEN 'BOLUM_BASKANI' THEN 1
        WHEN 'BOLUM_BASKAN_YARDIMCISI' THEN 2
        WHEN 'ABD_BASKANI' THEN 3
        WHEN 'OGRETIM_ELEMANI' THEN 4
        ELSE 5
    END,
    p.soyad ASC;
`;

/**
 * SQL sorgusunu PostgreSQL üzerinde canlı çalıştırır
 */
export async function executeDynamicBoardMembersQuery(bolumId: string) {
  const results = await prisma.$queryRawUnsafe<DynamicBoardMemberResult[]>(
    DYNAMIC_BOARD_MEMBERS_SQL,
    bolumId
  );

  const votingMembers = results.filter((r) => r.kurul_uyesi_mi === true);
  const nonVotingMembers = results.filter((r) => r.kurul_uyesi_mi === false);

  const totalEligible = votingMembers.length;
  const quorumRequired = Math.floor(totalEligible / 2) + 1;

  const bolumInfo = results.length > 0 ? {
    id: results[0].bolum_id,
    ad: results[0].bolum_adi,
    hasMultipleSpecialties: results[0].cok_anabilim_dallimi,
    yapiTuru: results[0].cok_anabilim_dallimi ? "Çoklu Anabilim Dalı" : "Tek Anabilim Dalı",
    yapiAciklamasi: results[0].cok_anabilim_dallimi
      ? "Birden Fazla Anabilim Dalı Bulunan Bölüm: Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 uyarınca kurul üyeleri Bölüm Başkanı, Bölüm Başkan Yardımcıları ve Anabilim Dalı Başkanlarından teşekkül eder."
      : "Tek Anabilim Dalı Bulunan Bölüm: Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 uyarınca Bölüm Başkanı başkanlığında TÜM öğretim üyeleri ve öğretim görevlileri kurul üyesidir."
  } : null;

  return {
    bolumInfo,
    allMembers: results,
    votingMembers,
    nonVotingMembers,
    totalEligible,
    quorumRequired,
    sqlQuery: DYNAMIC_BOARD_MEMBERS_SQL.trim()
  };
}
