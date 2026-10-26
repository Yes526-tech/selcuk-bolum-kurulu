"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Building2,
  Download,
  ExternalLink,
  QrCode,
  Lock,
  Clock,
  UserCheck,
  Paperclip,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  Scale
} from "lucide-react";

function VerifyPortalContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || searchParams.get("kod") || "";

  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const performVerification = async (verifyCode: string) => {
    if (!verifyCode.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/verify?code=${encodeURIComponent(verifyCode.trim())}`);
      const data = await res.json();
      if (data.success && data.isVerified) {
        setResult(data);
      } else {
        setError(data.message || data.error || "Girilen koda ait doğrulanabilir resmi kurul kararı bulunamadı.");
      }
    } catch (err: any) {
      setError("Doğrulama sunucusuna bağlanırken bir hata oluştu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      performVerification(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(code);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickSamples = [
    { label: "Örnek EBYS Kodu", val: "ebys-su-792841-2026" },
    { label: "Örnek Evrak No", val: "E-64134190-302.01.05-185420" },
    { label: "Örnek SHA-256", val: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 sm:py-8">
      {/* Üst Başlık Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-selcuk-blue to-selcuk-dark text-amber-300 shadow-xl ring-4 ring-amber-400/20 mb-1">
          <ShieldCheck className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Resmi Belge ve EBYS Karar Doğrulama Portalı
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Selçuk Üniversitesi Bölüm ve Anabilim Dalı Kurullarınca alınan kararların, katılımcı hazirun cetvellerinin ve SHA-256 kriptografik belge bütünlüğünün kamuya açık resmi doğrulama ekranı.
        </p>
      </div>

      {/* Arama / Kod Giriş Kutusu */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Doğrulama Kodu, EBYS Evrak Numarası veya SHA-256 Belge Özeti
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Örn: ebys-su-792841-2026 veya E-64134190-302.01.05-185420"
                className="w-full px-4 py-3.5 text-sm border border-slate-300 rounded-2xl focus:ring-2 focus:ring-selcuk-blue focus:outline-none shadow-xs font-mono font-medium text-slate-900"
              />
              <Search className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="inline-flex items-center justify-center gap-2 bg-selcuk-blue hover:bg-selcuk-dark disabled:bg-slate-300 text-white font-extrabold text-sm px-7 py-3.5 rounded-2xl shadow-md transition-all flex-shrink-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sorgulanıyor...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Belgeyi Doğrula</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Hızlı Test Örnekleri */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span className="font-semibold text-slate-400">Hızlı Test:</span>
          {quickSamples.map((samp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCode(samp.val);
                performVerification(samp.val);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono text-[11px] transition-colors"
            >
              {samp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hata Bildirimi */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-800 flex items-start gap-3.5 shadow-xs">
          <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-extrabold text-sm text-rose-900">Belge Doğrulanamadı</h3>
            <p className="text-xs text-rose-700 mt-1">{error}</p>
            <p className="text-[11px] text-rose-600 mt-2">
              Lütfen girdiğiniz doğrulama kodunun veya EBYS evrak numarasının doğruluğundan emin olunuz. Karar henüz kurul başkanı veya üyelerce kesinleştirilmemiş olabilir.
            </p>
          </div>
        </div>
      )}

      {/* Doğrulama Başarılı Sonuç Sertifikası */}
      {result && result.certificate && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500/40 shadow-2xl overflow-hidden space-y-6 animate-in fade-in-50 zoom-in-95">
          {/* Sertifika Üst Şeridi */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-selcuk-dark text-white p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg flex-shrink-0">
                  <CheckCircle2 className="w-9 h-9 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-400 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      Resmi Onaylı & Doğrulanmış Belge
                    </span>
                    <span className="text-emerald-200 font-mono text-xs">
                      {result.matchedBy}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {result.certificate.institution}
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                    {result.certificate.faculty} • {result.certificate.department}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold block">
                  Doğrulama Zamanı
                </span>
                <span className="font-mono text-xs text-white font-semibold">
                  {new Date(result.verificationTimestamp).toLocaleString("tr-TR")}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Temel Bilgiler Izgarası */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Toplantı & Karar No
                </span>
                <p className="font-mono font-extrabold text-sm text-slate-900">
                  #{result.certificate.meetingNumber}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{result.certificate.title}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  EBYS Evrak Numarası
                </span>
                <p className="font-mono font-bold text-xs text-selcuk-blue break-all">
                  {result.certificate.ebysDocumentNo || "Oluşturulmadı"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Kod: {result.certificate.ebysVerificationCode}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Toplantı Tarihi & Saati
                </span>
                <p className="font-bold text-xs text-slate-900">
                  {new Date(result.certificate.scheduledDate).toLocaleDateString("tr-TR", { dateStyle: "long" })}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Yer: {result.certificate.location}
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                  Salt Çoğunluk Durumu
                </span>
                <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {result.certificate.quorumInfo.attendees} / {result.certificate.quorumInfo.totalEligible} Üye Hazır
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  (Gereken Nisap: {result.certificate.quorumInfo.requiredQuorum})
                </p>
              </div>
            </div>

            {/* SHA-256 Kriptografik Belge Mührü */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    SHA-256 Kriptografik Belge Mührü
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(result.certificate.sha256Seal)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Kopyalandı" : "Özeti Kopyala"}</span>
                </button>
              </div>
              <p className="font-mono text-xs text-amber-300 break-all select-all leading-relaxed">
                {result.certificate.sha256Seal}
              </p>
              <p className="text-[11px] text-slate-400">
                Bu kriptografik mühür, toplantıda alınan kararların, katılım cetvelinin ve ek dosyaların kurul toplantısı sonrasında hiçbir şekilde tahrif edilmediğini garanti eder.
              </p>
            </div>

            {/* Alınan Kararlar Listesi */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-selcuk-blue" />
                <span>Toplantıda Alınan Kararlar ({result.certificate.items.length})</span>
              </h3>

              <div className="space-y-3">
                {result.certificate.items.map((it: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-colors space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-selcuk-blue text-white px-2 py-0.5 rounded-md">
                          {it.decisionNumber}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{it.title}</h4>
                      </div>
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {it.result} ({it.votes.favor} Kabul, {it.votes.against} Ret)
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium">Dayanak: {it.legalBasis}</p>
                    {it.dissentingOpinion && (
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                        <span className="font-bold">Muhalefet Şerhi:</span> {it.dissentingOpinion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* İmzacı Hazirun Listesi */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-selcuk-blue" />
                <span>Hazirun ve İmzacı Kurul Üyeleri</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {result.certificate.signers.map((sig: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                        {sig.boardTitle}
                      </span>
                      {sig.isSigned ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          İmzalandı
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                          {sig.status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-900">
                      {sig.title} {sig.name}
                    </p>
                    {sig.signedAt && (
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(sig.signedAt).toLocaleString("tr-TR")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Ek Dosyalar */}
            {result.certificate.attachments?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-selcuk-blue" />
                  <span>Onaylanan Ek Dosyalar ve Bütünlük Özetleri</span>
                </h3>

                <div className="space-y-2">
                  {result.certificate.attachments.map((att: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-selcuk-blue flex-shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{att.originalName}</p>
                          <p className="font-mono text-[10px] text-slate-400 break-all">
                            SHA-256: {att.sha256Hash}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Bütünlük Doğrulandı ✓
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-selcuk-blue border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyPortalContent />
    </Suspense>
  );
}
