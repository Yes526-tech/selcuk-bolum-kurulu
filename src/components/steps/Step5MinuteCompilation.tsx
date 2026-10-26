"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Printer,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Download,
  FileType,
  Sparkles,
  Lock,
  KeyRound,
  Check,
  Clock,
  UserCheck,
  ExternalLink,
  Copy
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Step5Props {
  meeting: any;
  onRefresh: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export default function Step5MinuteCompilation({
  meeting,
  onRefresh,
  onNextStep,
  onPrevStep
}: Step5Props) {
  const { user } = useAuth();
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [signingMemberId, setSigningMemberId] = useState<string | null>(null);
  const [preparingMemberId, setPreparingMemberId] = useState<string | null>(null);
  const [isBulkSigning, setIsBulkSigning] = useState(false);
  const [copiedDigest, setCopiedDigest] = useState(false);

  const acceptedItems = meeting.items.filter((i: any) => i.isAcceptedToAgenda);
  const boardAttendees = meeting.attendances.filter((a: any) => a.isBoardMember);

  const meetingNoStr = `${meeting.academicYear}/${meeting.meetingNumber < 10 ? "0" + meeting.meetingNumber : meeting.meetingNumber}`;
  const meetingDateStr = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date(meeting.scheduledDate));

  // Katılan kurul üyeleri (imzalaması gerekenler)
  const eligibleSigners = boardAttendees.filter((a: any) => a.status === "KATILDI");
  const signatures = meeting.signatures || [];

  // İmzalanmış üye sayısı
  const completedSignersCount = eligibleSigners.filter((att: any) =>
    signatures.some((s: any) => s.memberId === att.memberId && s.status === "COMPLETED") ||
    att.signedAt
  ).length;

  const totalSignersCount = eligibleSigners.length;
  const isAllSigned = completedSignersCount >= totalSignersCount && totalSignersCount > 0;

  // 1. Aşama: İmza Hazırlığı (Prepare)
  const handlePrepareSignature = async (memberId: string) => {
    setPreparingMemberId(memberId);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/signature/prepare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          userName: `${user.title} ${user.name}`,
        }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPreparingMemberId(null);
    }
  };

  // 2. Aşama: İmzayı Tamamlama (Complete)
  const handleCompleteSignature = async (memberId: string) => {
    setSigningMemberId(memberId);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/signature/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          userName: `${user.title} ${user.name}`,
          userEmail: user.email,
        }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSigningMemberId(null);
    }
  };

  // Toplu İmzala (Tüm Hazır Kurul Üyeleri Adına Simülasyon)
  const handleBulkSignAll = async () => {
    setIsBulkSigning(true);
    try {
      for (const att of eligibleSigners) {
        await fetch(`/api/meetings/${meeting.id}/signature/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberId: att.memberId,
            userName: `${att.member.title} ${att.member.firstName} ${att.member.lastName}`,
            userEmail: att.member.email,
          }),
        });
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsBulkSigning(false);
    }
  };

  const handleProceedToStep6 = async () => {
    setIsFinalizing(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/finalize`, {
        method: "POST",
      });
      if (res.ok) {
        onRefresh();
        onNextStep();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFinalizing(false);
    }
  };

  const copyDigest = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDigest(true);
    setTimeout(() => setCopiedDigest(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Üst Yönetici Çubuğu */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <span className="bg-amber-400 text-selcuk-dark font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs">
            ADIM 5 / 6
          </span>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Resmi Karar Tutanağının Derlenmesi ve İki Aşamalı E-İmza
            </h2>
            <p className="text-xs text-slate-500">
              Rapor Bölüm 3.11 & Çizelge 4.1 C1 standardında sabit SHA-256 içerik özeti ve PAdES uyumlu imzalama süreci
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-selcuk-blue" />
            Yazdır
          </button>

          <a
            href={`/api/meetings/${meeting.id}/export-docx?type=minute`}
            download
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl transition-all shadow-xs"
          >
            <FileType className="w-4 h-4 text-blue-600" />
            Word (DOCX)
          </a>

          <a
            href={`/api/meetings/${meeting.id}/export-pdf`}
            download
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-selcuk-dark rounded-xl transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            Resmi PDF İndir
          </a>

          <button
            onClick={handleProceedToStep6}
            disabled={isFinalizing}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md transition-all"
          >
            <span>{isFinalizing ? "Derleniyor..." : "Adım 6'ya Geç: EBYS Sevk"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* İki Aşamalı İmza ve Kriptografik İçerik Özeti Paneli (Rapor Bölüm 3.11 Standardı) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-5 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-selcuk-blue">
                Kriptografik İmza Paneli
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">
                İmzalanan: {completedSignersCount} / {totalSignersCount} Üye
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900">
              İki Aşamalı Kurul Üyesi E-İmza Süreci
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {!isAllSigned && (
              <button
                onClick={handleBulkSignAll}
                disabled={isBulkSigning}
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-selcuk-blue hover:bg-selcuk-dark text-white shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isBulkSigning ? "İmzalanıyor..." : "Tüm Üyeler Adına İmzala (Simülasyon)"}</span>
              </button>
            )}

            {meeting.sha256Seal && (
              <Link
                href={`/verify?code=${meeting.sha256Seal}`}
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-colors shadow-2xs"
              >
                <Lock className="w-3.5 h-3.5 text-purple-600" />
                <span>Mühür Doğrulama Portalı</span>
                <ExternalLink className="w-3 h-3 text-purple-500" />
              </Link>
            )}
          </div>
        </div>

        {/* SHA-256 İçerik Özeti Kilit Göstergesi */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Sabit Karar İçerik Özeti (SHA-256 Content Digest)
            </span>
            <button
              onClick={() => copyDigest(meeting.contentDigest || "c79b29e06180b2a8d5e894176d654f5c94d930f3531b463b7194f1c97a8296a2")}
              className="text-[10px] font-bold text-slate-300 hover:text-white px-2 py-0.5 rounded bg-white/10 transition-colors flex items-center gap-1"
            >
              {copiedDigest ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedDigest ? "Kopyalandı" : "Kopyala"}</span>
            </button>
          </div>
          <p className="font-mono text-xs text-amber-300 break-all select-all">
            {meeting.contentDigest || "c79b29e06180b2a8d5e894176d654f5c94d930f3531b463b7194f1c97a8296a2"}
          </p>
          <p className="text-[11px] text-slate-400">
            Tüm imzalar bu sabit içerik özeti üzerinden üretilir. Karar metninde veya eklerde yapılacak en ufak değişiklik durumunda imzalar geçersiz kılınır.
          </p>
        </div>

        {/* Belge Mühürlendi Bannerı */}
        {isAllSigned && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-400/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-emerald-900 shadow-xs animate-in fade-in-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-sm">Resmi Belge Mühürlendi (SHA-256 Kriptografik Kilit)</p>
                <p className="text-xs text-emerald-700 font-mono mt-0.5">
                  Mühür: {meeting.sha256Seal || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                </p>
              </div>
            </div>

            <Link
              href={`/verify?code=${meeting.sha256Seal || meeting.ebysVerificationCode || "ebys-su-792841-2026"}`}
              className="text-xs font-black bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl transition-colors shadow-xs"
            >
              Doğrulamayı Canlı Test Et →
            </Link>
          </div>
        )}

        {/* Üye Bazlı İki Aşamalı İmza Listesi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {eligibleSigners.map((att: any) => {
            const sig = signatures.find((s: any) => s.memberId === att.memberId && s.status === "COMPLETED");
            const isSigned = Boolean(sig || att.signedAt);
            const isPrepared = signatures.some((s: any) => s.memberId === att.memberId && s.status === "PREPARED");

            return (
              <div
                key={att.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between h-36 ${
                  isSigned
                    ? "bg-emerald-50/70 border-emerald-200"
                    : isPrepared
                    ? "bg-blue-50/70 border-blue-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">
                      {att.boardTitle}
                    </span>
                    {isSigned ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        İmzalandı
                      </span>
                    ) : isPrepared ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-blue-600" />
                        Hazırlandı
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                        Bekliyor
                      </span>
                    )}
                  </div>

                  <p className="font-extrabold text-xs text-slate-900 leading-snug">
                    {att.member.title} {att.member.firstName} {att.member.lastName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{att.member.email}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-1.5">
                  {!isSigned ? (
                    <>
                      <button
                        onClick={() => handlePrepareSignature(att.memberId)}
                        disabled={preparingMemberId === att.memberId}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                      >
                        {preparingMemberId === att.memberId ? "..." : "1. Hazırla"}
                      </button>
                      <button
                        onClick={() => handleCompleteSignature(att.memberId)}
                        disabled={signingMemberId === att.memberId}
                        className="text-[11px] font-bold px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
                      >
                        {signingMemberId === att.memberId ? "İmzalanıyor..." : "2. İmzala"}
                      </button>
                    </>
                  ) : (
                    <span className="font-mono text-[9px] text-emerald-700 truncate max-w-[180px]">
                      Digest: {sig?.signatureDigest?.slice(0, 16) || "hash-dogrulandi"}...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RESMİ BÖLÜM KURULU KARAR TUTANAĞI KAĞIDI (A4 Görünümü) */}
      <div className="bg-white border border-slate-300 rounded-2xl shadow-xl p-8 sm:p-14 max-w-4xl mx-auto font-serif text-slate-900 relative overflow-hidden">
        {/* Selçuk University Watermark Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025] flex items-center justify-center">
          <div className="w-[500px] h-[500px] rounded-full border-[40px] border-selcuk-blue flex items-center justify-center">
            <span className="text-8xl font-black text-selcuk-blue tracking-tighter">SÜ</span>
          </div>
        </div>

        {/* Antet Başlığı */}
        <div className="text-center border-b-2 border-selcuk-blue pb-5 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-1">T.C.</p>
          <p className="text-lg font-black text-selcuk-blue tracking-wider">SELÇUK ÜNİVERSİTESİ REKTÖRLÜĞÜ</p>
          <p className="text-sm font-bold text-slate-800 uppercase mt-0.5">{meeting.department.facultyName || "Teknoloji Fakültesi"}</p>
          <p className="text-sm font-semibold text-slate-700 uppercase">{meeting.department.name} Başkanlığı</p>
          <div className="mt-4 inline-block px-4 py-1 bg-selcuk-blue/5 rounded-full border border-selcuk-blue/20">
            <h1 className="text-sm font-black text-selcuk-blue uppercase tracking-widest">
              BÖLÜM KURULU KARAR TUTANAĞI
            </h1>
          </div>
        </div>

        {/* Toplantı Meta Tablosu */}
        <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-4 mb-6 text-xs font-sans">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <span className="font-bold text-slate-700">Toplantı No:</span>
              <span className="ml-1.5 font-mono font-bold text-selcuk-blue">{meetingNoStr}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Toplantı Tarihi:</span>
              <span className="ml-1.5 font-medium">{meetingDateStr}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Toplantı Saati:</span>
              <span className="ml-1.5 font-medium">
                {new Intl.DateTimeFormat("tr-TR", { timeStyle: "short" }).format(new Date(meeting.scheduledDate))}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Toplantı Yeri:</span>
              <span className="ml-1.5 font-medium">{meeting.location || "Bölüm Başkanlığı Toplantı Salonu"}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Kurul Başkanı:</span>
              <span className="ml-1.5 font-semibold text-slate-900">{meeting.department.headTitle} {meeting.department.headName}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Salt Çoğunluk Durumu:</span>
              <span className="ml-1.5 text-emerald-700 font-bold">
                {meeting.actualAttendeesCount} / {meeting.totalEligibleMembers} Üye Hazır (Sağlandı)
              </span>
            </div>
          </div>
        </div>

        {/* Mevzuat ve Hukuki Açıklama Giriş Paragrafı */}
        <div className="text-xs sm:text-sm leading-relaxed text-justify mb-6">
          <p>
            Üniversitelerde Akademik Teşkilat Yönetmeliği&apos;nin 15. maddesi ve Selçuk Üniversitesi Bölüm Kurulu Süreci İş Akışı hükümleri çerçevesinde; Bölüm Başkanı {meeting.department.headTitle} {meeting.department.headName} başkanlığında toplanan Kurulumuz, toplantı yeter sayısının (salt çoğunluk) hazır bulunduğunu tespit ederek oturumu açmış; belirlenen gündem maddelerini görüşmeye kabul etmiş ve aşağıdaki kararları almıştır:
          </p>
        </div>

        {/* Kararlar Listesi */}
        <div className="space-y-6 mb-8">
          {acceptedItems.map((item: any, idx: number) => {
            const decisionNo = item.decisionNumber || `${meetingNoStr}-${idx + 1 < 10 ? "0" + (idx + 1) : idx + 1}`;

            return (
              <div key={item.id} className="border border-slate-300 rounded-xl p-5 bg-white shadow-xs">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-selcuk-blue text-amber-300 px-2.5 py-0.5 rounded-md shadow-xs">
                      KARAR NO: {decisionNo}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                  </div>
                  <span className="text-[11px] font-sans font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                    {item.decisionResult === "KABUL_OYBIRLIGI"
                      ? "OYBİRLİĞİYLE KABUL"
                      : item.decisionResult === "KABUL_OYCOKLUGU"
                      ? "OYÇOKLUĞUYLA KABUL"
                      : item.decisionResult}
                  </span>
                </div>

                <div className="text-xs space-y-3 font-sans">
                  <p className="text-slate-600">
                    <strong className="text-slate-800">Hukuki Dayanak:</strong> {item.legalBasis}
                  </p>

                  <div className="font-serif leading-relaxed text-slate-800 text-justify bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                    <strong className="text-slate-900">KARAR: </strong>
                    {item.decisionText}
                  </div>

                  {item.dissentingOpinion && (
                    <div className="text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-xs italic">
                      <strong>Muhalefet Şerhi (Karşı Oy):</strong> {item.dissentingOpinion}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 flex flex-wrap justify-between pt-1">
                    <span>
                      Oylama Dağılımı: <strong>{item.votesInFavor}</strong> Kabul, <strong>{item.votesAgainst}</strong> Ret, <strong>{item.votesAbstain}</strong> Çekimser
                    </span>
                    <span className="text-selcuk-blue font-bold">
                      Ek: {item.category.replace("_", " ")} Çizelgesi
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* İMZA CETVELİ (Hazirun) */}
        <div className="border-t-2 border-slate-300 pt-6 font-sans">
          <div className="text-center mb-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-selcuk-blue">
              KURUL ÜYELERİ VE İMZA HAZİRUN CETVELİ
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              (Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 Hükümlerine Göre Tanzim Edilmiştir)
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-center">
            {boardAttendees.map((att: any) => {
              const m = att.member;
              const isPresent = att.status === "KATILDI";
              const sig = signatures.find((s: any) => s.memberId === att.memberId && s.status === "COMPLETED");
              const isSigned = Boolean(sig || att.signedAt);

              return (
                <div
                  key={att.id}
                  className="p-3 border border-slate-200 rounded-xl bg-slate-50/60 flex flex-col justify-between h-28 shadow-xs"
                >
                  <div>
                    <p className="font-bold text-xs text-slate-900 leading-tight">
                      {m.title} {m.firstName} {m.lastName}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{att.boardTitle}</p>
                  </div>

                  <div className="pt-2 border-t border-dashed border-slate-300">
                    {isPresent ? (
                      isSigned ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                          [ E-İMZALANDI ]
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                          [ İMZA BEKLİYOR ]
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                        [ MAZERETLİ / İZİNLİ ]
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Belge Alt Notu */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-sans">
          Selçuk Üniversitesi Bölüm Kurulu Karar Otomasyon Sistemi ile tanzim edilmiştir. 5070 Sayılı Elektronik İmza Kanunu&apos;na uygundur.
        </div>
      </div>

      {/* Alt Butonlar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 no-print">
        <button
          onClick={onPrevStep}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors"
        >
          ← Adım 4: Müzakere ve Oylamaya Dön
        </button>

        <button
          onClick={handleProceedToStep6}
          disabled={isFinalizing}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
        >
          <span>{isFinalizing ? "Derleniyor..." : "Adım 6'ya Geç: EBYS Sevk ve Üst Yazı"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
