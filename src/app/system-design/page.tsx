"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Database,
  Users,
  Layers,
  Table,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Code,
  Building2,
  FileCheck,
  Award,
  Scale,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function SystemDesignPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"roles" | "organization" | "database">("roles");
  const [selectedBolumId, setSelectedBolumId] = useState<string>("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");

  const loadData = (bolumId?: string) => {
    setLoading(true);
    const url = bolumId ? `/api/system-design?bolumId=${bolumId}` : `/api/system-design`;
    fetch(url)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
          if (!selectedBolumId && resData.bolumler?.length > 0) {
            setSelectedBolumId(resData.bolumler[0].id);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData(selectedBolumId);
  }, [selectedBolumId]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-4 border-selcuk-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Sistem analizi ve veritabanı şeması yükleniyor...</p>
      </div>
    );
  }

  const { roles, permissionMatrix, bolumler, dynamicQueryResult, ornekToplanti, tablesMeta } = data || {};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TAM_YETKI":
        return { label: "Tam Yetki", bg: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: CheckCircle2 };
      case "KOSULLU_YETKI":
        return { label: "Koşullu (Md. 15)", bg: "bg-blue-100 text-blue-800 border-blue-300", icon: Scale };
      case "VEKALETEN":
        return { label: "Vekaleten", bg: "bg-amber-100 text-amber-800 border-amber-300", icon: AlertCircle };
      default:
        return { label: "Yetkisi Yok", bg: "bg-red-50 text-red-700 border-red-200", icon: XCircle };
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık Banner */}
      <div className="bg-gradient-to-r from-selcuk-blue via-selcuk-navy to-selcuk-dark text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-selcuk-turquoise/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-amber-400 text-selcuk-dark font-black text-xs px-2.5 py-0.5 rounded">
                GÖREV 1
              </span>
              <span className="text-selcuk-turquoise text-xs font-semibold">
                Mimari Analiz & Veritabanı Spesifikasyonu
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Sistem Analizi, Rol Tanımları ve Veritabanı Tasarımı
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 ve S.Ü. Bölüm Kurulu Süreci doğrultusunda çıkarılan Rol & Yetki Matrisi, Organizasyonel Şema ve Karar Veritabanı Mimarisi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-mono font-bold">
              <Database className="w-4 h-4 text-emerald-400" />
              PostgreSQL Uyumlu Şema
            </span>
          </div>
        </div>
      </div>

      {/* 3 Ana Bölüm Sekmesi */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === "roles"
              ? "bg-white text-selcuk-blue border-selcuk-blue shadow-xs"
              : "text-slate-500 hover:text-slate-900 border-transparent hover:bg-slate-100/60"
          }`}
        >
          <Users className="w-4 h-4 text-selcuk-blue" />
          <span>Görev 1.1: Rol ve Yetki Matrisi</span>
        </button>

        <button
          onClick={() => setActiveTab("organization")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === "organization"
              ? "bg-white text-selcuk-blue border-selcuk-blue shadow-xs"
              : "text-slate-500 hover:text-slate-900 border-transparent hover:bg-slate-100/60"
          }`}
        >
          <Building2 className="w-4 h-4 text-selcuk-blue" />
          <span>Görev 1.2: Organizasyonel Şema & Dinamik Sorgu</span>
        </button>

        <button
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === "database"
              ? "bg-white text-selcuk-blue border-selcuk-blue shadow-xs"
              : "text-slate-500 hover:text-slate-900 border-transparent hover:bg-slate-100/60"
          }`}
        >
          <Database className="w-4 h-4 text-selcuk-blue" />
          <span>Görev 1.3: Toplantı & Karar Şeması (2026/01-01)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SEKME 1: GÖREV 1.1 – ROL VE YETKİ MATRİSİ */}
      {/* ========================================================================= */}
      {activeTab === "roles" && (
        <div className="space-y-6">
          {/* 5 Rol Kartı */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-selcuk-blue" />
                Sistemde Tanımlı 5 Temel Akademik ve İdari Rol
              </h2>
              <span className="text-xs text-slate-500">
                Yetki kapsamları ve mevzuat dayanakları
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {roles &&
                Object.values(roles).map((r: any) => (
                  <div
                    key={r.key}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between hover:border-selcuk-blue/40 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-selcuk-blue/10 text-selcuk-blue">
                          {r.shortTitle}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">{r.title}</h3>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">{r.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                      <p className="font-semibold text-slate-700">Yetki Kapsamı:</p>
                      <p className="line-clamp-3 mt-0.5">{r.scope}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Yetki Matrisi Tablosu */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Bölüm Kurulu Süreci Rol ve Yetki Matrisi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toplantı çağrısından EBYS üst yazısına kadar her işlem adımında rollerin kesin yetki derecesi
                </p>
              </div>

              {/* Filtre */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-semibold">Rol Filtresi:</span>
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                >
                  <option value="ALL">Tüm Roller (Tam Matris)</option>
                  <option value="BOLUM_BASKANI">Bölüm Başkanı</option>
                  <option value="BOLUM_BASKAN_YARDIMCISI">Bölüm Başkan Yardımcısı</option>
                  <option value="ABD_BASKANI">Anabilim Dalı Başkanı</option>
                  <option value="OGRETIM_ELEMANI">Öğretim Elemanı</option>
                  <option value="BOLUM_SEKRETERI">Bölüm Sekreteri</option>
                </select>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-1/3">Süreç ve İşlem Adımı</th>
                    <th className="p-3 text-center">Bölüm Başkanı</th>
                    <th className="p-3 text-center">Bşk. Yrd.</th>
                    <th className="p-3 text-center">ABD Başkanı</th>
                    <th className="p-3 text-center">Öğr. Elemanı</th>
                    <th className="p-3 text-center">Bölüm Sekreteri</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {permissionMatrix &&
                    permissionMatrix.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <p className="font-bold text-slate-900 text-xs">{p.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
                        </td>

                        {/* 5 Rol Kolonu */}
                        {(["BOLUM_BASKANI", "BOLUM_BASKAN_YARDIMCISI", "ABD_BASKANI", "OGRETIM_ELEMANI", "BOLUM_SEKRETERI"] as const).map(
                          (rk) => {
                            const acc = p.access[rk];
                            const badge = getStatusBadge(acc.status);
                            const Icon = badge.icon;

                            return (
                              <td key={rk} className="p-3 text-center align-top">
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg}`}
                                  title={acc.note}
                                >
                                  <Icon className="w-3 h-3" />
                                  {badge.label}
                                </span>
                                <span className="block text-[10px] text-slate-500 mt-1 italic text-left leading-tight">
                                  {acc.note}
                                </span>
                              </td>
                            );
                          }
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEKME 2: GÖREV 1.2 – ORGANİZASYONEL ŞEMA VE DİNAMİK SORGU */}
      {/* ========================================================================= */}
      {activeTab === "organization" && (
        <div className="space-y-6">
          {/* Bölüm Seçici ve Karşılaştırma */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-selcuk-blue" />
                  Görev 1.2: Organizasyonel Şema ve Dinamik Filtreleme Sorgusu
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bölümün tek veya çoklu anabilim dalına sahip olma durumuna göre aktif kurul üyelerini filtreleyen SQL sorgusu
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Test Edilen Bölüm:</span>
                <select
                  value={selectedBolumId}
                  onChange={(e) => setSelectedBolumId(e.target.value)}
                  className="p-2 border border-slate-300 rounded-lg text-xs font-bold bg-slate-50"
                >
                  {bolumler?.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.ad} ({b.hasMultipleSpecialties ? "Çok Anabilim Dallı" : "Tek Anabilim Dallı"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bölümün Yapı Bilgisi */}
            {dynamicQueryResult?.bolumInfo && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {dynamicQueryResult.bolumInfo.ad}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                        dynamicQueryResult.bolumInfo.hasMultipleSpecialties
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-purple-100 text-purple-800 border-purple-200"
                      }`}
                    >
                      {dynamicQueryResult.bolumInfo.yapiTuru} (Yönetmelik Madde 15)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                    {dynamicQueryResult.bolumInfo.yapiAciklamasi}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="text-slate-500 block text-[10px]">Kurul Üye Tamsayısı (N)</span>
                    <span className="font-black text-lg text-emerald-700">
                      {dynamicQueryResult.totalEligible} Üye
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="text-slate-500 block text-[10px]">Salt Çoğunluk Eşiği</span>
                    <span className="font-black text-lg text-selcuk-blue">
                      {dynamicQueryResult.quorumRequired} Üye
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Parametreli Dinamik SQL Sorgusu Gösterimi */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-selcuk-blue" />
                  PostgreSQL Parametreli Dinamik Filtreleme Sorgusu (Madde 15)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  prisma/schema.sql & src/lib/queries/board-members.ts
                </span>
              </div>
              <pre className="text-xs font-mono bg-slate-900 text-amber-300 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                {dynamicQueryResult?.sqlQuery || "SQL sorgusu yükleniyor..."}
              </pre>
            </div>

            {/* Sorgu Çıktısı Tablosu (Canlı Veritabanı Sonucu) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-600" />
                  Sorgunun Canlı Veritabanından Döndürdüğü Sonuç Tablosu ({dynamicQueryResult?.allMembers?.length || 0} Personel)
                </h4>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Unvan, Ad ve Soyad</th>
                      <th className="p-3">Kadro Rolü (rol)</th>
                      <th className="p-3">Anabilim Dalı</th>
                      <th className="p-3">Kurul Sıfatı (kurul_sifati)</th>
                      <th className="p-3 text-center">Kurul Üyesi mi? (kurul_uyesi_mi)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dynamicQueryResult?.allMembers?.map((m: any) => (
                      <tr
                        key={m.personel_id}
                        className={`hover:bg-slate-50 transition-colors ${
                          m.kurul_uyesi_mi ? "bg-white" : "bg-slate-50/60 opacity-70"
                        }`}
                      >
                        <td className="p-3 font-semibold text-slate-900">
                          {m.unvan} {m.ad} {m.soyad}
                          <span className="block text-[11px] text-slate-500 font-normal">{m.eposta}</span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-700">
                          {m.rol}
                        </td>
                        <td className="p-3 text-slate-600">
                          {m.anabilim_dali_adi || "Bölüm Geneli"}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800">{m.kurul_sifati}</span>
                        </td>
                        <td className="p-3 text-center">
                          {m.kurul_uyesi_mi ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Evet (Oy Hakkı Var)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                              <XCircle className="w-3.5 h-3.5" /> Hayır (Kurul Dışı)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEKME 3: GÖREV 1.3 – TOPLANTI VE KARAR VERİTABANI ŞEMASI */}
      {/* ========================================================================= */}
      {activeTab === "database" && (
        <div className="space-y-6">
          {/* 2026/01-01 Karar Formatı Tanıtımı */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-selcuk-blue" />
                  Görev 1.3: Toplantı ve Karar Veritabanı Şeması
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toplanti, Gundem_Maddesi, Katilim_Tutanagi, Karar (2026/01-01 formatında) ve Oylama_Detay tabloları
                </p>
              </div>

              <div className="bg-selcuk-blue text-white px-3 py-1.5 rounded-lg text-xs font-mono font-bold">
                Format: [YIL]/[TOPLANTI NO]-[KARAR NO] (Örn: 2026/01-01)
              </div>
            </div>

            {/* Canlı Karar Örnekleri (Veritabanından 2026/01-01) */}
            {ornekToplanti && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-selcuk-blue uppercase">
                    Veritabanındaki Gerçek Karar Kaydı ({ornekToplanti.baslik})
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-600">
                    EBYS Evrak No: {ornekToplanti.ebysEvrakNo}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ornekToplanti.kararlar?.map((k: any) => (
                    <div key={k.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
                        <span className="font-mono font-black text-selcuk-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {k.kararNo}
                        </span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                          {k.oyBirligiCoklugu}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900">{k.baslik}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        <strong>Dayanak:</strong> {k.mevzuatDayanagi}
                      </p>
                      <p className="text-[11px] text-slate-700 mt-1.5 italic bg-slate-50 p-2 rounded">
                        {k.kararMetni}
                      </p>
                      <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                        <span>Oylar: {k.kabulOySayisi} Kabul, {k.retOySayisi} Ret</span>
                        <span>Oylama Detay Kaydı: {k.oylamaDetaylari?.length || 0} Üye</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Veritabanı Tabloları Sözlüğü */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Veritabanı Tabloları Sözlüğü ve Kolon Tanımları (PostgreSQL DDL)
              </h4>

              <div className="space-y-4">
                {tablesMeta?.map((tab: any) => (
                  <div key={tab.tableName} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-selcuk-blue text-white px-2 py-0.5 rounded">
                          {tab.tableName}
                        </span>
                        <span className="text-xs text-slate-600 font-semibold">({tab.modelName})</span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                          {tab.gorev}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{tab.description}</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 text-[11px] border-b border-slate-200">
                          <tr>
                            <th className="p-2 w-1/4">Kolon Adı</th>
                            <th className="p-2 w-1/6">Veri Tipi</th>
                            <th className="p-2 w-1/6">Anahtar / Kısıtlama</th>
                            <th className="p-2">Açıklama</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {tab.columns.map((col: any) => (
                            <tr key={col.name} className="hover:bg-slate-50/50">
                              <td className="p-2 font-mono font-semibold text-slate-900">{col.name}</td>
                              <td className="p-2 font-mono text-[11px] text-slate-600">{col.type}</td>
                              <td className="p-2">
                                {col.isPk && (
                                  <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                    PRIMARY KEY
                                  </span>
                                )}
                                {col.isFk && (
                                  <span className="bg-blue-100 text-blue-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                    FOREIGN KEY
                                  </span>
                                )}
                                {col.isUnique && (
                                  <span className="bg-purple-100 text-purple-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                    UNIQUE
                                  </span>
                                )}
                              </td>
                              <td className="p-2 text-slate-600">{col.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
