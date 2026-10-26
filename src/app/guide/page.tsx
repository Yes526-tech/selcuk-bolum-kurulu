"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Scale,
  Calendar,
  Layers,
  FileCheck,
  Clock,
  Download,
  Lock,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function GuideManualPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const STEPS = [
    {
      step: 1,
      title: "Toplantı Çağrısı ve Gündemin Belirlenmesi",
      desc: "Bölüm Başkanı veya yetkilendirilmiş sekreterlik tarafından yeni toplantı oturumu açılır. Toplantı tarihi, saati, yeri belirlenir. Gündem maddeleri ve talep havuzundaki başvurular eklenerek resmi EBYS Çağrı Yazısı tanzim edilir ve kurul üyelerine tebliğ edilir.",
      tip: "Gündem maddelerine ilgili mevzuat dayanakları ve şablon parametreleri baştan girilebilir.",
    },
    {
      step: 2,
      title: "Toplantı Yeter Sayısı (Salt Çoğunluk) ve Hazirun Yoklaması",
      desc: "Toplantı başlamadan önce hazirun cetveli doldurulur. Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15'e göre asıl üye sayısı (N) üzerinden salt çoğunluk (Q = floor(N/2) + 1) ve Kurul Başkanının katılım durumu aranır. Yeter sayı sağlanamazsa oturum açılamaz; ileri bir tarihe erteleme mekanizması devreye girer ve resmi 'Toplantı Yetersizliği ve Erteleme Tutanağı' üretilir.",
      tip: "Toplantıda en az bir kurul başkanı bulunmalı ve salt çoğunluk sağlanmalıdır.",
    },
    {
      step: 3,
      title: "Gündem Oylaması ve Madde Çıkarma / Ekleme",
      desc: "Oturum açıldıktan sonra gündem maddelerinin görüşülmeye kabulü oylanır. Kurul çoğunluğunca reddedilen maddeler 'Gündemden Çıkarıldı' statüsüne alınır; üyelerin teklifiyle gündeme yeni madde eklenebilir.",
      tip: "Gündemden çıkarılan maddeler arşivde izlenir ancak sonraki müzakere adımına geçmez.",
    },
    {
      step: 4,
      title: "Maddelerin Görüşülmesi, Parametrik Şablonlar ve Oylama",
      desc: "Gündeme kabul edilen her madde sırasıyla müzakere edilir. 5 Standart parametrik karar şablonu (Ders Görevlendirme, Muafiyet, Staj, Sınav/Mazeret, Komisyon) seçilerek resmi metin ve ek tablolar derlenir. Kabul için onay penceresi, ret oyu için zorunlu gerekçe (muhalefet şerhi) girilir. Oyların 2-2 veya eşit çıkması halinde Kurul Başkanının oyu belirleyicidir.",
      tip: "İlk başarılı oy kullanıldığında toplantının katılım listesi (hazirun) kilitlenir.",
    },
    {
      step: 5,
      title: "Resmi Karar Tutanağının Derlenmesi ve İki Aşamalı İmza",
      desc: "Alınan tüm kararlar A4 formatında resmi Karar Tutanağı olarak derlenir. Kararın içeriği SHA-256 içerik özeti ile kilitlenir. Katılan tüm üyeler (ret oyu verenler dahil) 'İmza Hazırla' ve 'İmzayı Tamamla' adımlarıyla iki aşamalı demo e-imzalarını atarlar. Tüm imzalar tamamlandığında karar SHA-256 ile mühürlenir.",
      tip: "Tamamlanan ve mühürlenen kararlar kamusal /verify portalından doğrulanabilir.",
    },
    {
      step: 6,
      title: "EBYS Entegrasyonu ve Üst Birime (Dekanlık) Sevk",
      desc: "Mühürlenmiş karar tutanağı için EBYS Evrak Numarası, Doğrulama Kodu, Karekod ve Barkod üretilir. Fakülte Dekanlığına hitaben resmi EBYS Sevk Üst Yazısı hazırlanır ve mühürlü PDF/Word çıktıları indirilir.",
      tip: "Üretilen PDF'deki karekod tarandığında kararın tahrif edilmediği anında teyit edilir.",
    },
  ];

  const VOTING_RULES = [
    {
      rule: "Yeter Sayı (Salt Çoğunluk)",
      detail: "Kurul üye tamsayısının yarısından fazlası katılmalıdır (Örn: 7 üyeli kurulda en az 4 üye).",
    },
    {
      rule: "Başkan Katılım Şartı",
      detail: "Kararda tam olarak bir başkan bulunmalı; başkan katılmıyorsa veya vekili yoksa karar tamamlanamaz.",
    },
    {
      rule: "Oy Kullanma Hakkı",
      detail: "Yalnızca 'Katıldı' durumundaki üyeler oy kullanabilir; izinli veya mazeretli üyeler oy kullanamaz.",
    },
    {
      rule: "Eşitlikte Başkan Oyu (Casting Vote)",
      detail: "Oyların eşit çıkması halinde (örneğin 3 Kabul - 3 Ret), Kurul Başkanının oyu tarafı belirler.",
    },
    {
      rule: "Gerekçeli Ret (Muhalefet Şerhi)",
      detail: "Ret oyu veren üyenin şahsi muhalefet gerekçesini yazması zorunludur ve tutanağa işlenir.",
    },
    {
      rule: "İmza Zorunluluğu",
      detail: "Kabul edilen kararda katılan bütün üyeler, ret oyu vermiş olsalar dahi tutanağı imzalar.",
    },
    {
      rule: "Katılım Kilidi",
      detail: "Toplantıdaki ilk başarılı oy ile ortak katılım listesi (hazirun) otomatik olarak kilitlenir.",
    },
  ];

  const FAQS = [
    {
      q: "Eşzamanlılık (Concurrency) koruması sistemde nasıl çalışır?",
      a: "Sistemde sürüm denetimine (rowVersion) dayalı iyimser eşzamanlılık uygulanır. İki kurul üyesi aynı anda oy verdiğinde veya imzaladığında, veritabanı sürüm çakışmasını yakalar; ilk işlem onaylanır, çakışan ikinci işlem güncel veriyle yeniden denenerek kararın yanlış durumda takılması engellenir.",
    },
    {
      q: "İki aşamalı e-imza süreci ile klasik imza arasındaki fark nedir?",
      a: "Klasik imzalarda içerik hash'i sabitlenmediğinde sonradan yapılan metin değişiklikleri fark edilemez. Sistemimizde ise önce toplantı metni SHA-256 içerik özetine bağlanır, üye 'İmza Hazırla' çağrısı ile kişiye özel token alır ve bu token üzerinden imzasını atar. Karar metni değişirse imza geçersiz sayılır.",
    },
    {
      q: "Salt çoğunluk sağlanamadığında toplantı nasıl ertelenir?",
      a: "Hazirun yoklamasında hazır bulunan üye sayısı gereken salt çoğunluğun altındaysa Adım 2'deki 'Toplantıyı Ertele' butonu aktifleşir. Sistem resmi 'Toplantı Yetersizliği ve Erteleme Tutanağı' düzenleyerek yeni toplantı tarihini kayıt altına alır.",
    },
    {
      q: "Takılan veya revizyon gereken bir kurul sürecinden nasıl çıkılır?",
      a: "Kurul Başkanı veya sistem yöneticisi Adım 4 veya 5'te 'Süreci İptal Et' seçeneğiyle gerekçe belirterek süreci sonlandırabilir. İstenirse 'Yeniden Değerlendir' butonuyla iptal edilen kararın maddeleri kopyalanarak bağlı yeni bir taslak toplantı açılabilir.",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Üst Banner */}
      <div className="bg-gradient-to-r from-selcuk-blue via-selcuk-navy to-selcuk-dark text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-selcuk-turquoise/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-selcuk-dark font-black text-xs px-2.5 py-0.5 rounded-full">
                SİSTEM REHBERİ
              </span>
              <span className="text-slate-300 text-xs">
                Rapor Bölüm 4.7 & Şekil 4.16 / 4.19 Standardı
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Kullanım Kılavuzu ve Kurul İşleyiş Rehberi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Selçuk Üniversitesi Bölüm Kurulu Karar Otomasyonu'nun 6 adımlı iş akışı, oylama usul ve kuralları, kriptografik mühürleme ve EBYS sevk süreçleri.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/legislation"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 backdrop-blur-sm"
            >
              Mevzuat Maddeleri →
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Adımlı Süreç Akışı */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-selcuk-blue block mb-1">
            Uçtan Uca Süreç
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            6 Ana Adımlı Bölüm Kurulu Süreci İş Akışı
          </h2>
        </div>

        <div className="space-y-4">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-selcuk-blue text-amber-300 flex items-center justify-center font-black text-xs flex-shrink-0">
                  {s.step}
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">{s.title}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-11">{s.desc}</p>
              <div className="pl-11">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-selcuk-turquoise bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>İpucu: {s.tip}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Oylama ve Karar Kuralları Tablosu (Rapor Çizelge 3.4) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-selcuk-blue block mb-1">
            İş Kuralları Motoru
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            Uygulanan Oylama ve Toplantı Kuralları (Çizelge 3.4)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Yazılım tarafından sunucu katmanında zorunlu kılınan kanuni ve kurumsal kurallar.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-1/3">Kural Konusu</th>
                <th className="px-5 py-3.5">Sunucuda Uygulanan Kural ve Davranış</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {VOTING_RULES.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{r.rule}</td>
                  <td className="px-5 py-3.5 text-slate-600 leading-relaxed">{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sıkça Sorulan Sorular */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-selcuk-blue block mb-1">
            Sıkça Sorulan Sorular
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            Teknik ve Fonksiyonel Konular
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 bg-slate-50/50 hover:bg-slate-50"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-800">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 bg-white border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
