"use client";

import { useState } from "react";
import {
  Layers,
  BookOpen,
  Table,
  CheckCircle,
  Copy,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { DecisionCategory } from "@prisma/client";
import { LEGISLATION_TEMPLATES } from "@/lib/legislation";

export default function TemplatesPage() {
  const [selectedCat, setSelectedCat] = useState<DecisionCategory>(DecisionCategory.DERS_GOREVLENDIRME);
  const [copied, setCopied] = useState(false);

  // Form Değerleri
  const [cat1Yil, setCat1Yil] = useState("2026-2027");
  const [cat1Yariyil, setCat1Yariyil] = useState("Güz");
  const [cat1Program, setCat1Program] = useState("Lisans Programı (I. ve II. Öğretim)");

  const [cat2OgrNo, setCat2OgrNo] = useState("233311021");
  const [cat2OgrAd, setCat2OgrAd] = useState("Yunus Emre Sert");
  const [cat2Kurum, setCat2Kurum] = useState("Hacettepe Üniversitesi Bilgisayar Mühendisliği Bölümü");
  const [cat2Sinif, setCat2Sinif] = useState("3. Sınıf");

  const [cat3Donem, setCat3Donem] = useState("2025-2026 Yaz Dönemi");
  const [cat3Tur, setCat3Tur] = useState("Zorunlu Endüstriyel Donanım ve Yazılım Stajı");

  const [cat4SinavTur, setCat4SinavTur] = useState("Ara Sınav (Vize) ve Mazeret Sınav Takvimi");
  const [cat4TarihAralik, setCat4TarihAralik] = useState("17-28 Kasım 2026");

  const [cat5Komisyon, setCat5Komisyon] = useState("Muafiyet, İntibak ve Denklik Komisyonu");
  const [cat5Sure, setCat5Sure] = useState("3 (üç) yıl (2026-2029)");

  const templateDef = LEGISLATION_TEMPLATES[selectedCat];

  // Canlı Metin Üretimi
  const getRenderedText = () => {
    switch (selectedCat) {
      case DecisionCategory.DERS_GOREVLENDIRME:
        return templateDef.defaultTemplate({ akademikYil: cat1Yil, yariyil: cat1Yariyil, program: cat1Program });
      case DecisionCategory.MUAFIYET_INTIBAK:
        return templateDef.defaultTemplate({ ogrenciNo: cat2OgrNo, ogrenciAdSoyad: cat2OgrAd, geldigiKurum: cat2Kurum, intibakSinifi: cat2Sinif });
      case DecisionCategory.STAJ_ISLETME:
        return templateDef.defaultTemplate({ stajDonemi: cat3Donem, stajTuru: cat3Tur });
      case DecisionCategory.SINAV_MAZERET:
        return templateDef.defaultTemplate({ sinavTuru: cat4SinavTur, tarihAraligi: cat4TarihAralik });
      case DecisionCategory.KOMISYON_SECIMI:
        return templateDef.defaultTemplate({ komisyonAdi: cat5Komisyon, gorevSuresi: cat5Sure });
      default:
        return "";
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(getRenderedText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    {
      id: DecisionCategory.DERS_GOREVLENDIRME,
      name: "Eğitim-Öğretim ve Ders Görevlendirme",
      law: "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği (Madde 8)",
      desc: "Akademik yıl, yarıyıl, ders kodu/adı, kredi/AKTS ve sorumlu öğretim elemanı görevlendirmeleri.",
      attachment: "Ders Dağılım Çizelgesi Eki"
    },
    {
      id: DecisionCategory.MUAFIYET_INTIBAK,
      name: "Muafiyet ve İntibak Kararları",
      law: "Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 10/5 & 15)",
      desc: "Öğrenci no, ad-soyad, geldiği kurum, eski ders (kod/kredi/not) ve muaf olunan S.Ü. dersleri.",
      attachment: "Muafiyet/İntibak Karşılaştırma Çizelgesi Eki"
    },
    {
      id: DecisionCategory.STAJ_ISLETME,
      name: "Staj ve İşletmede Mesleki Eğitim",
      law: "S.Ü. Staj ve İşletmede Mesleki Eğitim Yönergeleri",
      desc: "Öğrenci listesi, komisyon görüşü, kabul/ret edilen iş günü sayısı ve staj dönemi.",
      attachment: "Onaylı Öğrenci Staj Listesi Eki"
    },
    {
      id: DecisionCategory.SINAV_MAZERET,
      name: "Sınav Programı ve Mazeret Sınavları",
      law: "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği",
      desc: "Sınav türü (Vize/Final/Bütünleme/Tek Ders), tarih aralığı ve sağlık mazeret belgeleri.",
      attachment: "Sınav Takvimi / Mazeretli Öğrenci Çizelgesi Eki"
    },
    {
      id: DecisionCategory.KOMISYON_SECIMI,
      name: "Komisyon ve Koordinatörlük Seçimi",
      law: "Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 15)",
      desc: "Komisyon adı (Muafiyet, Staj, Kalite, Erasmus vb.), görev süresi ve atanan üyeler.",
      attachment: "Komisyon Üye Listesi ve Görev Dağılımı Eki"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Standart Parametrik Karar Şablonları Kütüphanesi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bölüm sekreterliği ve bölüm başkanlığının her toplantıda sıfırdan metin yazmasını önleyen resmi şablonlar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon: Şablon Seçimi */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Otomasyona Dahil Edilen 5 Standart Kategori
          </h2>

          <div className="space-y-2">
            {categories.map((c) => {
              const isSelected = selectedCat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCat(c.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? "bg-selcuk-blue text-white border-selcuk-blue shadow-md shadow-selcuk-blue/20"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm block leading-snug">{c.name}</span>
                    <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                      {c.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className={`text-[10px] font-mono ${isSelected ? "text-amber-300" : "text-selcuk-blue font-semibold"}`}>
                      {c.attachment}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sağ Kolon (2 Sütun): Parametre Formu ve Canlı Çıktı */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{templateDef.title}</h3>
                <p className="text-xs text-selcuk-blue font-medium mt-0.5">
                  <strong>İlgili Mevzuat / Dayanak:</strong> {templateDef.legalBasis}
                </p>
              </div>

              <button
                onClick={copyText}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Kopyalandı!" : "Metni Kopyala"}
              </button>
            </div>

            {/* Dinamik Parametre Girişleri */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Otomatik Doldurulacak Parametreler
              </h4>

              {selectedCat === DecisionCategory.DERS_GOREVLENDIRME && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">Akademik Yıl</label>
                    <input
                      type="text"
                      value={cat1Yil}
                      onChange={(e) => setCat1Yil(e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Yarıyıl</label>
                    <select
                      value={cat1Yariyil}
                      onChange={(e) => setCat1Yariyil(e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    >
                      <option value="Güz">Güz Yarıyılı</option>
                      <option value="Bahar">Bahar Yarıyılı</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Program</label>
                    <input
                      type="text"
                      value={cat1Program}
                      onChange={(e) => setCat1Program(e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                </div>
              )}

              {selectedCat === DecisionCategory.MUAFIYET_INTIBAK && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">Öğrenci No</label>
                    <input
                      type="text"
                      value={cat2OgrNo}
                      onChange={(e) => setCat2OgrNo(e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Adı Soyadı</label>
                    <input
                      type="text"
                      value={cat2OgrAd}
                      onChange={(e) => setCat2OgrAd(e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="font-semibold block mb-1">Geldiği Kurum</label>
                    <input
                      type="text"
                      value={cat2Kurum}
                      onChange={(e) => setCat2Kurum(e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">İntibak Edildiği Sınıf</label>
                    <input
                      type="text"
                      value={cat2Sinif}
                      onChange={(e) => setCat2Sinif(e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                </div>
              )}

              {selectedCat === DecisionCategory.STAJ_ISLETME && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">Staj Dönemi</label>
                    <input
                      type="text"
                      value={cat3Donem}
                      onChange={(e) => setCat3Donem(e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Staj Türü</label>
                    <input
                      type="text"
                      value={cat3Tur}
                      onChange={(e) => setCat3Tur(e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                </div>
              )}

              {selectedCat === DecisionCategory.SINAV_MAZERET && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">Sınav Türü</label>
                    <input
                      type="text"
                      value={cat4SinavTur}
                      onChange={(e) => setCat4SinavTur(e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Tarih Aralığı</label>
                    <input
                      type="text"
                      value={cat4TarihAralik}
                      onChange={(e) => setCat4TarihAralik(e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                </div>
              )}

              {selectedCat === DecisionCategory.KOMISYON_SECIMI && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">Komisyon Adı</label>
                    <input
                      type="text"
                      value={cat5Komisyon}
                      onChange={(e) => setCat5Komisyon(e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Görev Süresi</label>
                    <input
                      type="text"
                      value={cat5Sure}
                      onChange={(e) => setCat5Sure(e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Canlı Üretilen Karar Metni */}
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase block mb-1.5">
                Canlı Üretilen Resmi Karar Metni (Paragraf)
              </span>
              <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs font-serif leading-relaxed text-slate-800 shadow-inner">
                {getRenderedText()}
              </div>
            </div>

            {/* Üretilecek Resmi Çıktı ve Ek Çizelge Bilgisi */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs flex items-start gap-3">
              <Table className="w-5 h-5 text-selcuk-blue mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-blue-950">Üretilecek Çıktı ve Ekler:</p>
                <p className="text-blue-800 mt-0.5">
                  Bu şablon seçildiğinde resmi Karar Tutanağı altında otomatik olarak{" "}
                  <strong>{categories.find((c) => c.id === selectedCat)?.attachment}</strong> tanzim edilir ve EBYS üst yazısına ek numara verilerek iliştirilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
