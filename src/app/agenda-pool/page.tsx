"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Inbox,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  Paperclip,
  Tag,
  Building2,
  Calendar,
  Filter,
  User,
  ArrowRight,
  Eye,
  Trash2,
  Send,
  X
} from "lucide-react";

export default function AgendaPoolPage() {
  const [talepler, setTalepler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedDeptCode, setSelectedDeptCode] = useState("CENG");

  // Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedTalepForView, setSelectedTalepForView] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    kategori: "DERS_GOREVLENDIRME",
    talepTuru: "ABD Başkanlığı Yazısı",
    baslik: "",
    basvuranAd: "",
    basvuranNo: "",
    aciklama: "",
    oneriKararMetni: "",
    ekBelgeAdi: "",
  });

  const loadTalepler = () => {
    setLoading(true);
    let url = `/api/agenda-pool?departmentCode=${selectedDeptCode}`;
    if (statusFilter !== "ALL") url += `&status=${statusFilter}`;
    if (categoryFilter !== "ALL") url += `&category=${categoryFilter}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTalepler(data.talepler);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTalepler();
  }, [selectedDeptCode, statusFilter, categoryFilter]);

  const handleCreateTalep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.baslik || !formData.basvuranAd) {
      alert("Lütfen başlık ve başvuran bilgilerini doldurunuz.");
      return;
    }

    const res = await fetch("/api/agenda-pool", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        departmentCode: selectedDeptCode,
      }),
    });

    if (res.ok) {
      setIsNewModalOpen(false);
      setFormData({
        kategori: "DERS_GOREVLENDIRME",
        talepTuru: "ABD Başkanlığı Yazısı",
        baslik: "",
        basvuranAd: "",
        basvuranNo: "",
        aciklama: "",
        oneriKararMetni: "",
        ekBelgeAdi: "",
      });
      loadTalepler();
    } else {
      alert("Talep kaydedilirken bir hata oluştu.");
    }
  };

  const handleDeleteTalep = async (id: string) => {
    if (!confirm("Bu talebi silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/agenda-pool/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadTalepler();
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/agenda-pool/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durum: newStatus }),
    });
    if (res.ok) {
      loadTalepler();
    }
  };

  const pendingCount = talepler.filter((t) => t.durum === "BEKLIYOR").length;
  const addedCount = talepler.filter((t) => t.durum === "TOPLANTIYA_EKLENDI").length;

  return (
    <div className="space-y-6">
      {/* Üst Başlık ve Aksiyon */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-selcuk-blue text-amber-300">
              <Inbox className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Bekleyen Gündem ve Talep Havuzu
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Anabilim dalı başkanlığı yazıları, komisyon raporları ve öğrenci dilekçelerinin toplantı öncesi toplandığı resmi havuz
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
            <Building2 className="w-4 h-4 text-selcuk-blue" />
            <select
              value={selectedDeptCode}
              onChange={(e) => setSelectedDeptCode(e.target.value)}
              className="text-xs font-semibold bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="CENG">Bilgisayar Mühendisliği (CENG)</option>
              <option value="BCT">Biyomedikal Cihaz Tek. (BCT)</option>
            </select>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-selcuk-blue hover:bg-selcuk-navy text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni Talep / Dilekçe Ekle</span>
          </button>
        </div>
      </div>

      {/* İstatistik ve Filtre Şeridi */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Bekleyen Talepler</p>
            <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          </div>
          <Clock className="w-8 h-8 text-amber-500/20" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Toplantıya Eklenenler</p>
            <p className="text-2xl font-black text-emerald-600">{addedCount}</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/20" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Toplam Talep Sayısı</p>
            <p className="text-2xl font-black text-slate-900">{talepler.length}</p>
          </div>
          <Inbox className="w-8 h-8 text-selcuk-blue/20" />
        </div>

        <div className="bg-gradient-to-br from-selcuk-blue to-selcuk-navy text-white p-4 rounded-2xl shadow-xs flex flex-col justify-center">
          <p className="text-[11px] text-amber-300 font-bold uppercase">Hızlı Süreç</p>
          <p className="text-xs text-slate-200 mt-0.5 leading-snug">
            Bekleyen talepleri doğrudan yeni toplantı gündemine aktarabilirsiniz.
          </p>
          <Link
            href="/meetings/new"
            className="mt-2 text-xs font-bold text-amber-400 hover:text-white flex items-center gap-1"
          >
            <span>Yeni Toplantı Başlat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filtreleme ve Sekmeler */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 text-xs">
          <span className="font-semibold text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Durum:</span>
          </span>
          {[
            { key: "ALL", label: "Tümü" },
            { key: "BEKLIYOR", label: "Bekleyenler" },
            { key: "TOPLANTIYA_EKLENDI", label: "Gündeme Alınanlar" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === tab.key
                  ? "bg-selcuk-blue text-white shadow-xs font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Kategori:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-1.5 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">Tüm Kategoriler</option>
            <option value="DERS_GOREVLENDIRME">1. Eğitim-Öğretim & Ders Dağılımı</option>
            <option value="MUAFIYET_INTIBAK">2. Muafiyet ve İntibak Kararları</option>
            <option value="STAJ_ISLETME">3. Staj ve İME Raporları</option>
            <option value="SINAV_MAZERET">4. Sınav Programı & Mazeretler</option>
            <option value="KOMISYON_SECIMI">5. Komisyon ve Koordinatörlük</option>
          </select>
        </div>
      </div>

      {/* Talepler Listesi */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Talepler yükleniyor...</div>
      ) : talepler.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-semibold text-sm">Seçili kriterlere uygun bekleyen talep bulunamadı.</p>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="text-xs px-3 py-1.5 bg-selcuk-blue text-white font-bold rounded-lg"
          >
            Yeni Talep Oluştur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {talepler.map((talep) => (
            <div
              key={talep.id}
              className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between gap-4 shadow-xs hover:shadow-md ${
                talep.durum === "TOPLANTIYA_EKLENDI"
                  ? "border-emerald-200 bg-emerald-50/20"
                  : "border-slate-200"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        talep.durum === "TOPLANTIYA_EKLENDI"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {talep.durum === "TOPLANTIYA_EKLENDI" ? "Gündeme Alındı" : "Toplantı Bekliyor"}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {talep.talepTuru}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {new Date(talep.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {talep.baslik}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {talep.aciklama || "Açıklama girilmemiş."}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <User className="w-3.5 h-3.5 text-selcuk-blue" />
                    <span>{talep.basvuranAd} {talep.basvuranNo && `(${talep.basvuranNo})`}</span>
                  </span>

                  {talep.ekBelgeAdi && (
                    <span className="flex items-center gap-1 text-selcuk-turquoise font-medium bg-selcuk-turquoise/10 px-2 py-0.5 rounded">
                      <Paperclip className="w-3 h-3" />
                      <span>{talep.ekBelgeAdi}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Alt Butonlar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedTalepForView(talep)}
                  className="text-xs text-selcuk-blue hover:underline flex items-center gap-1 font-semibold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detay & Öneri Karar</span>
                </button>

                <div className="flex items-center gap-2">
                  {talep.durum === "BEKLIYOR" ? (
                    <button
                      onClick={() => handleStatusChange(talep.id, "TOPLANTIYA_EKLENDI")}
                      className="text-xs px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Gündeme Alındı Yap</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(talep.id, "BEKLIYOR")}
                      className="text-xs px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition"
                    >
                      Beklemeye Al
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteTalep(talep.id)}
                    className="text-xs text-rose-500 hover:text-rose-700 p-1"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Yeni Talep Modalı */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-selcuk-blue" />
                <span>Bekleyen Gündem Havuzuna Yeni Talep Ekle</span>
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTalep} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Talep Türü</label>
                  <select
                    value={formData.talepTuru}
                    onChange={(e) => setFormData({ ...formData, talepTuru: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="ABD Başkanlığı Yazısı">ABD Başkanlığı Yazısı</option>
                    <option value="Komisyon Raporu">Komisyon Raporu</option>
                    <option value="Öğrenci Dilekçesi">Öğrenci Dilekçesi</option>
                    <option value="Dekanlık Sevk / Havale">Dekanlık Sevk / Havale</option>
                    <option value="Bölüm Başkanlığı Teklifi">Bölüm Başkanlığı Teklifi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Karar Kategorisi</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="DERS_GOREVLENDIRME">1. Eğitim-Öğretim & Ders Dağılımı</option>
                    <option value="MUAFIYET_INTIBAK">2. Muafiyet ve İntibak Kararları</option>
                    <option value="STAJ_ISLETME">3. Staj ve İME Kararları</option>
                    <option value="SINAV_MAZERET">4. Sınav Programı & Mazeretler</option>
                    <option value="KOMISYON_SECIMI">5. Komisyon ve Koordinatörlük Seçimi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Madde Başlığı</label>
                <input
                  type="text"
                  value={formData.baslik}
                  onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
                  placeholder="Örn: Bilgisayar Ağları ABD 2026-2027 Güz Lisansüstü Ders Dağılımı"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Başvuran / Talep Sahibi</label>
                  <input
                    type="text"
                    value={formData.basvuranAd}
                    onChange={(e) => setFormData({ ...formData, basvuranAd: e.target.value })}
                    placeholder="Örn: Prof. Dr. Fatma Zehra Şahin veya Yunus Emre Sert"
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sicil / Öğrenci No (Varsa)</label>
                  <input
                    type="text"
                    value={formData.basvuranNo}
                    onChange={(e) => setFormData({ ...formData, basvuranNo: e.target.value })}
                    placeholder="Örn: 233311021 veya SU-10901"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Açıklama / Başvuru Özeti</label>
                <textarea
                  value={formData.aciklama}
                  onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                  placeholder="Talep edilen hususun gerekçesi ve detayları..."
                  rows={2}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Taslak / Öneri Karar Metni</label>
                <textarea
                  value={formData.oneriKararMetni}
                  onChange={(e) => setFormData({ ...formData, oneriKararMetni: e.target.value })}
                  placeholder="Kurulda oylanması önerilen karar metni..."
                  rows={2}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ek Dosya Adı / Referans</label>
                <input
                  type="text"
                  value={formData.ekBelgeAdi}
                  onChange={(e) => setFormData({ ...formData, ekBelgeAdi: e.target.value })}
                  placeholder="Örn: transkript.pdf, staj_defteri.pdf, dilekce.pdf"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold bg-selcuk-blue hover:bg-selcuk-navy text-white rounded-lg shadow-xs"
                >
                  Havuza Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detay & Öneri Karar Modalı */}
      {selectedTalepForView && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-selcuk-blue text-white">
                  {selectedTalepForView.talepTuru}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1">
                  {selectedTalepForView.baslik}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTalepForView(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="font-semibold text-slate-700">Talep Eden:</p>
                <p className="text-slate-600">
                  {selectedTalepForView.basvuranAd} {selectedTalepForView.basvuranNo && `(${selectedTalepForView.basvuranNo})`}
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-700">Açıklama:</p>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {selectedTalepForView.aciklama || "Açıklama bulunmuyor."}
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-700">Öneri Karar Metni:</p>
                <p className="text-slate-700 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 italic">
                  &quot;{selectedTalepForView.oneriKararMetni || "Öneri karar metni belirtilmemiş."}&quot;
                </p>
              </div>

              {selectedTalepForView.ekBelgeAdi && (
                <div>
                  <p className="font-semibold text-slate-700">Ekli Evrak:</p>
                  <p className="text-selcuk-turquoise flex items-center gap-1 font-semibold mt-0.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{selectedTalepForView.ekBelgeAdi}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setSelectedTalepForView(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
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
