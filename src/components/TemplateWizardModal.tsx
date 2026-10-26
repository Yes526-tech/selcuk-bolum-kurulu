"use client";

import { useState } from "react";
import { X, Sparkles, Check, Table, BookOpen } from "lucide-react";
import { DecisionCategory } from "@prisma/client";
import { LEGISLATION_TEMPLATES } from "@/lib/legislation";
import CsvTableImporter from "./CsvTableImporter";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: () => void;
  meetingId: string;
  departmentName?: string;
}

export default function TemplateWizardModal({
  isOpen,
  onClose,
  onItemCreated,
  meetingId,
  departmentName
}: TemplateModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<DecisionCategory>(DecisionCategory.DERS_GOREVLENDIRME);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableData, setTableData] = useState<any>(null);

  // Kategori 1 Parametreleri
  const [cat1Yil, setCat1Yil] = useState("2026-2027");
  const [cat1Yariyil, setCat1Yariyil] = useState("Güz");
  const [cat1DersKod, setCat1DersKod] = useState("CENG301");
  const [cat1DersAd, setCat1DersAd] = useState("Yazılım Mühendisliği ve Mimarisi");
  const [cat1Kredi, setCat1Kredi] = useState("3");
  const [cat1Akts, setCat1Akts] = useState("5");
  const [cat1Hoca, setCat1Hoca] = useState("Prof. Dr. Mustafa Karakaya");

  // Kategori 2 Parametreleri
  const [cat2OgrNo, setCat2OgrNo] = useState("233311025");
  const [cat2OgrAd, setCat2OgrAd] = useState("Ahmet Hakan Demir");
  const [cat2Kurum, setCat2Kurum] = useState("Ege Üniversitesi Bilgisayar Mühendisliği");
  const [cat2EskiDers, setCat2EskiDers] = useState("BM101 Programlama Giriş (4 Kredi - Not: AA)");
  const [cat2YeniDers, setCat2YeniDers] = useState("CENG103 Programlama Dilleri I (6 AKTS - İntibak: AA)");

  // Kategori 3 Parametreleri
  const [cat3Donem, setCat3Donem] = useState("2025-2026 Yaz Dönemi");
  const [cat3OgrNo, setCat3OgrNo] = useState("213311045");
  const [cat3OgrAd, setCat3OgrAd] = useState("Merve Şen");
  const [cat3Firma, setCat3Firma] = useState("HAVELSAN A.Ş. Ar-Ge Merkezi");
  const [cat3KabulGun, setCat3KabulGun] = useState("30");

  // Kategori 4 Parametreleri
  const [cat4SinavTur, setCat4SinavTur] = useState("Ara Sınav (Vize) Mazeret");
  const [cat4TarihAralik, setCat4TarihAralik] = useState("01-08 Aralık 2026");
  const [cat4OgrNo, setCat4OgrNo] = useState("223311099");
  const [cat4OgrAd, setCat4OgrAd] = useState("Kemal Sunal");
  const [cat4Belge, setCat4Belge] = useState("Konya Numune Hastanesi Sağlık Raporu");

  // Kategori 5 Parametreleri
  const [cat5KomisyonAd, setCat5KomisyonAd] = useState("Bölüm Staj ve İşletmede Mesleki Eğitim Komisyonu");
  const [cat5Sure, setCat5Sure] = useState("3 (üç) yıl (2026-2029)");
  const [cat5Baskan, setCat5Baskan] = useState("Doç. Dr. Kemal Öztürk (Başkan)");
  const [cat5Uyeler, setCat5Uyeler] = useState("Dr. Öğr. Üyesi Burak Yıldırım, Öğr. Gör. Dr. Emre Aydın");

  if (!isOpen) return null;

  const handleApplyTemplate = async () => {
    setIsSubmitting(true);
    try {
      let title = "";
      let legalBasis = LEGISLATION_TEMPLATES[selectedCategory]?.legalBasis || "İlgili Mevzuat";
      let decisionText = "";
      let finalAttachmentsData: any = tableData;

      if (selectedCategory === DecisionCategory.DERS_GOREVLENDIRME) {
        title = `${cat1Yil} ${cat1Yariyil} Yarıyılı Ders Görevlendirmeleri (${cat1DersKod})`;
        decisionText = `Bölümümüzün ${cat1Yil} Eğitim-Öğretim Yılı ${cat1Yariyil} Yarıyılında açılacak olan ${cat1DersKod} kodlu ${cat1DersAd} dersinin (${cat1Kredi} Kredi / ${cat1Akts} AKTS) sorumlu öğretim elemanı olarak ${cat1Hoca}'ın görevlendirilmesi hususu görüşüldü. S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği'nin 8. maddesi uyarınca ekli çizelgedeki ders görevlendirmesinin aynen kabulüne ve Fakülte Yönetim Kurulu'na arzına oybirliğiyle karar verildi.`;
        if (!finalAttachmentsData) {
          finalAttachmentsData = {
            type: "ders_dagilim_tablosu",
            columns: ["Ders Kodu", "Ders Adı", "Kredi", "AKTS", "Şube", "Sorumlu Öğretim Elemanı"],
            rows: [
              { "Ders Kodu": cat1DersKod, "Ders Adı": cat1DersAd, "Kredi": cat1Kredi, "AKTS": cat1Akts, "Şube": "A", "Sorumlu Öğretim Elemanı": cat1Hoca }
            ]
          };
        }
      } else if (selectedCategory === DecisionCategory.MUAFIYET_INTIBAK) {
        title = `${cat2OgrAd} (${cat2OgrNo}) Ders Muafiyeti ve İntibak Kararı`;
        decisionText = `Bölümümüz Muafiyet ve İntibak Komisyonu'nun raporu doğrultusunda, ${cat2Kurum}'ndan geçiş yapan ${cat2OgrNo} numaralı ${cat2OgrAd}'in başarılı olduğu ${cat2EskiDers} dersine karşılık ${cat2YeniDers} dersinden muaf tutulmasına, Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 10/5 & 15 uyarınca intibakının onaylanmasına oybirliğiyle karar verildi.`;
        if (!finalAttachmentsData) {
          finalAttachmentsData = {
            type: "muafiyet_intibak_tablosu",
            columns: ["Öğrenci No", "Adı Soyadı", "Geldiği Kurum", "Eski Ders Kodu/Adı", "Muaf S.Ü. Dersi", "Notu"],
            rows: [
              { "Öğrenci No": cat2OgrNo, "Adı Soyadı": cat2OgrAd, "Geldiği Kurum": cat2Kurum, "Eski Ders Kodu/Adı": cat2EskiDers, "Muaf S.Ü. Dersi": cat2YeniDers, "Notu": "AA" }
            ]
          };
        }
      } else if (selectedCategory === DecisionCategory.STAJ_ISLETME) {
        title = `${cat3Donem} Staj Değerlendirme ve Onay Kararı (${cat3OgrAd})`;
        decisionText = `Bölümümüz Staj Komisyonu'nun değerlendirmesi sonucu, ${cat3Donem} döneminde ${cat3Firma} bünyesinde stajını tamamlayan ${cat3OgrNo} numaralı öğrenci ${cat3OgrAd}'in ${cat3KabulGun} günlük stajının kabulüne ve S.Ü. Staj Yönergesi uyarınca sisteme işlenmek üzere Dekanlığa bildirilmesine oybirliğiyle karar verildi.`;
        if (!finalAttachmentsData) {
          finalAttachmentsData = {
            type: "staj_listesi_tablosu",
            columns: ["Öğrenci No", "Adı Soyadı", "Firma / Kurum", "Kabul Gün", "Red Gün", "Staj Türü"],
            rows: [
              { "Öğrenci No": cat3OgrNo, "Adı Soyadı": cat3OgrAd, "Firma / Kurum": cat3Firma, "Kabul Gün": cat3KabulGun, "Red Gün": "0", "Staj Türü": "Endüstriyel Staj" }
            ]
          };
        }
      } else if (selectedCategory === DecisionCategory.SINAV_MAZERET) {
        title = `${cat4SinavTur} Takvimi ve Mazeret Başvuruları (${cat4OgrAd})`;
        decisionText = `S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği hükümleri uyarınca, ${cat4Belge} sunan ${cat4OgrNo} numaralı öğrenci ${cat4OgrAd}'e mazeret sınav hakkı tanınmasına ve sınav takviminin ${cat4TarihAralik} tarihleri arasında yürütülmesine oybirliğiyle karar verildi.`;
        if (!finalAttachmentsData) {
          finalAttachmentsData = {
            type: "sinav_takvimi_tablosu",
            columns: ["Öğrenci No", "Adı Soyadı", "Ders Kodu", "Ders Adı", "Sınav Türü", "Mazeret Belgesi"],
            rows: [
              { "Öğrenci No": cat4OgrNo, "Adı Soyadı": cat4OgrAd, "Ders Kodu": "CENG201", "Ders Adı": "Veri Yapıları", "Sınav Türü": cat4SinavTur, "Mazeret Belgesi": cat4Belge }
            ]
          };
        }
      } else if (selectedCategory === DecisionCategory.KOMISYON_SECIMI) {
        title = `${cat5KomisyonAd} Üyelerinin Belirlenmesi`;
        decisionText = `Üniversitelerde Akademik Teşkilat Yönetmeliği'nin 15. maddesi uyarınca ${cat5KomisyonAd} bünyesinde ${cat5Sure} görev yapmak üzere ${cat5Baskan} başkanlığında ve ${cat5Uyeler} üyeliğinde görevlendirilmesine oybirliğiyle karar verildi.`;
        if (!finalAttachmentsData) {
          finalAttachmentsData = {
            type: "komisyon_uyeleri_tablosu",
            columns: ["Komisyon Adı", "Görevi", "Unvanı Adı Soyadı", "Anabilim Dalı", "Görev Süresi"],
            rows: [
              { "Komisyon Adı": cat5KomisyonAd, "Görevi": "Komisyon Başkanı", "Unvanı Adı Soyadı": cat5Baskan, "Anabilim Dalı": "Bölüm Geneli", "Görev Süresi": cat5Sure },
              { "Komisyon Adı": cat5KomisyonAd, "Görevi": "Komisyon Üyesi", "Unvanı Adı Soyadı": cat5Uyeler, "Anabilim Dalı": "Bölüm Geneli", "Görev Süresi": cat5Sure }
            ]
          };
        }
      }

      const res = await fetch(`/api/meetings/${meetingId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          title,
          legalBasis,
          decisionText,
          templateData: {},
          attachmentsData: finalAttachmentsData
        }),
      });

      if (res.ok) {
        onItemCreated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    {
      cat: DecisionCategory.DERS_GOREVLENDIRME,
      name: "1. Ders Görevlendirmeleri",
      law: "S.Ü. Yönetmelik Md. 8",
      output: "Karar + Ders Dağılım Tablosu",
      desc: "Öğretim yılı, yarıyıl, ders kodu/adı, kredi/AKTS ve sorumlu öğretim elemanı"
    },
    {
      cat: DecisionCategory.MUAFIYET_INTIBAK,
      name: "2. Muafiyet ve İntibak",
      law: "Yönetmelik Md. 10/5 & 15",
      output: "Karar + İntibak Çizelgesi",
      desc: "Öğrenci no, ad-soyad, geldiği kurum, eski ders ve muaf olunan ders"
    },
    {
      cat: DecisionCategory.STAJ_ISLETME,
      name: "3. Staj ve İME Kararları",
      law: "S.Ü. Staj Yönergeleri",
      output: "Karar + Onaylı Staj Listesi",
      desc: "Öğrenci listesi, komisyon görüşü, kabul/ret gün sayısı"
    },
    {
      cat: DecisionCategory.SINAV_MAZERET,
      name: "4. Sınav Programı & Mazeret",
      law: "S.Ü. Sınav Yönetmeliği",
      output: "Karar + Sınav Takvimi",
      desc: "Sınav türü, tarih aralığı, sağlık mazeret belgeleri"
    },
    {
      cat: DecisionCategory.KOMISYON_SECIMI,
      name: "5. Komisyon Seçimleri",
      law: "Yönetmelik Md. 15",
      output: "Karar + Komisyon Listesi",
      desc: "Komisyon adı (Muafiyet, Staj, Kalite, Erasmus), görev süresi, üyeler"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Başlığı */}
        <div className="bg-gradient-to-r from-selcuk-blue to-selcuk-navy text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-selcuk-dark">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Standart Parametrik Karar Şablon Motoru</h3>
              <p className="text-xs text-slate-300">
                Resmi mevzuata uygun kural tabanlı metin ve Excel/CSV ek tablo üretici
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal İçerik */}
        <div className="p-6 max-h-[78vh] overflow-y-auto space-y-5">
          {/* Şablon Seçim Listesi */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase block mb-2">
              1. Karar Kategorisi Seçin
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((c) => {
                const isSelected = selectedCategory === c.cat;
                return (
                  <button
                    key={c.cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(c.cat);
                      setTableData(null); // Kategori değiştiğinde tabloyu sıfırla
                    }}
                    className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? "bg-selcuk-blue text-white border-selcuk-blue shadow-sm ring-2 ring-selcuk-turquoise/40"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs">{c.name}</p>
                      <p className={`text-[10px] mt-1 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                        Dayanak: {c.law}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-semibold mt-2 px-1.5 py-0.5 rounded w-fit ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {c.output}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seçilen Şablonun Parametre Formu */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-selcuk-blue uppercase mb-3 flex items-center gap-1.5">
              <Table className="w-4 h-4" />
              2. Otomatik Doldurulacak Parametreler
            </h4>

            {/* Kategori 1: Eğitim-Öğretim */}
            {selectedCategory === DecisionCategory.DERS_GOREVLENDIRME && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Akademik Yıl</label>
                  <input
                    type="text"
                    value={cat1Yil}
                    onChange={(e) => setCat1Yil(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Yarıyıl</label>
                  <select
                    value={cat1Yariyil}
                    onChange={(e) => setCat1Yariyil(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="Güz">Güz</option>
                    <option value="Bahar">Bahar</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ders Kodu</label>
                  <input
                    type="text"
                    value={cat1DersKod}
                    onChange={(e) => setCat1DersKod(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Ders Adı</label>
                  <input
                    type="text"
                    value={cat1DersAd}
                    onChange={(e) => setCat1DersAd(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kredi / AKTS</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cat1Kredi}
                      onChange={(e) => setCat1Kredi(e.target.value)}
                      placeholder="Kredi"
                      className="w-1/2 p-2 border rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      value={cat1Akts}
                      onChange={(e) => setCat1Akts(e.target.value)}
                      placeholder="AKTS"
                      className="w-1/2 p-2 border rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Sorumlu Öğretim Elemanı</label>
                  <input
                    type="text"
                    value={cat1Hoca}
                    onChange={(e) => setCat1Hoca(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
              </div>
            )}

            {/* Kategori 2: Muafiyet & İntibak */}
            {selectedCategory === DecisionCategory.MUAFIYET_INTIBAK && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Öğrenci No</label>
                  <input
                    type="text"
                    value={cat2OgrNo}
                    onChange={(e) => setCat2OgrNo(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Öğrenci Adı Soyadı</label>
                  <input
                    type="text"
                    value={cat2OgrAd}
                    onChange={(e) => setCat2OgrAd(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Geldiği Üniversite/Bölüm</label>
                  <input
                    type="text"
                    value={cat2Kurum}
                    onChange={(e) => setCat2Kurum(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Önceki Kurumda Başardığı Ders</label>
                  <input
                    type="text"
                    value={cat2EskiDers}
                    onChange={(e) => setCat2EskiDers(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Muaf Sayılan S.Ü. Dersi</label>
                  <input
                    type="text"
                    value={cat2YeniDers}
                    onChange={(e) => setCat2YeniDers(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
              </div>
            )}

            {/* Kategori 3: Staj & İME */}
            {selectedCategory === DecisionCategory.STAJ_ISLETME && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Staj Dönemi</label>
                  <input
                    type="text"
                    value={cat3Donem}
                    onChange={(e) => setCat3Donem(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Öğrenci No</label>
                  <input
                    type="text"
                    value={cat3OgrNo}
                    onChange={(e) => setCat3OgrNo(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kabul Edilen İş Günü</label>
                  <input
                    type="text"
                    value={cat3KabulGun}
                    onChange={(e) => setCat3KabulGun(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Öğrenci Adı Soyadı</label>
                  <input
                    type="text"
                    value={cat3OgrAd}
                    onChange={(e) => setCat3OgrAd(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Staj Yapılan Firma / Kurum</label>
                  <input
                    type="text"
                    value={cat3Firma}
                    onChange={(e) => setCat3Firma(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
              </div>
            )}

            {/* Kategori 4: Sınav & Mazeret */}
            {selectedCategory === DecisionCategory.SINAV_MAZERET && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sınav Türü</label>
                  <input
                    type="text"
                    value={cat4SinavTur}
                    onChange={(e) => setCat4SinavTur(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tarih Aralığı</label>
                  <input
                    type="text"
                    value={cat4TarihAralik}
                    onChange={(e) => setCat4TarihAralik(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mazeretli Öğrenci No & Ad</label>
                  <input
                    type="text"
                    value={`${cat4OgrNo} - ${cat4OgrAd}`}
                    onChange={(e) => {
                      const parts = e.target.value.split("-");
                      setCat4OgrNo(parts[0]?.trim() || "");
                      setCat4OgrAd(parts[1]?.trim() || "");
                    }}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mazeret Belgesi / Rapor</label>
                  <input
                    type="text"
                    value={cat4Belge}
                    onChange={(e) => setCat4Belge(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
              </div>
            )}

            {/* Kategori 5: Komisyon Seçimi */}
            {selectedCategory === DecisionCategory.KOMISYON_SECIMI && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Komisyon / Koordinatörlük Adı</label>
                  <input
                    type="text"
                    value={cat5KomisyonAd}
                    onChange={(e) => setCat5KomisyonAd(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Görev Süresi</label>
                  <input
                    type="text"
                    value={cat5Sure}
                    onChange={(e) => setCat5Sure(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Komisyon Başkanı</label>
                  <input
                    type="text"
                    value={cat5Baskan}
                    onChange={(e) => setCat5Baskan(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Atanan Üyeler</label>
                  <input
                    type="text"
                    value={cat5Uyeler}
                    onChange={(e) => setCat5Uyeler(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Excel / CSV Ek Tablo Yükleme ve Düzenleme Bileşeni (Görev 4.2) */}
          <CsvTableImporter
            key={selectedCategory}
            category={selectedCategory}
            onDataChange={(data) => setTableData(data)}
          />
        </div>

        {/* Modal Alt Butonları */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            Vazgeç
          </button>
          <button
            onClick={handleApplyTemplate}
            disabled={isSubmitting}
            className="text-xs font-bold px-5 py-2.5 rounded-xl bg-selcuk-blue hover:bg-selcuk-navy text-white flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            {isSubmitting ? "Oluşturuluyor..." : "Şablonu ve Ek Tabloyu Gündeme Ekle"}
          </button>
        </div>
      </div>
    </div>
  );
}
