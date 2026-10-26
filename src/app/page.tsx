"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  FileCheck,
  AlertTriangle,
  Award,
  PlusCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Clock,
  Send,
  Building2,
  Inbox,
  Archive,
  Download,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  FileText
} from "lucide-react";
import { MeetingStatus } from "@prisma/client";

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalMeetings: 0,
    completedCount: 0,
    postponedCount: 0,
    activeCount: 0,
    totalDecisions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");

  const loadData = (deptId?: string) => {
    setLoading(true);
    const url = deptId ? `/api/meetings?departmentId=${deptId}` : `/api/meetings`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMeetings(data.meetings);
          setStats(data.stats);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const saved = localStorage.getItem("selected_dept_id") || "";
    setSelectedDeptId(saved);
    loadData(saved);

    const handleDeptChange = (e: any) => {
      const newId = e.detail?.deptId || "";
      setSelectedDeptId(newId);
      loadData(newId);
    };

    window.addEventListener("department_changed", handleDeptChange);
    return () => window.removeEventListener("department_changed", handleDeptChange);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CAGRI_YAPILDI":
        return {
          label: "1. Çağrı Yapıldı",
          color: "bg-blue-50 text-blue-800 border-blue-200",
          icon: Clock,
        };
      case "ERTELENDI":
        return {
          label: "2. Çoğunluk Yok - Ertelendi",
          color: "bg-red-50 text-red-800 border-red-200 font-bold",
          icon: AlertTriangle,
        };
      case "OTURUM_ACILDI":
        return {
          label: "3. Oturum Açık (Gündem Oylaması)",
          color: "bg-amber-50 text-amber-800 border-amber-200 font-bold",
          icon: Layers,
        };
      case "MADDELER_GORUSULUYOR":
        return {
          label: "4. Maddeler Müzakerede",
          color: "bg-purple-50 text-purple-800 border-purple-200 font-bold",
          icon: FileCheck,
        };
      case "TUTANAK_HAZIRLANDI":
        return {
          label: "5. Karar Tutanağı Derlendi",
          color: "bg-teal-50 text-teal-800 border-teal-200 font-bold",
          icon: FileCheck,
        };
      case "EBYS_SEVK_EDILDI":
        return {
          label: "6. EBYS ile Sevk Edildi",
          color: "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold",
          icon: Send,
        };
      default:
        return {
          label: status,
          color: "bg-slate-100 text-slate-800 border-slate-200",
          icon: Clock,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Üst Kurumsal Karşılama ve Mevzuat Bannerı */}
      <div className="bg-gradient-to-r from-selcuk-dark via-selcuk-blue to-selcuk-navy text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-selcuk-turquoise/30 relative overflow-hidden">
        {/* Dekoratif Arka Plan Işıkları */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-selcuk-turquoise/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl -mb-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-selcuk-dark font-extrabold text-[11px] px-3 py-1 rounded-full shadow-xs tracking-wider">
                T.C. SELÇUK ÜNİVERSİTESİ
              </span>
              <span className="bg-selcuk-turquoise/20 text-selcuk-turquoise font-semibold text-xs px-2.5 py-0.5 rounded-full border border-selcuk-turquoise/30">
                EBYS & Madde 15 Entegrasyonu
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Bölüm Kurulu Süreci ve Karar Yönetim Sistemi
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 (Tek/Çok ABD Ayrımı) ve Selçuk Üniversitesi Bölüm Kurulu Süreci İş Akışı 6 ana adımı doğrultusunda tanzim edilmiş resmi karar otomasyon platformu.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-shrink-0">
            <Link
              href="/meetings/new"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-selcuk-dark font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-amber-950/30 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Yeni Toplantı Başlat</span>
            </Link>

            <Link
              href="/agenda-pool"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs px-4 py-3 rounded-2xl border border-white/20 transition-all backdrop-blur-xs"
            >
              <Inbox className="w-4 h-4 text-amber-300" />
              <span>Talep Havuzu</span>
            </Link>

            <Link
              href="/archive"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs px-4 py-3 rounded-2xl border border-white/20 transition-all backdrop-blur-xs"
            >
              <Archive className="w-4 h-4 text-selcuk-turquoise" />
              <span>Karar Arşivi</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Metrik Göstergeleri */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Toplam Toplantı</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalMeetings}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Kayıtlı kurul toplantısı</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">EBYS Sevk</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.completedCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Dekanlığa iletildi</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Aktif Oturum</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-amber-600">{stats.activeCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Gündem / müzakerede</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Ertelenen</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-rose-600">{stats.postponedCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Salt çoğunluk yok</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-selcuk-blue uppercase tracking-wider">Alınan Karar</span>
            <div className="w-8 h-8 rounded-xl bg-selcuk-blue/10 text-selcuk-blue flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-selcuk-blue">{stats.totalDecisions}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">5 standart kategoride</p>
          </div>
        </div>
      </div>

      {/* 3. 6 Aşamalı İş Akışı ve Mevzuat Bilgilendirme Çubuğu */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-selcuk-blue/10 text-selcuk-blue">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Selçuk Üniversitesi Bölüm Kurulu Süreci 6 Ana Adımı
            </h3>
          </div>
          <Link href="/legislation" className="text-xs font-bold text-selcuk-blue hover:text-selcuk-turquoise transition flex items-center gap-1">
            <span>Mevzuat ve Hukuki Temel Rehberi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
          <div className="p-3 bg-slate-50/70 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 transition flex flex-col justify-between">
            <div>
              <span className="w-5 h-5 rounded-full bg-selcuk-blue text-white font-extrabold text-[10px] flex items-center justify-center mb-1.5">1</span>
              <span className="font-bold text-slate-900 block text-xs">Gündem & Çağrı</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">Tarih, saat ve maddelerin resmi tebliği.</p>
            </div>
          </div>
          <div className="p-3 bg-slate-50/70 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 transition flex flex-col justify-between">
            <div>
              <span className="w-5 h-5 rounded-full bg-selcuk-blue text-white font-extrabold text-[10px] flex items-center justify-center mb-1.5">2</span>
              <span className="font-bold text-slate-900 block text-xs">Yeter Sayı & Hazirun</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">İzinliler düşülmüş salt çoğunluk kontrolü.</p>
            </div>
          </div>
          <div className="p-3 bg-slate-50/70 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 transition flex flex-col justify-between">
            <div>
              <span className="w-5 h-5 rounded-full bg-selcuk-blue text-white font-extrabold text-[10px] flex items-center justify-center mb-1.5">3</span>
              <span className="font-bold text-slate-900 block text-xs">Gündem Oylaması</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">Gündem kabulü ve madde eleme.</p>
            </div>
          </div>
          <div className="p-3 bg-slate-50/70 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 transition flex flex-col justify-between">
            <div>
              <span className="w-5 h-5 rounded-full bg-selcuk-blue text-white font-extrabold text-[10px] flex items-center justify-center mb-1.5">4</span>
              <span className="font-bold text-slate-900 block text-xs">Müzakere & Karar</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">5 standart şablonla oylama & muhalefet şerhi.</p>
            </div>
          </div>
          <div className="p-3 bg-slate-50/70 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 transition flex flex-col justify-between">
            <div>
              <span className="w-5 h-5 rounded-full bg-selcuk-blue text-white font-extrabold text-[10px] flex items-center justify-center mb-1.5">5</span>
              <span className="font-bold text-slate-900 block text-xs">Tutanak Derleme</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">Word (DOCX) ve PDF resmi tutanak.</p>
            </div>
          </div>
          <div className="p-3 bg-slate-50/70 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 transition flex flex-col justify-between">
            <div>
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center mb-1.5">6</span>
              <span className="font-bold text-slate-900 block text-xs">EBYS Sevk</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">Dekanlığa üst yazı & karekodlu arşiv.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Toplantılar Listesi */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Bölüm Kurulu Toplantıları</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Akademik yıl ve döneme göre kayıtlı resmi kurul toplantıları
            </p>
          </div>

          <Link
            href="/meetings/new"
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-selcuk-blue hover:bg-selcuk-navy text-white rounded-xl transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Yeni Toplantı Başlat</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Toplantılar yükleniyor...</div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">Seçilen bölümde kayıtlı toplantı bulunamadı.</p>
            <Link
              href="/meetings/new"
              className="inline-block mt-2 text-xs font-bold text-selcuk-blue hover:underline"
            >
              İlk Toplantıyı Başlat →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => {
              const statusInfo = getStatusBadge(meeting.status);
              const StatusIcon = statusInfo.icon;
              const dateFormatted = new Intl.DateTimeFormat("tr-TR", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(meeting.scheduledDate));
              const meetingNoStr = `${meeting.academicYear}/${meeting.meetingNumber < 10 ? "0" + meeting.meetingNumber : meeting.meetingNumber}`;

              return (
                <div
                  key={meeting.id}
                  className="p-5 bg-white hover:bg-slate-50/90 border border-slate-200/80 rounded-2xl transition-all card-hover flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-selcuk-blue to-selcuk-navy text-amber-300 font-black text-sm flex flex-col items-center justify-center flex-shrink-0 shadow-xs border border-white/10">
                      <span className="text-[9px] uppercase tracking-wider text-slate-300 font-sans">NO</span>
                      <span>{meetingNoStr.split("/")[1] || "01"}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-selcuk-blue">
                          Toplantı No: {meetingNoStr}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 font-semibold">{meeting.term} Yarıyılı</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-700 font-semibold">{meeting.department.name}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                        {meeting.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-selcuk-blue" />
                          <span>{dateFormatted}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600 truncate max-w-xs">{meeting.location}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {meeting.items.length} Gündem Maddesi
                        </span>
                        <span className="text-slate-300">•</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            meeting.isQuorumMet
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-red-50 text-red-800 border border-red-200"
                          }`}
                        >
                          Hazirun: {meeting.actualAttendeesCount}/{meeting.totalEligibleMembers} Üye ({meeting.isQuorumMet ? "Çoğunluk Sağlandı" : "Yetersiz"})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border ${statusInfo.color}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusInfo.label}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/api/meetings/${meeting.id}/export-docx?type=minute`}
                        download
                        className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl border border-slate-200 transition"
                        title="Word (DOCX) Tutanağı İndir"
                      >
                        <FileText className="w-4 h-4" />
                      </a>

                      <Link
                        href={`/meetings/${meeting.id}`}
                        className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-selcuk-blue hover:bg-selcuk-navy text-white transition-all shadow-xs"
                      >
                        <span>Süreci Yönet</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
