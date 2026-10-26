"use client";

import { ShieldCheck, BookOpen, CheckCircle, FileText, Scale, Table } from "lucide-react";

export default function LegislationGuidePage() {
  const steps = [
    {
      num: 1,
      title: "Toplantı Çağrısı ve Gündemin Belirlenmesi",
      doc: "Bölüm Kurulu Süreci İş Akışı (Adım 1)",
      text: "Bölüm başkanı toplantı gündemini belirler. Toplantı tarihi, saati, yeri ve gündem maddeleri yazılı veya dijital olarak anabilim dalı başkanlarına ve kurul üyelerine bildirilir (Çağrı Belgesi)."
    },
    {
      num: 2,
      title: "Toplantı Yeter Sayısı (Salt Çoğunluk) ve Hazirun Kontrolü",
      doc: "Bölüm Kurulu Süreci İş Akışı (Adım 2) & Yönetmelik Md. 15",
      text: "Katılım tutanağı (Hazirun) üzerinden kurul üye tamsayısının salt çoğunluğu aranır (Q = floor(N/2) + 1). Salt çoğunluk sağlanamadığı takdirde oturum açılamaz; toplantı ileri bir tarihe ertelenir ve resmi 'Toplantı Yetersizliği ve Erteleme Tutanağı' tanzim edilir."
    },
    {
      num: 3,
      title: "Gündem Oylaması ve Madde Çıkarma / Ekleme",
      doc: "Bölüm Kurulu Süreci İş Akışı (Adım 3)",
      text: "Yeter sayı sağlandıktan sonra oturum açılır ve gündem maddelerinin görüşülmeye kabulü oylanır. Kurul üyelerinin çoğunluk kararıyla kabul edilmeyen maddeler gündemden çıkarılır. Üye teklifleri görüşülerek gündeme yeni madde eklenebilir."
    },
    {
      num: 4,
      title: "Maddelerin Görüşülmesi ve Karara Bağlanması",
      doc: "Bölüm Kurulu Süreci İş Akışı (Adım 4)",
      text: "Kabul edilen gündem maddeleri sırasıyla müzakere edilir. Standart 5 parametrik karar şablonu (ders görevlendirme, muafiyet-intibak, staj, sınav/mazeret, komisyon seçimi) mevzuatına göre kararlar oylanır (Oybirliği / Oyçokluğu / Ret). Varsa muhalefet şerhleri kaydedilir."
    },
    {
      num: 5,
      title: "Karar Tutanağının ve Eklerinin Hazırlanması",
      doc: "Bölüm Kurulu Süreci İş Akışı (Adım 5)",
      text: "Alınan kararlar resmi Karar Tutanağı formatında derlenir. Karar numaraları, ilgili mevzuat dayanakları, ek çizelgeler (ders dağılımı, intibak tablosu vb.) ve Madde 15 uyarınca kurul üyelerinin imza blokları hazırlanır."
    },
    {
      num: 6,
      title: "EBYS Entegrasyonu ve Üst Birime (Dekanlık/Müdürlük) Sevk",
      doc: "Bölüm Kurulu Süreci İş Akışı (Adım 6)",
      text: "Resmi EBYS evrak numarası, sayı, tarih, doğrulama kodu ve barkod üretilir. Dekanlığa/Müdürlüğe hitaben hazırlanan resmi EBYS Üst Yazısı ile birlikte sevk edilmeye hazır çıktı (PDF) üretilir."
    }
  ];

  const templates = [
    {
      cat: "Eğitim-Öğretim ve Ders Görevlendirme",
      params: "Akademik yıl, yarıyıl, ders kodu/adı, kredi/AKTS, sorumlu öğretim elemanı",
      law: "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği (Madde 8)",
      out: "Karar metni + Ders dağılım tablosu eki"
    },
    {
      cat: "Muafiyet ve İntibak Kararları",
      params: "Öğrenci no, ad-soyad, geldiği kurum, eski ders (kod/kredi/not), muaf olunan S.Ü. dersi",
      law: "Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 10/5 & 15)",
      out: "Karar metni + Muafiyet/intibak karşılaştırma çizelgesi"
    },
    {
      cat: "Staj ve İşletmede Mesleki Eğitim",
      params: "Öğrenci listesi, komisyon görüşü, kabul/ret edilen iş günü sayısı, dönem",
      law: "S.Ü. Staj ve İşletmede Mesleki Eğitim Yönergeleri",
      out: "Karar metni + Onaylı öğrenci staj listesi"
    },
    {
      cat: "Sınav Programı ve Mazeret Sınavları",
      params: "Sınav türü (Vize/Final/Bütünleme/Tek Ders), tarih aralığı, öğrenci mazeret belgesi",
      law: "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği",
      out: "Karar metni + Sınav takvimi / mazeretli öğrenci tablosu"
    },
    {
      cat: "Komisyon ve Koordinatörlük Seçimi",
      params: "Komisyon adı (Muafiyet, Staj, Kalite, Erasmus), görev süresi, atanan üyeler",
      law: "Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 15)",
      out: "Karar metni + Komisyon üye listesi"
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Mevzuat ve İş Akışı Temeli Rehberi
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Selçuk Üniversitesi Bölüm Kurulu Süreci İş Akışı ve Üniversitelerde Akademik Teşkilat Yönetmeliği hükümleri
        </p>
      </div>

      {/* 1. Yönetmelik Madde 15 Hükmü */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-selcuk-blue border-b border-slate-100 pb-3">
          <Scale className="w-5 h-5 text-selcuk-turquoise" />
          <h2 className="text-base font-bold">
            1. Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 15) Hükümleri
          </h2>
        </div>

        <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs font-serif leading-relaxed text-slate-800">
          <p className="font-bold text-selcuk-blue mb-2">Madde 15 – Bölüm Kurulu:</p>
          <p className="mb-2">
            &quot;Bölüm kurulu, tek anabilim/anasanat dalı bulunan bölümlerde bölüm başkanının başkanlığında o bölümdeki tüm öğretim üyeleri ve öğretim görevlilerinden; birden fazla anabilim/anasanat dalı bulunan bölümlerde ise bölüm başkanı, bölüm başkan yardımcıları ile anabilim dalı başkanlarından oluşur.&quot;
          </p>
          <p>
            &quot;Bölüm kurulu, bölümün öğretim, bilimsel araştırma ve yayım faaliyetleri ile bu faaliyetlerle ilgili esasları, plan, program ve ihtiyaçları kararlaştırır.&quot;
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <h3 className="font-bold text-purple-900 mb-1">Tek Anabilim Dallı Bölümler</h3>
            <ul className="list-disc list-inside space-y-1 text-purple-800">
              <li>Bölüm Başkanı (Kurul Başkanı)</li>
              <li>Bölüm Başkan Yardımcıları</li>
              <li>Bölümdeki TÜM Profesör, Doçent ve Dr. Öğr. Üyeleri</li>
              <li>Bölümdeki TÜM Öğretim Görevlileri</li>
              <li className="font-semibold text-purple-950 mt-1">Her biri asıl üye ve oy hakkına sahiptir.</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-1">Birden Fazla Anabilim Dallı Bölümler</h3>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Bölüm Başkanı (Kurul Başkanı)</li>
              <li>Bölüm Başkan Yardımcıları</li>
              <li>Anabilim Dalı (ABD) Başkanları</li>
              <li className="font-semibold text-blue-950 mt-1">
                Yalnızca yukarıdaki üyeler oy hakkına sahiptir. Diğer öğretim elemanları doğrudan kurul üyesi değildir.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. 6 Ana Adımlı İş Akışı */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 text-selcuk-blue border-b border-slate-100 pb-3">
          <ShieldCheck className="w-5 h-5 text-selcuk-turquoise" />
          <h2 className="text-base font-bold">
            2. Selçuk Üniversitesi Bölüm Kurulu Süreci İş Akışı (6 Ana Adım)
          </h2>
        </div>

        <div className="space-y-4">
          {steps.map((st) => (
            <div key={st.num} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start gap-4">
              <span className="w-8 h-8 rounded-xl bg-selcuk-blue text-amber-400 font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                {st.num}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-slate-900">{st.title}</h3>
                  <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    {st.doc}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{st.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Standart Karar Şablonları Matrisi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-selcuk-blue border-b border-slate-100 pb-3">
          <Table className="w-5 h-5 text-selcuk-turquoise" />
          <h2 className="text-base font-bold">
            3. Otomasyona Dahil Edilen Standart Karar Şablonları Tablosu
          </h2>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3">Karar Kategorisi</th>
                <th className="p-3">Otomatik Doldurulacak Parametreler</th>
                <th className="p-3">İlgili Mevzuat / Dayanak</th>
                <th className="p-3">Üretilecek Çıktı / Ekler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {templates.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{row.cat}</td>
                  <td className="p-3 text-slate-700">{row.params}</td>
                  <td className="p-3 font-medium text-selcuk-blue">{row.law}</td>
                  <td className="p-3 font-semibold text-emerald-800">{row.out}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
