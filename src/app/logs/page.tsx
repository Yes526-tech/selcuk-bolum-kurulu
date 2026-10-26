"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  Search,
  Filter,
  AlertTriangle,
  Info,
  XCircle,
  Lock,
  Calendar,
  Building2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCheck
} from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    infoCount: 0,
    warnCount: 0,
    errorCount: 0,
    securityCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = (targetPage = page) => {
    setLoading(true);
    let url = `/api/logs?page=${targetPage}&limit=15`;
    if (level !== "ALL") url += `&level=${level}`;
    if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLogs(data.logs);
          setStats(data.stats);
          setTotalPages(data.pagination.totalPages);
          setPage(data.pagination.page);
        }
      })
      .catch((err) => console.error("Logs fetch error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, level]);

  const getLevelBadge = (lvl: string) => {
    switch (lvl) {
      case "INFO":
        return {
          label: "BİLGİ",
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          icon: Info,
        };
      case "WARN":
        return {
          label: "UYARI",
          bg: "bg-amber-50 text-amber-800 border-amber-200 font-bold",
          icon: AlertTriangle,
        };
      case "ERROR":
        return {
          label: "HATA",
          bg: "bg-rose-50 text-rose-800 border-rose-200 font-bold",
          icon: XCircle,
        };
      case "SECURITY":
        return {
          label: "GÜVENLİK / MÜHÜR",
          bg: "bg-purple-50 text-purple-800 border-purple-200 font-bold",
          icon: Lock,
        };
      default:
        return {
          label: lvl,
          bg: "bg-slate-100 text-slate-800 border-slate-200",
          icon: Info,
        };
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
                GÜVENLİK VE İZLENEBİLİRLİK
              </span>
              <span className="text-slate-300 text-xs">
                Rapor Bölüm 3.5 & Şekil 4.15 Standardı
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Sistem İşlem Kayıtları (Audit Logs)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Toplantı oluşturma, hazirun kilitleri, oy kullanma, demo e-imzalar, belge mühürleme ve EBYS sevk süreçlerine ait tüm işlemler değiştirilemez şekilde kayıt altına alınır.
            </p>
          </div>

          <button
            onClick={() => fetchLogs(page)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Kayıtları Yenile</span>
          </button>
        </div>
      </div>

      {/* İstatistik Sayaçları */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toplam Kayıt</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Bilgi (INFO)</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{stats.infoCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Uyarı (WARN)</p>
          <p className="text-2xl font-black text-amber-700 mt-1">{stats.warnCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Güvenlik / Mühür</p>
          <p className="text-2xl font-black text-purple-700 mt-1">{stats.securityCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Hata (ERROR)</p>
          <p className="text-2xl font-black text-rose-700 mt-1">{stats.errorCount}</p>
        </div>
      </div>

      {/* Arama ve Filtreleme */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <input
            type="text"
            placeholder="İşlem adı, kullanıcı, e-posta veya açıklama ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-selcuk-blue font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Düzey:</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-selcuk-blue"
          >
            <option value="ALL">Tümü</option>
            <option value="INFO">Bilgi (INFO)</option>
            <option value="WARN">Uyarı (WARN)</option>
            <option value="SECURITY">Güvenlik (SECURITY)</option>
            <option value="ERROR">Hata (ERROR)</option>
          </select>
        </div>
      </div>

      {/* Log Tablosu */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Tarih & Saat</th>
                <th className="px-4 py-3.5">Düzey</th>
                <th className="px-4 py-3.5">İşlem Türü</th>
                <th className="px-4 py-3.5">Kullanıcı</th>
                <th className="px-4 py-3.5">IP Adresi</th>
                <th className="px-5 py-3.5">Açıklama & Detaylar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-selcuk-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Kayıtlar yükleniyor...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Kriterlere uygun işlem kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = getLevelBadge(log.level);
                  const Icon = badge.icon;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 text-slate-500 font-mono whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("tr-TR")}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${badge.bg}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold font-mono text-slate-800 whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                        <p className="font-bold text-slate-900">{log.userName}</p>
                        {log.userEmail && (
                          <p className="text-[10px] text-slate-400 font-mono">{log.userEmail}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.ipAddress || "127.0.0.1"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 max-w-md leading-relaxed">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama Çubuğu */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Sayfa <span className="font-bold text-slate-800">{page}</span> / {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => fetchLogs(page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => fetchLogs(page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
