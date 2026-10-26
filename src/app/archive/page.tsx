"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Archive,
  Search,
  Filter,
  FileText,
  Calendar,
  Building2,
  ExternalLink,
  Printer,
  X,
  Eye,
  Table,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  FileType,
  Layers
} from "lucide-react";

export default function ArchivePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [academicYear, setAcademicYear] = useState("ALL");
  const [departmentCode, setDepartmentCode] = useState("ALL");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal State
  const [selectedDecision, setSelectedDecision] = useState<any>(null);

  const performSearch = () => {
    setLoading(true);
    let url = `/api/archive?query=${encodeURIComponent(query)}`;
    if (category !== "ALL") url += `&category=${category}`;
    if (academicYear !== "ALL") url += `&academicYear=${academicYear}`;
    if (departmentCode !== "ALL") url += `&departmentCode=${departmentCode}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setResults(data.results);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 250);
    return () => clearTimeout(timer);
  }, [query, category, academicYear, departmentCode]);

  const quickSearchTags = [
    { label: "Öğrenci: 233311021", q: "233311021" },
    { label: "Yunus Emre Sert", q: "Yunus Emre" },
    { label: "Ders: CENG101", q: "CENG101" },
    { label: "Prof. Dr. M. Akif Demir", q: "Akif Demir" },
    { label: "Karar: 2026/01", q: "2026/01" },
  ];

  return (
    <div className="space-y-6">
      {/* Üst Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-selcuk-blue text-amber-300 shadow-md">
              <Archive className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Bölüm Kurulu Karar Defteri ve Arşiv Arama Modülü
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Öğrenci numarası, öğretim üyesi adı, ders kodu, karar numarası ve tarih bazlı çok kriterli resmi arşiv tarayıcısı
          </p>
        </div>

        <span className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
          {results.length} Karar Arşivde Bulundu
        </span>
      </div>

      {/* Arama ve Filtreleme Kartı */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Öğrenci No (örn: 233311021), Hoca Adı, Ders Kodu (örn: CENG101), Karar No (örn: 2026/01-01) veya kelime arayın..."
            className="w-full pl-12 pr-10 py-3 text-xs sm:text-sm border border-slate-300 rounded-2xl focus:ring-2 focus:ring-selcuk-blue focus:outline-none shadow-xs font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Hızlı Arama Etiketleri */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Hızlı Filtreler:</span>
          </span>
          {quickSearchTags.map((tag) => (
            <button
              key={tag.q}
              onClick={() => setQuery(tag.q)}
              className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition shadow-xs"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Çoklu Kriter Filtreleri */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Karar Kategorisi</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium shadow-xs"
            >
              <option value="ALL">Tüm Kategoriler</option>
              <option value="DERS_GOREVLENDIRME">1. Eğitim-Öğretim & Ders Dağılımı</option>
              <option value="MUAFIYET_INTIBAK">2. Muafiyet ve İntibak Kararları</option>
              <option value="STAJ_ISLETME">3. Staj ve İME Kararları</option>
              <option value="SINAV_MAZERET">4. Sınav Programı & Mazeretler</option>
              <option value="KOMISYON_SECIMI">5. Komisyon Seçimleri</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Bölüm / Birim</label>
            <select
              value={departmentCode}
              onChange={(e) => setDepartmentCode(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium shadow-xs"
            >
              <option value="ALL">Tüm Bölümler</option>
              <option value="CENG">Bilgisayar Mühendisliği (CENG)</option>
              <option value="BCT">Biyomedikal Cihaz Tek. (BCT)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Akademik Yıl</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium shadow-xs"
            >
              <option value="ALL">Tüm Yıllar</option>
              <option value="2026-2027">2026-2027</option>
              <option value="2025-2026">2025-2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Arama Sonuçları */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs font-medium">
          Arşiv taranıyor...
        </div>
      ) : results.length === 0 ? (
        <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-2.5 shadow-sm">
          <Archive className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-bold text-sm text-slate-700">Aramanıza uygun kurul kararı bulunamadı.</p>
          <p className="text-xs text-slate-400">Farklı anahtar kelimelerle arama yapabilir veya filtreleri sıfırlayabilirsiniz.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {results.map((decision) => {
            const categoryBadgeColor =
              decision.category === "DERS_GOREVLENDIRME"
                ? "bg-blue-100 text-blue-800 border-blue-200"
                : decision.category === "MUAFIYET_INTIBAK"
                ? "bg-purple-100 text-purple-800 border-purple-200"
                : decision.category === "STAJ_ISLETME"
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : decision.category === "SINAV_MAZERET"
                ? "bg-amber-100 text-amber-800 border-amber-200"
                : decision.category === "KOMISYON_SECIMI"
                ? "bg-rose-100 text-rose-800 border-rose-200"
                : "bg-slate-100 text-slate-800 border-slate-200";

            return (
              <div
                key={decision.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-md bg-selcuk-blue text-amber-300 shadow-xs">
                      {decision.decisionNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${categoryBadgeColor}`}>
                      {decision.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-selcuk-turquoise" />
                      <span>{new Date(decision.meetingDate).toLocaleDateString("tr-TR")}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      • {decision.departmentName}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                    {decision.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 font-serif bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                    {decision.decisionText}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span><strong>Mevzuat:</strong> {decision.legalBasis}</span>
                    {decision.attachmentsData && (
                      <span className="text-emerald-700 flex items-center gap-1 font-bold">
                        <Table className="w-3.5 h-3.5" />
                        Ek Tablo Mevcut
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setSelectedDecision(decision)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition shadow-xs"
                  >
                    <Eye className="w-4 h-4 text-selcuk-blue" />
                    <span>Karar Detayı</span>
                  </button>

                  <Link
                    href={`/meetings/${decision.meetingId}`}
                    className="p-2.5 text-slate-400 hover:text-selcuk-blue hover:bg-blue-50 rounded-xl transition shadow-xs"
                    title="İlgili Toplantıya Git"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Karar Detay Modalı */}
      {selectedDecision && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-5 animate-fade-in">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-md bg-selcuk-blue text-amber-300">
                    KARAR NO: {selectedDecision.decisionNumber}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {selectedDecision.departmentName}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-2">
                  {selectedDecision.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDecision(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Toplantı Tarihi:</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{new Date(selectedDecision.meetingDate).toLocaleDateString("tr-TR")}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Hukuki Dayanak:</p>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{selectedDecision.legalBasis}</p>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Resmi Karar Metni:
                </p>
                <div className="p-4 rounded-2xl border border-slate-200 bg-white font-serif text-slate-900 leading-relaxed text-xs shadow-inner">
                  {selectedDecision.decisionText}
                </div>
              </div>

              {/* Ek Tablo Verisi (Varsa) */}
              {selectedDecision.attachmentsData && selectedDecision.attachmentsData.rows && (
                <div>
                  <p className="font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-emerald-600" />
                    Karar Ek Çizelgesi ({selectedDecision.attachmentsData.rows.length} Kayıt):
                  </p>
                  <div className="border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 font-bold text-slate-700 text-[11px] uppercase">
                        <tr>
                          {Object.keys(selectedDecision.attachmentsData.rows[0] || {}).map((col) => (
                            <th key={col} className="p-2.5 border-b">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedDecision.attachmentsData.rows.map((row: any, rIdx: number) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            {Object.values(row).map((val: any, cIdx: number) => (
                              <td key={cIdx} className="p-2.5">
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Muhalefet Şerhi (Varsa) */}
              {selectedDecision.dissentingOpinion && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
                  <p className="font-bold">Muhalefet Şerhi (Karşı Oy Gerekçesi):</p>
                  <p className="mt-1 italic">{selectedDecision.dissentingOpinion}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Link
                href={`/meetings/${selectedDecision.meetingId}`}
                className="text-xs text-selcuk-blue hover:text-selcuk-dark font-bold flex items-center gap-1"
              >
                <span>İlgili Toplantı Sürecine Git</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => setSelectedDecision(null)}
                className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
