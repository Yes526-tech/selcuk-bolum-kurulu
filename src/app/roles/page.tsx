"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Scale,
  Users,
  Award,
  BookOpen,
  Lock,
  Layers,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";
import { ROLES, RoleKey, RoleDefinition, PermissionAccess } from "@/lib/permissions/matrix";
import { useAuth } from "@/context/AuthContext";

export default function RolesAndPermissionsPage() {
  const { user, switchRole } = useAuth();
  const [selectedRoleKey, setSelectedRoleKey] = useState<RoleKey>(user.role || "BOLUM_BASKANI");

  // Rapor Çizelge 3.3'teki Sayfa Bazlı Yetki Alanları
  const PAGE_PERMISSIONS = [
    {
      key: "oylama",
      title: "Oylama ve İmza Süreci",
      path: "/meetings/[id]",
      desc: "Kararları listeleme, kararı açma, oy kullanma, ret gerekçesi girme ve iki aşamalı demo imza işlemleri.",
      access: {
        BOLUM_BASKANI: "TAM_YETKI",
        BOLUM_BASKAN_YARDIMCISI: "TAM_YETKI",
        ABD_BASKANI: "TAM_YETKI",
        OGRETIM_ELEMANI: "KOSULLU_YETKI", // Tek ABD'de tam yetki, çoklu ABD'de kurul dışı
        BOLUM_SEKRETERI: "YOK",
      }
    },
    {
      key: "yeni-karar",
      title: "Toplantı ve Karar Hazırlama",
      path: "/meetings/new",
      desc: "Yeni toplantı oluşturma, karar taslağı hazırlama, parametrik şablon seçimi, ek dosya yönetimi ve hazirun yoklaması.",
      access: {
        BOLUM_BASKANI: "TAM_YETKI",
        BOLUM_BASKAN_YARDIMCISI: "VEKALETEN",
        ABD_BASKANI: "KOSULLU_YETKI",
        OGRETIM_ELEMANI: "YOK",
        BOLUM_SEKRETERI: "TAM_YETKI",
      }
    },
    {
      key: "arsiv",
      title: "Karar Arşivi",
      path: "/archive",
      desc: "İmzalanmış, reddedilmiş ve iptal edilmiş kararları görüntüleme, arama ve resmi PDF/Word çıktılarını indirme.",
      access: {
        BOLUM_BASKANI: "TAM_YETKI",
        BOLUM_BASKAN_YARDIMCISI: "TAM_YETKI",
        ABD_BASKANI: "TAM_YETKI",
        OGRETIM_ELEMANI: "TAM_YETKI",
        BOLUM_SEKRETERI: "TAM_YETKI",
      }
    },
    {
      key: "users",
      title: "Kullanıcı & Kadro Yönetimi",
      path: "/members",
      desc: "Bölüm öğretim elemanlarını listeleme, görev ve sicil bilgilerini düzenleme, yurt dışı/sağlık izin durumunu işleme.",
      access: {
        BOLUM_BASKANI: "TAM_YETKI",
        BOLUM_BASKAN_YARDIMCISI: "VEKALETEN",
        ABD_BASKANI: "KOSULLU_YETKI",
        OGRETIM_ELEMANI: "YOK",
        BOLUM_SEKRETERI: "TAM_YETKI",
      }
    },
    {
      key: "roles",
      title: "Rol ve Yetki Matrisi",
      path: "/roles",
      desc: "Kurul rollerinin sayfa ve işlem bazlı yetkilerini, mevzuat dayanaklarını inceleme ve rol simülasyonu yapma.",
      access: {
        BOLUM_BASKANI: "TAM_YETKI",
        BOLUM_BASKAN_YARDIMCISI: "TAM_YETKI",
        ABD_BASKANI: "TAM_YETKI",
        OGRETIM_ELEMANI: "TAM_YETKI",
        BOLUM_SEKRETERI: "TAM_YETKI",
      }
    },
    {
      key: "logs",
      title: "İşlem Kayıtları (Audit Logs)",
      path: "/logs",
      desc: "Sistemde gerçekleşen oylama, imza, mühür, erteleme ve iptal işlem loglarını inceleme ve filtreleme.",
      access: {
        BOLUM_BASKANI: "TAM_YETKI",
        BOLUM_BASKAN_YARDIMCISI: "TAM_YETKI",
        ABD_BASKANI: "TAM_YETKI",
        OGRETIM_ELEMANI: "YOK",
        BOLUM_SEKRETERI: "TAM_YETKI",
      }
    },
    {
      key: "verify",
      title: "Resmi Belge Doğrulama",
      path: "/verify",
      desc: "EBYS kodu ve SHA-256 kriptografik mühür ile belgenin tahrif edilmediğini teyit etme.",
      access: {
        BOLUM_BASKANI: "TAM_YETKI",
        BOLUM_BASKAN_YARDIMCISI: "TAM_YETKI",
        ABD_BASKANI: "TAM_YETKI",
        OGRETIM_ELEMANI: "TAM_YETKI",
        BOLUM_SEKRETERI: "TAM_YETKI",
      }
    },
  ];

  const getBadge = (status: string) => {
    switch (status) {
      case "TAM_YETKI":
        return {
          label: "Tam Yetki",
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: CheckCircle2,
        };
      case "KOSULLU_YETKI":
        return {
          label: "Koşullu (Md. 15)",
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          icon: Scale,
        };
      case "VEKALETEN":
        return {
          label: "Vekaleten Yetkili",
          bg: "bg-amber-50 text-amber-800 border-amber-200 font-semibold",
          icon: AlertCircle,
        };
      default:
        return {
          label: "Yetki Yok",
          bg: "bg-slate-100 text-slate-400 border-slate-200",
          icon: XCircle,
        };
    }
  };

  const selectedRole = ROLES[selectedRoleKey];

  return (
    <div className="space-y-8">
      {/* Üst Banner */}
      <div className="bg-gradient-to-r from-selcuk-blue via-selcuk-navy to-selcuk-dark text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-selcuk-turquoise/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-selcuk-dark font-black text-xs px-2.5 py-0.5 rounded-full">
                YETKİLENDİRME MATRİSİ
              </span>
              <span className="text-slate-300 text-xs">
                Rapor Bölüm 3.6 & Şekil 4.14 / 4.18 Standardı
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Kurul Rolleri ve Sayfa Yetki Yönetimi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 ve 2547 Sayılı Kanun Madde 16 çerçevesinde tanımlanmış kurul rolleri, görev kapsamları ve sayfa bazlı yetki matrisi.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-xs">
            <span className="text-slate-300 block">Şu Anki Oturum Rolünüz:</span>
            <span className="font-extrabold text-amber-300 text-sm">{ROLES[user.role]?.title || user.role}</span>
          </div>
        </div>
      </div>

      {/* 5 Kurul Rolü Seçim Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {(Object.keys(ROLES) as RoleKey[]).map((roleKey) => {
          const r = ROLES[roleKey];
          const isSelected = selectedRoleKey === roleKey;
          const isUserCurrent = user.role === roleKey;

          return (
            <button
              key={roleKey}
              onClick={() => setSelectedRoleKey(roleKey)}
              className={`text-left p-4 rounded-2xl border transition-all relative ${
                isSelected
                  ? "bg-white border-selcuk-blue shadow-lg ring-2 ring-selcuk-blue/20"
                  : "bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
              }`}
            >
              {isUserCurrent && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {r.shortTitle}
                </span>
              </div>
              <h3 className="font-extrabold text-xs text-slate-900 leading-snug">{r.title}</h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{r.description}</p>
            </button>
          );
        })}
      </div>

      {/* Seçili Rolün Detay Kartı ve Hızlı Rol Değiştirme Butonu */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-selcuk-blue">
                Seçili Rol Analizi
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500">{selectedRole.key}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{selectedRole.title}</h2>
            <p className="text-xs text-slate-500 mt-1">{selectedRole.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => switchRole(selectedRoleKey)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-selcuk-blue hover:bg-selcuk-dark text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>Bu Role Geç (Simülasyon)</span>
            </button>
          </div>
        </div>

        {/* Hukuki Dayanak ve Görev Kapsamı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
              Hukuki ve Mevzuat Dayanağı
            </span>
            <p className="font-medium text-slate-800 leading-relaxed">{selectedRole.legalBasis}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
              Sistem Görev ve İmza Kapsamı
            </span>
            <p className="font-medium text-slate-800 leading-relaxed">{selectedRole.scope}</p>
          </div>
        </div>

        {/* Sayfa Bazlı Yetki Tablosu (Rapor Çizelge 3.3) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-selcuk-blue" />
              <span>Sayfa ve Modül Yetki Matrisi (Çizelge 3.3)</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Bu roldeki kullanıcının sayfalara erişim ve işlem hakları
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Sayfa / Modül Alanı</th>
                  <th className="px-4 py-3.5">Kapsam ve Fonksiyon</th>
                  <th className="px-5 py-3.5 text-right">Erişim & Yetki Durumu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PAGE_PERMISSIONS.map((perm) => {
                  const accessStatus = perm.access[selectedRoleKey] || "YOK";
                  const badge = getBadge(accessStatus);
                  const Icon = badge.icon;

                  return (
                    <tr key={perm.key} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-extrabold text-slate-900">{perm.title}</p>
                        <p className="font-mono text-[10px] text-slate-400 mt-0.5">{perm.path}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600 max-w-md leading-relaxed">
                        {perm.desc}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-bold ${badge.bg}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
