"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Plus, AlertCircle, FileSpreadsheet, CheckCheck, Sparkles, Filter } from "lucide-react";
import { DecisionResult, DecisionCategory } from "@prisma/client";

interface Step3Props {
  meeting: any;
  onRefresh: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export default function Step3AgendaVoting({
  meeting,
  onRefresh,
  onNextStep,
  onPrevStep
}: Step3Props) {
  const [isVoting, setIsVoting] = useState(false);
  const [newProposalTitle, setNewProposalTitle] = useState("");
  const [newProposalCategory, setNewProposalCategory] = useState<DecisionCategory>(DecisionCategory.DIGER);
  const [showAddProposal, setShowAddProposal] = useState(false);

  // Gündem Oylaması: Maddeyi Kabul Et veya Gündemden Çıkar
  const handleVoteAgendaItem = async (itemId: string, isAccepted: boolean, customNotes?: string) => {
    setIsVoting(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/agenda-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          isAcceptedToAgenda: isAccepted,
          agendaVoteNotes: customNotes || (isAccepted ? "Kurul oybirliğiyle gündeme kabul edildi." : "Kurul kararıyla gündemden çıkarılmıştır."),
        }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVoting(false);
    }
  };

  // Toplu Kabul Et
  const handleAcceptAll = async () => {
    setIsVoting(true);
    try {
      for (const item of meeting.items) {
        if (!item.isAcceptedToAgenda) {
          await fetch(`/api/meetings/${meeting.id}/agenda-vote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itemId: item.id,
              isAcceptedToAgenda: true,
              agendaVoteNotes: "Kurul üyelerinin oybirliği ile gündeme kabul edildi.",
            }),
          });
        }
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsVoting(false);
    }
  };

  // Yeni Madde Teklifi Ekleme (Toplantı esnasında üye teklifi)
  const handleAddProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProposalTitle.trim()) return;

    try {
      const res = await fetch(`/api/meetings/${meeting.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newProposalTitle,
          category: newProposalCategory,
          legalBasis: "Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 (Kurul Üyesi Teklifi)",
          decisionText: `${newProposalTitle} teklifi kurul tarafından müzakere edilmiştir.`,
          isAcceptedToAgenda: true,
        }),
      });
      if (res.ok) {
        setNewProposalTitle("");
        setShowAddProposal(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProceedToStep4 = async () => {
    const acceptedItems = meeting.items.filter((i: any) => i.isAcceptedToAgenda);
    if (acceptedItems.length === 0) {
      alert("Gündemde görüşülecek en az 1 kabul edilmiş madde bulunmalıdır!");
      return;
    }

    try {
      const res = await fetch(`/api/meetings/${meeting.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: 4,
          status: "MADDELER_GORUSULUYOR"
        }),
      });
      if (res.ok) {
        onNextStep();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const acceptedCount = meeting.items.filter((i: any) => i.isAcceptedToAgenda).length;
  const removedCount = meeting.items.filter((i: any) => !i.isAcceptedToAgenda).length;

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-selcuk-dark font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                ADIM 3 / 6
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Gündem Oylaması ve Madde Çıkarma / Ekleme
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Selçuk Üniversitesi Bölüm Kurulu Süreci 3. Adımı: Gündem maddelerinin görüşülmeye kabulünü oylama, kabul edilmeyen maddeleri gerekçesiyle gündemden çıkarma
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAcceptAll}
              disabled={isVoting}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              Tümünü Gündeme Al
            </button>

            <button
              onClick={() => setShowAddProposal(!showAddProposal)}
              className="flex items-center gap-1.5 bg-selcuk-blue hover:bg-selcuk-dark text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              Yeni Madde Teklifi Ver
            </button>
          </div>
        </div>

        {/* Özet İstatistik Çubuğu */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Toplam Gündem Maddesi</span>
            <p className="text-2xl font-black text-slate-800 mt-1">{meeting.items.length} Madde</p>
          </div>
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl shadow-xs">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Görüşülmeye Kabul Edilen</span>
            <p className="text-2xl font-black text-emerald-800 mt-1">{acceptedCount} Madde</p>
          </div>
          <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-xl shadow-xs">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Gündemden Çıkarılan / Ret</span>
            <p className="text-2xl font-black text-rose-800 mt-1">{removedCount} Madde</p>
          </div>
        </div>

        {/* Yeni Madde Teklif Formu */}
        {showAddProposal && (
          <form onSubmit={handleAddProposal} className="mb-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Toplantı Esnasında Kurul Üyesi Teklifi ile Yeni Gündem Maddesi Ekle
              </h4>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Gündem maddesi başlığı / teklif konusu..."
                    value={newProposalTitle}
                    onChange={(e) => setNewProposalTitle(e.target.value)}
                    className="w-full text-xs p-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-selcuk-blue bg-white shadow-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <select
                    value={newProposalCategory}
                    onChange={(e) => setNewProposalCategory(e.target.value as DecisionCategory)}
                    className="w-full text-xs p-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-selcuk-blue bg-white shadow-xs font-medium"
                  >
                    <option value={DecisionCategory.DERS_GOREVLENDIRME}>Ders Görevlendirme</option>
                    <option value={DecisionCategory.MUAFIYET_INTIBAK}>Muafiyet & İntibak</option>
                    <option value={DecisionCategory.STAJ_ISLETME}>Staj & İşletmede Eğitim</option>
                    <option value={DecisionCategory.SINAV_MAZERET}>Sınav & Mazeret</option>
                    <option value={DecisionCategory.KOMISYON_SECIMI}>Komisyon & Koordinatörlük</option>
                    <option value={DecisionCategory.DIGER}>Diğer / Genel Akademik</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddProposal(false)}
                  className="text-xs font-bold px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={!newProposalTitle.trim()}
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-selcuk-blue hover:bg-selcuk-dark text-white shadow-md disabled:opacity-50 transition-colors"
                >
                  Teklifi Gündeme Al
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Gündem Maddeleri Oylama Listesi */}
        <div className="space-y-3.5 mb-6">
          {meeting.items.map((item: any, idx: number) => {
            const isAccepted = item.isAcceptedToAgenda;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isAccepted
                    ? "bg-white border-slate-200 shadow-xs hover:border-slate-300"
                    : "bg-rose-50/60 border-rose-200 opacity-80"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 max-w-2xl">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5 shadow-xs ${
                        isAccepted ? "bg-selcuk-blue text-amber-300" : "bg-rose-600 text-white"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-slate-900">{item.title}</span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                          {item.category.replace("_", " ")}
                        </span>
                        {isAccepted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Gündeme Kabul Edildi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Gündemden Çıkarıldı
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">Mevzuat Dayanağı:</span> {item.legalBasis}
                      </p>

                      <p className="text-xs text-slate-600 mt-1">
                        <span className="font-semibold text-slate-700">Gündem Oylaması Kararı:</span>{" "}
                        <span className="italic">{item.agendaVoteNotes || "Görüşülmek üzere gündeme alındı."}</span>
                      </p>
                    </div>
                  </div>

                  {/* Oylama Aksiyon Butonları */}
                  <div className="flex items-center gap-2">
                    {isAccepted ? (
                      <button
                        type="button"
                        onClick={() => handleVoteAgendaItem(item.id, false, "Kurul üyelerinin çoğunluk kararı ile gündem maddesi çıkarılmıştır.")}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 bg-white hover:bg-rose-50 flex items-center gap-1.5 transition-colors shadow-xs"
                        title="Bu maddeyi gündemden çıkar"
                      >
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Gündemden Çıkar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleVoteAgendaItem(item.id, true, "Gündeme kabul edildi.")}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 flex items-center gap-1.5 transition-colors shadow-xs"
                        title="Bu maddeyi tekrar gündeme al"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Tekrar Gündeme Al
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Butonlar: Geri ve İleri */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            onClick={onPrevStep}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            ← Adım 2: Hazirun Kontrolüne Dön
          </button>

          <button
            onClick={handleProceedToStep4}
            disabled={acceptedCount === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Adım 4&apos;e Geç: Maddeleri Müzakere Et & Karara Bağla ({acceptedCount} Madde)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
