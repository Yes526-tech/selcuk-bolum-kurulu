export type RoleKey =
  | "BOLUM_BASKANI"
  | "BOLUM_BASKAN_YARDIMCISI"
  | "ABD_BASKANI"
  | "OGRETIM_ELEMANI"
  | "BOLUM_SEKRETERI";

export type PermissionAccess = "TAM_YETKI" | "KOSULLU_YETKI" | "VEKALETEN" | "YOK";

export interface RoleDefinition {
  key: RoleKey;
  title: string;
  shortTitle: string;
  description: string;
  legalBasis: string;
  scope: string;
}

export interface PermissionDefinition {
  id: string;
  category: "CAGRI_VE_GUNDEM" | "HAZIRUN_VE_OTURUM" | "MUZAKERE_VE_OYLAMA" | "TUTANAK_VE_EBYS";
  name: string;
  description: string;
  access: Record<RoleKey, { status: PermissionAccess; note: string }>;
}

export const ROLES: Record<RoleKey, RoleDefinition> = {
  BOLUM_BASKANI: {
    key: "BOLUM_BASKANI",
    title: "Bölüm Başkanı",
    shortTitle: "Bşk.",
    description: "Bölümün akademik ve idari en üst amiridir. Bölüm kurulunun tabii başkanıdır.",
    legalBasis: "2547 Sayılı Kanun Madde 16 & Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 14-15",
    scope: "Toplantı çağrısı ve gündemi onaylama, toplantıyı açma ve yönetme, kararları kesinleştirme ve EBYS üst yazısını imzalama."
  },
  BOLUM_BASKAN_YARDIMCISI: {
    key: "BOLUM_BASKAN_YARDIMCISI",
    title: "Bölüm Başkan Yardımcısı",
    shortTitle: "Bşk. Yrd.",
    description: "Bölüm başkanına görevlerinde yardım eder ve yokluğunda vekalet eder.",
    legalBasis: "2547 Sayılı Kanun Madde 16 & Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15",
    scope: "Gündem önerisi sunma, kurul toplantısında asıl üye olarak müzakere ve oy kullanma, tutanak imzalama."
  },
  ABD_BASKANI: {
    key: "ABD_BASKANI",
    title: "Anabilim Dalı Başkanı",
    shortTitle: "ABD Bşk.",
    description: "Bölüm bünyesindeki ilgili anabilim dalının başkanıdır.",
    legalBasis: "Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 & 16",
    scope: "Kendi anabilim dalı adına gündem önerisi sunma (ders dağılımı, komisyon, intibak vb.), çoklu ABD'de asıl kurul üyesi olarak müzakere, oylama ve imza."
  },
  OGRETIM_ELEMANI: {
    key: "OGRETIM_ELEMANI",
    title: "Öğretim Elemanı (Öğr. Üyesi / Öğr. Gör.)",
    shortTitle: "Öğr. Elemanı",
    description: "Bölüm kadrosundaki profesör, doçent, doktor öğretim üyesi ve öğretim görevlileri.",
    legalBasis: "Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15",
    scope: "Tek anabilim dalı olan bölümlerde asıl üye oylaması ve imza; çoklu anabilim dalı olan bölümlerde gündem teklifi iletme ve bilgilendirilme."
  },
  BOLUM_SEKRETERI: {
    key: "BOLUM_SEKRETERI",
    title: "Bölüm Sekreteri / Birim Personeli",
    shortTitle: "Sekreterlik",
    description: "Bölümün idari, yazı işleri ve raportörlük hizmetlerini yürüten personel.",
    legalBasis: "Üniversitelerde İdari Teşkilat Yönetmeliği & Selçuk Üniversitesi İş Akışları",
    scope: "Gündem taslağı hazırlama, toplantı çağrı evrakını düzenleme, katılım cetveli (hazirun) kaydı, tutanak ve EBYS çıktısı alma."
  }
};

export const PERMISSION_MATRIX: PermissionDefinition[] = [
  // 1. ÇAĞRI VE GÜNDEM SÜRECİ
  {
    id: "TOPLANTI_CAGRISI_BASLATMA",
    category: "CAGRI_VE_GUNDEM",
    name: "Toplantı Çağrısı ve Tarihi Başlatma",
    description: "Sistemde yeni bir Bölüm Kurulu toplantı oturumu ve çağrı kaydı açma.",
    access: {
      BOLUM_BASKANI: { status: "TAM_YETKI", note: "Doğrudan toplantı tarihi ve gündemi belirler." },
      BOLUM_BASKAN_YARDIMCISI: { status: "VEKALETEN", note: "Bölüm başkanının yetkilendirmesiyle yapabilir." },
      ABD_BASKANI: { status: "YOK", note: "Toplantı tarihi belirleyemez, gündem önerir." },
      OGRETIM_ELEMANI: { status: "YOK", note: "Toplantı çağırma yetkisi yoktur." },
      BOLUM_SEKRETERI: { status: "TAM_YETKI", note: "Başkan talimatıyla sistemde taslak çağrı başlatır." }
    }
  },
  {
    id: "GUNDEM_TASLAGI_HAZIRLAMA",
    category: "CAGRI_VE_GUNDEM",
    name: "Gündem Taslağı Hazırlama ve Ön Giriş",
    description: "Gelen evrak, intibak dilekçesi, staj defteri vb. konuları gündem maddesi taslağı olarak sisteme ekleme.",
    access: {
      BOLUM_BASKANI: { status: "TAM_YETKI", note: "Gündem maddelerini doğrudan sisteme işler." },
      BOLUM_BASKAN_YARDIMCISI: { status: "TAM_YETKI", note: "Taslak madde hazırlayabilir." },
      ABD_BASKANI: { status: "TAM_YETKI", note: "Anabilim dalı konularını taslak olarak girebilir." },
      OGRETIM_ELEMANI: { status: "KOSULLU_YETKI", note: "Sekreterliğe veya ABD başkanına öneri iletir." },
      BOLUM_SEKRETERI: { status: "TAM_YETKI", note: "Tüm başvuruları taslak gündem haline getirir." }
    }
  },
  {
    id: "GUNDEM_ONERISI_SUNMA",
    category: "CAGRI_VE_GUNDEM",
    name: "Resmi Gündem Önerisi Sunma",
    description: "Kurul gündemine alınmak üzere resmi teklif verme (ders görevlendirme, sınav, intibak).",
    access: {
      BOLUM_BASKANI: { status: "TAM_YETKI", note: "Gündemi asıl belirleyen makamdır." },
      BOLUM_BASKAN_YARDIMCISI: { status: "TAM_YETKI", note: "Öneri sunma hakkına sahiptir." },
      ABD_BASKANI: { status: "TAM_YETKI", note: "Anabilim Dalı adına resmi teklif sunar." },
      OGRETIM_ELEMANI: { status: "TAM_YETKI", note: "Dilekçe ve komisyon raporuyla gündem teklif edebilir." },
      BOLUM_SEKRETERI: { status: "YOK", note: "Akademik teklif sunamaz; evrak iletir." }
    }
  },
  {
    id: "TOPLANTI_CAGRISI_ONAYLAMA",
    category: "CAGRI_VE_GUNDEM",
    name: "Resmi Çağrı ve Gündemi Onaylama",
    description: "Toplantı çağrı evrakını kesinleştirerek üyelere resmi tebliğ etme.",
    access: {
      BOLUM_BASKANI: { status: "TAM_YETKI", note: "Bölüm Başkanı imzasıyla çağrı resmileşir." },
      BOLUM_BASKAN_YARDIMCISI: { status: "VEKALETEN", note: "Başkan vekili sıfatıyla onaylayabilir." },
      ABD_BASKANI: { status: "YOK", note: "Onay yetkisi yoktur." },
      OGRETIM_ELEMANI: { status: "YOK", note: "Onay yetkisi yoktur." },
      BOLUM_SEKRETERI: { status: "YOK", note: "Sadece tebliğ ve dağıtımı yürütür." }
    }
  },

  // 2. HAZİRUN VE OTURUM SÜRECİ
  {
    id: "HAZIRUN_YOKLAMA_KAYDI",
    category: "HAZIRUN_VE_OTURUM",
    name: "Katılım Tutanağı (Hazirun) Kaydı",
    description: "Toplantıya katılan, mazeret bildiren veya katılmayan üyelerin yoklamasını işleme.",
    access: {
      BOLUM_BASKANI: { status: "TAM_YETKI", note: "Yoklamayı denetler ve onaylar." },
      BOLUM_BASKAN_YARDIMCISI: { status: "TAM_YETKI", note: "Hazirun sürecine iştirak eder." },
      ABD_BASKANI: { status: "YOK", note: "Yalnızca kendi katılım imzasını atar." },
      OGRETIM_ELEMANI: { status: "YOK", note: "Yalnızca kendi katılım imzasını atar." },
      BOLUM_SEKRETERI: { status: "TAM_YETKI", note: "Yoklama listesini ve mazeret belgelerini sisteme girer." }
    }
  },
  {
    id: "SALT_COGUNLUK_DENETIMI",
    category: "HAZIRUN_VE_OTURUM",
    name: "Salt Çoğunluk Denetimi ve Erteleme Tanzimi",
    description: "Üye tamsayısının salt çoğunluğunu (floor(N/2)+1) kontrol etme; yetersizlikte erteleme tutanağı düzenleme.",
    access: {
      BOLUM_BASKANI: { status: "TAM_YETKI", note: "Erteleme tutanağını tanzim ve imza eder." },
      BOLUM_BASKAN_YARDIMCISI: { status: "VEKALETEN", note: "Başkan vekiliyse erteleme kararı alır." },
      ABD_BASKANI: { status: "YOK", note: "Tek başına erteleme kararı veremez." },
      OGRETIM_ELEMANI: { status: "YOK", note: "Yetkisi yoktur." },
      BOLUM_SEKRETERI: { status: "TAM_YETKI", note: "Sistemin hesapladığı erteleme tutanağı taslağını oluşturur." }
    }
  },
  {
    id: "OTURUM_ACMA_VE_YONETME",
    category: "HAZIRUN_VE_OTURUM",
    name: "Toplantı Oturumunu Açma ve Yönetme",
    description: "Yeter sayı sağlandığında oturumu resmi olarak açma ve söz hakkı verme.",
    access: {
      BOLUM_BASKANI: { status: "TAM_YETKI", note: "Toplantıyı bizzat yönetir ve yönlendirir." },
      BOLUM_BASKAN_YARDIMCISI: { status: "VEKALETEN", note: "Başkan bulunmadığında oturumu yönetir." },
      ABD_BASKANI: { status: "YOK", note: "Kurul oturumunu açamaz." },
      OGRETIM_ELEMANI: { status: "YOK", note: "Yetkisi yoktur." },
      BOLUM_SEKRETERI: { status: "YOK", note: "Raportör olarak oturumu takip eder." }
    }
  },

  // 3. MÜZAKERE VE OYLAMA SÜRECİ
  {
    id: "GUNDEM_OYLAMASI",
    category: "MUZAKERE_VE_OYLAMA",
    name: "Gündem Oylaması ve Madde Çıkarma Oyu",
    description: "Gündem maddelerinin görüşülmeye kabulünü oylama ve kabul edilmeyenleri çıkarma.",
    access: {
      BOLUM_BASKANI: { status: "TAM_YETKI", note: "Oylamayı yaptırır ve oy kullanır." },
      BOLUM_BASKAN_YARDIMCISI: { status: "TAM_YETKI", note: "Kurul üyesi olarak oy kullanır." },
      ABD_BASKANI: { status: "TAM_YETKI", note: "Kurul üyesi olarak oy kullanır." },
      OGRETIM_ELEMANI: { status: "KOSULLU_YETKI", note: "Tek ABD'li bölümlerde tam oy hakkı vardır; Çok ABD'de yoktur (Md. 15)." },
      BOLUM_SEKRETERI: { status: "YOK", note: "Oy hakkı bulunmaz." }
    }
  },
  {
    id: "MADDELERI_OYLAMA",
    category: "MUZAKERE_VE_OYLAMA",
    name: "Karar Oylaması (Kabul / Ret / Çekimser)",
    description: "Müzakere edilen maddeler için kabul, ret veya çekimser oyu kullanma.",
    access: {
      BOLUM_BASKANI: { status: "TAM_YETKI", note: "Oy hakkı vardır; eşitlik halinde başkanın tarafı çoğunluk sayılır." },
      BOLUM_BASKAN_YARDIMCISI: { status: "TAM_YETKI", note: "Kurul üyesi olarak oy kullanır." },
      ABD_BASKANI: { status: "TAM_YETKI", note: "Kurul üyesi olarak oy kullanır." },
      OGRETIM_ELEMANI: { status: "KOSULLU_YETKI", note: "Tek ABD'de kurul üyesi olarak oylar; Çok ABD'de kurul üyesi değildir (Md. 15)." },
      BOLUM_SEKRETERI: { status: "YOK", note: "Oy hakkı bulunmaz." }
    }
  },
  {
    id: "MUHALEFET_SERHI_GIRISI",
    category: "MUZAKERE_VE_OYLAMA",
    name: "Muhalefet Şerhi (Karşı Oy) Bildirimi",
    description: "Ret oyu kullanan üyenin resmi gerekçesini tutanağa yazdırma hakkı.",
    access: {
      BOLUM_BASKANI: { status: "TAM_YETKI", note: "Muhalefet şerhini tutanağa kaydettirir." },
      BOLUM_BASKAN_YARDIMCISI: { status: "TAM_YETKI", note: "Karşı oy kullandığında gerekçe sunar." },
      ABD_BASKANI: { status: "TAM_YETKI", note: "Karşı oy gerekçesini tutanağa işletir." },
      OGRETIM_ELEMANI: { status: "KOSULLU_YETKI", note: "Tek ABD'li bölümlerde kurul üyesi ise muhalefet şerhi düşebilir." },
      BOLUM_SEKRETERI: { status: "YOK", note: "Şahsi muhalefet şerhi veremez; beyanları kaydeder." }
    }
  },
  {
    id: "KARAR_KESINLESTIRME",
    category: "MUZAKERE_VE_OYLAMA",
    name: "Kararı Kesinleştirme ve Karar No Verme",
    description: "Oylama sonucuna göre resmi 2026/01-01 formatında karar numarası atama.",
    access: {
      BOLUM_BASKANI: { status: "TAM_YETKI", note: "Kararı nihai olarak bağlar ve onaylar." },
      BOLUM_BASKAN_YARDIMCISI: { status: "VEKALETEN", note: "Başkan vekiliyse kesinleştirir." },
      ABD_BASKANI: { status: "YOK", note: "Yetkisi yoktur." },
      OGRETIM_ELEMANI: { status: "YOK", note: "Yetkisi yoktur." },
      BOLUM_SEKRETERI: { status: "TAM_YETKI", note: "Sistem üzerinden karar numaralarını tanzim eder." }
    }
  },

  // 4. TUTANAK VE EBYS SÜRECİ
  {
    id: "TUTANAK_DERLEME",
    category: "TUTANAK_VE_EBYS",
    name: "Resmi Karar Tutanağını Derleme",
    description: "Alınan kararları, ek tabloları ve imza cetvelini resmi A4 formatında derleme.",
    access: {
      BOLUM_BASKANI: { status: "TAM_YETKI", note: "Tutanağın son halini inceler ve onaylar." },
      BOLUM_BASKAN_YARDIMCISI: { status: "TAM_YETKI", note: "Mizanpajı kontrol edebilir." },
      ABD_BASKANI: { status: "YOK", note: "Yetkisi yoktur." },
      OGRETIM_ELEMANI: { status: "YOK", note: "Yetkisi yoktur." },
      BOLUM_SEKRETERI: { status: "TAM_YETKI", note: "Tutanağı derler ve imza aşamasına getirir." }
    }
  },
  {
    id: "E_IMZA_ATMA",
    category: "TUTANAK_VE_EBYS",
    name: "Karar Tutanağı ve Hazirun İmzalama",
    description: "Nihai karar tutanağı altına elektronik veya ıslak imza koyma.",
    access: {
      BOLUM_BASKANI: { status: "TAM_YETKI", note: "Kurul başkanı sıfatıyla ilk ve nihai imzayı atar." },
      BOLUM_BASKAN_YARDIMCISI: { status: "TAM_YETKI", note: "Kurul üyesi sıfatıyla imzalar." },
      ABD_BASKANI: { status: "TAM_YETKI", note: "Kurul üyesi sıfatıyla imzalar." },
      OGRETIM_ELEMANI: { status: "KOSULLU_YETKI", note: "Tek ABD'de asıl üye olarak imzalar; Çok ABD'de kurul üyesi imzası atmaz (Md. 15)." },
      BOLUM_SEKRETERI: { status: "TAM_YETKI", note: "Raportör / Birim personeli olarak imzalar." }
    }
  },
  {
    id: "EBYS_UST_YAZI_ONAY",
    category: "TUTANAK_VE_EBYS",
    name: "EBYS Üst Yazısı ile Dekanlığa Sevk",
    description: "Kararları Dekanlığa/Müdürlüğe resmi EBYS üst yazısıyla havale etme.",
    access: {
      BOLUM_BASKANI: { status: "TAM_YETKI", note: "Münhasıran Bölüm Başkanı yetkisindedir." },
      BOLUM_BASKAN_YARDIMCISI: { status: "VEKALETEN", note: "Vekalet onayıyla sevk edebilir." },
      ABD_BASKANI: { status: "YOK", note: "Bölüm adına sevk yetkisi yoktur." },
      OGRETIM_ELEMANI: { status: "YOK", note: "Yetkisi yoktur." },
      BOLUM_SEKRETERI: { status: "YOK", note: "EBYS taslağını hazırlar, imzayı başkan atar." }
    }
  },
  {
    id: "EBYS_CIKTI_VE_ARSIV",
    category: "TUTANAK_VE_EBYS",
    name: "EBYS Doğrulama, PDF Çıktısı Alma ve Arşivleme",
    description: "Barkodlu, karekodlu resmi Karar Tutanağı PDF çıktısını alma ve arşive kaldırma.",
    access: {
      BOLUM_BASKANI: { status: "TAM_YETKI", note: "Arşivleme ve çıktı alma yetkisine sahiptir." },
      BOLUM_BASKAN_YARDIMCISI: { status: "TAM_YETKI", note: "Çıktı ve arşive erişebilir." },
      ABD_BASKANI: { status: "TAM_YETKI", note: "Kendi bölümünün kararlarını görüntüleyebilir ve indirebilir." },
      OGRETIM_ELEMANI: { status: "TAM_YETKI", note: "İlgili bölüm kararlarını görüntüleyebilir." },
      BOLUM_SEKRETERI: { status: "TAM_YETKI", note: "Resmi PDF çıktısını alır, EBYS kaydını tamamlar ve arşivler." }
    }
  }
];

export function checkRolePermission(role: RoleKey, permissionId: string): { allowed: boolean; status: PermissionAccess; note: string } {
  const perm = PERMISSION_MATRIX.find(p => p.id === permissionId);
  if (!perm) return { allowed: false, status: "YOK", note: "Tanımlanmamış yetki" };
  const access = perm.access[role];
  return {
    allowed: access.status === "TAM_YETKI" || access.status === "KOSULLU_YETKI" || access.status === "VEKALETEN",
    status: access.status,
    note: access.note
  };
}
