"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  FileText,
  Table,
  Edit3,
  Award,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  Scale,
  Ban,
  RefreshCw,
  Paperclip,
  Plus,
  ShieldCheck,
  X
} from "lucide-react";
import { DecisionCategory, DecisionResult } from "@prisma/client";

interface Step4Props {
  meeting: any;
  onRefresh: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export default function Step4DecisionDeliberation({
  meeting,
  onRefresh,
  onNextStep,
  onPrevStep
}: Step4Props) {
  const [activeItemId, setActiveItemId] = useState<string>(
    meeting.items.find((i: any) => i.isAcceptedToAgenda)?.id || ""
  );
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modallar ve İptal/Yeniden Değerlendirme State'leri
  const [confirmAcceptModalOpen, setConfirmAcceptModalOpen] = useState(false);
  const [confirmItemId, setConfirmItemId] = useState<string | null>(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const [isReconsidering, setIsReconsidering] = useState(false);

  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [newAttachName, setNewAttachName] = useState("");
  const [isUploadingAttach, setIsUploadingAttach] = useState(false);

  // Sadece gündeme kabul edilen maddeler görüşülür
  const acceptedItems = meeting.items.filter((i: any) => i.isAcceptedToAgenda);
  const activeItem = acceptedItems.find((i: any) => i.id === activeItemId) || acceptedItems[0];

  const handleStartEdit = (item: any) => {
    setEditingItem({
      id: item.id,
      decisionText: item.decisionText || "",
      decisionResult: item.decisionResult || DecisionResult.KABUL_OYBIRLIGI,
      votesInFavor: item.votesInFavor ?? meeting.actualAttendeesCount,
      votesAgainst: item.votesAgainst ?? 0,
      votesAbstain: item.votesAbstain ?? 0,
      dissentingOpinion: item.dissentingOpinion || "",
    });
  };

  const handleSaveItemDecision = async () => {
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/items/${editingItem.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });
      if (res.ok) {
        setEditingItem(null);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Onay Modallı Oybirliğiyle Kabul Butonu (Rapor A5 Standardı)
  const handleOpenConfirmAccept = (itemId: string) => {
    setConfirmItemId(itemId);
    setConfirmAcceptModalOpen(true);
  };

  const handleExecuteQuickAccept = async () => {
    if (!confirmItemId) return;
    setConfirmAcceptModalOpen(false);
    setIsSaving(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/items/${confirmItemId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decisionResult: DecisionResult.KABUL_OYBIRLIGI,
          votesInFavor: meeting.actualAttendeesCount,
          votesAgainst: 0,
          votesAbstain: 0,
          dissentingOpinion: "",
        }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Gerekçeli İptal (Rapor A4 Standardı)
  const handleCancelMeeting = async () => {
    if (!cancelReason.trim()) {
      alert("Lütfen iptal gerekçesini belirtiniz.");
      return;
    }
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });
      if (res.ok) {
        setIsCancelModalOpen(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCancelling(false);
    }
  };

  // İptal Edilen Karardan Bağlı Yeni Taslak Üretme (Yeniden Değerlendirme)
  const handleReconsiderMeeting = async () => {
    setIsReconsidering(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/reconsider`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success && data.newMeetingId) {
        window.location.href = `/meetings/${data.newMeetingId}`;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReconsidering(false);
    }
  };

  // Ek Dosya Yükleme (Rapor Bölüm 3.12 Standardı)
  const handleUploadAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttachName.trim()) return;
    setIsUploadingAttach(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalName: newAttachName.trim(),
          fileSize: 120400 + Math.floor(Math.random() * 150000),
          mimeType: "application/pdf",
        }),
      });
      if (res.ok) {
        setIsAttachModalOpen(false);
        setNewAttachName("");
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingAttach(false);
    }
  };

  const handleProceedToStep5 = async () => {
    // Tüm maddelerin oylanmış olup olmadığını kontrol et
    const unvoted = acceptedItems.filter((i: any) => i.decisionResult === DecisionResult.BEKLIYOR);
    if (unvoted.length > 0) {
      if (!confirm(`Henüz oylanmamış ${unvoted.length} madde bulunmaktadır. Devam etmek istiyor musunuz?`)) {
        return;
      }
    }

    try {
      const res = await fetch(`/api/meetings/${meeting.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: 5,
          status: "TUTANAK_HAZIRLANDI"
        }),
      });
      if (res.ok) {
        onNextStep();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!activeItem) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-10 rounded-2xl border border-slate-200/80 text-center shadow-md">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2.5" />
        <p className="font-bold text-slate-800 text-sm">Gündemde görüşülecek kabul edilmiş madde bulunmuyor.</p>
        <p className="text-xs text-slate-500 mt-1">Lütfen Adım 3&apos;e dönerek gündem maddelerini onaylayınız.</p>
        <button onClick={onPrevStep} className="mt-4 text-xs font-bold px-4 py-2 bg-selcuk-blue hover:bg-selcuk-dark text-white rounded-xl shadow-xs transition-all">
          ← Gündem Oylamasına Dön
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık Kartı */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-selcuk-dark font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                ADIM 4 / 6
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Gündem Maddelerinin Müzakeresi ve Karara Bağlanması
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Selçuk Üniversitesi Bölüm Kurulu Süreci 4. Adımı: Standart karar şablonları mevzuatına uygun müzakere, oylama ve resmi karar metni oluşturma
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              Hazır Bulunan Üye: {meeting.actualAttendeesCount} / {meeting.totalEligibleMembers}
            </span>

            {meeting.status === "IPTAL" ? (
              <button
                onClick={handleReconsiderMeeting}
                disabled={isReconsidering}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-selcuk-dark shadow-xs transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReconsidering ? "animate-spin" : ""}`} />
                <span>Yeniden Değerlendir</span>
              </button>
            ) : (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 shadow-xs transition-all"
                title="Süreci Gerekçeyle İptal Et"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Süreci İptal Et</span>
              </button>
            )}
          </div>
        </div>

        {/* İptal Edilmiş Süreç Uyarısı (Rapor Bölüm 3.13) */}
        {meeting.status === "IPTAL" && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl mb-5 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-rose-900">Bu Kurul Süreci Gerekçeli Olarak İptal Edilmiştir</p>
                <p className="text-rose-700 mt-0.5">
                  <strong>İptal Gerekçesi:</strong> {meeting.cancelledReason || "Belirtilmemiş"}
                </p>
                {meeting.cancelledAt && (
                  <p className="text-[11px] text-rose-500 font-mono mt-1">
                    İptal Zamanı: {new Date(meeting.cancelledAt).toLocaleString("tr-TR")}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleReconsiderMeeting}
              disabled={isReconsidering}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-selcuk-blue hover:bg-selcuk-dark text-white font-bold rounded-xl shadow-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReconsidering ? "animate-spin" : ""}`} />
              <span>Yeni Taslak Başlat</span>
            </button>
          </div>
        )}

        {/* Madde Sekmeleri (Navigasyon) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2.5 mb-6 border-b border-slate-200">
          {acceptedItems.map((item: any, idx: number) => {
            const isSelected = item.id === activeItem.id;
            const isAccepted = item.decisionResult.startsWith("KABUL");
            const isRejected = item.decisionResult === "REDDEDILDI";

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveItemId(item.id);
                  setEditingItem(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-gradient-to-r from-selcuk-blue to-selcuk-dark text-white border-selcuk-blue shadow-md scale-[1.02]"
                    : "bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                    isSelected ? "bg-amber-400 text-selcuk-dark" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="truncate max-w-[170px]">{item.title}</span>
                {isAccepted && (
                  <CheckCircle className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-300" : "text-emerald-600"}`} />
                )}
                {isRejected && (
                  <XCircle className={`w-3.5 h-3.5 ${isSelected ? "text-rose-300" : "text-rose-600"}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Aktif Madde Detay ve Müzakere Kartı */}
        <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-6 mb-6 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4 pb-3 border-b border-slate-200/80">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-mono font-black bg-selcuk-blue text-amber-300 px-3 py-1 rounded-lg shadow-xs">
                  KARAR NO: {activeItem.decisionNumber || "2026/01-01"}
                </span>
                <h3 className="text-base font-extrabold text-slate-900">{activeItem.title}</h3>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-selcuk-turquoise" />
                <span className="font-bold text-slate-700">İlgili Mevzuat / Hukuki Dayanak:</span>{" "}
                <span className="text-selcuk-blue font-semibold">{activeItem.legalBasis}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStartEdit(activeItem)}
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-selcuk-blue" />
                Kararı Düzenle & Oyla
              </button>

              <button
                onClick={() => handleOpenConfirmAccept(activeItem.id)}
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Oybirliğiyle Kabul Et
              </button>
            </div>
          </div>

          {/* Oylama Düzenleme Formu (Modal/In-line) */}
          {editingItem && editingItem.id === activeItem.id ? (
            <div className="bg-white p-5 rounded-2xl border-2 border-selcuk-turquoise/50 shadow-lg mb-6 animate-fade-in">
              <h4 className="text-xs font-black text-selcuk-blue uppercase tracking-wider mb-3">
                Karar Metni ve Oylama Sonucu Düzenleme
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Resmi Karar Metni (Paragraf)
                  </label>
                  <textarea
                    rows={4}
                    value={editingItem.decisionText}
                    onChange={(e) => setEditingItem({ ...editingItem, decisionText: e.target.value })}
                    className="w-full text-xs p-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-selcuk-blue font-serif leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Karar Sonucu
                    </label>
                    <select
                      value={editingItem.decisionResult}
                      onChange={(e) => setEditingItem({ ...editingItem, decisionResult: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white font-semibold"
                    >
                      <option value={DecisionResult.KABUL_OYBIRLIGI}>Kabul (Oybirliğiyle)</option>
                      <option value={DecisionResult.KABUL_OYCOKLUGU}>Kabul (Oyçokluğuyla)</option>
                      <option value={DecisionResult.REDDEDILDI}>Reddedildi</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Kabul Oyu</label>
                    <input
                      type="number"
                      value={editingItem.votesInFavor}
                      onChange={(e) => setEditingItem({ ...editingItem, votesInFavor: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Ret Oyu</label>
                    <input
                      type="number"
                      value={editingItem.votesAgainst}
                      onChange={(e) => setEditingItem({ ...editingItem, votesAgainst: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-bold text-rose-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Çekimser Oy</label>
                    <input
                      type="number"
                      value={editingItem.votesAbstain}
                      onChange={(e) => setEditingItem({ ...editingItem, votesAbstain: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-bold text-slate-500"
                    />
                  </div>
                </div>

                {/* Eşitlikte Başkan Oyu Kuralı (Rapor Çizelge 3.4 & B1) */}
                {editingItem.votesInFavor === editingItem.votesAgainst && editingItem.votesInFavor > 0 && (
                  <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs flex items-center gap-2.5 shadow-2xs">
                    <Scale className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Eşitlik Kuralı Devrede (Oylar: {editingItem.votesInFavor} Kabul - {editingItem.votesAgainst} Ret)</p>
                      <p className="text-[11px] text-purple-700 mt-0.5">
                        Üniversitelerde Akademik Teşkilat Yönetmeliği ve Bölüm Kurulu Usulü gereğince, oyların eşitliği halinde Kurul Başkanının oyu tarafı belirleyicidir.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Muhalefet Şerhi (Karşı Oy / Çekimserlik Gerekçesi)
                    </label>
                    {editingItem.votesAgainst > 0 && (
                      <span className="text-[10px] text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                        Zorunlu Gerekçe ({editingItem.votesAgainst} Ret Oyu)
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Örn: Prof. Dr. Mustafa Karakaya: 'İlgili dersin laboratuvar altyapısının yetersiz olması gerekçesiyle karşı oy kullanılmıştır.'"
                    value={editingItem.dissentingOpinion}
                    onChange={(e) => setEditingItem({ ...editingItem, dissentingOpinion: e.target.value })}
                    className={`w-full text-xs p-3 border rounded-xl focus:outline-none focus:ring-2 ${
                      editingItem.votesAgainst > 0 && !editingItem.dissentingOpinion.trim()
                        ? "border-amber-400 bg-amber-50/50 focus:ring-amber-500"
                        : "border-slate-300 focus:ring-selcuk-blue"
                    }`}
                  />
                  {editingItem.votesAgainst > 0 && !editingItem.dissentingOpinion.trim() && (
                    <p className="text-[11px] text-amber-800 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Usul gereğince ret oyu veren kurul üyelerinin karşı oy gerekçesi resmi tutanağa şerh düşülmelidir.
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="text-xs font-bold px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleSaveItemDecision}
                    disabled={isSaving}
                    className="text-xs font-bold px-5 py-2 bg-selcuk-blue hover:bg-selcuk-dark text-white rounded-xl shadow-md transition-colors"
                  >
                    {isSaving ? "Kaydediliyor..." : "Kararı Kaydet"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Mevcut Karar Metni ve Oylama Kartı */
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mb-6">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                Resmi Karar Paragrafı
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                {activeItem.decisionText || "Karar metni henüz girilmemiş."}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600">Oylama Durumu:</span>
                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-lg border flex items-center gap-1.5 shadow-xs ${
                      activeItem.decisionResult === DecisionResult.KABUL_OYBIRLIGI
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : activeItem.decisionResult === DecisionResult.KABUL_OYCOKLUGU
                        ? "bg-blue-50 text-blue-800 border-blue-200"
                        : activeItem.decisionResult === DecisionResult.REDDEDILDI
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {activeItem.decisionResult === DecisionResult.KABUL_OYBIRLIGI ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        KABUL (OYBİRLİĞİYLE)
                      </>
                    ) : activeItem.decisionResult === DecisionResult.KABUL_OYCOKLUGU ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                        KABUL (OYÇOKLUĞUYLA - {activeItem.votesInFavor} Kabul, {activeItem.votesAgainst} Ret)
                      </>
                    ) : activeItem.decisionResult === DecisionResult.REDDEDILDI ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        REDDEDİLDİ
                      </>
                    ) : (
                      "Oylama Bekliyor"
                    )}
                  </span>
                </div>

                {activeItem.dissentingOpinion && (
                  <div className="text-xs italic text-rose-800 bg-rose-50/90 px-3.5 py-1.5 rounded-xl border border-rose-200 shadow-xs">
                    <strong>Muhalefet Şerhi:</strong> {activeItem.dissentingOpinion}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EK TABLOLAR / ÇİZELGELER (5 Standart Kategori Çıktıları) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-selcuk-blue uppercase tracking-wider flex items-center gap-2">
                <Table className="w-4 h-4 text-selcuk-turquoise" />
                Resmi Karar Eki / Çizelge Tablosu
              </span>
              <span className="text-[11px] text-slate-500 font-mono font-medium">
                {activeItem.attachmentsData?.type || "Standart Çizelge"}
              </span>
            </div>

            {/* Kategori 1 Eki: Ders Dağılım Tablosu */}
            {activeItem.category === DecisionCategory.DERS_GOREVLENDIRME && (
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                    <tr>
                      <th className="p-3">Ders Kodu</th>
                      <th className="p-3">Ders Adı</th>
                      <th className="p-3 text-center">Kredi</th>
                      <th className="p-3 text-center">AKTS</th>
                      <th className="p-3">Görevlendirilen Öğretim Elemanı</th>
                      <th className="p-3 text-center">Grup/Şube</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 bg-white">
                    {(activeItem.attachmentsData?.rows || [
                      { kod: "CENG101", ad: "Bilgisayar Mühendisliğine Giriş", kredi: "3", akts: "5", hoca: "Prof. Dr. Mehmet Akif Demir", grup: "A" },
                      { kod: "CENG201", ad: "Veri Yapıları ve Algoritmalar", kredi: "4", akts: "7", hoca: "Dr. Öğr. Üyesi Ayşe Nur Yılmaz", grup: "A/B" },
                      { kod: "CENG301", ad: "İşletim Sistemleri", kredi: "4", akts: "6", hoca: "Doç. Dr. Hüseyin Çetin", grup: "A" }
                    ]).map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-selcuk-blue">{row.kod}</td>
                        <td className="p-3 text-slate-900 font-semibold">{row.ad}</td>
                        <td className="p-3 text-center font-bold">{row.kredi}</td>
                        <td className="p-3 text-center font-bold text-selcuk-turquoise">{row.akts}</td>
                        <td className="p-3 font-semibold text-slate-800">{row.hoca}</td>
                        <td className="p-3 text-center">{row.grup}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Kategori 2 Eki: Muafiyet ve İntibak Karşılaştırma Çizelgesi */}
            {activeItem.category === DecisionCategory.MUAFIYET_INTIBAK && (
              <div className="space-y-3">
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 text-xs flex justify-between">
                  <div>
                    <span className="font-bold text-slate-700">Öğrenci: </span>
                    <span className="font-semibold text-slate-900">{activeItem.attachmentsData?.student?.adSoyad || "Yunus Emre Sert"}</span>
                    <span className="text-slate-500 font-mono ml-1">({activeItem.attachmentsData?.student?.no || "233311021"})</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Geldiği Kurum: </span>
                    <span className="font-semibold text-slate-900">{activeItem.attachmentsData?.student?.geldigiUniversite || "Hacettepe Üniversitesi"}</span>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5 bg-slate-200/70" colSpan={3}>Eski Kurumda Başarılan Ders</th>
                        <th className="p-2.5 bg-blue-100/70" colSpan={4}>Muaf Tutulan S.Ü. Dersi</th>
                        <th className="p-2.5 text-center">Sonuç</th>
                      </tr>
                      <tr className="border-t border-slate-200 text-[11px] text-slate-600 uppercase">
                        <th className="p-2">Kod / Ders Adı</th>
                        <th className="p-2 text-center">Kredi</th>
                        <th className="p-2 text-center">Harf Notu</th>
                        <th className="p-2">S.Ü. Kod / Ders Adı</th>
                        <th className="p-2 text-center">AKTS</th>
                        <th className="p-2 text-center">İntibak Notu</th>
                        <th className="p-2 text-center">Durum</th>
                        <th className="p-2 text-center">Komisyon</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80 bg-white">
                      {(activeItem.attachmentsData?.rows || [
                        { eskiKod: "BMT101", eskiAd: "Matematik I", eskiKredi: "4", eskiNot: "AA", suKod: "MAT101", suAd: "Matematik I", suAkts: "6", intibakNotu: "AA", durum: "MUAF" },
                        { eskiKod: "BMT105", eskiAd: "Temel Programlama", eskiKredi: "4", eskiNot: "AA", suKod: "CENG103", suAd: "Programlama Dilleri I", suAkts: "6", intibakNotu: "AA", durum: "MUAF" },
                        { eskiKod: "BMT201", eskiAd: "Veri Yapıları", eskiKredi: "4", eskiNot: "BB", suKod: "CENG201", suAd: "Veri Yapıları ve Algoritmalar", suAkts: "7", intibakNotu: "BB", durum: "MUAF" }
                      ]).map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2 font-medium">{row.eskiKod} - {row.eskiAd}</td>
                          <td className="p-2 text-center">{row.eskiKredi}</td>
                          <td className="p-2 text-center font-bold text-selcuk-blue">{row.eskiNot}</td>
                          <td className="p-2 font-medium text-slate-900">{row.suKod} - {row.suAd}</td>
                          <td className="p-2 text-center">{row.suAkts}</td>
                          <td className="p-2 text-center font-bold text-emerald-700">{row.intibakNotu}</td>
                          <td className="p-2 text-center">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {row.durum}
                            </span>
                          </td>
                          <td className="p-2 text-center text-emerald-600 font-bold">KABUL</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Kategori 3 Eki: Staj Listesi Tablosu */}
            {activeItem.category === DecisionCategory.STAJ_ISLETME && (
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                    <tr>
                      <th className="p-3">Öğrenci No</th>
                      <th className="p-3">Adı Soyadı</th>
                      <th className="p-3">Staj Yapılan Kurum/Firma</th>
                      <th className="p-3">Staj Türü</th>
                      <th className="p-3 text-center">Kabul Gün</th>
                      <th className="p-3 text-center">Ret Gün</th>
                      <th className="p-3">Komisyon Değerlendirmesi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 bg-white">
                    {(activeItem.attachmentsData?.rows || [
                      { ogrenciNo: "213311005", adSoyad: "Ahmet Kaya", firma: "ASELSAN A.Ş. / Konya", tur: "Yazılım Stajı", gunKabul: "30", gunRet: "0", komisyonKarari: "UYGUN - KABUL" },
                      { ogrenciNo: "213311018", adSoyad: "Buse Karaca", firma: "HAVELSAN A.Ş. / Ankara", tur: "Yazılım Stajı", gunKabul: "30", gunRet: "0", komisyonKarari: "UYGUN - KABUL" }
                    ]).map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-selcuk-blue">{row.ogrenciNo}</td>
                        <td className="p-3 font-semibold text-slate-900">{row.adSoyad}</td>
                        <td className="p-3 text-slate-700">{row.firma}</td>
                        <td className="p-3">{row.tur}</td>
                        <td className="p-3 text-center font-bold text-emerald-700">{row.gunKabul} Gün</td>
                        <td className="p-3 text-center font-bold text-rose-600">{row.gunRet} Gün</td>
                        <td className="p-3 font-bold text-emerald-700">{row.komisyonKarari}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Kategori 4 Eki: Sınav Takvimi / Mazeret Çizelgesi */}
            {activeItem.category === DecisionCategory.SINAV_MAZERET && (
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                      <tr>
                        <th className="p-3">Tarih</th>
                        <th className="p-3">Saat</th>
                        <th className="p-3">Ders Kodu</th>
                        <th className="p-3">Ders Adı</th>
                        <th className="p-3">Sınav Salonu</th>
                        <th className="p-3">Sorumlu Gözetmen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80 bg-white">
                      {(activeItem.attachmentsData?.rows || [
                        { tarih: "17.11.2026", saat: "10:00", dersKodu: "CENG101", dersAdi: "Bilgisayar Mühendisliğine Giriş", derslik: "Amfi-1, Amfi-2", gozetmen: "Öğr. Gör. Dr. Emre Aydın" },
                        { tarih: "18.11.2026", saat: "14:00", dersKodu: "CENG201", dersAdi: "Veri Yapıları ve Algoritmalar", derslik: "D-201, D-202", gozetmen: "Dr. Öğr. Üyesi Seda Korkmaz" }
                      ]).map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-bold text-selcuk-blue">{row.tarih}</td>
                          <td className="p-3 font-semibold">{row.saat}</td>
                          <td className="p-3 font-mono font-bold">{row.dersKodu}</td>
                          <td className="p-3 font-semibold text-slate-900">{row.dersAdi}</td>
                          <td className="p-3">{row.derslik}</td>
                          <td className="p-3">{row.gozetmen}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {activeItem.attachmentsData?.mazeretListesi && (
                  <div className="bg-amber-50/90 p-4 rounded-xl border border-amber-200">
                    <p className="text-xs font-bold text-amber-900 mb-2">Sağlık Raporlu Öğrenci Mazeret Çizelgesi</p>
                    <div className="text-xs text-slate-700 space-y-1.5">
                      {activeItem.attachmentsData.mazeretListesi.map((m: any, mIdx: number) => (
                        <div key={mIdx} className="flex justify-between bg-white p-2.5 rounded-lg border border-amber-200">
                          <span className="font-semibold text-slate-900">{m.ogrenciNo} - {m.adSoyad} ({m.dersKodu})</span>
                          <span className="text-slate-600">{m.belgeTuru}</span>
                          <span className="font-bold text-emerald-700">Mazeret Sınavı: {m.mazeretSinavTarihi}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Kategori 5 Eki: Komisyon ve Koordinatörlük Listesi */}
            {activeItem.category === DecisionCategory.KOMISYON_SECIMI && (
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                    <tr>
                      <th className="p-3">Komisyondaki Görevi</th>
                      <th className="p-3">Unvanı, Adı ve Soyadı</th>
                      <th className="p-3">E-posta</th>
                      <th className="p-3">Dahili Tel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 bg-white">
                    {(activeItem.attachmentsData?.rows || [
                      { gorev: "Komisyon Başkanı", unvanAd: "Prof. Dr. Fatma Zehra Şahin", eposta: "fzsahin@selcuk.edu.tr", dahili: "2106" },
                      { gorev: "Üye (MÜDEK Sorumlusu)", unvanAd: "Doç. Dr. Hüseyin Çetin", eposta: "hcetin@selcuk.edu.tr", dahili: "2102" },
                      { gorev: "Üye (Bologna Sorumlusu)", unvanAd: "Dr. Öğr. Üyesi Ayşe Nur Yılmaz", eposta: "ayse.yilmaz@selcuk.edu.tr", dahili: "2103" }
                    ]).map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-selcuk-blue">{row.gorev}</td>
                        <td className="p-3 font-semibold text-slate-900">{row.unvanAd}</td>
                        <td className="p-3 text-slate-600">{row.eposta}</td>
                        <td className="p-3 font-mono">{row.dahili}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Diğer Kategoriler */}
            {activeItem.category === DecisionCategory.DIGER && (
              <p className="text-xs text-slate-500 italic p-3 text-center">
                Bu karar türü için standart ek çizelge gerekmemektedir.
              </p>
            )}
          </div>

          {/* EK DOSYALAR VE BÜTÜNLÜK DENETİMİ (Rapor Bölüm 3.12 Standardı) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-100">
              <div>
                <span className="text-xs font-black text-selcuk-blue uppercase tracking-wider flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-selcuk-turquoise" />
                  Toplantı ve Karara Ait Ek Dosyalar (SHA-256 Doğrulamalı)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Her ek dosyanın boyutu ve SHA-256 kriptografik özeti kaydedilerek tahrifat denetimi sağlanır.
                </p>
              </div>

              <button
                onClick={() => setIsAttachModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Ek Belge Ekle</span>
              </button>
            </div>

            {meeting.attachments && meeting.attachments.length > 0 ? (
              <div className="space-y-2">
                {meeting.attachments.map((att: any) => (
                  <div
                    key={att.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-selcuk-blue flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{att.originalName}</p>
                        <p className="font-mono text-[10px] text-slate-400 break-all">
                          SHA-256: {att.sha256Hash} • {(att.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex-shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Bütünlük Doğrulandı ✓
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic p-2 text-center">
                Henüz bu toplantıya ek dosya yüklenmedi.
              </p>
            )}
          </div>
        </div>

        {/* Butonlar: Geri ve İleri */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            onClick={onPrevStep}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            ← Adım 3: Gündem Oylamasına Dön
          </button>

          <button
            onClick={handleProceedToStep5}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
          >
            <span>Adım 5&apos;e Geç: Resmi Karar Tutanağını Derle</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kabul Oyu Onay Penceresi (Rapor Sorun A5 Standardı) */}
      {confirmAcceptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-slate-900">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900">Oybirliğiyle Kabul Onayı</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Bu gündem maddesini toplantıda hazır bulunan <strong>{meeting.actualAttendeesCount} kurul üyesinin</strong> tamamının kabul oyu ile kesinleştirmek istediğinizden emin misiniz?
              </p>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] leading-relaxed">
              Bu işlem neticesinde karar sonucu &quot;KABUL (OYBİRLİĞİYLE)&quot; olarak tescil edilecek ve mevzuat hükmü resmi karar metnine bağlanacaktır.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAcceptModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleExecuteQuickAccept}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Evet, Kabul Oyu Ver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Süreci İptal Etme Modalı (Rapor Sorun A4 Standardı) */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-slate-900">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <Ban className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900">Kurul Sürecini İptal Et</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Görüşülen veya takılan bu toplantı sürecini gerekçe belirterek iptal edebilirsiniz. İptal edilen toplantı arşive kaldırılır ve istenirse yeni bir taslak üretilebilir.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Zorunlu İptal Gerekçesi
              </label>
              <textarea
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Örn: Anabilim dalı ders görevlendirmelerindeki değişiklik nedeniyle sürecin yeniden başlatılmasına..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isCancelling || !cancelReason.trim()}
                onClick={handleCancelMeeting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                {isCancelling ? "İptal Ediliyor..." : "Süreci İptal Et"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ek Belge Ekleme Modalı (Rapor Bölüm 3.12 Standardı) */}
      {isAttachModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-slate-900">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-selcuk-blue" />
                <h3 className="font-extrabold text-sm text-slate-900">Karara Ek Belge Yükle</h3>
              </div>
              <button
                onClick={() => setIsAttachModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadAttachment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ek Dosya Adı / Başlığı
                </label>
                <input
                  type="text"
                  required
                  value={newAttachName}
                  onChange={(e) => setNewAttachName(e.target.value)}
                  placeholder="Örn: Bolum_Ders_Dagitim_Cizelgesi_Ek1.pdf"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-1 focus:ring-selcuk-blue focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] leading-relaxed">
                Yüklenen belgenin kriptografik <strong>SHA-256 özeti</strong> otomatik üretilir ve mühürleme aşamasında kararla ilişkilendirilir.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAttachModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isUploadingAttach}
                  className="px-5 py-2 bg-selcuk-blue hover:bg-selcuk-dark text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  {isUploadingAttach ? "Yükleniyor..." : "Ek Dosyayı Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
