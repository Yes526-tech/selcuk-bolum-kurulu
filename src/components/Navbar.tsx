"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FileText,
  Users,
  Layers,
  Calendar,
  Building2,
  BookOpen,
  PlusCircle,
  ShieldCheck,
  ChevronDown,
  Database,
  Inbox,
  Archive,
  UserCheck,
  LogIn,
  Sparkles,
  Lock,
  Bell,
  HelpCircle,
  KeyRound,
  X,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, allPresetUsers, switchUser } = useAuth();
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.departments.length > 0) {
          setDepartments(data.departments);
          const saved = localStorage.getItem("selected_dept_id");
          if (saved && data.departments.some((d: any) => d.id === saved)) {
            setSelectedDeptId(saved);
          } else {
            setSelectedDeptId(data.departments[0].id);
            localStorage.setItem("selected_dept_id", data.departments[0].id);
          }
        }
      })
      .catch((err) => console.error("Navbar departments fetch error:", err));
  }, []);

  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    localStorage.setItem("selected_dept_id", deptId);
    window.dispatchEvent(new CustomEvent("department_changed", { detail: { deptId } }));
  };

  const currentDept = departments.find((d) => d.id === selectedDeptId);

  const navLinks = [
    { href: "/", label: "Toplantı Panosu", icon: Calendar },
    { href: "/meetings/new", label: "Yeni Toplantı", icon: PlusCircle },
    { href: "/agenda-pool", label: "Talep Havuzu", icon: Inbox },
    { href: "/archive", label: "Karar Arşivi", icon: Archive },
    { href: "/templates", label: "Şablonlar", icon: Layers },
    { href: "/members", label: "Kurul Üyeleri", icon: Users },
    { href: "/roles", label: "Rol & Yetkiler", icon: ShieldCheck },
    { href: "/logs", label: "İşlem Kayıtları", icon: FileText },
    { href: "/verify", label: "Belge Doğrula", icon: Lock },
    { href: "/announcements", label: "Duyurular", icon: Bell },
    { href: "/guide", label: "Kılavuz", icon: HelpCircle },
    { href: "/system-design", label: "Şema", icon: Database },
  ];

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    if (!pwdCurrent) {
      setPwdError("Lütfen mevcut parolanızı giriniz.");
      return;
    }
    if (pwdNew.length < 6) {
      setPwdError("Yeni parola en az 6 karakter olmalıdır.");
      return;
    }
    if (pwdNew !== pwdConfirm) {
      setPwdError("Yeni parolalar birbiriyle eşleşmiyor.");
      return;
    }
    setPwdSuccess(true);
    setTimeout(() => {
      setIsPasswordModalOpen(false);
      setPwdSuccess(false);
      setPwdCurrent("");
      setPwdNew("");
      setPwdConfirm("");
    }, 1500);
  };

  return (
    <header className="bg-selcuk-dark/95 backdrop-blur-md text-white shadow-xl border-b border-selcuk-turquoise/20 no-print sticky top-0 z-50 transition-all">
      {/* Üst Şerit (Resmi Kurumsal Başlık & Bilgi Çubuğu) */}
      <div className="bg-black/30 border-b border-white/5 px-4 sm:px-6 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-extrabold tracking-wider text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              T.C. SELÇUK ÜNİVERSİTESİ
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-medium hidden sm:inline">
              Bölüm Kurulu Süreci ve Karar Yönetim Otomasyonu
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <Link
              href="/verify"
              className="inline-flex items-center gap-1.5 bg-selcuk-turquoise/15 hover:bg-selcuk-turquoise/25 text-selcuk-turquoise px-2.5 py-0.5 rounded-full border border-selcuk-turquoise/30 font-mono text-[11px] font-semibold transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-selcuk-turquoise" />
              Doğrulama Portalı
            </Link>

            <Link
              href="/guide"
              className="text-[11px] text-slate-400 hover:text-amber-300 transition-colors hidden md:inline"
            >
              Kullanım Kılavuzu
            </Link>
          </div>
        </div>
      </div>

      {/* Ana Navigasyon Alanı */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo ve Üniversite Başlığı */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white p-0.5 flex items-center justify-center shadow-lg border-2 border-amber-400 group-hover:scale-105 transition-transform duration-200">
                <img src="/selcuk-logo.svg" alt="T.C. Selçuk Üniversitesi Logosu" className="w-8 h-8 object-contain" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-selcuk-turquoise border-2 border-selcuk-dark flex items-center justify-center text-[8px] font-bold text-selcuk-dark">
                ✓
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm leading-tight tracking-tight text-white group-hover:text-amber-300 transition-colors">
                BÖLÜM KURULU SİSTEMİ
              </span>
              <span className="text-[10px] text-selcuk-turquoise font-semibold tracking-wide">
                6 Adımlı Karar & EBYS Sevk Motoru
              </span>
            </div>
          </Link>

          {/* Menü Bağlantıları (Masaüstü) */}
          <nav className="hidden 2xl:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-selcuk-turquoise/20 text-selcuk-turquoise border border-selcuk-turquoise/40 shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sağ Alan: Bölüm Seçici ve Kullanıcı / Rol Profili */}
          <div className="flex items-center gap-2.5">
            {/* Departman / Kurul Seçici */}
            <div className="relative hidden lg:block">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-selcuk-turquoise/50 rounded-xl px-3 py-1.5 transition-colors shadow-xs">
                <Building2 className="w-3.5 h-3.5 text-selcuk-turquoise flex-shrink-0" />
                <select
                  aria-label="Aktif Bölüm Seçimi"
                  value={selectedDeptId}
                  onChange={(e) => handleDeptChange(e.target.value)}
                  className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer max-w-[160px] truncate"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id} className="bg-slate-900 text-white py-1">
                      {dept.code} - {dept.name}
                    </option>
                  ))}
                </select>
                {currentDept && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      currentDept.departmentType === "COK_ANABILIM_DALI"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                        : "bg-purple-500/20 text-purple-300 border border-purple-400/30"
                    }`}
                  >
                    {currentDept.departmentType === "COK_ANABILIM_DALI" ? "Çok ABD" : "Tek ABD"}
                  </span>
                )}
              </div>
            </div>

            {/* Duyurular Butonu */}
            <Link
              href="/announcements"
              className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-300 rounded-xl border border-white/10 transition-colors relative"
              title="Kurul Duyuruları"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </Link>

            {/* Kullanıcı / Rol Profili Menüsü */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/15 rounded-xl px-3 py-1.5 transition-all shadow-xs text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 text-selcuk-dark flex items-center justify-center font-extrabold text-xs shadow-xs flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left pr-1">
                  <p className="text-[11px] font-bold text-white leading-tight truncate max-w-[120px]">
                    {user.title} {user.name}
                  </p>
                  <p className="text-[10px] text-amber-300 font-semibold leading-tight truncate">
                    {user.role === "BOLUM_BASKANI"
                      ? "Bölüm Başkanı"
                      : user.role === "BOLUM_BASKAN_YARDIMCISI"
                      ? "Bşk. Yrd."
                      : user.role === "ABD_BASKANI"
                      ? "ABD Başkanı"
                      : user.role === "BOLUM_SEKRETERI"
                      ? "Bölüm Sekreteri"
                      : "Öğr. Elemanı"}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </button>

              {/* Rol Açılır Menüsü */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 text-slate-800 p-2.5 overflow-hidden animate-in fade-in-50 zoom-in-95">
                    <div className="p-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/80 rounded-xl mb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-selcuk-blue uppercase tracking-wider">
                          Aktif Oturum
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Yetkili
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {user.title} {user.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{user.email}</p>
                      <p className="text-[11px] text-selcuk-turquoise font-semibold mt-1">
                        {user.departmentName}
                      </p>
                    </div>

                    {/* Hızlı Profil Eylemleri (Şekil 4.21 & 4.22) */}
                    <div className="grid grid-cols-2 gap-1.5 mb-2.5 px-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsPasswordModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-selcuk-blue" />
                        <span>Şifre Değiştir</span>
                      </button>
                      <Link
                        href="/roles"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-selcuk-turquoise" />
                        <span>Yetki Matrisi</span>
                      </Link>
                    </div>

                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Fakülte Kadrosu ({allPresetUsers.length} Hoca)</span>
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    </div>

                    <div className="px-2 pb-1.5">
                      <input
                        type="text"
                        placeholder="Hoca ara (Şakir, Tahir, Fatih)..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-selcuk-blue"
                      />
                    </div>

                    <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                      {allPresetUsers
                        .filter((preset) => {
                          if (!userSearch.trim()) return true;
                          const q = userSearch.toLowerCase();
                          return (
                            preset.name.toLowerCase().includes(q) ||
                            (preset.duty && preset.duty.toLowerCase().includes(q)) ||
                            preset.title.toLowerCase().includes(q)
                          );
                        })
                        .map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => {
                              switchUser(preset.id);
                              setIsUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                              preset.id === user.id
                                ? "bg-selcuk-blue text-white font-bold shadow-xs"
                                : "hover:bg-slate-100 text-slate-700"
                            }`}
                          >
                            <div className="truncate">
                              <p className="truncate font-semibold">
                                {preset.title} {preset.name} {preset.duty ? `(${preset.duty})` : ""}
                              </p>
                              <p
                                className={`text-[10px] truncate ${
                                  preset.id === user.id ? "text-amber-300 font-medium" : "text-slate-400"
                                }`}
                              >
                                {preset.role.replace(/_/g, " ")}
                              </p>
                            </div>
                            {preset.id === user.id && (
                              <UserCheck className="w-4 h-4 text-amber-300 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                    </div>

                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between px-1">
                      <Link
                        href="/login"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="text-xs text-selcuk-blue hover:text-selcuk-navy font-bold flex items-center gap-1.5"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Giriş Ekranı</span>
                      </Link>
                      <Link
                        href="/logs"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="text-xs text-slate-500 hover:text-slate-900 font-medium"
                      >
                        İşlem Logları
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobil / Orta Ekran Yatay Kaydırılabilir Navigasyon Şeridi (Rapor Bölüm 3.15) */}
        <div className="2xl:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-white/10 no-scrollbar">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-selcuk-turquoise/20 text-selcuk-turquoise font-bold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Şifre Değiştirme Modalı (Rapor Şekil 4.22) */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-slate-900">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-selcuk-blue/10 flex items-center justify-center text-selcuk-blue">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Parola Değiştirme</h3>
                  <p className="text-[11px] text-slate-500">Kullanıcı profil güvenliği</p>
                </div>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pwdSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">Parolanız başarıyla güncellendi!</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Yeni parolanız sonraki oturumlarda geçerli olacaktır.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                {pwdError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <span className="font-medium">{pwdError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mevcut Parola
                  </label>
                  <input
                    type="password"
                    required
                    value={pwdCurrent}
                    onChange={(e) => setPwdCurrent(e.target.value)}
                    placeholder="Mevcut parolanız"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-selcuk-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Yeni Parola
                  </label>
                  <input
                    type="password"
                    required
                    value={pwdNew}
                    onChange={(e) => setPwdNew(e.target.value)}
                    placeholder="En az 6 karakter"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-selcuk-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Yeni Parola (Tekrar)
                  </label>
                  <input
                    type="password"
                    required
                    value={pwdConfirm}
                    onChange={(e) => setPwdConfirm(e.target.value)}
                    placeholder="Yeni parolayı onaylayın"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-selcuk-blue focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-selcuk-blue hover:bg-selcuk-dark text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    Parolayı Güncelle
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
