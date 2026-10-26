"use client";

import { useState } from "react";
import { Table, Upload, Plus, Trash2, FileSpreadsheet, Check, Sparkles } from "lucide-react";

interface CsvTableImporterProps {
  category: string;
  initialData?: any;
  onDataChange: (tableData: { type: string; columns: string[]; rows: any[] }) => void;
}

const PRESET_COLUMNS: Record<string, string[]> = {
  DERS_GOREVLENDIRME: [
    "Ders Kodu",
    "Ders Adı",
    "Kredi",
    "AKTS",
    "Şube",
    "Sorumlu Öğretim Elemanı"
  ],
  MUAFIYET_INTIBAK: [
    "Öğrenci No",
    "Adı Soyadı",
    "Geldiği Kurum",
    "Eski Ders Kodu/Adı",
    "Muaf S.Ü. Dersi",
    "Notu"
  ],
  STAJ_ISLETME: [
    "Öğrenci No",
    "Adı Soyadı",
    "Firma / Kurum",
    "Kabul Gün",
    "Red Gün",
    "Staj Türü"
  ],
  SINAV_MAZERET: [
    "Öğrenci No",
    "Adı Soyadı",
    "Ders Kodu",
    "Ders Adı",
    "Sınav Türü",
    "Mazeret Belgesi"
  ],
  KOMISYON_SECIMI: [
    "Komisyon Adı",
    "Görevi",
    "Unvanı Adı Soyadı",
    "Anabilim Dalı",
    "Görev Süresi"
  ],
  DIGER: ["Sıra No", "Madde / Konu", "İlgili Kişi", "Açıklama"]
};

const SAMPLE_DATA: Record<string, any[]> = {
  DERS_GOREVLENDIRME: [
    { "Ders Kodu": "CENG101", "Ders Adı": "Bilgisayar Mühendisliğine Giriş", "Kredi": "3", "AKTS": "5", "Şube": "A", "Sorumlu Öğretim Elemanı": "Prof. Dr. Mehmet Akif Demir" },
    { "Ders Kodu": "CENG201", "Ders Adı": "Veri Yapıları ve Algoritmalar", "Kredi": "4", "AKTS": "6", "Şube": "A", "Sorumlu Öğretim Elemanı": "Prof. Dr. Mustafa Karakaya" },
    { "Ders Kodu": "CENG305", "Ders Adı": "İşletim Sistemleri", "Kredi": "3", "AKTS": "5", "Şube": "B", "Sorumlu Öğretim Elemanı": "Doç. Dr. Hüseyin Çetin" },
    { "Ders Kodu": "CENG401", "Ders Adı": "Bitirme Projesi I", "Kredi": "2", "AKTS": "6", "Şube": "Tüm", "Sorumlu Öğretim Elemanı": "Prof. Dr. Fatma Zehra Şahin" }
  ],
  MUAFIYET_INTIBAK: [
    { "Öğrenci No": "233311021", "Adı Soyadı": "Yunus Emre Sert", "Geldiği Kurum": "Hacettepe Üniversitesi", "Eski Ders Kodu/Adı": "BİL113 Algoritmalar", "Muaf S.Ü. Dersi": "CENG102 Programlama I", "Notu": "AA" },
    { "Öğrenci No": "233311088", "Adı Soyadı": "Mehmet Can Solak", "Geldiği Kurum": "Gazi Üniversitesi", "Eski Ders Kodu/Adı": "MAT101 Kalkülüs I", "Muaf S.Ü. Dersi": "MAT101 Matematik I", "Notu": "BA" }
  ],
  STAJ_ISLETME: [
    { "Öğrenci No": "223311012", "Adı Soyadı": "Büşra Çelik", "Firma / Kurum": "HAVELSAN A.Ş.", "Kabul Gün": "30", "Red Gün": "0", "Staj Türü": "Yazılım Stajı" },
    { "Öğrenci No": "223311045", "Adı Soyadı": "Tarık Yılmaz", "Firma / Kurum": "ASELSAN Konya", "Kabul Gün": "30", "Red Gün": "0", "Staj Türü": "Donanım Stajı" },
    { "Öğrenci No": "223311090", "Adı Soyadı": "Gizem Şener", "Firma / Kurum": "Teknokent Yazılım Ltd.", "Kabul Gün": "25", "Red Gün": "5", "Staj Türü": "Mesleki Staj" }
  ],
  SINAV_MAZERET: [
    { "Öğrenci No": "223311044", "Adı Soyadı": "Ayşe Gültekin", "Ders Kodu": "CENG201", "Ders Adı": "Veri Yapıları", "Sınav Türü": "Ara Sınav (Vize)", "Mazeret Belgesi": "Meram Tıp Onaylı Rapor" },
    { "Öğrenci No": "213311018", "Adı Soyadı": "Kadir Erdem", "Ders Kodu": "CENG305", "Ders Adı": "İşletim Sistemleri", "Sınav Türü": "Ara Sınav (Vize)", "Mazeret Belgesi": "Resmi Sağlık Raporu" }
  ],
  KOMISYON_SECIMI: [
    { "Komisyon Adı": "Kalite ve Akreditasyon Komisyonu", "Görevi": "Komisyon Başkanı", "Unvanı Adı Soyadı": "Prof. Dr. Fatma Zehra Şahin", "Anabilim Dalı": "Bilgisayar Bilimleri", "Görev Süresi": "3 Yıl" },
    { "Komisyon Adı": "Kalite ve Akreditasyon Komisyonu", "Görevi": "Üye", "Unvanı Adı Soyadı": "Doç. Dr. Hüseyin Çetin", "Anabilim Dalı": "Bilgisayar Donanımı", "Görev Süresi": "3 Yıl" },
    { "Komisyon Adı": "Kalite ve Akreditasyon Komisyonu", "Görevi": "Üye", "Unvanı Adı Soyadı": "Dr. Öğr. Üyesi Seda Korkmaz", "Anabilim Dalı": "Bilgisayar Yazılımı", "Görev Süresi": "3 Yıl" }
  ],
  DIGER: [
    { "Sıra No": "1", "Madde / Konu": "Bölüm Tanıtım Semineri", "İlgili Kişi": "Doç. Dr. Hüseyin Çetin", "Açıklama": "Fakülte amfisinde düzenlenecek" }
  ]
};

export default function CsvTableImporter({
  category,
  initialData,
  onDataChange
}: CsvTableImporterProps) {
  const columns = PRESET_COLUMNS[category] || PRESET_COLUMNS.DIGER;
  const [rows, setRows] = useState<any[]>(
    initialData?.rows || SAMPLE_DATA[category] || []
  );
  const [isCsvPasteOpen, setIsCsvPasteOpen] = useState(false);
  const [csvText, setCsvText] = useState("");

  const emitChange = (newRows: any[]) => {
    setRows(newRows);
    onDataChange({
      type: `${category.toLowerCase()}_tablosu`,
      columns,
      rows: newRows
    });
  };

  const handleAddEmptyRow = () => {
    const emptyRow: any = {};
    columns.forEach((col) => (emptyRow[col] = ""));
    const updated = [...rows, emptyRow];
    emitChange(updated);
  };

  const handleCellChange = (rowIndex: number, column: string, value: string) => {
    const updated = [...rows];
    updated[rowIndex] = { ...updated[rowIndex], [column]: value };
    emitChange(updated);
  };

  const handleDeleteRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    emitChange(updated);
  };

  const handleLoadSample = () => {
    const sample = SAMPLE_DATA[category] || [];
    emitChange(sample);
  };

  const handleParseCsv = () => {
    if (!csvText.trim()) return;

    // Ayrıştırma: satırlar ve tab/virgül/noktalı virgül
    const lines = csvText.trim().split("\n");
    const parsedRows: any[] = [];

    // İlk satır başlık mı kontrol et
    let startIndex = 0;
    const delimiter = csvText.includes("\t") ? "\t" : csvText.includes(";") ? ";" : ",";

    const firstLineCols = lines[0].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ""));
    const isFirstLineHeader = firstLineCols.some((col) =>
      columns.some((c) => c.toLowerCase() === col.toLowerCase())
    );

    if (isFirstLineHeader) {
      startIndex = 1;
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ""));
      const rowObj: any = {};
      columns.forEach((col, cIdx) => {
        rowObj[col] = values[cIdx] || "";
      });
      parsedRows.push(rowObj);
    }

    if (parsedRows.length > 0) {
      emitChange(parsedRows);
      setIsCsvPasteOpen(false);
      setCsvText("");
    } else {
      alert("CSV metni ayrıştırılamadı. Lütfen satırları kontrol ediniz.");
    }
  };

  return (
    <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-900 uppercase">
            Ek Karar Çizelgesi ve Tablo Verisi (Excel / CSV)
          </span>
          <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            {rows.length} Satır
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition"
          >
            <Sparkles className="w-3 h-3" />
            <span>Örnek Veri Yükle</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCsvPasteOpen(!isCsvPasteOpen)}
            className="text-[11px] text-selcuk-blue bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition"
          >
            <Upload className="w-3 h-3" />
            <span>Excel / CSV Yapıştır</span>
          </button>

          <button
            type="button"
            onClick={handleAddEmptyRow}
            className="text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition"
          >
            <Plus className="w-3 h-3" />
            <span>Satır Ekle</span>
          </button>
        </div>
      </div>

      {/* CSV Yapıştırma Alanı */}
      {isCsvPasteOpen && (
        <div className="p-3 bg-white border border-selcuk-blue/30 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-800">
              Excel&apos;den Hücreleri Kopyalayıp Buraya Yapıştırın (Tab veya Virgülle Ayrılmış)
            </p>
            <span className="text-[10px] text-slate-400">Kolon Sırası: {columns.join(" | ")}</span>
          </div>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={4}
            placeholder={`Örnek:\n${columns.join("\t")}\n${Object.values(SAMPLE_DATA[category]?.[0] || {}).join("\t")}`}
            className="w-full text-xs font-mono p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-selcuk-blue"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCsvPasteOpen(false)}
              className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleParseCsv}
              className="px-3 py-1 text-xs font-bold bg-selcuk-blue hover:bg-selcuk-navy text-white rounded shadow-xs"
            >
              Tabloya Aktar
            </button>
          </div>
        </div>
      )}

      {/* Etkileşimli Tablo Görünümü */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs max-h-64 overflow-y-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-100 sticky top-0 z-10 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
            <tr>
              <th className="p-2 w-8 text-center text-slate-400">#</th>
              {columns.map((col) => (
                <th key={col} className="p-2 font-bold whitespace-nowrap">
                  {col}
                </th>
              ))}
              <th className="p-2 w-8 text-center">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="p-4 text-center text-slate-400">
                  Tablo verisi boş. Yukarıdaki butonlardan örnek veri yükleyebilir veya satır ekleyebilirsiniz.
                </td>
              </tr>
            ) : (
              rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-2 text-center text-[10px] text-slate-400 font-mono">
                    {rIdx + 1}
                  </td>
                  {columns.map((col) => (
                    <td key={col} className="p-1">
                      <input
                        type="text"
                        value={row[col] || ""}
                        onChange={(e) => handleCellChange(rIdx, col, e.target.value)}
                        className="w-full text-xs p-1.5 border border-transparent hover:border-slate-300 focus:border-selcuk-blue focus:bg-white rounded transition focus:outline-none"
                      />
                    </td>
                  ))}
                  <td className="p-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(rIdx)}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded transition"
                      title="Satırı Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-400 italic">
        * Bu tablo, kararın resmi ekinde (Ek-1, Ek-2 vb.) resmi tutanak PDF ve Word belgelerine otomatik tablo olarak gömülecektir.
      </p>
    </div>
  );
}
