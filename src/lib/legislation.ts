import { DepartmentType, MemberRole, AttendanceStatus, DecisionCategory, DecisionResult } from "@prisma/client";

/**
 * Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15:
 * "Bölüm Kurulu:
 * - Tek anabilim dalı bulunan bölümlerde bölüm başkanının başkanlığında tüm öğretim üyeleri ve öğretim görevlilerinden,
 * - Birden fazla anabilim dalı bulunan bölümlerde ise bölüm başkanı, bölüm başkan yardımcıları ile anabilim dalı başkanlarından oluşur."
 */
export function determineBoardMembership(
  departmentType: DepartmentType,
  role: MemberRole
): { isMember: boolean; boardTitle: string; explanation: string } {
  if (role === MemberRole.BOLUM_BASKANI) {
    return {
      isMember: true,
      boardTitle: "Bölüm Başkanı (Kurul Başkanı)",
      explanation: "Yönetmelik Madde 15 gereğince Bölüm Başkanı, Bölüm Kurulunun tabii başkanı ve oy hakkına sahip asıl üyesidir."
    };
  }

  if (departmentType === DepartmentType.TEK_ANABILIM_DALI) {
    if (
      role === MemberRole.BOLUM_BASKAN_YARDIMCISI ||
      role === MemberRole.ABD_BASKANI ||
      role === MemberRole.OGRETIM_UYESI ||
      role === MemberRole.OGRETIM_GOREVLISI
    ) {
      return {
        isMember: true,
        boardTitle: role === MemberRole.OGRETIM_GOREVLISI ? "Öğretim Görevlisi (Kurul Üyesi)" : "Öğretim Üyesi (Kurul Üyesi)",
        explanation: "Tek anabilim dalı bulunan bölümlerde Bölüm Başkanının başkanlığında TÜM öğretim üyeleri ve öğretim görevlileri kurul üyesidir (Madde 15)."
      };
    }
    return {
      isMember: false,
      boardTitle: "Misafir / Raportör",
      explanation: "Araştırma görevlileri ve idari personel Bölüm Kurulu asıl üyesi değildir; oy hakkı bulunmaz."
    };
  } else {
    // Birden Fazla Anabilim Dalı
    if (role === MemberRole.BOLUM_BASKAN_YARDIMCISI) {
      return {
        isMember: true,
        boardTitle: "Bölüm Başkan Yardımcısı (Kurul Üyesi)",
        explanation: "Birden fazla anabilim dalı olan bölümlerde Bölüm Başkan Yardımcıları kurulun asıl üyesidir (Madde 15)."
      };
    }
    if (role === MemberRole.ABD_BASKANI) {
      return {
        isMember: true,
        boardTitle: "Anabilim Dalı Başkanı (Kurul Üyesi)",
        explanation: "Birden fazla anabilim dalı olan bölümlerde Anabilim Dalı Başkanları kurulun asıl üyesidir (Madde 15)."
      };
    }
    return {
      isMember: false,
      boardTitle: "Öğretim Elemanı (Kurul Dışı)",
      explanation: "Birden fazla anabilim dalı olan bölümlerde kurul yalnızca Bölüm Bşk., Bşk. Yardımcıları ve ABD Başkanlarından oluşur. Diğer öğretim elemanları doğrudan kurul üyesi değildir."
    };
  }
}

/**
 * Toplantı Yeter Sayısı (Salt Çoğunluk) Kontrolü:
 * Katılım tutanağı üzerinden salt çoğunluğu otomatik hesaplama.
 * Toplam üye sayısı N ise, Salt Çoğunluk Q = floor(N / 2) + 1
 */
export function calculateQuorum(totalEligibleMembers: number, actualAttendeesCount: number) {
  const quorumRequired = Math.floor(totalEligibleMembers / 2) + 1;
  const isQuorumMet = actualAttendeesCount >= quorumRequired;
  const percentage = totalEligibleMembers > 0 ? Math.round((actualAttendeesCount / totalEligibleMembers) * 100) : 0;

  return {
    totalEligibleMembers,
    actualAttendeesCount,
    quorumRequired,
    isQuorumMet,
    percentage,
    missingCount: isQuorumMet ? 0 : quorumRequired - actualAttendeesCount,
    message: isQuorumMet
      ? `Salt çoğunluk sağlanmıştır (${actualAttendeesCount}/${totalEligibleMembers} üye hazır). Oturum açılabilir.`
      : `Salt çoğunluk sağlanamamıştır! (En az ${quorumRequired} üye katılımı gerekirken ${actualAttendeesCount} üye katılmıştır). Toplantı ileri bir tarihe ertelenmelidir.`
  };
}

/**
 * 5 Standart Karar Kategorisi için Parametrik Şablon Metin Üreticileri
 */
export const LEGISLATION_TEMPLATES = {
  // Kategori 1: Eğitim-Öğretim ve Ders Görevlendirme
  [DecisionCategory.DERS_GOREVLENDIRME]: {
    title: "Eğitim-Öğretim ve Ders Görevlendirmeleri",
    legalBasis: "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği (Madde 8) ile 2547 Sayılı Kanun Madde 31 ve 40/a",
    defaultTemplate: (params: { akademikYil?: string; yariyil?: string; program?: string }) => {
      const yil = params.akademikYil || "2026-2027";
      const yar = params.yariyil || "Güz";
      const prg = params.program || "Lisans Programı";
      return `Bölümümüzün ${yil} Eğitim-Öğretim Yılı ${yar} Yarıyılında ${prg} bünyesinde okutulması kararlaştırılan derslerin haftalık teorik ve uygulama saatleri, kredi/AKTS değerleri ve dersi bizzat yürütecek öğretim elemanlarının görevlendirilmeleri hususu görüşüldü. Yapılan müzakereler neticesinde; ekli Ders Dağılım Çizelgesi'nde (Ek-1) yer alan derslerin ve sorumlu öğretim elemanı görevlendirmelerinin S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği'nin 8. maddesi uyarınca kabulüne ve onaylanmak üzere Fakülte/Yüksekokul Yönetim Kurulu'na arzına oybirliğiyle karar verildi.`;
    }
  },

  // Kategori 2: Muafiyet ve İntibak Kararları
  [DecisionCategory.MUAFIYET_INTIBAK]: {
    title: "Ders Muafiyeti ve Akademik İntibak Kararı",
    legalBasis: "Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 10/5 & 15) ve S.Ü. Muafiyet ve İntibak Yönergesi",
    defaultTemplate: (params: { ogrenciNo?: string; ogrenciAdSoyad?: string; geldigiKurum?: string; intibakSinifi?: string }) => {
      const no = params.ogrenciNo || "233311021";
      const ad = params.ogrenciAdSoyad || "Yunus Emre Sert";
      const kurum = params.geldigiKurum || "Hacettepe Üniversitesi Bilgisayar Mühendisliği Bölümü";
      const sinif = params.intibakSinifi || "3. Sınıf";
      return `Bölümümüz Muafiyet ve İntibak Komisyonu'nun hazırlamış olduğu rapor ile ${no} numaralı öğrenci ${ad}'in daha önce ${kurum} bünyesinde başarıyla tamamladığı derslere ait transkript ve ders içerikleri incelendi. Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 10/5 & 15 ve S.Ü. Muafiyet ve İntibak Yönergesi hükümleri çerçevesinde; ekli Muafiyet ve İntibak Karşılaştırma Çizelgesi'nde (Ek-2) gösterilen derslerden muaf tutulmasına, harf notlarının sisteme intibak ettirilmesine ve öğrencinin ${sinif}'a intibakının onaylanmak üzere Fakülte/Yüksekokul Yönetim Kurulu'na arzına oybirliğiyle karar verildi.`;
    }
  },

  // Kategori 3: Staj ve İşletmede Mesleki Eğitim
  [DecisionCategory.STAJ_ISLETME]: {
    title: "Zorunlu Staj ve İşletmede Mesleki Eğitim Değerlendirmesi",
    legalBasis: "S.Ü. Staj ve İşletmede Mesleki Eğitim Yönergeleri",
    defaultTemplate: (params: { stajDonemi?: string; stajTuru?: string }) => {
      const donem = params.stajDonemi || "2025-2026 Yaz Dönemi";
      const tur = params.stajTuru || "Zorunlu Endüstriyel Staj";
      return `Bölümümüz Staj Komisyonu Başkanlığı tarafından ${donem} döneminde ${tur} kapsamında stajlarını tamamlayan öğrencilerin teslim ettiği staj dosyaları ve işyeri değerlendirme belgeleri incelendi. S.Ü. Staj ve İşletmede Mesleki Eğitim Yönergeleri doğrultusunda yapılan değerlendirmeler neticesinde; ekli Onaylı Öğrenci Staj Listesi'nde (Ek-3) bilgileri sunulan öğrencilerin kabul ve ret edilen iş günü sayılarının aynen onaylanmasına ve Öğrenci İşleri Otomasyonuna işlenmek üzere Dekanlığa/Müdürlüğe bildirilmesine oybirliğiyle karar verildi.`;
    }
  },

  // Kategori 4: Sınav Programı ve Mazeret Sınavları
  [DecisionCategory.SINAV_MAZERET]: {
    title: "Sınav Programı ve Mazeret Sınavı Başvuruları",
    legalBasis: "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği",
    defaultTemplate: (params: { akademikYil?: string; yariyil?: string; sinavTuru?: string; tarihAraligi?: string }) => {
      const yil = params.akademikYil || "2026-2027";
      const yar = params.yariyil || "Güz";
      const tur = params.sinavTuru || "Ara Sınav (Vize) ve Mazeret Takvimi";
      const aralik = params.tarihAraligi || "17-28 Kasım 2026";
      return `Bölümümüzün ${yil} Eğitim-Öğretim Yılı ${yar} Yarıyılı ${tur} sınav programı ve sağlık raporu/haklı mazeret belgesi ibraz eden öğrencilerin dilekçeleri müzakere edildi. S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği gereğince hazırlanan ekli Sınav Takvimi'nin (Ek-4) uygun olduğuna, mazeretleri komisyonca geçerli kabul edilen öğrencilere mazeret sınav hakkı tanınmasına ve sınav takviminin ilan edilmek üzere ilgili makamlara sunulmasına oybirliğiyle karar verildi.`;
    }
  },

  // Kategori 5: Komisyon ve Koordinatörlük Seçimi
  [DecisionCategory.KOMISYON_SECIMI]: {
    title: "Bölüm Komisyon ve Koordinatörlük Üyeleri Seçimi",
    legalBasis: "Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 15)",
    defaultTemplate: (params: { komisyonAdi?: string; gorevSuresi?: string }) => {
      const adi = params.komisyonAdi || "Kalite, Akreditasyon ve Bologna Komisyonu";
      const sure = params.gorevSuresi || "3 (üç) yıl";
      return `Bölümümüz bünyesinde akademik ve akreditasyon çalışmalarının düzenli yürütülmesini teminen, Üniversitelerde Akademik Teşkilat Yönetmeliği'nin 15. maddesi uyarınca teşkil edilen ${adi} üyelerinin görev süresinin dolması sebebiyle yeni komisyon üyeleri belirlenmiştir. Yapılan oylama neticesinde; ${sure} süreyle ekli Komisyon Üye Listesi'nde (Ek-5) yer alan öğretim elemanlarının görevlendirilmelerine oybirliğiyle karar verildi.`;
    }
  },

  // Diğer
  [DecisionCategory.DIGER]: {
    title: "Diğer Akademik ve İdari Konular",
    legalBasis: "Üniversitelerde Akademik Teşkilat Yönetmeliği ve İlgili Yönergeler",
    defaultTemplate: (params: { konu?: string }) => {
      return `Bölümümüzün gündeminde yer alan ${params.konu || "ilgili akademik ve idari konular"} görüşüldü. Yapılan müzakereler neticesinde durumun uygun olduğuna oybirliğiyle karar verildi.`;
    }
  }
};

/**
 * Resmi Erteleme Tutanağı Metni Oluşturucu
 */
export function generatePostponementMinuteDoc(data: {
  facultyName: string;
  departmentName: string;
  meetingNumber: number;
  academicYear: string;
  term: string;
  scheduledDate: Date;
  postponedToDate: Date;
  totalMembers: number;
  quorumRequired: number;
  actualAttendees: number;
  headTitle: string;
  headName: string;
  location: string;
}): string {
  const dateFormatted = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short" }).format(data.scheduledDate);
  const newDateFormatted = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short" }).format(data.postponedToDate);

  return `T.C.
SELÇUK ÜNİVERSİTESİ
${data.facultyName.toUpperCase()}
${data.departmentName.toUpperCase()} BÖLÜM BAŞKANLIĞI

BÖLÜM KURULU TOPLANTI YETERSİZLİĞİ VE ERTELEME TUTANAĞI

Toplantı No           : ${data.academicYear}/${data.meetingNumber < 10 ? "0" + data.meetingNumber : data.meetingNumber}
Planlanan Toplantı   : ${dateFormatted}
Toplantı Yeri         : ${data.location}
Kurul Üye Tamsayısı   : ${data.totalMembers}
Gereken Salt Çoğunluk: ${data.quorumRequired}
Hazır Bulunan Üye     : ${data.actualAttendees}

Üniversitelerde Akademik Teşkilat Yönetmeliği'nin 15. maddesi ve Selçuk Üniversitesi Bölüm Kurulu Süreci İş Akışı hükümleri gereğince; ${dateFormatted} tarihinde yapılması kararlaştırılan Bölüm Kurulu Toplantısı öncesinde yapılan katılım (hazirun) yoklamasında:
Toplam ${data.totalMembers} kurul üyesinden yalnızca ${data.actualAttendees} üyenin hazır bulunduğu, toplantının açılabilmesi için gereken asgari salt çoğunluğun (${data.quorumRequired} üye) sağlanamadığı tespit edilmiştir.

Bu doğrultuda; Üniversitelerde Akademik Teşkilat Yönetmeliği hükümleri uyarınca toplantı oturumu açılamamış ve belirlenen gündem maddelerinin görüşülmesi ${newDateFormatted} tarihine ERTELENMİŞTİR.

İşbu Toplantı Yetersizliği ve Erteleme Tutanağı mahallinde tanzim edilerek hazır bulunan üyelerce müştereken imza altına alınmıştır.

${data.headTitle} ${data.headName}
Bölüm Başkanı / Kurul Başkanı`;
}

/**
 * Resmi EBYS Üst Sevk Yazısı Metni Oluşturucu
 */
export function generateEBYSLetterDoc(data: {
  facultyName: string;
  departmentName: string;
  ebysUnitCode: string;
  ebysDocumentNo: string;
  meetingNumber: number;
  academicYear: string;
  meetingDate: Date;
  itemCount: number;
  headTitle: string;
  headName: string;
}): string {
  const dateStr = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(data.meetingDate);

  return `T.C.
SELÇUK ÜNİVERSİTESİ
${data.facultyName.toUpperCase()} DEKANLIĞINA/MÜDÜRLÜĞÜNE

Sayı   : ${data.ebysDocumentNo}
Konu   : Bölüm Kurulu Kararları (Toplantı No: ${data.academicYear}/${data.meetingNumber < 10 ? "0" + data.meetingNumber : data.meetingNumber})
Tarih  : ${dateStr}

Bölümümüz Bölüm Kurulu'nun ${dateStr} tarihinde gerçekleştirdiği ${data.academicYear}/${data.meetingNumber < 10 ? "0" + data.meetingNumber : data.meetingNumber} sayılı olağan toplantısında müzakere edilerek karara bağlanan ${data.itemCount} (adet) karar metni ve ekli çizelgeleri ekte sunulmuştur.

Alınan kararların Fakülte/Yüksekokul Yönetim Kurulu'nda görüşülerek onaylanması hususunu tensiplerinize saygılarımla arz ederim.

${data.headTitle} ${data.headName}
Bölüm Başkanı`;
}
