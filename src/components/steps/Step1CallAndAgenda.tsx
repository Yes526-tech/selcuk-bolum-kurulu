"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Send,
  FileText,
  Sparkles,
  AlertCircle,
  Inbox,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Bell,
  Download,
  X,
  Paperclip
} from "lucide-react";
import { DecisionCategory } from "@prisma/client";

interface Step1Props {
  meeting: any;
  onRefresh: () => void;
  onNextStep: () => void;
  onOpenTemplateModal: () => void;
}

export default function Step1CallAndAgenda({
  meeting,
  onRefresh,
  onNextStep,
  onOpenTemplateModal
}: Step1Props) {
  const [isEditingCall, setIsEditingCall] = useState(false);
  const [callText, setCallText] = useState(meeting.callDocumentText || "");
  const [location, setLocation] = useState(meeting.location || "");
  const [isSaving, setIsSaving] = useState(false);

  // Talep Havuzu Modalı
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [poolItems, setPoolItems] = useState<any[]>([]);
  const [selectedPoolIds, setSelectedPoolIds] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Bildirim Modalı
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notificationResults, setNotificationResults] = useState<any>(null);
  const [isSendingNotice, setIsSendingNotice] = useState(false);

  // Yeni Hızlı Gündem Maddesi Ekleme
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<DecisionCategory>(DecisionCategory.DERS_GOREVLENDIRME);

  const loadPoolItems = () => {
    fetch(`/api/agenda-pool?departmentCode=${meeting.department?.code || "CENG"}&status=BEKLIYOR`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPoolItems(data.talepler);
        }
      });
  };

  const handleOpenPoolModal = () => {
    loadPoolItems();
    setSelectedPoolIds([]);
    setIsPoolModalOpen(true);
  };

  const handleImportPoolItems = async () => {
    if (selectedPoolIds.length === 0) return;
    setIsImporting(true);

    try {
      for (const poolId of selectedPoolIds) {
        const item = poolItems.find((p) => p.id === poolId);
        if (!item) continue;

        await fetch(`/api/meetings/${meeting.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: item.baslik,
            category: item.kategori,
            legalBasis:
              item.kategori === "DERS_GOREVLENDIRME"
                ? "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği (Madde 8)"
                : item.kategori === "MUAFIYET_INTIBAK"
                ? "Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 10/5 & 15)"
                : item.kategori === "STAJ_ISLETME"
                ? "S.Ü. Staj ve İşletmede Mesleki Eğitim Yönergeleri"
                : item.kategori === "SINAV_MAZERET"
                ? "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği"
                : "Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 15)",
            decisionText: item.oneriKararMetni || `${item.baslik} hususu görüşülerek karara bağlanacaktır.`,
            talepId: item.id,
          }),
        });
      }
      setIsPoolModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error("Havuzdan aktarma hatası:", err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleMoveItem = async (index: number, direction: "up" | "down") => {
    const items = [...meeting.items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    // Yer değiştir
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    const reorderedItemIds = items.map((i) => i.id);

    try {
      const res = await fetch(`/api/meetings/${meeting.id}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorderedItemIds }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error("Sıralama hatası:", err);
    }
  };

  const handleSendOfficialNotice = async () => {
    setIsSendingNotice(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/notify-call`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setNotificationResults(data);
        setIsNotifyModalOpen(true);
        onRefresh();
      } else {
        alert("Bildirim gönderilemedi: " + (data.error || "Bilinmeyen hata"));
      }
    } catch (err) {
      console.error(err);
      alert("Bildirim servisine ulaşılamadı.");
    } finally {
      setIsSendingNotice(false);
    }
  };

  const handleSaveCallInfo = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          callDocumentText: callText,
        }),
      });
      if (res.ok) {
        setIsEditingCall(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch(`/api/meetings/${meeting.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          legalBasis:
            newCategory === DecisionCategory.DERS_GOREVLENDIRME
              ? "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği (Madde 8)"
              : newCategory === DecisionCategory.MUAFIYET_INTIBAK
              ? "Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 10/5 & 15)"
              : newCategory === DecisionCategory.STAJ_ISLETME
              ? "S.Ü. Staj ve İşletmede Mesleki Eğitim Yönergeleri"
              : newCategory === DecisionCategory.SINAV_MAZERET
              ? "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği"
              : newCategory === DecisionCategory.KOMISYON_SECIMI
              ? "Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 15)"
              : "İlgili Mevzuat Hükümleri",
          decisionText: `${newTitle} konusu görüşülerek karara bağlanacaktır.`,
        }),
      });
      if (res.ok) {
        setNewTitle("");
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Bu gündem maddesini silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/items?itemId=${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProceedToStep2 = async () => {
    try {
      const res = await fetch(`/api/meetings/${meeting.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: 2,
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

  const dateFormatted = new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(meeting.scheduledDate));

  return (
    <div className="space-y-6">
      {/* 1. Çağrı ve Toplantı Bilgisi Kartı */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-selcuk-blue to-selcuk-navy text-white px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-selcuk-dark font-black text-xs px-2.5 py-0.5 rounded-full">
                ADIM 1 / 6
              </span>
              <h2 className="text-lg font-bold">Toplantı Çağrısı ve Gündemin Bildirilmesi</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Selçuk Üniversitesi Bölüm Kurulu Süreci İş Akışı 1. Adımı: Toplantı tarihi, saati, yeri ve gündem maddelerinin üyelere resmi tebliği
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendOfficialNotice}
              disabled={isSendingNotice}
              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg border border-emerald-400/40 shadow-xs transition-all flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{isSendingNotice ? "Gönderiliyor..." : "Üyelere Çağrı Gönder"}</span>
            </button>

            <button
              onClick={() => setIsEditingCall(!isEditingCall)}
              className="text-xs bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-1.5 rounded-lg border border-white/20 transition-all"
            >
              {isEditingCall ? "Vazgeç" : "Çağrı Bilgilerini Düzenle"}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Calendar className="w-5 h-5 text-selcuk-turquoise mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Toplantı Tarihi ve Saati</p>
                <p className="text-sm font-semibold text-slate-800">{dateFormatted}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <MapPin className="w-5 h-5 text-selcuk-turquoise mt-0.5" />
              <div className="w-full">
                <p className="text-xs text-slate-500 font-medium">Toplantı Yeri / Salonu</p>
                {isEditingCall ? (
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs font-semibold p-1 border rounded mt-1"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">{meeting.location}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <FileText className="w-5 h-5 text-selcuk-turquoise mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 font-medium">EBYS Çağrı Evrak No</p>
                <p className="text-sm font-mono font-semibold text-selcuk-blue">
                  {meeting.callDocumentNo || "E-64134190-302.01.05-184910"}
                </p>
                {meeting.callSentAt && (
                  <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
                    Tebliğ: {new Date(meeting.callSentAt).toLocaleTimeString("tr-TR")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Resmi Çağrı Yazısı Önizlemesi */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-selcuk-blue" />
                Resmi Çağrı Yazısı ve EBYS Bildirim Metni
              </span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Madde 15 Uyarınca Kurul Üyelerine Tebliğ Edildi
              </span>
            </div>

            {isEditingCall ? (
              <textarea
                value={callText}
                onChange={(e) => setCallText(e.target.value)}
                rows={6}
                className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl focus:ring-1 focus:ring-selcuk-blue bg-white"
              />
            ) : (
              <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-slate-200">
                {meeting.callDocumentText ||
                  `T.C. SELÇUK ÜNİVERSİTESİ\n${meeting.department?.facultyName?.toUpperCase() || "MÜHENDİSLİK FAKÜLTESİ"}\n${meeting.department?.name?.toUpperCase() || "BİLGİSAYAR MÜHENDİSLİĞİ BÖLÜMÜ"} BAŞKANLIĞI\n\nSayı: 64134190-302.01.05-184910\nKonu: Bölüm Kurulu Toplantı Çağrısı ve Gündemi\n\nBölüm Kurulumuz, 2547 Sayılı Kanun'un 16. Maddesi ile Üniversitelerde Akademik Teşkilat Yönetmeliği'nin 15. Maddesi uyarınca aşağıda belirtilen gün, saat ve gündem maddelerini görüşmek üzere toplanacaktır.\n\nToplantıya asıl kurul üyelerinin teşrifleri rica olunur.`}
              </pre>
            )}

            {isEditingCall && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleSaveCallInfo}
                  disabled={isSaving}
                  className="bg-selcuk-blue text-white text-xs px-4 py-2 rounded-xl font-medium hover:bg-selcuk-navy transition-colors"
                >
                  {isSaving ? "Kaydediliyor..." : "Çağrı Bilgilerini Kaydet"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Gündem Maddeleri Listesi, Havuzdan Ekleme ve Sıralama Kartı */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Toplantı Gündem Maddeleri</span>
              <span className="bg-selcuk-blue text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                {meeting.items.length} Madde
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gündem maddelerini sürükle veya yukarı/aşağı butonlarıyla sıralayabilir, talep havuzundan veya şablonlardan ekleyebilirsiniz.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenPoolModal}
              className="flex items-center gap-1.5 bg-selcuk-blue hover:bg-selcuk-navy text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xs transition"
            >
              <Inbox className="w-4 h-4 text-amber-300" />
              <span>Talep Havuzundan Madde Seç</span>
            </button>

            <button
              onClick={onOpenTemplateModal}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xs transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Karar Şablonu Ekle</span>
            </button>
          </div>
        </div>

        {/* Maddeler Tablosu ve Sıralama Butonları */}
        {meeting.items.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">Henüz gündem maddesi eklenmemiş</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Yukarıdaki &quot;Talep Havuzundan Madde Seç&quot; veya &quot;Karar Şablonu Ekle&quot; butonlarını kullanabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 mb-6">
            {meeting.items.map((item: any, idx: number) => {
              const categoryBadgeColor =
                item.category === "DERS_GOREVLENDIRME"
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : item.category === "MUAFIYET_INTIBAK"
                  ? "bg-purple-100 text-purple-800 border-purple-200"
                  : item.category === "STAJ_ISLETME"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : item.category === "SINAV_MAZERET"
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : item.category === "KOMISYON_SECIMI"
                  ? "bg-rose-100 text-rose-800 border-rose-200"
                  : "bg-slate-100 text-slate-800 border-slate-200";

              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Sıra Numarası ve Karar No */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <span className="w-7 h-7 rounded-lg bg-selcuk-blue text-white font-bold text-xs flex items-center justify-center">
                        {item.itemNumber || idx + 1}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500 mt-1">
                        {item.decisionNumber}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">{item.title}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${categoryBadgeColor}`}>
                          {item.category.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-slate-600">Dayanak:</span> {item.legalBasis}
                      </p>
                      {item.decisionText && (
                        <p className="text-xs text-slate-700 mt-1.5 line-clamp-2 italic bg-white p-2 rounded-lg border border-slate-200">
                          {item.decisionText}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sıralama ve Silme Aksiyonları */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleMoveItem(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                      title="Yukarı Taşı"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveItem(idx, "down")}
                      disabled={idx === meeting.items.length - 1}
                      className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                      title="Aşağı Taşı"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors ml-1"
                      title="Maddeyi Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hızlı Madde Ekleme Formu */}
        <form onSubmit={handleAddItem} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-bold text-slate-800 uppercase mb-3 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-selcuk-blue" />
            Hızlı Gündem Maddesi Ekle
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Kategori
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as DecisionCategory)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-selcuk-blue"
              >
                <option value={DecisionCategory.DERS_GOREVLENDIRME}>Ders Görevlendirme (Md. 8)</option>
                <option value={DecisionCategory.MUAFIYET_INTIBAK}>Muafiyet & İntibak (Md. 10/5 & 15)</option>
                <option value={DecisionCategory.STAJ_ISLETME}>Staj & Mesleki Eğitim</option>
                <option value={DecisionCategory.SINAV_MAZERET}>Sınav & Mazeret Sınavları</option>
                <option value={DecisionCategory.KOMISYON_SECIMI}>Komisyon Seçimi (Md. 15)</option>
                <option value={DecisionCategory.DIGER}>Diğer Akademik / İdari</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Gündem Maddesi Başlığı
              </label>
              <input
                type="text"
                placeholder="Örn: 2026-2027 Güz Yarıyılı Ara Sınav Mazeret Talepleri"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-selcuk-blue"
              />
            </div>

            <div className="md:col-span-1 flex items-end">
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="w-full bg-selcuk-blue hover:bg-selcuk-navy text-white text-xs font-semibold p-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Maddeyi Ekle
              </button>
            </div>
          </div>
        </form>

        {/* İlerle Butonu (Adım 2: Hazirun ve Salt Çoğunluk) */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Gündem maddeleri ve çağrı belgesi tamamlandığında Hazirun kontrolüne geçebilirsiniz.
          </p>

          <button
            onClick={handleProceedToStep2}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
          >
            <span>Adım 2&apos;ye Geç: Hazirun & Salt Çoğunluk Kontrolü</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bekleyen Talep Havuzundan Madde Seç Modalı */}
      {isPoolModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-selcuk-blue" />
                  <span>Bekleyen Talep Havuzundan Madde Aktar</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toplantı gündemine eklemek istediğiniz dilekçe ve yazıları seçiniz:
                </p>
              </div>
              <button
                onClick={() => setIsPoolModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2.5">
              {poolItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Havuzda bu bölüm için bekleyen yeni bir talep bulunmuyor.
                </div>
              ) : (
                poolItems.map((item) => {
                  const isChecked = selectedPoolIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedPoolIds(selectedPoolIds.filter((id) => id !== item.id));
                        } else {
                          setSelectedPoolIds([...selectedPoolIds, item.id]);
                        }
                      }}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? "bg-selcuk-blue/5 border-selcuk-blue shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 rounded text-selcuk-blue focus:ring-selcuk-blue"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{item.baslik}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {item.talepTuru}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          <strong>Başvuran:</strong> {item.basvuranAd} {item.basvuranNo && `(${item.basvuranNo})`}
                        </p>
                        {item.aciklama && (
                          <p className="text-xs text-slate-600 mt-1 line-clamp-1 italic">
                            {item.aciklama}
                          </p>
                        )}
                        {item.ekBelgeAdi && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-selcuk-turquoise mt-1 font-medium">
                            <Paperclip className="w-3 h-3" />
                            {item.ekBelgeAdi}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-xs text-slate-500">
                {selectedPoolIds.length} talep seçildi
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPoolModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleImportPoolItems}
                  disabled={selectedPoolIds.length === 0 || isImporting}
                  className="px-4 py-1.5 text-xs font-bold bg-selcuk-blue hover:bg-selcuk-navy text-white rounded-lg shadow-xs disabled:opacity-50"
                >
                  {isImporting ? "Aktarılıyor..." : "Seçilenleri Gündeme Ekle"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bildirim Sonuç Modalı */}
      {isNotifyModalOpen && notificationResults && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Resmi Toplantı Çağrısı ve Gündem Tebliğ Edildi
                  </h3>
                  <p className="text-xs text-slate-500">
                    EBYS Evrak No: {notificationResults.callDocumentNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNotifyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Yönetmelik Madde 15 uyarınca oy hakkı bulunan <strong>{notificationResults.sentCount} asıl kurul üyesine</strong> kurumsal e-posta ve EBYS sistem bildirimi başarıyla iletilmiştir:
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              {notificationResults.logs?.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                  <div>
                    <p className="font-bold text-slate-800">{log.aliciUnvanAd}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{log.aliciEposta}</p>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded">
                    İletildi
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setIsNotifyModalOpen(false)}
                className="px-4 py-1.5 text-xs font-bold bg-selcuk-blue hover:bg-selcuk-navy text-white rounded-lg shadow-xs"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
