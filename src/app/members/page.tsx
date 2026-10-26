"use client";

import { useEffect, useState } from "react";
import {
  Users,
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  Info,
  Award,
  UserPlus,
  Plane,
  AlertTriangle,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  GraduationCap
} from "lucide-react";
import { OFFICIAL_FACULTY_LIST, OfficialFacultyMember } from "@/lib/faculty-list";

export default function MembersPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [members, setMembers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [activeMemberForLeave, setActiveMemberForLeave] = useState<any>(null);
  const [leaveReason, setLeaveReason] = useState("YÖK Yurtdışı Görevlendirmesi / İzinli");

  // Hoca Seçim ve Arama State'i
  const [facultySearch, setFacultySearch] = useState("");
  const [selectedFacultyId, setSelectedFacultyId] = useState("");

  // New Member Form State
  const [newMemberForm, setNewMemberForm] = useState({
    title: "Prof. Dr.",
    firstName: "",
    lastName: "",
    email: "",
    phone: "0332 223 2100",
    sicilNo: "",
    role: "OGRETIM_UYESI",
    academicUnitId: "",
  });

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.departments.length > 0) {
          setDepartments(data.departments);
          const saved = localStorage.getItem("selected_dept_id") || data.departments[0].id;
          setSelectedDeptId(saved);
          loadMembers(saved);
        }
      });
  }, []);

  const loadMembers = (deptId: string) => {
    setLoading(true);
    fetch(`/api/members?departmentId=${deptId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMembers(data.members);
          setStats(data.stats);
        }
      })
      .finally(() => setLoading(false));
  };

  const handleDeptSelect = (deptId: string) => {
    setSelectedDeptId(deptId);
    localStorage.setItem("selected_dept_id", deptId);
    loadMembers(deptId);
  };

  const handleSelectFacultyMember = (id: string) => {
    setSelectedFacultyId(id);
    const fac = OFFICIAL_FACULTY_LIST.find((f) => f.id === id);
    if (fac) {
      setNewMemberForm({
        title: fac.title,
        firstName: fac.firstName,
        lastName: fac.lastName,
        email: fac.email,
        phone: "0332 223 2100",
        sicilNo: fac.sicilNo,
        role: fac.defaultRole,
        academicUnitId: newMemberForm.academicUnitId,
      });
    }
  };

  const filteredFacultyList = OFFICIAL_FACULTY_LIST.filter((f) => {
    if (!facultySearch.trim()) return true;
    const q = facultySearch.toLowerCase();
    return (
      f.fullName.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      (f.duty && f.duty.toLowerCase().includes(q))
    );
  });

  const handleToggleLeave = async (member: any) => {
    if (member.onLeave) {
      // Göreve Döndür
      const res = await fetch(`/api/members/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onLeave: false, leaveReason: null }),
      });
      if (res.ok) {
        loadMembers(selectedDeptId);
      }
    } else {
      // İzinli Yap Modalını Aç
      setActiveMemberForLeave(member);
      setLeaveReason("YÖK Resmi Görevlendirmesi / İzinli");
      setIsLeaveModalOpen(true);
    }
  };

  const submitLeave = async () => {
    if (!activeMemberForLeave) return;
    const res = await fetch(`/api/members/${activeMemberForLeave.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onLeave: true, leaveReason }),
    });
    if (res.ok) {
      setIsLeaveModalOpen(false);
      loadMembers(selectedDeptId);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.firstName || !newMemberForm.lastName || !newMemberForm.email) {
      alert("Lütfen ad, soyad ve e-posta alanlarını doldurunuz.");
      return;
    }

    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newMemberForm,
        departmentId: selectedDeptId,
      }),
    });

    if (res.ok) {
      setIsAddModalOpen(false);
      setNewMemberForm({
        title: "Dr. Öğr. Üyesi",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        sicilNo: "",
        role: "OGRETIM_UYESI",
        academicUnitId: "",
      });
      loadMembers(selectedDeptId);
    } else {
      const err = await res.json();
      alert("Hata: " + (err.error || "Personel eklenemedi"));
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Bu öğretim elemanını sistemden silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/members/${memberId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      loadMembers(selectedDeptId);
    }
  };

  const currentDept = departments.find((d) => d.id === selectedDeptId);
  const boardMembers = members.filter((m) => m.isBoardMember);
  const nonBoardMembers = members.filter((m) => !m.isBoardMember);

  return (
    <div className="space-y-6">
      {/* Üst Başlık ve Aksiyonlar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Kurul Üye Yapısı ve Yönetmelik Madde 15 Yönetimi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 hükümlerine göre dinamik olarak teşekkül eden kurul üyeleri ve nisap hesaplaması
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Departman Değiştirme */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
            <Building2 className="w-4 h-4 text-selcuk-blue" />
            <select
              value={selectedDeptId}
              onChange={(e) => handleDeptSelect(e.target.value)}
              className="text-xs font-semibold bg-transparent focus:outline-none cursor-pointer pr-2"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.departmentType === "COK_ANABILIM_DALI" ? "Çok ABD'li" : "Tek ABD'li"})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-selcuk-blue hover:bg-selcuk-navy text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Yeni Personel Ekle</span>
          </button>
        </div>
      </div>

      {/* Yönetmelik Madde 15 Kurumsal Bilgi ve Canlı Nisap Kartı */}
      <div className="bg-gradient-to-r from-selcuk-blue to-selcuk-navy text-white rounded-2xl p-6 shadow-md border border-selcuk-turquoise/30">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-3 w-full">
            <div>
              <h3 className="font-bold text-sm text-amber-300 uppercase tracking-wide">
                Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 15): Bölüm Kurulu Üye Yapısı & Nisap Kuralı
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed mt-1">
                &quot;Bölüm kurulu; tek anabilim/anasanat dalı bulunan bölümlerde bölüm başkanının başkanlığında tüm öğretim üyeleri ve öğretim görevlilerinden; birden fazla anabilim/anasanat dalı bulunan bölümlerde ise bölüm başkanı, bölüm başkan yardımcıları ile anabilim dalı başkanlarından oluşur.&quot;
              </p>
            </div>

            {/* Dinamik Nisap Hesaplama Çubuğu */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-white/10 text-center">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <p className="text-[10px] text-slate-300 font-medium">Toplam Personel</p>
                  <p className="text-lg font-extrabold text-white">{stats.totalStaff}</p>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <p className="text-[10px] text-emerald-300 font-medium">Asıl Kurul Üyesi (N)</p>
                  <p className="text-lg font-extrabold text-emerald-300">{stats.totalBoardMembers}</p>
                </div>
                <div className="bg-amber-500/20 p-2.5 rounded-xl border border-amber-500/30">
                  <p className="text-[10px] text-amber-300 font-medium">İzinli / Görevli (L)</p>
                  <p className="text-lg font-extrabold text-amber-300">{stats.onLeaveBoardMembers}</p>
                  <span className="text-[9px] text-amber-200">Nisaptan düşer</span>
                </div>
                <div className="bg-blue-500/20 p-2.5 rounded-xl border border-blue-500/30">
                  <p className="text-[10px] text-blue-300 font-medium">Aktif Tamsayı (N - L)</p>
                  <p className="text-lg font-extrabold text-blue-300">{stats.effectiveBoardMembers}</p>
                </div>
                <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30">
                  <p className="text-[10px] text-emerald-200 font-medium">Salt Çoğunluk Eşiği</p>
                  <p className="text-lg font-extrabold text-emerald-400">{stats.requiredQuorum} Üye</p>
                  <span className="text-[9px] text-emerald-300 font-mono">⌊(N-L)/2⌋ + 1</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1. Kurul Üyeleri Listesi (Madde 15 Uyarınca Oy Hakkı Olanlar) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Bölüm Kurulu Asıl Üyeleri (Yönetmelik Madde 15)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                {boardMembers.length} Üye
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toplantılarda hazirunda yer alan, yoklamada salt çoğunluğu oluşturan ve oylamalarda oy kullanan üyeler
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {boardMembers.map((m) => {
            return (
              <div
                key={m.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  m.onLeave
                    ? "border-amber-300 bg-amber-50/50"
                    : "border-emerald-200/80 bg-emerald-50/30 hover:bg-emerald-50/60"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">
                        {m.title} {m.firstName} {m.lastName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-selcuk-blue text-white">
                        {m.boardTitle}
                      </span>
                      {m.onLeave && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-600 text-white animate-pulse">
                          <Plane className="w-3 h-3" />
                          İzinli / Görevli (Nisaptan Düşüldü)
                        </span>
                      )}
                    </div>

                    <span
                      className={`p-1 rounded-full flex-shrink-0 ${
                        m.onLeave
                          ? "text-amber-700 bg-amber-100"
                          : "text-emerald-700 bg-emerald-100"
                      }`}
                      title={m.onLeave ? "İzinli/Görevli" : "Kurul Asıl Üyesi"}
                    >
                      {m.onLeave ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1">
                    <strong>Anabilim Dalı:</strong> {m.academicUnit?.name || "Bölüm Geneli"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {m.email} • {m.phone || "Dahili: 2100"}
                  </p>

                  {m.onLeave && (
                    <div className="mt-2 p-2 bg-amber-100/70 border border-amber-300 rounded-lg text-xs text-amber-900">
                      <strong>İzin/Görev Mazereti:</strong> {m.leaveReason || "YÖK Görevlendirmesi"}
                    </div>
                  )}

                  <p className="text-[11px] text-emerald-800 mt-2 italic bg-white/80 p-1.5 rounded border border-emerald-200">
                    {m.boardExplanation}
                  </p>
                </div>

                {/* Aksiyon Butonları */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleLeave(m)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                      m.onLeave
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-amber-100 hover:bg-amber-200 text-amber-800"
                    }`}
                  >
                    <Plane className="w-3 h-3" />
                    <span>{m.onLeave ? "Göreve Döndür" : "İzinli / Görevli Yap"}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteMember(m.id)}
                    className="text-xs text-rose-500 hover:text-rose-700 p-1"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Kurul Dışı Öğretim Elemanları (Varsa) */}
      {nonBoardMembers.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                <span>Bölümdeki Diğer Öğretim Elemanları (Kurul Dışı / Oy Hakkı Yok)</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {nonBoardMembers.length} Personel
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Birden fazla anabilim dalı bulunan bölümlerde Madde 15 uyarınca Bölüm Kurulunda oy hakkı bulunmamaktadır.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {nonBoardMembers.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        {m.title} {m.firstName} {m.lastName}
                      </p>
                      <p className="text-slate-600 mt-0.5">
                        <strong>Görevi / ABD:</strong> {m.academicUnit?.name || "Bölüm"} ({m.role.replace("_", " ")})
                      </p>
                      <p className="text-slate-500">{m.email}</p>
                    </div>
                    <span className="text-slate-400 p-1 flex-shrink-0" title="Kurul Dışı">
                      <XCircle className="w-5 h-5" />
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 italic">
                    {m.boardExplanation}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-end">
                  <button
                    onClick={() => handleDeleteMember(m.id)}
                    className="text-xs text-rose-500 hover:text-rose-700 p-1"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* İzinli Yap Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Plane className="w-4 h-4 text-amber-600" />
                <span>İzinli / Görevli Durumu Kaydet</span>
              </h3>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              <strong>{activeMemberForLeave?.title} {activeMemberForLeave?.firstName} {activeMemberForLeave?.lastName}</strong> izinli veya görevli olarak işaretlenecektir. Yönetmelik Madde 15 gereğince üye tamsayısından otomatik düşülerek yeni nisap hesaplanacaktır.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                İzin / Görevlendirme Mazereti
              </label>
              <textarea
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                rows={3}
                className="w-full text-xs p-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                placeholder="Örn: YÖK 39. Madde Yurtdışı Araştırma İzni, Sağlık Heyet Raporu vb."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                İptal
              </button>
              <button
                onClick={submitLeave}
                className="px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs"
              >
                İzinli Olarak Kaydet & Nisabı Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Yeni Personel Ekle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-selcuk-blue" />
                <span>Yeni Akademik Personel Ekle</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              {/* HOCA SEÇİM ALANI (İsim elle yazmak yerine bu listeden seçilir) */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-amber-700" />
                    <span>Resmi Fakülte Kadrosundan Hoca Seç:</span>
                  </label>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                    {OFFICIAL_FACULTY_LIST.length} Tanımlı Hoca
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Aşağıdaki listeden seçim yaptığınızda unvan, ad, soyad ve kurumsal e-posta bilgileri otomatik doldurulur.
                </p>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="Hoca ara (örn: Gül Nihal, Humar, Fatih, Tahir, vb.)..."
                    value={facultySearch}
                    onChange={(e) => setFacultySearch(e.target.value)}
                    className="w-full p-2 text-xs border border-amber-300 rounded-lg bg-white focus:ring-1 focus:ring-amber-500"
                  />

                  <select
                    value={selectedFacultyId}
                    onChange={(e) => handleSelectFacultyMember(e.target.value)}
                    className="w-full p-2.5 text-xs font-bold border-2 border-amber-500 rounded-lg bg-white text-slate-800 shadow-xs focus:outline-none"
                  >
                    <option value="">-- Lütfen Listeden Bir Hoca Seçiniz --</option>
                    <optgroup label="Dekanlık & Yönetim">
                      {filteredFacultyList.filter(f => f.duty?.includes("Dekan")).map(fac => (
                        <option key={fac.id} value={fac.id}>
                          {fac.fullName} ({fac.duty})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Profesörler">
                      {filteredFacultyList.filter(f => !f.duty?.includes("Dekan") && f.title.includes("Prof")).map(fac => (
                        <option key={fac.id} value={fac.id}>
                          {fac.fullName} {fac.duty ? `(${fac.duty})` : ""}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Doçentler">
                      {filteredFacultyList.filter(f => f.title.includes("Doç")).map(fac => (
                        <option key={fac.id} value={fac.id}>
                          {fac.fullName} {fac.duty ? `(${fac.duty})` : ""}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Dr. Öğretim Üyeleri">
                      {filteredFacultyList.filter(f => f.title.includes("Dr. Öğr. Üyesi")).map(fac => (
                        <option key={fac.id} value={fac.id}>
                          {fac.fullName}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Öğretim & Araştırma Görevlileri">
                      {filteredFacultyList.filter(f => f.title.includes("Gör")).map(fac => (
                        <option key={fac.id} value={fac.id}>
                          {fac.fullName}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {selectedFacultyId && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Seçildi: <strong>{newMemberForm.title} {newMemberForm.firstName} {newMemberForm.lastName}</strong> ({newMemberForm.email})</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unvan</label>
                  <select
                    value={newMemberForm.title}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, title: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="Prof. Dr.">Prof. Dr.</option>
                    <option value="Doç. Dr.">Doç. Dr.</option>
                    <option value="Dr. Öğr. Üyesi">Dr. Öğr. Üyesi</option>
                    <option value="Öğr. Gör. Dr.">Öğr. Gör. Dr.</option>
                    <option value="Öğr. Gör.">Öğr. Gör.</option>
                    <option value="Arş. Gör.">Arş. Gör.</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">İdari Rol</label>
                  <select
                    value={newMemberForm.role}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="BOLUM_BASKANI">Bölüm Başkanı</option>
                    <option value="BOLUM_BASKAN_YARDIMCISI">Bölüm Başkan Yardımcısı</option>
                    <option value="ABD_BASKANI">Anabilim Dalı Başkanı</option>
                    <option value="OGRETIM_UYESI">Öğretim Üyesi</option>
                    <option value="OGRETIM_GOREVLISI">Öğretim Görevlisi</option>
                    <option value="SEKRETERYA">Bölüm Sekreteri</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ad</label>
                  <input
                    type="text"
                    value={newMemberForm.firstName}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, firstName: e.target.value })}
                    placeholder="Ad"
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Soyad</label>
                  <input
                    type="text"
                    value={newMemberForm.lastName}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, lastName: e.target.value })}
                    placeholder="Soyad"
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kurumsal E-posta</label>
                <input
                  type="email"
                  value={newMemberForm.email}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                  placeholder="ad.soyad@selcuk.edu.tr"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefon / Dahili</label>
                  <input
                    type="text"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    placeholder="0332 223 2100"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sicil No</label>
                  <input
                    type="text"
                    value={newMemberForm.sicilNo}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, sicilNo: e.target.value })}
                    placeholder="SU-12345"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Anabilim Dalı</label>
                <select
                  value={newMemberForm.academicUnitId}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, academicUnitId: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="">Bölüm Geneli / Bağımsız</option>
                  {currentDept?.academicUnits?.map((unit: any) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold bg-selcuk-blue hover:bg-selcuk-navy text-white rounded-lg shadow-xs"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
