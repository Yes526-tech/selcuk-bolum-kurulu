"use client";

import { useState } from "react";
import {
  Send,
  Download,
  Printer,
  CheckCircle2,
  FileText,
  Building2,
  ShieldCheck,
  QrCode,
  ExternalLink,
  Barcode,
  FileType,
  Copy,
  Check,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface Step6Props {
  meeting: any;
  onRefresh: () => void;
  onPrevStep: () => void;
}

export default function Step6EBYSExport({ meeting, onRefresh, onPrevStep }: Step6Props) {
  const [copiedCode, setCopiedCode] = useState(false);

  const ebysNo = meeting.ebysDocumentNo || "E-64134190-302.01.05-185420";
  const verifyCode = meeting.ebysVerificationCode || "ebys-su-792841-2026";
  const ebysBarcode = meeting.ebysBarcode || `SU641341903020105185420`;
  const meetingNoStr = `${meeting.academicYear}/${meeting.meetingNumber < 10 ? "0" + meeting.meetingNumber : meeting.meetingNumber}`;

  const copyVerification = () => {
    navigator.clipboard.writeText(verifyCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. EBYS Sevk Başarı Bildirimi */}
      <div className="bg-gradient-to-r from-selcuk-blue via-teal-900 to-selcuk-dark text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-selcuk-turquoise/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md flex-shrink-0">
              <CheckCircle2 className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-amber-400 text-selcuk-dark font-black text-xs px-3 py-0.5 rounded-full shadow-xs">
                  ADIM 6 / 6
                </span>
                <span className="text-emerald-300 font-bold text-xs">
                  Süreç Tamamlandı
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                EBYS Sevk İşlemi Başarıyla Gerçekleştirildi
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl leading-relaxed">
                Selçuk Üniversitesi Bölüm Kurulu Kararları resmi EBYS evrak numarası ile derlenerek ilgili Dekanlığa/Müdürlüğe sevk edilmeye hazır hale getirilmiştir.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={`/api/meetings/${meeting.id}/export-pdf`}
              download
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-selcuk-dark font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Resmi PDF İndir</span>
            </a>

            <a
              href={`/api/meetings/${meeting.id}/export-docx?type=minute`}
              download
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
            >
              <FileType className="w-4 h-4" />
              <span>Word (DOCX)</span>
            </a>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 backdrop-blur-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır</span>
            </button>
          </div>
        </div>
      </div>

      {/* İndirilebilir Resmi Evrak Paketi (Görev 6.1 ve 6.2) */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Download className="w-4 h-4 text-selcuk-blue" />
            Resmi Belge Çıktıları ve EBYS Paket İndirme Merkezi
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Dekanlığa/Müdürlüğe resmi EBYS üzerinden veya ıslak imzalı iletilmek üzere tek tıkla üretilen resmi belgeler:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Karar Tutanağı */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-selcuk-blue/40 hover:shadow-md transition-all flex flex-col justify-between gap-4">
            <div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-selcuk-blue text-amber-300 uppercase tracking-wider">
                Ana Belge
              </span>
              <h4 className="font-bold text-sm text-slate-900 mt-2.5">
                Resmi Karar Tutanağı
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tüm kararlar, gerekçeler, oylama sonuçları, muhalefet şerhleri ve unvan sırasına göre imza blokları.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
              <a
                href={`/api/meetings/${meeting.id}/export-docx?type=minute`}
                download
                className="flex-1 text-center py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all shadow-xs"
              >
                Word (DOCX)
              </a>
              <a
                href={`/api/meetings/${meeting.id}/export-pdf`}
                download
                className="flex-1 text-center py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all shadow-xs"
              >
                PDF
              </a>
            </div>
          </div>

          {/* Dekanlık Üst Yazısı */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between gap-4">
            <div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                EBYS Sevk
              </span>
              <h4 className="font-bold text-sm text-slate-900 mt-2.5">
                Dekanlık / Müdürlük Üst Yazısı
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Sayı, Konu, İlgi, Ekler ve Bölüm Başkanı elektronik imza bloğunu içeren resmi sevk müzekkeresi.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
              <a
                href={`/api/meetings/${meeting.id}/export-docx?type=letter`}
                download
                className="flex-1 text-center py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all shadow-xs"
              >
                Word (DOCX)
              </a>
              <a
                href={`/api/meetings/${meeting.id}/export-pdf`}
                download
                className="flex-1 text-center py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all shadow-xs"
              >
                PDF
              </a>
            </div>
          </div>

          {/* Katılım Tutanağı (Hazirun) */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between gap-4">
            <div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-selcuk-dark uppercase tracking-wider">
                Hazirun
              </span>
              <h4 className="font-bold text-sm text-slate-900 mt-2.5">
                Katılım ve İmza Tutanağı
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Madde 15 uyarınca asıl üyelerin imza alanlarını ve mazeretli üyelerin açıklamalarını içeren hazirun cetveli.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
              <a
                href={`/api/meetings/${meeting.id}/export-docx?type=attendance`}
                download
                className="flex-1 text-center py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all shadow-xs"
              >
                Word (DOCX)
              </a>
              <a
                href={`/api/meetings/${meeting.id}/export-pdf`}
                download
                className="flex-1 text-center py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all shadow-xs"
              >
                PDF
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EBYS Evrak ve Doğrulama Kartı */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-selcuk-blue" />
          Selçuk Üniversitesi EBYS Resmi Evrak ve Doğrulama Bilgileri
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50/80 border border-slate-200 rounded-2xl mb-6 shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">EBYS Evrak Sayısı</p>
            <p className="text-sm font-mono font-black text-selcuk-blue mt-1">{ebysNo}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Birim Kodu: {meeting.department.ebysUnitCode}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doğrulama Kodu</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">{verifyCode}</span>
              <button
                onClick={copyVerification}
                className="text-[11px] font-bold text-selcuk-blue hover:text-selcuk-dark flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? "Kopyalandı" : "Kopyala"}
              </button>
              <Link
                href={`/verify?code=${encodeURIComponent(verifyCode)}`}
                target="_blank"
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 inline-flex items-center gap-1 shadow-2xs hover:bg-emerald-100 transition-colors"
                title="Doğrulama Portalında Sorgula"
              >
                <ExternalLink className="w-3 h-3" />
                Doğrula
              </Link>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">ebys.selcuk.edu.tr/dogrulama / Portal</p>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">EBYS Sevk Durumu</p>
            <p className="text-sm font-black text-emerald-700 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Üst Birime İletildi
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Fakülte Yönetim Kurulu Gündemine Hazır</p>
          </div>

          <div className="text-left md:text-right flex flex-col justify-center items-start md:items-end">
            <span className="text-xs font-mono font-black tracking-widest text-slate-600 block">
              ||| ||||| |||| |||||||| |||
            </span>
            <span className="text-[10px] font-mono text-slate-400">{ebysBarcode}</span>
          </div>
        </div>

        {/* 3. Dekanlığa / Müdürlüğe Sevk Üst Yazısı (Resmi EBYS Formatında) */}
        <div className="border border-slate-300 rounded-2xl p-8 sm:p-12 bg-white font-serif max-w-3xl mx-auto shadow-md">
          <div className="text-center border-b border-slate-300 pb-4 mb-6">
            <p className="text-xs font-bold uppercase text-slate-600">T.C.</p>
            <p className="text-sm font-black text-selcuk-blue">SELÇUK ÜNİVERSİTESİ REKTÖRLÜĞÜ</p>
            <p className="text-xs font-bold text-slate-800 uppercase mt-0.5">{meeting.department.faculty?.name || "Mühendislik ve Doğa Bilimleri Fakültesi"}</p>
            <p className="text-xs font-semibold text-slate-700 uppercase">{meeting.department.name} Başkanlığı</p>
          </div>

          <div className="flex justify-between items-start text-xs font-sans mb-6">
            <div>
              <p><strong>Sayı:</strong> {ebysNo}</p>
              <p><strong>Konu:</strong> Bölüm Kurulu Kararları (Toplantı No: {meetingNoStr})</p>
            </div>
            <div className="text-right">
              <p><strong>Tarih:</strong> {new Intl.DateTimeFormat("tr-TR").format(new Date())}</p>
            </div>
          </div>

          <div className="text-center my-6">
            <h4 className="text-sm font-bold font-sans uppercase tracking-wide text-slate-900">
              {(meeting.department.faculty?.name || "Mühendislik ve Doğa Bilimleri Fakültesi").toUpperCase()} DEKANLIĞINA / MÜDÜRLÜĞÜNE
            </h4>
          </div>

          <div className="text-xs leading-relaxed text-justify space-y-4 font-serif text-slate-800">
            <p>
              Bölümümüz Bölüm Kurulu&apos;nun {new Intl.DateTimeFormat("tr-TR").format(new Date(meeting.scheduledDate))} tarihinde gerçekleştirdiği {meetingNoStr} sayılı olağan toplantısında müzakere edilerek karara bağlanan {meeting.items.filter((i: any) => i.isAcceptedToAgenda).length} (adet) karar metni ve ekli çizelgeleri ekte sunulmuştur.
            </p>
            <p>
              Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 ve ilgili mevzuat uyarınca alınan söz konusu kararların Fakülte/Yüksekokul Yönetim Kurulu&apos;nda görüşülerek onaylanması hususunu tensiplerinize saygılarımla arz ederim.
            </p>
          </div>

          <div className="mt-12 text-right font-sans">
            <p className="font-bold text-xs text-slate-900">
              {meeting.department.headTitle} {meeting.department.headName}
            </p>
            <p className="text-[11px] text-slate-500">Bölüm Başkanı</p>
            <p className="text-[10px] text-emerald-700 font-bold mt-1 bg-emerald-50 px-2 py-0.5 rounded inline-block border border-emerald-200">
              [ Güvenli Elektronik İmzalıdır ]
            </p>
          </div>

          <div className="mt-10 pt-4 border-t border-slate-200 text-xs font-sans text-slate-600">
            <p className="font-bold text-[11px] text-slate-800 mb-1">EKLER:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
              <li>Bölüm Kurulu Karar Tutanağı ({meetingNoStr} Sayılı, E-İmzalı)</li>
              <li>Ders Görevlendirme ve Dağılım Çizelgesi (Ek-1)</li>
              <li>Muafiyet ve İntibak Karşılaştırma Çizelgesi (Ek-2)</li>
              <li>Zorunlu Staj Onay Listesi (Ek-3)</li>
              <li>Sınav Takvimi ve Mazeret Çizelgesi (Ek-4)</li>
              <li>Komisyon ve Koordinatörlük Üye Listesi (Ek-5)</li>
            </ol>
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6 no-print">
          <button
            onClick={onPrevStep}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            ← Adım 5: Tutanak Önizlemeye Dön
          </button>

          <Link
            href="/"
            className="text-xs font-bold text-selcuk-blue hover:text-selcuk-dark px-4 py-2.5 rounded-xl border border-selcuk-blue/30 bg-selcuk-blue/5 hover:bg-selcuk-blue/10 transition-colors shadow-xs"
          >
            Toplantı Panosuna Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
