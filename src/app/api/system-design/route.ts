import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLES, PERMISSION_MATRIX } from "@/lib/permissions/matrix";
import { executeDynamicBoardMembersQuery } from "@/lib/queries/board-members";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bolumId = searchParams.get("bolumId");

    // 1. Tüm Bölümleri getir
    const bolumler = await prisma.bolum.findMany({
      include: {
        fakulte: true,
        anabilimDallari: true,
        _count: {
          select: {
            personeller: true,
            toplantilar: true,
            anabilimDallari: true
          }
        }
      },
      orderBy: { ad: "asc" }
    });

    const targetBolumId = bolumId || (bolumler.length > 0 ? bolumler[0].id : null);

    // 2. Hedef Bölüm için Dinamik SQL Sorgusunu çalıştır
    let dynamicQueryResult = null;
    if (targetBolumId) {
      dynamicQueryResult = await executeDynamicBoardMembersQuery(targetBolumId);
    }

    // 3. Toplantı ve Karar Şeması Örnekleri (2026/01-01 formatı)
    const ornekToplanti = await prisma.toplanti.findFirst({
      where: targetBolumId ? { bolumId: targetBolumId } : undefined,
      include: {
        gundemMaddeleri: {
          orderBy: { siraNo: "asc" }
        },
        kararlar: {
          orderBy: { kararNo: "asc" },
          include: {
            oylamaDetaylari: {
              include: { personel: true }
            }
          }
        },
        katilimTutanaklari: {
          include: { personel: true }
        }
      },
      orderBy: { tarih: "desc" }
    });

    // 4. Veritabanı Tablo Meta Bilgileri
    const tablesMeta = [
      {
        gorev: "Görev 1.2 - Organizasyonel Şema",
        tableName: "fakulte_yuksekokul",
        modelName: "FakulteYuksekokul",
        description: "Üniversiteye bağlı fakülte, yüksekokul ve enstitü birimlerinin tanımlandığı üst tablo.",
        columns: [
          { name: "id", type: "VARCHAR(36)", isPk: true, desc: "Benzersiz Birim ID" },
          { name: "kod", type: "VARCHAR(20)", isUnique: true, desc: "Birim Kodu (örn: MUH, SHMYO)" },
          { name: "ad", type: "VARCHAR(255)", desc: "Fakülte/Yüksekokul Tam Adı" },
          { name: "tur", type: "VARCHAR(50)", desc: "FAKULTE, YUKSEKOKUL, ENSTITU" },
          { name: "dekan_mudur_unvan_ad", type: "VARCHAR(150)", desc: "Dekan / Müdür Unvan ve Adı" }
        ]
      },
      {
        gorev: "Görev 1.2 - Organizasyonel Şema",
        tableName: "bolum",
        modelName: "Bolum",
        description: "Fakülteye bağlı akademik bölümlerin ve teşkilat yapısının (Tek/Çok ABD) tutulduğu tablo.",
        columns: [
          { name: "id", type: "VARCHAR(36)", isPk: true, desc: "Bölüm ID" },
          { name: "fakulte_id", type: "VARCHAR(36)", isFk: true, desc: "Bağlı Olduğu Fakülte ID" },
          { name: "kod", type: "VARCHAR(20)", isUnique: true, desc: "Bölüm Kodu (örn: CENG, BCT)" },
          { name: "ad", type: "VARCHAR(255)", desc: "Bölüm Adı" },
          { name: "ebys_birim_kodu", type: "VARCHAR(50)", desc: "Selçuk Üniv. EBYS Birim Kodu (örn: 302.01.05)" },
          { name: "bolum_tipi", type: "ENUM", desc: "TEK_ANABILIM_DALI / COK_ANABILIM_DALI" },
          { name: "has_multiple_specialties", type: "BOOLEAN", desc: "Madde 15 Kural Anahtarı (true: Çok ABD, false: Tek ABD)" }
        ]
      },
      {
        gorev: "Görev 1.2 - Organizasyonel Şema",
        tableName: "anabilim_dali",
        modelName: "AnabilimDali",
        description: "Bölüm bünyesinde yer alan anabilim ve anasanat dallarının tablosu.",
        columns: [
          { name: "id", type: "VARCHAR(36)", isPk: true, desc: "Anabilim Dalı ID" },
          { name: "bolum_id", type: "VARCHAR(36)", isFk: true, desc: "Bağlı Bölüm ID" },
          { name: "kod", type: "VARCHAR(20)", desc: "ABD Kısa Kodu (BYAZ, BDON vb.)" },
          { name: "ad", type: "VARCHAR(255)", desc: "Anabilim Dalı Adı" },
          { name: "baskan_personel_id", type: "VARCHAR(36)", isFk: true, desc: "Anabilim Dalı Başkanı Personel ID" }
        ]
      },
      {
        gorev: "Görev 1.2 - Organizasyonel Şema",
        tableName: "akademik_personel",
        modelName: "AkademikPersonel",
        description: "Bölüm öğretim üyeleri, öğretim görevlileri ve bölüm sekreterliği personeli tablosu.",
        columns: [
          { name: "id", type: "VARCHAR(36)", isPk: true, desc: "Personel ID" },
          { name: "bolum_id", type: "VARCHAR(36)", isFk: true, desc: "Kadro Bölümü ID" },
          { name: "anabilim_dali_id", type: "VARCHAR(36)", isFk: true, desc: "Bağlı Anabilim Dalı ID" },
          { name: "unvan", type: "VARCHAR(50)", desc: "Prof. Dr., Doç. Dr., Dr. Öğr. Üyesi, Öğr. Gör." },
          { name: "ad", type: "VARCHAR(100)", desc: "Adı" },
          { name: "soyad", type: "VARCHAR(100)", desc: "Soyadı" },
          { name: "eposta", type: "VARCHAR(150)", isUnique: true, desc: "Kurumsal E-posta (@selcuk.edu.tr)" },
          { name: "rol", type: "ENUM", desc: "BOLUM_BASKANI, BOLUM_BASKAN_YARDIMCISI, ABD_BASKANI, OGRETIM_ELEMANI, BOLUM_SEKRETERI" }
        ]
      },
      {
        gorev: "Görev 1.3 - Toplantı ve Karar Şeması",
        tableName: "toplanti",
        modelName: "Toplanti",
        description: "Bölüm Kurulu toplantısının takvimi, oturum aşamaları ve salt çoğunluk durumu.",
        columns: [
          { name: "id", type: "VARCHAR(36)", isPk: true, desc: "Toplantı ID" },
          { name: "toplanti_no", type: "INTEGER", desc: "Toplantı Sıra No (örn: 1)" },
          { name: "akademik_yil", type: "VARCHAR(20)", desc: "Örn: 2026-2027" },
          { name: "yariyil", type: "VARCHAR(20)", desc: "Güz / Bahar" },
          { name: "tarih", type: "TIMESTAMP", desc: "Toplantı Tarihi" },
          { name: "saat", type: "VARCHAR(10)", desc: "Toplantı Saati (örn: 10:00)" },
          { name: "yer", type: "VARCHAR(255)", desc: "Toplantı Salonu / Adresi" },
          { name: "durum", type: "ENUM", desc: "CAGRI_YAPILDI, ERTELENDI, OTURUM_ACILDI, EBYS_SEVK_EDILDI..." },
          { name: "cogunluk_durumu", type: "BOOLEAN", desc: "Salt Çoğunluk Sağlandı mı? (Yetersizse erteleme tanzim edilir)" },
          { name: "gereken_salt_cogunluk", type: "INTEGER", desc: "floor(N / 2) + 1" },
          { name: "hazir_bulunan_uye_sayisi", type: "INTEGER", desc: "Katılan Kurul Üyesi Sayısı" }
        ]
      },
      {
        gorev: "Görev 1.3 - Toplantı ve Karar Şeması",
        tableName: "gundem_maddesi",
        modelName: "GundemMaddesi",
        description: "Toplantı öncesi belirlenen ve toplantı açılışında oylanan gündem maddeleri.",
        columns: [
          { name: "id", type: "VARCHAR(36)", isPk: true, desc: "Gündem Maddesi ID" },
          { name: "toplanti_id", type: "VARCHAR(36)", isFk: true, desc: "Bağlı Toplantı ID" },
          { name: "sira_no", type: "INTEGER", desc: "Gündem Sıra No (1, 2, 3...)" },
          { name: "kategori", type: "ENUM", desc: "5 Standart Kategori (Ders, İntibak, Staj, Sınav, Komisyon)" },
          { name: "baslik", type: "VARCHAR(255)", desc: "Gündem Maddesi Başlığı" },
          { name: "talep_kaynagi", type: "VARCHAR(150)", desc: "Talep Eden Makam/Komisyon/Öğrenci" },
          { name: "kabul_durumu", type: "ENUM", desc: "KABUL_EDILDI, REDDEDILDI_CIKARILDI, BEKLIYOR" }
        ]
      },
      {
        gorev: "Görev 1.3 - Toplantı ve Karar Şeması",
        tableName: "katilim_tutanagi",
        modelName: "KatilimTutanagi",
        description: "Hazirun cetveli; üyelerin katılım, mazeret ve e-imza durumları.",
        columns: [
          { name: "id", type: "VARCHAR(36)", isPk: true, desc: "Katılım Tutanağı Kayıt ID" },
          { name: "toplanti_id", type: "VARCHAR(36)", isFk: true, desc: "Toplantı ID" },
          { name: "personel_id", type: "VARCHAR(36)", isFk: true, desc: "Personel ID" },
          { name: "is_board_member", type: "BOOLEAN", desc: "Yönetmelik Madde 15'e Göre Oy Hakkı Olan Kurul Üyesi mi?" },
          { name: "kurul_sifati", type: "VARCHAR(100)", desc: "Kurul Başkanı, Bşk. Yrd., ABD Bşk., Kurul Üyesi" },
          { name: "katilim_durumu", type: "ENUM", desc: "KATILDI, MAZERETLI, KATILMADI" },
          { name: "imza_durumu", type: "BOOLEAN", desc: "E-İmza ile Onaylandı mı?" }
        ]
      },
      {
        gorev: "Görev 1.3 - Toplantı ve Karar Şeması",
        tableName: "karar",
        modelName: "Karar",
        description: "Müzakere edilerek bağlanan nihai resmi karar metni (2026/01-01 formatı).",
        columns: [
          { name: "id", type: "VARCHAR(36)", isPk: true, desc: "Karar ID" },
          { name: "toplanti_id", type: "VARCHAR(36)", isFk: true, desc: "Toplantı ID" },
          { name: "gundem_maddesi_id", type: "VARCHAR(36)", isFk: true, isUnique: true, desc: "Gündem Maddesi ID" },
          { name: "karar_no", type: "VARCHAR(50)", desc: "Resmi Karar No (Format: YIL/TOPLANTI-SIRA, örn: 2026/01-01)" },
          { name: "kategori", type: "ENUM", desc: "5 Standart Kategori" },
          { name: "baslik", type: "VARCHAR(255)", desc: "Karar Başlığı" },
          { name: "mevzuat_dayanagi", type: "TEXT", desc: "İlgili Mevzuat / Hukuki Dayanak Metni" },
          { name: "karar_metni", type: "TEXT", desc: "Resmi Karar Paragrafı" },
          { name: "oy_birligi_coklugu", type: "ENUM", desc: "KABUL_OYBIRLIGI, KABUL_OYCOKLUGU, REDDEDILDI" },
          { name: "kabul_oy_sayisi", type: "INTEGER", desc: "Kabul Oyları Toplamı" },
          { name: "ret_oy_sayisi", type: "INTEGER", desc: "Ret Oyları Toplamı" },
          { name: "cekimser_oy_sayisi", type: "INTEGER", desc: "Çekimser Oyları Toplamı" }
        ]
      },
      {
        gorev: "Görev 1.3 - Toplantı ve Karar Şeması",
        tableName: "oylama_detay",
        modelName: "OylamaDetay",
        description: "Her bir kurul üyesinin bireysel oy tercihi ve muhalefet şerhi.",
        columns: [
          { name: "id", type: "VARCHAR(36)", isPk: true, desc: "Oy Kayıt ID" },
          { name: "karar_id", type: "VARCHAR(36)", isFk: true, desc: "Karar ID" },
          { name: "personel_id", type: "VARCHAR(36)", isFk: true, desc: "Oy Kullanan Üye ID" },
          { name: "oy", type: "ENUM", desc: "KABUL, RET, CEKIMSER" },
          { name: "muhalefet_serhi", type: "TEXT", desc: "Şahsi Karşı Oy Gerekçesi" }
        ]
      }
    ];

    return NextResponse.json({
      success: true,
      roles: ROLES,
      permissionMatrix: PERMISSION_MATRIX,
      bolumler,
      dynamicQueryResult,
      ornekToplanti,
      tablesMeta
    });
  } catch (error: any) {
    console.error("System Design GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
