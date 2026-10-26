"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  PlusCircle,
  ArrowLeft,
  CheckSquare,
  Square,
  ShieldCheck,
  Inbox,
  Paperclip
} from "lucide-react";
import { DecisionCategory } from "@prisma/client";

export default function NewMeetingPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");

  const [title, setTitle] = useState("2026-2027 Eğitim-Öğretim Yılı Güz Yarıyılı Olağan Bölüm Kurulu Toplantısı");
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [term, setTerm] = useState("Güz");
  const [scheduledDate, setScheduledDate] = useState("2026-10-25T10:00");
  const [location, setLocation] = useState("Bölüm Başkanlığı Toplantı Salonu (Bina A, No:302)");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Standart Başlangıç Gündem Maddeleri
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([
    "DERS_GOREVLENDIRME",
    "MUAFIYET_INTIBAK",
    "STAJ_ISLETME",
    "SINAV_MAZERET",
    "KOMISYON_SECIMI"
  ]);

  // Havuz Maddeleri
  const [poolItems, setPoolItems] = useState<any[]>([]);
  const [selectedPoolIds, setSelectedPoolIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.departments.length > 0) {
          setDepartments(data.departments);
          const saved = localStorage.getItem("selected_dept_id");
          const activeDeptId = saved && data.departments.some((d: any) => d.id === saved) ? saved : data.departments[0].id;
          setSelectedDeptId(activeDeptId);
          loadPoolItems(data.departments.find((d: any) => d.id === activeDeptId)?.code || "CENG");
        }
      });
  }, []);

  const loadPoolItems = (deptCode: string) => {
    fetch(`/api/agenda-pool?departmentCode=${deptCode}&status=BEKLIYOR`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPoolItems(data.talepler);
          // Varsayılan olarak tüm bekleyenleri seç
          setSelectedPoolIds(data.talepler.map((t: any) => t.id));
        }
      });
  };

  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    const dept = departments.find((d) => d.id === deptId);
    if (dept) {
      loadPoolItems(dept.code);
    }
  };

  const templateOptions = [
    {
      category: "DERS_GOREVLENDIRME",
      title: "2026-2027 Güz Yarıyılı Ders Görevlendirmeleri ve Dağılımı",
      legal: "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği (Madde 8)"
    },
    {
      category: "MUAFIYET_INTIBAK",
      title: "Geçiş Yapan Öğrencilerin Ders Muafiyeti ve İntibak Talepleri",
      legal: "Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 10/5 & 15)"
    },
    {
      category: "STAJ_ISLETME",
      title: "Zorunlu Staj ve İşletmede Mesleki Eğitim Komisyon Değerlendirmesi",
      legal: "S.Ü. Staj ve İşletmede Mesleki Eğitim Yönergeleri"
    },
    {
      category: "SINAV_MAZERET",
      title: "Ara Sınav (Vize) Takvimi ve Sağlık Raporlu Öğrenci Mazeretleri",
      legal: "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği"
    },
    {
      category: "KOMISYON_SECIMI",
      title: "Bölüm Akreditasyon, Kalite ve İntibak Komisyonlarının Seçimi",
      legal: "Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 15)"
    }
  ];

  const toggleTemplate = (cat: string) => {
    if (selectedTemplates.includes(cat)) {
      setSelectedTemplates(selectedTemplates.filter((c) => c !== cat));
    } else {
      setSelectedTemplates([...selectedTemplates, cat]);
    }
  };

  const togglePoolItem = (id: string) => {
    if (selectedPoolIds.includes(id)) {
      setSelectedPoolIds(selectedPoolIds.filter((p) => p !== id));
    } else {
      setSelectedPoolIds([...selectedPoolIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId) return;

    setIsSubmitting(true);
    try {
      // 1. Şablonlardan gelen maddeler
      const initialItems: any[] = templateOptions
        .filter((t) => selectedTemplates.includes(t.category))
        .map((t) => ({
          category: t.category,
          title: t.title,
          legalBasis: t.legal,
          decisionText: `${t.title} hususu görüşülerek mevzuat doğrultusunda karara bağlanacaktır.`
        }));

      // 2. Havuzdan seçilen maddeler
      const chosenPoolItems = poolItems.filter((p) => selectedPoolIds.includes(p.id));
      for (const p of chosenPoolItems) {
        initialItems.push({
          category: p.kategori,
          title: p.baslik,
          legalBasis:
            p.kategori === "DERS_GOREVLENDIRME"
              ? "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği (Madde 8)"
              : p.kategori === "MUAFIYET_INTIBAK"
              ? "Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 10/5 & 15)"
              : "Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 15)",
          decisionText: p.oneriKararMetni || `${p.baslik} konusu görüşülerek karara bağlanacaktır.`,
          talepId: p.id,
        });
      }

      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: selectedDeptId,
          academicYear,
          term,
          title,
          scheduledDate,
          location,
          initialItems
        })
      });

      const data = await res.json();
      if (data.success && data.meetingId) {
        // Havuz maddelerini güncellendi yap
        for (const p of chosenPoolItems) {
          await fetch(`/api/agenda-pool/${p.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              durum: "TOPLANTIYA_EKLENDI",
              secilenToplantiId: data.meetingId
            })
          }).catch(() => {});
        }

        router.push(`/meetings/${data.meetingId}`);
      } else {
        alert(data.error || "Toplantı oluşturulamadı");
      }
    } catch (err) {
      console.error(err);
      alert("Hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDept = departments.find((d) => d.id === selectedDeptId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Yeni Bölüm Kurulu Toplantısı ve Çağrısı Başlat
          </h1>
          <p className="text-xs text-slate-500">
            Selçuk Üniversitesi Bölüm Kurulu Süreci 1. Adımı: Tarih, yer, gündem ve Madde 15 üye yapısını tanımlayın
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Bölüm Seçimi ve Madde 15 Rozeti */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="text-xs font-bold text-slate-800 uppercase block mb-1.5">
            Bölüm ve Teşkilat Yapısı
          </label>
          <select
            value={selectedDeptId}
            onChange={(e) => handleDeptChange(e.target.value)}
            className="w-full text-xs font-semibold p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-selcuk-blue"
          >
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({dept.facultyName}) - {dept.departmentType === "COK_ANABILIM_DALI" ? "Birden Fazla Anabilim Dalı" : "Tek Anabilim Dalı"}
              </option>
            ))}
          </select>

          {currentDept && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Yönetmelik Madde 15 Kuralı: </strong>
                {currentDept.departmentType === "COK_ANABILIM_DALI"
                  ? "Bölüm Başkanı + Başkan Yardımcıları + Anabilim Dalı Başkanları kurul üyesi olarak otomatik atanacaktır."
                  : "Bölüm Başkanı + Tüm Öğretim Üyeleri ve Öğretim Görevlileri kurul üyesi olarak atanacaktır."}
              </span>
            </div>
          )}
        </div>

        {/* Toplantı Temel Bilgileri */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Toplantı Bilgileri
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Toplantı Başlığı
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-selcuk-blue"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Akademik Yıl
              </label>
              <input
                type="text"
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Yarıyıl
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Güz">Güz Yarıyılı</option>
                <option value="Bahar">Bahar Yarıyılı</option>
                <option value="Yaz">Yaz Dönemi</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Toplantı Tarihi ve Saati
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Toplantı Yeri / Salonu
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Bekleyen Talep Havuzundaki Maddeler */}
        {poolItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-selcuk-blue" />
                  <span>Bekleyen Talep ve Dilekçe Havuzundaki Maddeler</span>
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    {poolItems.length} Bekleyen
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Bu toplantıya dahil etmek istediğiniz dilekçe ve ABD yazılarını işaretleyin:
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {poolItems.map((item) => {
                const isChecked = selectedPoolIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => togglePoolItem(item.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isChecked
                        ? "bg-selcuk-blue/5 border-selcuk-blue shadow-xs"
                        : "bg-white border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="mt-0.5 text-selcuk-blue">
                      {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-bold text-slate-900">{item.baslik}</p>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.2 rounded font-semibold">
                          {item.talepTuru}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Başvuran: {item.basvuranAd} {item.basvuranNo && `(${item.basvuranNo})`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Standart Karar Şablonları */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Gündeme Eklenecek Standart Karar Maddeleri
              </h3>
              <p className="text-xs text-slate-500">
                Toplantıya dahil etmek istediğiniz standart şablonları işaretleyin (Sonradan da eklenebilir)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {templateOptions.map((item) => {
              const isChecked = selectedTemplates.includes(item.category);
              return (
                <div
                  key={item.category}
                  onClick={() => toggleTemplate(item.category)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isChecked
                      ? "bg-slate-50 border-selcuk-blue/50 shadow-xs"
                      : "bg-white border-slate-200 opacity-60"
                  }`}
                >
                  <div className="mt-0.5 text-selcuk-blue">
                    {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Dayanak: {item.legal}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gönder Butonu */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Link
            href="/"
            className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Vazgeç
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-selcuk-blue hover:bg-selcuk-navy text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>{isSubmitting ? "Toplantı Başlatılıyor..." : "Toplantı Çağrısını Oluştur ve Süreci Aç"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
