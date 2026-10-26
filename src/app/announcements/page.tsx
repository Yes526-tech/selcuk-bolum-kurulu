"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  PlusCircle,
  Clock,
  UserCheck,
  Send,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Edit2,
  CheckCircle2,
  Mail,
  Share2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.departments.length > 0) {
          setDepartments(data.departments);
          const saved = localStorage.getItem("selected_dept_id") || data.departments[0].id;
          setSelectedDeptId(saved);
          loadAnnouncements(saved);
        }
      });
  }, []);

  const loadAnnouncements = (deptId: string) => {
    setLoading(true);
    fetch(`/api/announcements?departmentId=${deptId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAnnouncements(data.announcements);
        }
      })
      .catch((err) => console.error("Announcements fetch error:", err))
      .finally(() => setLoading(false));
  };

  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    loadAnnouncements(deptId);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setIsModalOpen(true);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          departmentId: selectedDeptId,
          title: title.trim(),
          content: content.trim(),
          authorName: `${user.title} ${user.name}`,
          authorEmail: user.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        loadAnnouncements(selectedDeptId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Banner */}
      <div className="bg-gradient-to-r from-selcuk-blue via-selcuk-navy to-selcuk-dark text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-selcuk-turquoise/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-selcuk-dark font-black text-xs px-2.5 py-0.5 rounded-full">
                BİLDİRİM VE TEBLİĞ
              </span>
              <span className="text-slate-300 text-xs">
                Rapor Bölüm 3.18 & Şekil 4.17 Standardı
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Kurul Toplantı Duyuruları ve Tebliğler
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Bölüm ve Anabilim Dalı Kurullarının toplantı çağrıları, gündem bildirimleri ve komisyon duyuruları sürüm denetimli olarak yayımlanır.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-selcuk-dark rounded-xl text-xs font-black transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni Duyuru Yayımla</span>
          </button>
        </div>
      </div>

      {/* Bölüm Filtresi */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-selcuk-blue" />
          <span className="text-xs font-bold text-slate-700">Aktif Kurul Seçimi:</span>
          <select
            value={selectedDeptId}
            onChange={(e) => handleDeptChange(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 font-medium focus:outline-none focus:ring-1 focus:ring-selcuk-blue"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Toplam <span className="font-bold text-slate-800">{announcements.length}</span> duyuru listeleniyor
        </span>
      </div>

      {/* Duyurular Listesi */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
          <div className="w-6 h-6 border-2 border-selcuk-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Duyurular yükleniyor...</span>
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
          <Bell className="w-8 h-8 text-slate-300 mx-auto mb-1" />
          <p className="font-bold">Henüz yayımlanmış duyuru bulunmuyor.</p>
          <p className="text-xs text-slate-400">Yeni duyuru butonuna tıklayarak ilk toplantı çağrısını paylaşabilirsiniz.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7 hover:border-slate-300 transition-colors space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-selcuk-blue text-amber-300 shadow-2xs">
                    Sürüm v{ann.version}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(ann.publishedAt).toLocaleDateString("tr-TR", { dateStyle: "long" })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(ann)}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-selcuk-blue px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Güncelle (Yeni Sürüm)</span>
                  </button>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {ann.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {ann.content}
              </p>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <UserCheck className="w-4 h-4 text-selcuk-blue" />
                  Yayımlayan: <strong className="text-slate-800">{ann.authorName}</strong>
                </span>

                <span className="text-[11px] text-slate-400">
                  Kurul Üyelerine Tebliğ Edildi ✓
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Duyuru Ekle / Güncelle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in fade-in-50 zoom-in-95">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-selcuk-blue block mb-1">
                {editingId ? "Duyuru Sürüm Güncelleme" : "Yeni Kurul Duyurusu"}
              </span>
              <h3 className="text-lg font-black text-slate-900">
                {editingId ? "Mevcut Duyuruyu Güncelle (v+1)" : "Toplantı ve Kurul Tebliği Yayımla"}
              </h3>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duyuru Başlığı
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: 2026-2027 Güz Yarıyılı 3. Olağan Kurul Çağrısı"
                  className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-xl focus:ring-1 focus:ring-selcuk-blue focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duyuru Metni / Tebliğ İçeriği
                </label>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Toplantı tarihi, saati, gündem konuları ve üyelere yönelik açıklamalar..."
                  className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-xl focus:ring-1 focus:ring-selcuk-blue focus:outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-selcuk-blue hover:bg-selcuk-dark text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  {submitting ? "Kaydediliyor..." : editingId ? "Sürümü Güncelle" : "Yayımla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
