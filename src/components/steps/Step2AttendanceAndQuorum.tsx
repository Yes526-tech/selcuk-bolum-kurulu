"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  ShieldCheck,
  FileText,
  ArrowRight,
  Download,
  Users,
  CheckCheck,
  UserCheck,
  Building
} from "lucide-react";
import { AttendanceStatus } from "@prisma/client";

interface Step2Props {
  meeting: any;
  onRefresh: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export default function Step2AttendanceAndQuorum({
  meeting,
  onRefresh,
  onNextStep,
  onPrevStep
}: Step2Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [postponeModalOpen, setPostponeModalOpen] = useState(false);
  const [postponeDate, setPostponeDate] = useState("");
  const [postponeReason, setPostponeReason] = useState("");
  const [postponeMinute, setPostponeMinute] = useState("");
  const [excuseModalMember, setExcuseModalMember] = useState<any>(null);
  const [tempExcuseReason, setTempExcuseReason] = useState("");

  const boardAttendances = meeting.attendances.filter((a: any) => a.isBoardMember);
  const nonBoardAttendances = meeting.attendances.filter((a: any) => !a.isBoardMember);

  // İzinli / Görevli Üyeler (Madde 15 uyarınca nisap tamsayısından otomatik düşülür)
  const onLeaveBoardAttendances = boardAttendances.filter((a: any) => a.member?.onLeave);
  const activeBoardAttendances = boardAttendances.filter((a: any) => !a.member?.onLeave);

  const totalEligible = activeBoardAttendances.length; // N - L
  const presentCount = activeBoardAttendances.filter((a: any) => a.status === AttendanceStatus.KATILDI).length;
  const excusedCount = activeBoardAttendances.filter((a: any) => a.status === AttendanceStatus.MAZERETLI).length + onLeaveBoardAttendances.length;
  const absentCount = activeBoardAttendances.filter((a: any) => a.status === AttendanceStatus.KATILMADI).length;

  const quorumRequired = Math.floor(totalEligible / 2) + 1;
  const isQuorumMet = presentCount >= quorumRequired;
  const quorumPercent = totalEligible > 0 ? Math.round((presentCount / totalEligible) * 100) : 0;

  // Tablo 3.4 Kuralı: Kararda tam olarak bir başkan bulunmalı, başkan katılmıyorsa oylama tamamlanamaz / açılamaz
  const chairmanAttendance = boardAttendances.find(
    (a: any) =>
      a.member?.role === "BOLUM_BASKANI" ||
      a.boardTitle?.toLowerCase().includes("bölüm başkanı") ||
      a.boardTitle?.toLowerCase().includes("kurul başkanı")
  );
  const isChairmanPresent = chairmanAttendance ? chairmanAttendance.status === AttendanceStatus.KATILDI : true;

  // Katılım Durumunu Değiştirme
  const handleStatusChange = async (memberId: string, status: AttendanceStatus, excuseReason?: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          status,
          excuseReason: excuseReason || null,
        }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Toplu Katıldı İşaretleme
  const handleMarkAllPresent = async () => {
    setIsUpdating(true);
    try {
      for (const att of activeBoardAttendances) {
        if (att.status !== AttendanceStatus.KATILDI) {
          await fetch(`/api/meetings/${meeting.id}/attendance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              memberId: att.member.id,
              status: AttendanceStatus.KATILDI,
              excuseReason: null,
            }),
          });
        }
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Erteleme İşlemi (Quorum sağlanamadığında)
  const handlePostponeMeeting = async () => {
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/postpone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postponedToDate: postponeDate ? new Date(postponeDate) : undefined,
          customReason: postponeReason || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPostponeMinute(data.minuteDoc);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProceedToStep3 = async () => {
    if (!isQuorumMet) {
      alert("Toplantı yeter sayısı (salt çoğunluk) sağlanamadığından gündem oylamasına geçilemez! Toplantıyı erteleyiniz.");
      return;
    }

    if (chairmanAttendance && !isChairmanPresent) {
      alert("Yönetmelik ve Sistem Kuralları (Tablo 3.4) gereğince: Kararda tam olarak bir kurul başkanı bulunmalıdır. Kurul Başkanı hazır bulunmadan gündem görüşmelerine ve oylamaya geçilemez!");
      return;
    }

    try {
      const res = await fetch(`/api/meetings/${meeting.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: 3,
          status: "OTURUM_ACILDI"
        }),
      });
      if (res.ok) {
        onNextStep();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isMultiUnit = meeting.department.departmentType === "COK_ANABILIM_DALI";

  return (
    <div className="space-y-6">
      {/* Üst Bilgi Başlığı ve Yönetmelik Uyarısı */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-selcuk-dark font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                ADIM 2 / 6
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Hazirun ve Toplantı Yeter Sayısı (Salt Çoğunluk) Kontrolü
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Selçuk Üniversitesi Bölüm Kurulu Süreci: Katılım tutanağı üzerinden salt çoğunluğu otomatik hesaplama ve çoğunluk sağlanamadığında toplantıyı ileri bir tarihe erteleme
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-xs ${
                isMultiUnit
                  ? "bg-purple-50 text-purple-800 border-purple-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-selcuk-turquoise" />
              {isMultiUnit ? "Çok Anabilim Dallı Bölüm (Madde 15/2)" : "Tek Anabilim Dallı Bölüm (Madde 15/1)"}
            </span>
          </div>
        </div>

        {/* Mevzuat Bilgilendirme Notu */}
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed mb-6">
          <strong className="text-selcuk-blue font-bold">Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 Hükmü: </strong>
          {isMultiUnit ? (
            <span>
              Birden fazla anabilim dalı bulunan bölümlerde kurul üyesi; <strong>Bölüm Başkanı, Bölüm Başkan Yardımcıları ile Anabilim Dalı Başkanları</strong>dır.
              Diğer öğretim elemanları oy hakkı bulunmayan kurul dışı statüdedir. İzinli/görevli üyeler nisap tamsayısından otomatik düşülür.
            </span>
          ) : (
            <span>
              Tek anabilim dalı bulunan bölümlerde kurul üyesi; <strong>Bölüm Başkanının başkanlığında TÜM öğretim üyeleri ve öğretim görevlileri</strong>dir.
              İzinli/görevli üyeler nisap tamsayısından otomatik düşülür.
            </span>
          )}
        </div>

        {/* Canlı Salt Çoğunluk Barı ve Metrikler */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kurul Üye Tamsayısı</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{totalEligible} Üye</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {onLeaveBoardAttendances.length > 0 ? `(${onLeaveBoardAttendances.length} üye izinli/görevli düşüldü)` : "Tüm üyeler aktif"}
            </p>
          </div>

          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gereken Salt Çoğunluk</p>
            <p className="text-2xl font-black text-selcuk-blue mt-1">
              {quorumRequired} Üye
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Q = ⌊N / 2⌋ + 1 eşiği</p>
          </div>

          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hazır Bulunan Üye</p>
            <p className={`text-2xl font-black mt-1 ${isQuorumMet ? "text-emerald-600" : "text-rose-600"}`}>
              {presentCount} Üye
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {excusedCount} Mazeretli, {absentCount} Katılmadı
            </p>
          </div>

          <div className={`p-4 rounded-xl border shadow-xs transition-all ${
            isQuorumMet ? "bg-emerald-50/80 border-emerald-200" : "bg-rose-50/80 border-rose-200"
          }`}>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Yeter Sayı Durumu</p>
            <p className={`text-sm font-black mt-1 flex items-center gap-1.5 ${isQuorumMet ? "text-emerald-700" : "text-rose-700"}`}>
              {isQuorumMet ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
              {isQuorumMet ? "Salt Çoğunluk Sağlandı" : "Yeter Sayı Sağlanamadı!"}
            </p>
            <p className="text-[11px] mt-1 text-slate-600 leading-tight">
              {isQuorumMet
                ? "Oturum açılabilir, gündem oylamasına geçilebilir."
                : `En az ${quorumRequired - presentCount} üye daha gereklidir. Toplantı ertelenmelidir.`}
            </p>
          </div>
        </div>

        {/* Görsel Çoğunluk İlerleme Çubuğu */}
        <div className="mb-6 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs mb-2 font-semibold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-selcuk-blue" />
              Katılım Oranı: %{quorumPercent} ({presentCount}/{totalEligible})
            </span>
            <span className={isQuorumMet ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}>
              Yasal Eşik: En az {quorumRequired} üye (%{totalEligible > 0 ? Math.round((quorumRequired / totalEligible) * 100) : 0})
            </span>
          </div>
          <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isQuorumMet ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-rose-500 to-red-500"
              }`}
              style={{ width: `${Math.min(quorumPercent, 100)}%` }}
            />
            {/* Eşik Çizgisi */}
            {totalEligible > 0 && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-slate-900 shadow-sm"
                style={{ left: `${(quorumRequired / totalEligible) * 100}%` }}
                title={`Salt Çoğunluk Eşiği: ${quorumRequired} üye`}
              />
            )}
          </div>
        </div>

        {/* Çoğunluk Sağlanamadığında Erteleme Uyarısı ve Butonu */}
        {!isQuorumMet && (
          <div className="p-4 bg-rose-50/90 border border-rose-300 rounded-xl mb-6 flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-900">
                  Toplantı Yeter Sayısı (Salt Çoğunluk) Sağlanamamıştır!
                </p>
                <p className="text-xs text-rose-700 mt-0.5">
                  Selçuk Üniversitesi Bölüm Kurulu Süreci gereği, salt çoğunluk bulunmaksızın toplantı açılamaz. Toplantı ertelenmeli ve Erteleme Tutanağı tanzim edilmelidir.
                </p>
              </div>
            </div>

            <button
              onClick={() => setPostponeModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <Calendar className="w-4 h-4" />
              Toplantıyı İleri Bir Tarihe Ertele
            </button>
          </div>
        )}

        {/* Tablo 3.4 Kuralı: Kurul Başkanı Katılım Kontrolü */}
        {isQuorumMet && chairmanAttendance && !isChairmanPresent && (
          <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl mb-6 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                Kurul Başkanı Hazır Bulunmalıdır! (Tablo 3.4 Kuralı)
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Mevzuat ve karar sistemi kuralları gereğince kurulda tam olarak bir başkan bulunmalıdır. {chairmanAttendance.member?.title} {chairmanAttendance.member?.firstName} {chairmanAttendance.member?.lastName} &quot;Katıldı&quot; olarak işaretlenmeden oturum açılamaz ve oylamaya geçilemez.
              </p>
            </div>
          </div>
        )}

        {/* Ertelenmiş Toplantı Belgesi Varsa Göster */}
        {meeting.postponedMinuteDoc && (
          <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-700" />
                Resmi Toplantı Yetersizliği ve Erteleme Tutanağı
              </span>
              <span className="text-xs font-semibold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-md">
                Ertelendi: {meeting.postponedToDate ? new Intl.DateTimeFormat("tr-TR").format(new Date(meeting.postponedToDate)) : ""}
              </span>
            </div>
            <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap bg-white p-3.5 rounded-lg border border-amber-200">
              {meeting.postponedMinuteDoc}
            </pre>
          </div>
        )}

        {/* 1. Asıl Kurul Üyeleri Hazirun Tablosu */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Kurul Üyeleri Katılım Cetveli (Hazirun)</span>
                <span className="text-xs bg-selcuk-blue text-white px-2.5 py-0.5 rounded-full font-mono font-bold shadow-xs">
                  {boardAttendances.length} Asıl Üye
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg transition-all shadow-xs"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                Tümünü Katıldı İşaretle
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Öğretim Elemanı</th>
                  <th className="p-3">Kurul Üyeliği Sıfatı</th>
                  <th className="p-3">Anabilim Dalı</th>
                  <th className="p-3 text-center">Katılım Durumu</th>
                  <th className="p-3">Mazeret / Not</th>
                  <th className="p-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 bg-white">
                {boardAttendances.map((att: any) => {
                  const m = att.member;
                  const isMemberOnLeave = m?.onLeave;

                  return (
                    <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{m.title} {m.firstName} {m.lastName}</span>
                              {isMemberOnLeave && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  İzinli / Görevli
                                </span>
                              )}
                            </div>
                            <span className="block text-[11px] text-slate-400 font-normal">{m.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 font-medium px-2 py-0.5 rounded-md border border-slate-200">
                          {att.boardTitle}
                        </span>
                      </td>

                      <td className="p-3 text-slate-600">
                        {m.academicUnit?.name || "Bölüm Geneli"}
                      </td>

                      <td className="p-3 text-center">
                        {att.status === AttendanceStatus.KATILDI ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Katıldı
                          </span>
                        ) : att.status === AttendanceStatus.MAZERETLI ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md font-bold text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Mazeretli
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md font-bold text-[11px]">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Katılmadı
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-slate-600 italic">
                        {att.excuseReason || "-"}
                      </td>

                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(m.id, AttendanceStatus.KATILDI)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                              att.status === AttendanceStatus.KATILDI
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-emerald-700"
                            }`}
                          >
                            Katıldı
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setExcuseModalMember(att);
                              setTempExcuseReason(att.excuseReason || "");
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                              att.status === AttendanceStatus.MAZERETLI
                                ? "bg-amber-500 text-white shadow-xs"
                                : "text-slate-600 hover:text-amber-700"
                            }`}
                          >
                            Mazeretli
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(m.id, AttendanceStatus.KATILMADI)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                              att.status === AttendanceStatus.KATILMADI
                                ? "bg-rose-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-rose-700"
                            }`}
                          >
                            Katılmadı
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Kurul Dışı Öğretim Elemanları (Varsa Bilgilendirme Amaçlı) */}
        {nonBoardAttendances.length > 0 && (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Bölümdeki Diğer Öğretim Elemanları (Kurul Dışı / Oy Hakkı Yok)
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Çok ABD&apos;li bölümlerde Yön. Md. 15 gereğince kurul üyesi sayılmazlar
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {nonBoardAttendances.map((att: any) => (
                <div key={att.id} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs shadow-xs">
                  <p className="font-semibold text-slate-800">
                    {att.member.title} {att.member.firstName} {att.member.lastName}
                  </p>
                  <p className="text-[11px] text-slate-500">{att.member.academicUnit?.name || "Öğretim Elemanı"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Butonlar: Geri ve İleri */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            onClick={onPrevStep}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            ← Adım 1: Çağrı ve Gündeme Dön
          </button>

          <button
            onClick={handleProceedToStep3}
            disabled={!isQuorumMet || (!!chairmanAttendance && !isChairmanPresent)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Adım 3&apos;e Geç: Gündem Oylaması ve Madde Çıkarma</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mazeret Giriş Modalı */}
      {excuseModalMember && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Mazeret Gerekçesi Girin</h4>
            <p className="text-xs text-slate-500 mb-4">
              {excuseModalMember.member.title} {excuseModalMember.member.firstName} {excuseModalMember.member.lastName}
            </p>

            <textarea
              value={tempExcuseReason}
              onChange={(e) => setTempExcuseReason(e.target.value)}
              placeholder="Örn: YÖK / TÜBİTAK resmi görevlendirmesi, izinli veya sağlık raporu..."
              rows={3}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-selcuk-blue mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setExcuseModalMember(null)}
                className="text-xs font-bold px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  handleStatusChange(excuseModalMember.member.id, AttendanceStatus.MAZERETLI, tempExcuseReason);
                  setExcuseModalMember(null);
                }}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors"
              >
                Mazereti Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toplantı Erteleme Modalı */}
      {postponeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center gap-2.5 text-rose-600 mb-2">
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900">Toplantıyı İleri Bir Tarihe Ertele</h4>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Salt çoğunluk sağlanamadığı için Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 ve Selçuk Üniversitesi Bölüm Kurulu Süreci uyarınca resmi Erteleme Tutanağı oluşturulacaktır.
            </p>

            <div className="space-y-3.5 mb-5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ertelenen Yeni Toplantı Tarihi ve Saati
                </label>
                <input
                  type="datetime-local"
                  value={postponeDate}
                  onChange={(e) => setPostponeDate(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-selcuk-blue"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Özel Erteleme Gerekçesi (İsteğe Bağlı)
                </label>
                <textarea
                  value={postponeReason}
                  onChange={(e) => setPostponeReason(e.target.value)}
                  placeholder="Üye mazeretleri ve yetersizlik açıklaması..."
                  rows={2}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-selcuk-blue"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPostponeModalOpen(false)}
                className="text-xs font-bold px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  handlePostponeMeeting();
                  setPostponeModalOpen(false);
                }}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Erteleme Tutanağını Tanzim Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
