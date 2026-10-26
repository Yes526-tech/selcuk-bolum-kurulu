import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Selçuk Üniversitesi | Bölüm Kurulu Süreci ve Karar Yönetim Otomasyonu",
  description: "Selçuk Üniversitesi Bölüm Kurulu Süreci İş Akışı 6 Adımı ve Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 uyumlu karar otomasyon sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </AuthProvider>
        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-sm no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="font-medium text-slate-300">
                T.C. Selçuk Üniversitesi • Bölüm Kurulu Süreci ve Karar Otomasyonu
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 & EBYS Entegrasyon Standardı
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
