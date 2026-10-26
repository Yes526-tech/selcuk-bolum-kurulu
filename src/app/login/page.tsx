"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  Mail,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Building2,
  Lock,
  KeyRound
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, allPresetUsers, switchUser, login } = useAuth();
  const [email, setEmail] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [generatedCaptcha, setGeneratedCaptcha] = useState("482910");
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const refreshCaptcha = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCaptcha(code);
    setCaptchaInput("");
  };

  useEffect(() => {
    refreshCaptcha();
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.departments.length > 0) {
          setDepartments(data.departments);
          const saved = localStorage.getItem("selected_dept_id") || data.departments[0].id;
          setSelectedDeptId(saved);
        }
      });
  }, []);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Güvenlik kodu denetimi (Rapor Bölüm 3.6 uyarınca)
    if (captchaInput.trim() !== generatedCaptcha) {
      setError("Güvenlik kodu hatalı! Lütfen kutuda görünen 6 haneli kodu tekrar giriniz.");
      refreshCaptcha();
      return;
    }

    if (selectedDeptId) {
      localStorage.setItem("selected_dept_id", selectedDeptId);
      window.dispatchEvent(new CustomEvent("department_changed", { detail: { deptId: selectedDeptId } }));
    }

    const res = login(email);
    if (res.success) {
      setSuccessMsg("Kurumsal giriş başarılı! Seçili kurula yönlendiriliyorsunuz...");
      setTimeout(() => router.push("/"), 700);
    } else {
      setError(res.message || "Giriş başarısız.");
    }
  };

  const handlePresetSelect = (userId: string) => {
    if (selectedDeptId) {
      localStorage.setItem("selected_dept_id", selectedDeptId);
      window.dispatchEvent(new CustomEvent("department_changed", { detail: { deptId: selectedDeptId } }));
    }
    switchUser(userId);
    setSuccessMsg("Rol oturumu aktif edildi! Yönlendiriliyorsunuz...");
    setTimeout(() => router.push("/"), 500);
  };

  // Öne çıkarılan temsilci roller
  const priorityPresets = [
    allPresetUsers.find((u) => u.name.includes("Şakir") || u.name.includes("TAŞDEMİR")) || allPresetUsers[0],
    allPresetUsers.find((u) => u.name.includes("Tahir") || u.name.includes("SAĞ")) || allPresetUsers[1],
    allPresetUsers.find((u) => u.name.includes("Fatih") || u.name.includes("BAŞÇİFTÇİ")) || allPresetUsers[2],
    allPresetUsers.find((u) => u.role === "BOLUM_SEKRETERI") || allPresetUsers[3],
  ].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 space-y-8">
      {/* Başlık ve Kurumsal Kimlik */}
      <div className="text-center space-y-3 relative">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-selcuk-blue to-selcuk-dark text-amber-300 shadow-xl ring-4 ring-amber-400/20 mb-1">
          <ShieldCheck className="w-11 h-11" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            T.C. SELÇUK ÜNİVERSİTESİ
          </h1>
          <p className="text-sm sm:text-base font-bold text-selcuk-turquoise tracking-wide uppercase mt-1">
            Bölüm Kurulu Süreci ve Karar Yönetim Otomasyonu
          </p>
        </div>
        <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
          Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 ve EBYS İş Akışları Doğrultusunda Güvenli Oturum ve Kurul Seçimi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
        {/* Sol Kolon: Kurumsal E-posta ve Güvenlik Kodu Giriş Formu */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-selcuk-blue" />
              <span>Kurumsal Giriş (@selcuk.edu.tr)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Selçuk Üniversitesi e-posta adresiniz, şifreniz ve güvenlik kodunuzla giriş yapın
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4">
            {/* Kurul / Bölüm Seçimi (Rapor Bölüm 1.1) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-selcuk-blue" />
                <span>Çalışılacak Kurul / Birim</span>
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50 font-medium focus:ring-2 focus:ring-selcuk-blue focus:outline-none shadow-xs"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.facultyName})
                  </option>
                ))}
              </select>
            </div>

            {/* E-posta */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kurumsal E-posta Adresi
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ad.soyad@selcuk.edu.tr"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-selcuk-blue focus:outline-none shadow-xs font-medium"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Örn: stasdemir@selcuk.edu.tr veya ceng.sekreterlik@selcuk.edu.tr
              </span>
            </div>

            {/* Parola */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Parola / Şifre
              </label>
              <input
                type="password"
                defaultValue="••••••••"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50/70 text-slate-600 focus:outline-none shadow-xs"
              />
            </div>

            {/* 6 Haneli Güvenlik Kodu (Rapor Bölüm 3.6 Standardı) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Güvenlik Kodu (Captcha)</span>
                <span className="text-[10px] text-slate-400 font-normal">2 dakika geçerli</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="6 haneli kod"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono tracking-widest text-center border border-slate-300 rounded-xl focus:ring-2 focus:ring-selcuk-blue focus:outline-none shadow-xs font-bold"
                  />
                </div>

                {/* Captcha Görsel Kutusu */}
                <div className="flex items-center gap-1.5 bg-slate-900 text-amber-300 px-3.5 py-2 rounded-xl select-none shadow-xs border border-slate-800">
                  <span className="font-mono font-black text-sm tracking-widest">
                    {generatedCaptcha}
                  </span>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Güvenlik kodunu yenile"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-selcuk-blue hover:bg-selcuk-dark text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>Güvenli Kurumsal Giriş Yap</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
            <p className="font-bold text-slate-700">Mevcut Aktif Oturum:</p>
            <p className="text-slate-600 font-mono mt-0.5">
              {user.title} {user.name} ({user.role})
            </p>
          </div>
        </div>

        {/* Sağ Kolon: Hızlı Rol Test ve Simülasyon Paneli */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/90 rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-selcuk-blue/10 text-selcuk-blue text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-selcuk-blue" />
              Hızlı Rol Simülasyonu
            </div>
            <h2 className="text-base font-extrabold text-slate-900">
              Tek Tıkla Kurumsal Yetki Simülasyonu
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Rapor ve değerlendirme aşamasında farklı kurul rollerinin deneyimlenmesi için hazır oturum profilleri:
            </p>
          </div>

          <div className="space-y-2.5">
            {priorityPresets.map((preset) => {
              const isSelected = preset.id === user.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-gradient-to-r from-selcuk-blue to-selcuk-dark text-white border-selcuk-blue shadow-md scale-[1.01]"
                      : "bg-white text-slate-800 border-slate-200 hover:border-selcuk-turquoise hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-selcuk-blue"
                      }`}
                    >
                      {preset.role === "BOLUM_BASKANI"
                        ? "BŞK"
                        : preset.role === "BOLUM_BASKAN_YARDIMCISI"
                        ? "BYD"
                        : preset.role === "ABD_BASKANI"
                        ? "ABD"
                        : preset.role === "BOLUM_SEKRETERI"
                        ? "SEK"
                        : "ÖĞR"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">
                        {preset.title} {preset.name}
                      </p>
                      <p
                        className={`text-[11px] truncate ${
                          isSelected ? "text-amber-200" : "text-slate-500"
                        }`}
                      >
                        {preset.duty || preset.role.replace(/_/g, " ")} • {preset.email}
                      </p>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-300 flex-shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl text-amber-900 text-[11px] leading-relaxed shadow-xs">
            <strong>Yönetmelik Uyarısı:</strong> Çok Anabilim Dallı bölümlerde sadece Bölüm Başkanı, Başkan Yardımcıları ve ABD Başkanları asıl kurul üyesidir ve oylamaya katılır. Bölüm Sekreteri ise raportör olarak tutanak düzenler.
          </div>
        </div>
      </div>
    </div>
  );
}
