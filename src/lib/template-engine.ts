import { DecisionCategory, DecisionResult } from "@prisma/client";

export interface TemplatePlaceholder {
  key: string;
  label: string;
  description: string;
  defaultValue: string;
  category: DecisionCategory;
}

export const TEMPLATE_PLACEHOLDERS: TemplatePlaceholder[] = [
  { key: "akademik_yil", label: "Akademik Yıl", description: "Örn: 2026-2027", defaultValue: "2026-2027", category: "DERS_GOREVLENDIRME" },
  { key: "yariyil", label: "Yarıyıl", description: "Güz veya Bahar", defaultValue: "Güz", category: "DERS_GOREVLENDIRME" },
  { key: "program_adi", label: "Program Adı", description: "Lisans / Yüksek Lisans / Doktora", defaultValue: "Bilgisayar Mühendisliği Lisans Programı", category: "DERS_GOREVLENDIRME" },
  { key: "anabilim_dali", label: "Anabilim Dalı", description: "İlgili Anabilim Dalı", defaultValue: "Bilgisayar Yazılımı Anabilim Dalı", category: "DERS_GOREVLENDIRME" },

  { key: "ogrenci_ad_soyad", label: "Öğrenci Adı Soyadı", description: "Öğrencinin Adı Soyadı", defaultValue: "Yunus Emre Sert", category: "MUAFIYET_INTIBAK" },
  { key: "ogrenci_no", label: "Öğrenci Numarası", description: "Öğrenci Numarası", defaultValue: "233311021", category: "MUAFIYET_INTIBAK" },
  { key: "geldigi_kurum", label: "Geldiği Üniversite/Bölüm", description: "Önceki Yükseköğretim Kurumu", defaultValue: "Gazi Üniversitesi Bilgisayar Mühendisliği", category: "MUAFIYET_INTIBAK" },
  { key: "intibak_sinifi", label: "İntibak Ettirilen Sınıf", description: "İntibak sınıfı", defaultValue: "3. Sınıf", category: "MUAFIYET_INTIBAK" },

  { key: "staj_donemi", label: "Staj Dönemi", description: "Stajın yapıldığı dönem", defaultValue: "2025-2026 Yaz Dönemi", category: "STAJ_ISLETME" },
  { key: "staj_turu", label: "Staj Türü", description: "Zorunlu Donanım / Yazılım / İME", defaultValue: "Zorunlu Endüstriyel Staj", category: "STAJ_ISLETME" },
  { key: "kabul_edilen_gun", label: "Kabul Edilen İş Günü", description: "Kabul edilen gün", defaultValue: "30", category: "STAJ_ISLETME" },

  { key: "sinav_turu", label: "Sınav Türü", description: "Vize / Mazeret / Bütünleme", defaultValue: "Ara Sınav (Vize) ve Mazeret Sınavları", category: "SINAV_MAZERET" },
  { key: "tarih_araligi", label: "Sınav Tarih Aralığı", description: "Sınav haftası tarihleri", defaultValue: "17 - 28 Kasım 2026", category: "SINAV_MAZERET" },

  { key: "komisyon_adi", label: "Komisyon Adı", description: "Komisyon veya Koordinatörlük adı", defaultValue: "Bölüm Kalite, Akreditasyon ve Bologna Komisyonu", category: "KOMISYON_SECIMI" },
  { key: "gorev_suresi", label: "Görev Süresi", description: "Görevlendirme süresi", defaultValue: "3 (üç) yıl", category: "KOMISYON_SECIMI" },
];

/**
 * Verilen şablon metnindeki {{degisken}} yer tutucularını dinamik değerlerle değiştirir
 */
export function renderTemplateText(templateText: string, params: Record<string, string>): string {
  if (!templateText) return "";
  let rendered = templateText;

  for (const [key, value] of Object.entries(params)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    rendered = rendered.replace(regex, value ?? "");
  }

  return rendered;
}

/**
 * Görev 4.3: Resmi Mevzuat İfade Tamamlama
 * Oylama sonucuna göre resmi kanuni hüküm cümlesini kararın sonuna ekler
 */
export function appendOfficialStatutoryConclusion(
  decisionText: string,
  result: DecisionResult,
  votes: { favor: number; against: number; abstain: number },
  dissentingOpinions?: { memberName: string; reason: string }[]
): string {
  let cleaned = decisionText.trim();

  // Halihazırda sonu oybirliği/oyçokluğu ile bitiyorsa mükerrer olmasın
  if (cleaned.endsWith("oybirliğiyle karar verildi.") || cleaned.endsWith("karara bağlanmıştır.")) {
    return cleaned;
  }

  let conclusion = "";

  if (result === "KABUL_OYBIRLIGI") {
    conclusion = "\n\nYapılan müzakereler neticesinde; mevcudun OY BİRLİĞİ ile kabul edilerek karara bağlanmıştır.";
  } else if (result === "KABUL_OYCOKLUGU") {
    conclusion = `\n\nYapılan müzakereler ve gizli/açık oylama neticesinde; mevcudun (${votes.favor} kabul, ${votes.against} ret oyu ile) OY ÇOKLUĞU ile kabul edilerek karara bağlanmış olup, onaylanmak ve gereği yapılmak üzere Fakülte Yönetim Kuruluna / Dekanlık Makamına arzına karar verilmiştir.`;
  } else if (result === "REDDEDILDI") {
    conclusion = `\n\nYapılan oylama neticesinde; mevcudun (${votes.against} ret, ${votes.favor} kabul oyu ile) salt çoğunluğu sağlanamadığından REDDEDİLMİŞTİR.`;
  } else {
    conclusion = "\n\nMüzakereler neticesinde karara bağlanmak üzere oylama aşamasındadır.";
  }

  // Muhalefet Şerhleri Eki (Varsa)
  if (dissentingOpinions && dissentingOpinions.length > 0) {
    conclusion += "\n\nKARŞI OY VE MUHALEFET ŞERHLERİ:";
    for (const d of dissentingOpinions) {
      conclusion += `\n- ${d.memberName}: "${d.reason}"`;
    }
  }

  return `${cleaned}${conclusion}`;
}
