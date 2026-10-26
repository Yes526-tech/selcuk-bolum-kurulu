import {
  PrismaClient,
  DepartmentType,
  MemberRole,
  MeetingStatus,
  AttendanceStatus,
  DecisionCategory,
  DecisionResult,
  BolumTipi,
  RolTuru,
  ToplantiDurumu,
  KatilimDurumu,
  KararKategorisi,
  GundemKabulDurumu,
  KararSonucu,
  OyTuru,
  TalepDurumu
} from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Selçuk Üniversitesi Bölüm ve Kurul Karar Otomasyonu Tohumlama Başlatılıyor...");

  // 1. Temizlik
  await prisma.decisionSignature.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.itemVote.deleteMany();
  await prisma.meetingItem.deleteMany();
  await prisma.meetingAttendance.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.decisionTemplate.deleteMany();
  await prisma.facultyMember.deleteMany();
  await prisma.academicUnit.deleteMany();
  await prisma.department.deleteMany();

  // Eski Türkçeleştirilmiş tabloların temizliği
  await prisma.oylamaDetay.deleteMany();
  await prisma.karar.deleteMany();
  await prisma.katilimTutanagi.deleteMany();
  await prisma.gundemMaddesi.deleteMany();
  await prisma.toplanti.deleteMany();
  await prisma.kararSablonu.deleteMany();
  await prisma.talepGundemHavuzu.deleteMany();
  await prisma.bildirimLog.deleteMany();
  await prisma.akademikPersonel.deleteMany();
  await prisma.anabilimDali.deleteMany();
  await prisma.bolum.deleteMany();
  await prisma.fakulteYuksekokul.deleteMany();

  // =========================================================================
  // BÖLÜM 1: AKADEMİK BİRİMLER VE KURULLAR (RAPOR BÖLÜM 1.1)
  // =========================================================================
  // Kurul 1: Bilgisayar Mühendisliği Bölüm Kurulu (Teknoloji Fakültesi)
  const cengDept = await prisma.department.create({
    data: {
      code: "CENG",
      name: "Bilgisayar Mühendisliği Bölüm Kurulu",
      facultyName: "Teknoloji Fakültesi",
      departmentType: DepartmentType.COK_ANABILIM_DALI,
      ebysUnitCode: "302.01.05",
      currentAcademicYear: "2026-2027",
      currentTerm: "Güz",
      headTitle: "Prof. Dr.",
      headName: "Şakir TAŞDEMİR",
      viceHead1: "Doç. Dr. Tahir SAĞ",
      viceHead2: "Doç. Dr. Güzin ÖZMEN",
    }
  });

  // Uyumlu Fakülte ve Bölüm kaydı (Eski/Ek modeller için)
  const fakulteTeknoloji = await prisma.fakulteYuksekokul.create({
    data: {
      kod: "TEK",
      ad: "Teknoloji Fakültesi",
      tur: "FAKULTE",
      dekanMudurUnvanAd: "Prof. Dr. Ali Kahraman",
    }
  });

  const bolumCeng = await prisma.bolum.create({
    data: {
      id: cengDept.id,
      fakulteId: fakulteTeknoloji.id,
      kod: "CENG",
      ad: "Bilgisayar Mühendisliği Bölümü",
      ebysBirimKodu: "302.01.05",
      bolumTipi: BolumTipi.COK_ANABILIM_DALI,
      hasMultipleSpecialties: true,
      mevcutAkademikYil: "2026-2027",
      mevcutYariyil: "Güz",
    }
  });

  // Kurul 2: Bilgisayar Mühendisliği Anabilim Dalı Kurulu (Teknoloji Fakültesi / Lisansüstü)
  const cengAbdDept = await prisma.department.create({
    data: {
      code: "CENG-ABD",
      name: "Bilgisayar Mühendisliği Anabilim Dalı Kurulu",
      facultyName: "Teknoloji Fakültesi / Lisansüstü",
      departmentType: DepartmentType.TEK_ANABILIM_DALI,
      ebysUnitCode: "302.01.06",
      currentAcademicYear: "2026-2027",
      currentTerm: "Güz",
      headTitle: "Prof. Dr.",
      headName: "Fatih BAŞÇİFTÇİ",
      viceHead1: "Doç. Dr. Tahir SAĞ",
    }
  });

  // Kurul 3: Bilişim Teknolojileri Mühendisliği Anabilim Dalı Kurulu (Teknoloji Fakültesi / Lisansüstü)
  const btmAbdDept = await prisma.department.create({
    data: {
      code: "BTM-ABD",
      name: "Bilişim Teknolojileri Mühendisliği Anabilim Dalı Kurulu",
      facultyName: "Teknoloji Fakültesi / Lisansüstü",
      departmentType: DepartmentType.TEK_ANABILIM_DALI,
      ebysUnitCode: "302.01.07",
      currentAcademicYear: "2026-2027",
      currentTerm: "Güz",
      headTitle: "Prof. Dr.",
      headName: "Adem Alpaslan ALTUN",
      viceHead1: "Doç. Dr. Güzin ÖZMEN",
    }
  });

  // Kurul 4: Biyomedikal Cihaz Teknolojisi Bölümü (Tek Anabilim Dalı - Yönetmelik Karşılaştırma Modeli)
  const bioDept = await prisma.department.create({
    data: {
      code: "BCT",
      name: "Biyomedikal Cihaz Teknolojisi Bölüm Kurulu",
      facultyName: "Sağlık Hizmetleri Meslek Yüksekokulu",
      departmentType: DepartmentType.TEK_ANABILIM_DALI,
      ebysUnitCode: "302.04.12",
      currentAcademicYear: "2026-2027",
      currentTerm: "Güz",
      headTitle: "Doç. Dr.",
      headName: "Tarkan Güler",
    }
  });

  // =========================================================================
  // ANABİLİM DALLARI (CENG İÇİN)
  // =========================================================================
  const abdYazilim = await prisma.academicUnit.create({
    data: { departmentId: cengDept.id, name: "Bilgisayar Yazılımı Anabilim Dalı", shortCode: "BYAZ" }
  });
  const abdDonanim = await prisma.academicUnit.create({
    data: { departmentId: cengDept.id, name: "Bilgisayar Donanımı Anabilim Dalı", shortCode: "BDON" }
  });
  const abdTemel = await prisma.academicUnit.create({
    data: { departmentId: cengDept.id, name: "Bilgisayar Bilimleri Anabilim Dalı", shortCode: "BBIL" }
  });
  const abdAglar = await prisma.academicUnit.create({
    data: { departmentId: cengDept.id, name: "Siber Güvenlik ve Ağ Sistemleri Anabilim Dalı", shortCode: "BAGL" }
  });

  // =========================================================================
  // ÖĞRETİM ÜYELERİ VE PERSONEL KADROSU
  // =========================================================================
  // CENG Bölüm Kurulu Üyeleri:
  // Md. 15 (Çoklu ABD): Bölüm Başkanı + 2 Bşk. Yrd. + 4 ABD Bşk. = 7 Asıl Kurul Üyesi!
  const membersCeng = await Promise.all([
    // 0. Bölüm Başkanı
    prisma.facultyMember.create({
      data: {
        departmentId: cengDept.id,
        academicUnitId: abdYazilim.id,
        title: "Prof. Dr.",
        firstName: "Şakir",
        lastName: "TAŞDEMİR",
        email: "stasdemir@selcuk.edu.tr",
        role: MemberRole.BOLUM_BASKANI,
        sicilNo: "SU-10001",
      }
    }),
    // 1. Bölüm Bşk. Yrd. 1
    prisma.facultyMember.create({
      data: {
        departmentId: cengDept.id,
        academicUnitId: abdDonanim.id,
        title: "Doç. Dr.",
        firstName: "Tahir",
        lastName: "SAĞ",
        email: "tahir.sag@selcuk.edu.tr",
        role: MemberRole.BOLUM_BASKAN_YARDIMCISI,
        sicilNo: "SU-10002",
      }
    }),
    // 2. Bölüm Bşk. Yrd. 2
    prisma.facultyMember.create({
      data: {
        departmentId: cengDept.id,
        academicUnitId: abdTemel.id,
        title: "Doç. Dr.",
        firstName: "Güzin",
        lastName: "ÖZMEN",
        email: "guzin.ozmen@selcuk.edu.tr",
        role: MemberRole.BOLUM_BASKAN_YARDIMCISI,
        sicilNo: "SU-10003",
      }
    }),
    // 3. Bilgisayar Yazılımı ABD Başkanı
    prisma.facultyMember.create({
      data: {
        departmentId: cengDept.id,
        academicUnitId: abdYazilim.id,
        title: "Prof. Dr.",
        firstName: "Fatih",
        lastName: "BAŞÇİFTÇİ",
        email: "fatih.basciftci@selcuk.edu.tr",
        role: MemberRole.ABD_BASKANI,
        sicilNo: "SU-10005",
      }
    }),
    // 4. Bilgisayar Donanımı ABD Başkanı
    prisma.facultyMember.create({
      data: {
        departmentId: cengDept.id,
        academicUnitId: abdDonanim.id,
        title: "Prof. Dr.",
        firstName: "Adem Alpaslan",
        lastName: "ALTUN",
        email: "adem.altun@selcuk.edu.tr",
        role: MemberRole.ABD_BASKANI,
        sicilNo: "SU-10006",
      }
    }),
    // 5. Bilgisayar Bilimleri ABD Başkanı
    prisma.facultyMember.create({
      data: {
        departmentId: cengDept.id,
        academicUnitId: abdTemel.id,
        title: "Prof. Dr.",
        firstName: "Abdullah Engin",
        lastName: "ÖZÇELİK",
        email: "abdullah.ozcelik@selcuk.edu.tr",
        role: MemberRole.ABD_BASKANI,
        sicilNo: "SU-10007",
      }
    }),
    // 6. Siber Güvenlik ve Ağ Sistemleri ABD Başkanı
    prisma.facultyMember.create({
      data: {
        departmentId: cengDept.id,
        academicUnitId: abdAglar.id,
        title: "Prof. Dr.",
        firstName: "Ahmet Ali",
        lastName: "SERTKAYA",
        email: "ahmet.sertkaya@selcuk.edu.tr",
        role: MemberRole.ABD_BASKANI,
        sicilNo: "SU-10008",
      }
    }),
    // 7. Öğretim Üyesi (Kurul Dışı / Teklif Sunabilir)
    prisma.facultyMember.create({
      data: {
        departmentId: cengDept.id,
        academicUnitId: abdYazilim.id,
        title: "Prof. Dr.",
        firstName: "Adnan",
        lastName: "BERBER",
        email: "adnan.berber@selcuk.edu.tr",
        role: MemberRole.OGRETIM_UYESI,
        sicilNo: "SU-10009",
      }
    }),
    // 8. Öğretim Üyesi (İzinli Hoca - Görevli / İzinli Nisap Testi)
    prisma.facultyMember.create({
      data: {
        departmentId: cengDept.id,
        academicUnitId: abdDonanim.id,
        title: "Dr. Öğr. Üyesi",
        firstName: "Kemal",
        lastName: "ÖZTÜRK",
        email: "kozturk@selcuk.edu.tr",
        role: MemberRole.OGRETIM_UYESI,
        sicilNo: "SU-10012",
        onLeave: true,
        leaveReason: "YÖK Yurtdışı Araştırma İzni (TÜBİTAK 2219)",
      }
    }),
    // 9. Bölüm Sekreteri / Raportör
    prisma.facultyMember.create({
      data: {
        departmentId: cengDept.id,
        title: "Bölüm Sekreteri",
        firstName: "Zeynep",
        lastName: "GÜNEŞ",
        email: "ceng.sekreterlik@selcuk.edu.tr",
        role: MemberRole.SEKRETERYA,
        sicilNo: "SU-20101",
      }
    }),
  ]);

  // BCT (Tek Anabilim Dalı) Hocaları
  const membersBct = await Promise.all([
    prisma.facultyMember.create({ data: { departmentId: bioDept.id, title: "Doç. Dr.", firstName: "Tarkan", lastName: "GÜLER", email: "tguler@selcuk.edu.tr", role: MemberRole.BOLUM_BASKANI, sicilNo: "SU-11002" } }),
    prisma.facultyMember.create({ data: { departmentId: bioDept.id, title: "Dr. Öğr. Üyesi", firstName: "Nilgün", lastName: "ERTEKİN", email: "nertekin@selcuk.edu.tr", role: MemberRole.OGRETIM_UYESI, sicilNo: "SU-12490" } }),
    prisma.facultyMember.create({ data: { departmentId: bioDept.id, title: "Öğr. Gör.", firstName: "Cemil", lastName: "BOZKURT", email: "cbozkurt@selcuk.edu.tr", role: MemberRole.OGRETIM_GOREVLISI, sicilNo: "SU-14220" } }),
    prisma.facultyMember.create({ data: { departmentId: bioDept.id, title: "Öğr. Gör.", firstName: "Aslı", lastName: "DURAN", email: "aduran@selcuk.edu.tr", role: MemberRole.OGRETIM_GOREVLISI, sicilNo: "SU-15100" } }),
  ]);

  // CENG-ABD Hocaları
  await Promise.all([
    prisma.facultyMember.create({ data: { departmentId: cengAbdDept.id, title: "Prof. Dr.", firstName: "Fatih", lastName: "BAŞÇİFTÇİ", email: "fatih.basciftci.abd@selcuk.edu.tr", role: MemberRole.BOLUM_BASKANI, sicilNo: "SU-10005" } }),
    prisma.facultyMember.create({ data: { departmentId: cengAbdDept.id, title: "Doç. Dr.", firstName: "Tahir", lastName: "SAĞ", email: "tahir.sag.abd@selcuk.edu.tr", role: MemberRole.OGRETIM_UYESI, sicilNo: "SU-10002" } }),
    prisma.facultyMember.create({ data: { departmentId: cengAbdDept.id, title: "Prof. Dr.", firstName: "Şakir", lastName: "TAŞDEMİR", email: "stasdemir.abd@selcuk.edu.tr", role: MemberRole.OGRETIM_UYESI, sicilNo: "SU-10001" } }),
  ]);

  // BTM-ABD Hocaları
  await Promise.all([
    prisma.facultyMember.create({ data: { departmentId: btmAbdDept.id, title: "Prof. Dr.", firstName: "Adem Alpaslan", lastName: "ALTUN", email: "adem.altun.btm@selcuk.edu.tr", role: MemberRole.BOLUM_BASKANI, sicilNo: "SU-10006" } }),
    prisma.facultyMember.create({ data: { departmentId: btmAbdDept.id, title: "Doç. Dr.", firstName: "Güzin", lastName: "ÖZMEN", email: "guzin.ozmen.btm@selcuk.edu.tr", role: MemberRole.OGRETIM_UYESI, sicilNo: "SU-10003" } }),
    prisma.facultyMember.create({ data: { departmentId: btmAbdDept.id, title: "Prof. Dr.", firstName: "Ahmet Ali", lastName: "SERTKAYA", email: "ahmet.sertkaya.btm@selcuk.edu.tr", role: MemberRole.OGRETIM_UYESI, sicilNo: "SU-10008" } }),
  ]);

  // =========================================================================
  // 5 STANDART RESMİ KARAR ŞABLONU (RAPOR BÖLÜM 2 & ÇİZELGE 3.5)
  // =========================================================================
  await prisma.decisionTemplate.createMany({
    data: [
      {
        departmentId: cengDept.id,
        category: DecisionCategory.DERS_GOREVLENDIRME,
        name: "Eğitim-Öğretim ve Ders Görevlendirmeleri Şablonu",
        legalBasis: "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği (Madde 8) ile 2547 Sayılı Kanun Madde 31 ve 40/a",
        templateText: "Bölümümüzün 2026-2027 Eğitim-Öğretim Yılı Güz Yarıyılında Lisans Programı bünyesinde okutulması kararlaştırılan derslerin haftalık teorik ve uygulama saatleri, kredi/AKTS değerleri ve dersi bizzat yürütecek öğretim elemanlarının görevlendirilmeleri hususu görüşüldü. Yapılan müzakereler neticesinde; ekli Ders Dağılım Çizelgesi'nde (Ek-1) yer alan derslerin ve sorumlu öğretim elemanı görevlendirmelerinin S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği'nin 8. maddesi uyarınca kabulüne ve onaylanmak üzere Fakülte Yönetim Kurulu'na arzına karar verildi.",
      },
      {
        departmentId: cengDept.id,
        category: DecisionCategory.MUAFIYET_INTIBAK,
        name: "Muafiyet ve İntibak Kararları Şablonu",
        legalBasis: "Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 10/5 & 15 ve S.Ü. Muafiyet ve İntibak Yönergesi",
        templateText: "Bölümümüze yatay geçiş, DGS veya af yoluyla kayıt yaptıran öğrencilerin daha önce başarılı oldukları yükseköğretim derslerine istinaden ilettikleri muafiyet ve intibak talepleri görüşüldü. Bölüm Muafiyet ve İntibak Komisyonu'nun hazırlamış olduğu ekli inceleme raporu ve karşılaştırma çizelgesi (Ek-2) incelendi. İlgili öğrencilerin belirtilen derslerden muaf tutulmalarına ve intibak ettirildikleri yarıyılın onaylanmasına karar verildi.",
      },
      {
        departmentId: cengDept.id,
        category: DecisionCategory.STAJ_ISLETME,
        name: "Staj ve İşletmede Mesleki Eğitim Şablonu",
        legalBasis: "S.Ü. Staj ve İşletmede Mesleki Eğitim Yönergeleri ile 3308 Sayılı Mesleki Eğitim Kanunu",
        templateText: "Bölümümüz öğrencilerinin 2025-2026 Eğitim-Öğretim Yılı Yaz Döneminde kamu kurumlarında ve özel sektör işletmelerinde yapmış oldukları zorunlu endüstriyel staj çalışmalarına ait staj defterleri ve komisyon değerlendirme tutanakları görüşüldü. Ekli listede (Ek-3) isimleri, öğrenci numaraları ve staj yaptıkları kurumlar belirtilen öğrencilerin staj kabul/ret gün sayılarının onaylanmasına karar verildi.",
      },
      {
        departmentId: cengDept.id,
        category: DecisionCategory.SINAV_MAZERET,
        name: "Sınav Programı ve Mazeret Sınavları Şablonu",
        legalBasis: "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği (Sınavlar ve Değerlendirme Esasları)",
        templateText: "Bölümümüzün 2026-2027 Güz Yarıyılı Ara Sınav (Vize) takvimi ile sağlık ve haklı mazeretleri sebebiyle ara sınavlara katılamayarak süresi içinde resmi rapor ve mazeret dilekçesi ibraz eden öğrencilerin durumları görüşüldü. Sınav takviminin uygun olduğuna ve mazeretleri kabul edilen ekli listedeki (Ek-4) öğrencilere mazeret sınav hakkı tanınmasına karar verildi.",
      },
      {
        departmentId: cengDept.id,
        category: DecisionCategory.KOMISYON_SECIMI,
        name: "Komisyon ve Koordinatörlük Seçimi Şablonu",
        legalBasis: "Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 ve MÜDEK Akreditasyon Yönergesi",
        templateText: "Bölümümüz bünyesinde eğitim-öğretim, staj, intibak, akreditasyon ve kalite geliştirme faaliyetlerini yürütmek üzere oluşturulan komisyonların görev süreleri ve üye dağılımları görüşüldü. Ekli listede (Ek-5) yer alan öğretim elemanlarının 3 (üç) yıl süreyle ilgili komisyonlarda görevlendirilmelerine karar verildi.",
      },
    ]
  });

  // =========================================================================
  // TOPLANTI 1 (TAMAMLANMIŞ, RESMİ MÜHÜRLÜ VE EBYS SEVK EDİLMİŞ TOPLANTI)
  // =========================================================================
  const meetingDate1 = new Date("2026-10-15T10:00:00Z");
  const seal1 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const ebysDocNo1 = "E-64134190-302.01.05-185420";
  const ebysVerify1 = "ebys-su-792841-2026";
  const ebysBarcode1 = "SU641341903020105185420";

  const meeting1 = await prisma.meeting.create({
    data: {
      departmentId: cengDept.id,
      meetingNumber: 1,
      academicYear: "2026-2027",
      term: "Güz",
      title: "2026-2027 Eğitim-Öğretim Yılı Güz Yarıyılı 1. Olağan Bölüm Kurulu Toplantısı",
      scheduledDate: meetingDate1,
      location: "Teknoloji Fakültesi Bölüm Başkanlığı Toplantı Salonu (Bina A, K:3, No:302)",
      status: MeetingStatus.EBYS_SEVK_EDILDI,
      currentStep: 6,
      quorumRequired: 4,
      totalEligibleMembers: 7,
      actualAttendeesCount: 7,
      isQuorumMet: true,
      isAttendanceLocked: true,
      attendanceLockedAt: new Date("2026-10-15T10:05:00Z"),
      isSealed: true,
      sha256Seal: seal1,
      contentDigest: "c79b29e06180b2a8d5e894176d654f5c94d930f3531b463b7194f1c97a8296a2",
      callDocumentNo: "E-64134190-302.01.05-184910",
      callSentAt: new Date("2026-10-10T09:00:00Z"),
      ebysDocumentNo: ebysDocNo1,
      ebysDocumentDate: new Date("2026-10-15T14:30:00Z"),
      ebysVerificationCode: ebysVerify1,
      ebysBarcode: ebysBarcode1,
      finalMinuteText: `T.C. SELÇUK ÜNİVERSİTESİ TEKNOLOJİ FAKÜLTESİ BİLGİSAYAR MÜHENDİSLİĞİ BÖLÜM KURULU KARAR TUTANAĞI\nToplantı No: 2026/01\nTarih: 15 Ekim 2026\nKararlar oybirliği ile alınmış ve tüm üyelerce e-imzalanmıştır.`,
      upperLetterText: `T.C. SELÇUK ÜNİVERSİTESİ TEKNOLOJİ FAKÜLTESİ DEKANLIĞINA\nBölüm kurulumuzun 2026/01 sayılı kararları ekte sunulmuştur. Arz ederim.\nProf. Dr. Şakir TAŞDEMİR - Bölüm Başkanı`,
      signedAt: new Date("2026-10-15T12:30:00Z"),
    }
  });

  // Hazirun Kayıtları (Meeting 1 için 7 asıl üye ve misafirler)
  for (let i = 0; i < membersCeng.length; i++) {
    const mem = membersCeng[i];
    const isBoard = i < 7;
    let titleStr = "Öğretim Elemanı (Kurul Dışı)";
    if (i === 0) titleStr = "Bölüm Başkanı (Kurul Başkanı)";
    else if (i === 1 || i === 2) titleStr = "Bölüm Başkan Yardımcısı";
    else if (i >= 3 && i <= 6) titleStr = "Anabilim Dalı Başkanı";
    else if (i === 9) titleStr = "Bölüm Sekreteri / Raportör";

    await prisma.meetingAttendance.create({
      data: {
        meetingId: meeting1.id,
        memberId: mem.id,
        isBoardMember: isBoard,
        boardTitle: titleStr,
        status: AttendanceStatus.KATILDI,
        signedAt: new Date("2026-10-15T10:00:00Z"),
      }
    });

    if (isBoard) {
      await prisma.decisionSignature.create({
        data: {
          meetingId: meeting1.id,
          memberId: mem.id,
          prepToken: "prep-token-" + (i + 1),
          contentDigest: "c79b29e06180b2a8d5e894176d654f5c94d930f3531b463b7194f1c97a8296a2",
          signatureDigest: crypto.createHash("sha256").update(mem.email + meeting1.id).digest("hex"),
          status: "COMPLETED",
          signedAt: new Date("2026-10-15T11:30:00Z"),
          ipAddress: "192.168.1.10" + i,
        }
      });
    }
  }

  // Kararlar (Meeting 1: 5 Karar)
  const items1Data = [
    {
      num: 1,
      decNo: "2026/01-01",
      cat: DecisionCategory.DERS_GOREVLENDIRME,
      title: "2026-2027 Güz Yarıyılı Ders Görevlendirmeleri ve Haftalık Ders Dağılımı",
      law: "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği (Madde 8)",
      text: "Bölümümüzün 2026-2027 Güz Yarıyılı lisans ders görevlendirmelerinin ekli çizelgedeki şekliyle kabulüne ve Fakülte Yönetim Kuruluna arzına oybirliğiyle karar verildi.",
      res: DecisionResult.KABUL_OYBIRLIGI,
      favor: 7, against: 0,
    },
    {
      num: 2,
      decNo: "2026/01-02",
      cat: DecisionCategory.MUAFIYET_INTIBAK,
      title: "Yatay Geçiş ve DGS Yapan Öğrencilerin Ders Muafiyeti ve İntibak Talepleri",
      law: "Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 10/5 & 15",
      text: "233311021 numaralı öğrenci Yunus Emre Sert'in muafiyet ve intibak dosyasının incelenmesi neticesinde ekli tablodaki intibakın uygun olduğuna oybirliğiyle karar verildi.",
      res: DecisionResult.KABUL_OYBIRLIGI,
      favor: 7, against: 0,
    },
    {
      num: 3,
      decNo: "2026/01-03",
      cat: DecisionCategory.STAJ_ISLETME,
      title: "2025-2026 Yaz Dönemi Zorunlu Endüstriyel Staj Değerlendirme Sonuçları",
      law: "S.Ü. Staj ve İşletmede Mesleki Eğitim Yönergeleri",
      text: "Staj Komisyonu tarafından incelenen 34 öğrencinin staj defterlerinin onaylanmasına oybirliğiyle karar verildi.",
      res: DecisionResult.KABUL_OYBIRLIGI,
      favor: 7, against: 0,
    },
    {
      num: 4,
      decNo: "2026/01-04",
      cat: DecisionCategory.SINAV_MAZERET,
      title: "2026-2027 Güz Yarıyılı Ara Sınav Programı ve Sağlık Mazeretleri",
      law: "S.Ü. Ön Lisans ve Lisans Eğitim-Öğretim ve Sınav Yönetmeliği",
      text: "Ara sınav programının onaylanmasına ve sağlık raporu sunan 4 öğrenciye mazeret sınav hakkı tanınmasına oybirliğiyle karar verildi.",
      res: DecisionResult.KABUL_OYBIRLIGI,
      favor: 7, against: 0,
    },
    {
      num: 5,
      decNo: "2026/01-05",
      cat: DecisionCategory.KOMISYON_SECIMI,
      title: "Bölüm Kalite, Akreditasyon (MÜDEK) ve Bologna Komisyonu Seçimi",
      law: "Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 15)",
      text: "Bölüm Kalite ve Akreditasyon Komisyonu üyeliklerine ekli listede yer alan öğretim elemanlarının atanmasına oybirliğiyle karar verildi.",
      res: DecisionResult.KABUL_OYBIRLIGI,
      favor: 7, against: 0,
    },
  ];

  for (const item of items1Data) {
    await prisma.meetingItem.create({
      data: {
        meetingId: meeting1.id,
        itemNumber: item.num,
        decisionNumber: item.decNo,
        category: item.cat,
        title: item.title,
        legalBasis: item.law,
        decisionText: item.text,
        isAcceptedToAgenda: true,
        decisionResult: item.res,
        votesInFavor: item.favor,
        votesAgainst: item.against,
        votesAbstain: 0,
      }
    });
  }

  // Ek Dosyalar (Meeting 1 için gerçekçi ekler ve SHA-256 bütünlük özetleri)
  await prisma.attachment.createMany({
    data: [
      {
        meetingId: meeting1.id,
        fileName: "Ders_Dagitim_Cizelgesi_2026_Guz.pdf",
        originalName: "Ek-1_Ders_Dagitim_Cizelgesi.pdf",
        fileSize: 412580,
        mimeType: "application/pdf",
        sha256Hash: "8f481c5f3b392476b7db0a04918e6c738e4df5e27a136bfb1c1d8ea8f3b23e80",
        fileUrl: "/uploads/Ek-1_Ders_Dagitim_Cizelgesi.pdf",
      },
      {
        meetingId: meeting1.id,
        fileName: "Muafiyet_Intibak_Karsilastirma_Tablosu.xlsx",
        originalName: "Ek-2_Muafiyet_Intibak_Tablosu.xlsx",
        fileSize: 184320,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        sha256Hash: "3a91bf293b6e82847c1341c89f41de18f8e028bfa0d2358bc753f58a74e92a11",
        fileUrl: "/uploads/Ek-2_Muafiyet_Intibak_Tablosu.xlsx",
      },
      {
        meetingId: meeting1.id,
        fileName: "Staj_Komisyon_Inceleme_Tutanagi.pdf",
        originalName: "Ek-3_Staj_Komisyon_Raporu.pdf",
        fileSize: 256190,
        mimeType: "application/pdf",
        sha256Hash: "9e1c28b3401fa5c98d667c2936270e517865231efb7189a8123498f7654321ab",
        fileUrl: "/uploads/Ek-3_Staj_Komisyon_Raporu.pdf",
      },
    ]
  });

  // =========================================================================
  // TOPLANTI 2 (MÜZAKERE VE OYLAMA AŞAMASINDAKİ TOPLANTI - ADIM 4 & 5 TESTİ)
  // =========================================================================
  const meetingDate2 = new Date("2026-10-24T14:00:00Z");
  const meeting2 = await prisma.meeting.create({
    data: {
      departmentId: cengDept.id,
      meetingNumber: 2,
      academicYear: "2026-2027",
      term: "Güz",
      title: "2026-2027 Eğitim-Öğretim Yılı Güz Yarıyılı 2. Olağan Bölüm Kurulu Toplantısı",
      scheduledDate: meetingDate2,
      location: "Teknoloji Fakültesi Bölüm Başkanlığı Toplantı Salonu (Bina A, K:3, No:302)",
      status: MeetingStatus.MADDELER_GORUSULUYOR,
      currentStep: 4,
      quorumRequired: 4,
      totalEligibleMembers: 7,
      actualAttendeesCount: 6,
      isQuorumMet: true,
      callDocumentNo: "E-64134190-302.01.05-186100",
      callSentAt: new Date("2026-10-20T09:00:00Z"),
      isAttendanceLocked: true,
      attendanceLockedAt: new Date("2026-10-24T14:05:00Z"),
    }
  });

  // Hazirun (Meeting 2: 6 Katıldı, 1 İzinli Mazeretli)
  for (let i = 0; i < membersCeng.length; i++) {
    const mem = membersCeng[i];
    const isBoard = i < 7;
    const isExcused = i === 6; // Prof. Dr. Ahmet Ali Sertkaya mazeretli
    let titleStr = "Öğretim Elemanı (Kurul Dışı)";
    if (i === 0) titleStr = "Bölüm Başkanı (Kurul Başkanı)";
    else if (i === 1 || i === 2) titleStr = "Bölüm Başkan Yardımcısı";
    else if (i >= 3 && i <= 6) titleStr = "Anabilim Dalı Başkanı";

    await prisma.meetingAttendance.create({
      data: {
        meetingId: meeting2.id,
        memberId: mem.id,
        isBoardMember: isBoard,
        boardTitle: titleStr,
        status: isExcused ? AttendanceStatus.MAZERETLI : AttendanceStatus.KATILDI,
        excuseReason: isExcused ? "TÜBİTAK Proje İzleme Toplantısı Görevlendirmesi" : null,
      }
    });
  }

  // Kararlar (Meeting 2: 3 Madde - Biri kabul, biri oylamada, biri ret ve muhalefet şerhli)
  await prisma.meetingItem.create({
    data: {
      meetingId: meeting2.id,
      itemNumber: 1,
      decisionNumber: "2026/02-01",
      category: DecisionCategory.DERS_GOREVLENDIRME,
      title: "Yazılım Anabilim Dalı Yüksek Lisans Ek Ders Dağılım Teklifi",
      legalBasis: "S.Ü. Lisansüstü Eğitim-Öğretim ve Sınav Yönetmeliği",
      decisionText: "Yazılım Anabilim Dalı lisansüstü ders görevlendirmelerinin uygun olduğuna oyçokluğuyla karar verildi.",
      isAcceptedToAgenda: true,
      decisionResult: DecisionResult.KABUL_OYCOKLUGU,
      votesInFavor: 5,
      votesAgainst: 1,
      votesAbstain: 0,
      dissentingOpinion: "Prof. Dr. Adem Alpaslan ALTUN: Laboratuvar ders saatlerinin yeniden planlanması gerektiği kanaatindeyim.",
    }
  });

  await prisma.meetingItem.create({
    data: {
      meetingId: meeting2.id,
      itemNumber: 2,
      decisionNumber: "2026/02-02",
      category: DecisionCategory.STAJ_ISLETME,
      title: "Güz Dönemi İsteğe Bağlı Staj Başvurularının İncelenmesi",
      legalBasis: "S.Ü. Staj ve İşletmede Mesleki Eğitim Yönergeleri",
      decisionText: "Öğrencilerin isteğe bağlı staj sigorta bildirimlerinin onaylanması görüşülmektedir.",
      isAcceptedToAgenda: true,
      decisionResult: DecisionResult.BEKLIYOR,
      votesInFavor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
    }
  });

  await prisma.meetingItem.create({
    data: {
      meetingId: meeting2.id,
      itemNumber: 3,
      decisionNumber: "2026/02-03",
      category: DecisionCategory.MUAFIYET_INTIBAK,
      title: "Özel Öğrenci Statüsünde Alınan Derslerin İntibak Talebi",
      legalBasis: "Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 10/5 & 15",
      decisionText: "Kredi ve AKTS uyuşmazlığı gerekçesiyle intibak talebinin reddine oyçokluğuyla karar verildi.",
      isAcceptedToAgenda: true,
      decisionResult: DecisionResult.REDDEDILDI,
      votesInFavor: 2,
      votesAgainst: 4,
      votesAbstain: 0,
      dissentingOpinion: "Doç. Dr. Tahir SAĞ: Eşdeğer kabul edilen içeriklerin komisyonca tekrar incelenmesi gerektiğini düşünmekteyim.",
    }
  });

  // =========================================================================
  // TOPLANTI 3 (SALT ÇOĞUNLUK SAĞLANAMADIĞI İÇİN ERTELENEN TOPLANTI - ADIM 2 TESTİ)
  // =========================================================================
  const meetingDate3 = new Date("2026-10-05T10:00:00Z");
  const meeting3 = await prisma.meeting.create({
    data: {
      departmentId: cengDept.id,
      meetingNumber: 3,
      academicYear: "2026-2027",
      term: "Güz",
      title: "2026-2027 Eğitim-Öğretim Yılı Güz Yarıyılı Olağanüstü Bölüm Kurulu Toplantısı",
      scheduledDate: meetingDate3,
      location: "Teknoloji Fakültesi Bölüm Başkanlığı Toplantı Salonu",
      status: MeetingStatus.ERTELENDI,
      currentStep: 2,
      quorumRequired: 4,
      totalEligibleMembers: 7,
      actualAttendeesCount: 3, // 7 üyeden yalnızca 3 katılım -> Salt çoğunluk sağlanamadı!
      isQuorumMet: false,
      postponedReason: "Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15 uyarınca kurul üye tamsayısının salt çoğunluğu (en az 4 üye) sağlanamadığından oturum açılamamıştır.",
      postponedToDate: new Date("2026-10-12T10:00:00Z"),
      postponedMinuteDoc: `T.C. SELÇUK ÜNİVERSİTESİ TEKNOLOJİ FAKÜLTESİ\nBÖLÜM KURULU TOPLANTI YETERSİZLİĞİ VE ERTELEME TUTANAĞI\n\nToplantı Tarihi: 05 Ekim 2026 Saat: 10:00\nBölüm Kurulu üye tamsayısı 7 olup, toplantı saatinde hazır bulunan üye sayısı 3 olarak tespit edilmiştir. Salt çoğunluk (en az 4 üye) sağlanamadığından oturum açılamamış ve toplantı 12 Ekim 2026 tarihine ertelenmiştir.`,
      callDocumentNo: "E-64134190-302.01.05-183400",
    }
  });

  // Hazirun (Meeting 3: 3 Katıldı, 4 Mazeretli/Katılmadı)
  for (let i = 0; i < membersCeng.length; i++) {
    const mem = membersCeng[i];
    const isBoard = i < 7;
    const isPresent = i < 3;
    await prisma.meetingAttendance.create({
      data: {
        meetingId: meeting3.id,
        memberId: mem.id,
        isBoardMember: isBoard,
        boardTitle: isBoard ? (i === 0 ? "Bölüm Başkanı" : "Kurul Üyesi") : "Kurul Dışı",
        status: isPresent ? AttendanceStatus.KATILDI : AttendanceStatus.MAZERETLI,
        excuseReason: isPresent ? null : "Resmi Görevlendirme / Kongre Katılımı",
      }
    });
  }

  // =========================================================================
  // TOPLANTI 4 (YENİ ÇAĞRI YAPILMIŞ TOPLANTI - ADIM 1 AŞAMASINDA)
  // =========================================================================
  const meetingDate4 = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const meeting4 = await prisma.meeting.create({
    data: {
      departmentId: cengDept.id,
      meetingNumber: 4,
      academicYear: "2026-2027",
      term: "Güz",
      title: "2026-2027 Eğitim-Öğretim Yılı Güz Yarıyılı 3. Olağan Bölüm Kurulu Toplantısı",
      scheduledDate: meetingDate4,
      location: "Teknoloji Fakültesi Bölüm Başkanlığı Toplantı Salonu (Bina A, K:3, No:302)",
      status: MeetingStatus.CAGRI_YAPILDI,
      currentStep: 1,
      quorumRequired: 4,
      totalEligibleMembers: 7,
      actualAttendeesCount: 7,
      isQuorumMet: true,
      callDocumentNo: "E-64134190-302.01.05-187500",
      callSentAt: new Date(),
      callDocumentText: `T.C. SELÇUK ÜNİVERSİTESİ TEKNOLOJİ FAKÜLTESİ BİLGİSAYAR MÜHENDİSLİĞİ BÖLÜM BAŞKANLIĞI\nSayı: E-64134190-302.01.05-187500\nKonu: Bölüm Kurulu Toplantı Çağrısı ve Gündemi\n\nBölüm Kurulu üyelerimizin yukarıda belirtilen gün ve saatte toplantıya teşriflerini rica ederim.\nProf. Dr. Şakir TAŞDEMİR - Bölüm Başkanı`,
    }
  });

  for (let i = 0; i < membersCeng.length; i++) {
    const mem = membersCeng[i];
    await prisma.meetingAttendance.create({
      data: {
        meetingId: meeting4.id,
        memberId: mem.id,
        isBoardMember: i < 7,
        boardTitle: i === 0 ? "Bölüm Başkanı" : (i <= 2 ? "Bölüm Başkan Yardımcısı" : (i <= 6 ? "ABD Başkanı" : "Öğr. Elemanı")),
        status: AttendanceStatus.KATILDI,
      }
    });
  }

  // =========================================================================
  // GÜNDEM VE TALEP HAVUZU (RAPOR GÖREV 3.1)
  // =========================================================================
  await prisma.talepGundemHavuzu.createMany({
    data: [
      {
        bolumId: cengDept.id,
        kategori: KararKategorisi.DERS_GOREVLENDIRME,
        baslik: "Yazılım Anabilim Dalı 2026-2027 Bahar Yarıyılı Ön Ders Dağılım Teklifi",
        talepTuru: "ABD Başkanlığı Yazısı",
        basvuranAd: "Prof. Dr. Fatih BAŞÇİFTÇİ (Yazılım ABD Bşk.)",
        aciklama: "Bahar döneminde açılması planlanan lisans ve yüksek lisans derslerinin hoca görevlendirmeleri.",
        oneriKararMetni: "Yazılım ABD ders dağılım teklifinin uygunluğuna ve Fakülte Yönetim Kuruluna arzına karar verildi.",
        ekBelgeAdi: "Yazilim_ABD_Bahar_Teklifi.pdf",
        durum: TalepDurumu.BEKLIYOR,
      },
      {
        bolumId: cengDept.id,
        kategori: KararKategorisi.MUAFIYET_INTIBAK,
        baslik: "Farabi / Erasmus Değişim Öğrencisi Ders Tanınma Talebi",
        talepTuru: "Öğrenci Dilekçesi",
        basvuranAd: "Ayşe Nur ŞAHİN (223311045)",
        basvuranNo: "223311045",
        aciklama: "Polonya Politechnika Poznanska'da alınan derslerin transkript ve ders içerikleri intibak başvurusu.",
        oneriKararMetni: "Erasmus koordinatörlüğü görüşü uyarınca ilgili derslerin eşdeğerliğine karar verildi.",
        ekBelgeAdi: "Erasmus_Transkript_ve_Learning_Agreement.pdf",
        durum: TalepDurumu.BEKLIYOR,
      },
      {
        bolumId: cengDept.id,
        kategori: KararKategorisi.STAJ_ISLETME,
        baslik: "Savunma Sanayii Başkanlığı (SSB) Vizyoner Genç Stajı Onayı",
        talepTuru: "Komisyon Raporu",
        basvuranAd: "Staj ve İME Komisyonu",
        aciklama: "ASELSAN ve HAVELSAN bünyesinde uzun dönem aday mühendislik stajı yapacak 12 öğrencinin protokol onayı.",
        oneriKararMetni: "Protokol kapsamındaki aday mühendislik stajlarının zorunlu staja sayılmasına karar verildi.",
        ekBelgeAdi: "SSB_Staj_Protokol_Listesi.xlsx",
        durum: TalepDurumu.BEKLIYOR,
      },
      {
        bolumId: cengDept.id,
        kategori: KararKategorisi.KOMISYON_SECIMI,
        baslik: "Bölüm Mezuniyet ve Kariyer Takip Komisyonu Oluşturulması",
        talepTuru: "Bölüm Başkanlığı Teklifi",
        basvuranAd: "Doç. Dr. Tahir SAĞ (Başkan Yardımcısı)",
        aciklama: "MÜDEK akreditasyonu mezun izleme ölçütlerini yürütmek üzere 3 yıllık komisyon kurulması.",
        oneriKararMetni: "Mezuniyet ve Kariyer Komisyonunun ekli üyelerden teşekkül ettirilmesine karar verildi.",
        ekBelgeAdi: "Mezuniyet_Komisyonu_Gerekce_Raporu.docx",
        durum: TalepDurumu.BEKLIYOR,
      },
    ]
  });

  // =========================================================================
  // İŞLEM KAYITLARI (AUDIT LOGS - RAPOR ŞEKİL 4.15 & ÇİZELGE 3.2)
  // =========================================================================
  await prisma.auditLog.createMany({
    data: [
      {
        departmentId: cengDept.id,
        userName: "Prof. Dr. Şakir TAŞDEMİR",
        userEmail: "stasdemir@selcuk.edu.tr",
        action: "TOPLANTI_OLUSTURULDU",
        level: "INFO",
        details: "Toplantı #2026/01 oluşturuldu ve resmi çağrı tebliği yapıldı. EBYS Çağrı No: E-64134190-302.01.05-184910",
        ipAddress: "192.168.1.10",
        createdAt: new Date("2026-10-10T09:00:00Z"),
      },
      {
        departmentId: cengDept.id,
        userName: "Zeynep GÜNEŞ (Sekreter)",
        userEmail: "ceng.sekreterlik@selcuk.edu.tr",
        action: "HAZIRUN_GUNCELENDI",
        level: "INFO",
        details: "Toplantı #2026/01 katılım yoklaması tamamlandı (7/7 hazır). Salt çoğunluk sağlandı.",
        ipAddress: "192.168.1.15",
        createdAt: new Date("2026-10-15T10:05:00Z"),
      },
      {
        departmentId: cengDept.id,
        userName: "Prof. Dr. Şakir TAŞDEMİR",
        userEmail: "stasdemir@selcuk.edu.tr",
        action: "GUNDEM_OYLANDI",
        level: "INFO",
        details: "Gündem maddelerinin görüşülmeye kabulü oylandı. 5 madde oybirliğiyle kabul edildi.",
        ipAddress: "192.168.1.10",
        createdAt: new Date("2026-10-15T10:15:00Z"),
      },
      {
        departmentId: cengDept.id,
        userName: "Prof. Dr. Fatih BAŞÇİFTÇİ",
        userEmail: "fatih.basciftci@selcuk.edu.tr",
        action: "E_IMZA_TAMAMLANDI",
        level: "INFO",
        details: "Toplantı #2026/01 tutanağı Bilgisayar Yazılımı ABD Başkanı tarafından güvenli e-imza ile imzalandı.",
        ipAddress: "192.168.1.13",
        createdAt: new Date("2026-10-15T11:45:00Z"),
      },
      {
        departmentId: cengDept.id,
        userName: "Sistem Kripto Motoru",
        action: "BELGE_MUHURLENDI",
        level: "SECURITY",
        details: "Toplantı #2026/01 tüm kurul üyelerince imzalandı ve SHA-256 kriptografik mühür ile kilitlendi (e3b0c44298fc...).",
        ipAddress: "127.0.0.1",
        createdAt: new Date("2026-10-15T12:30:00Z"),
      },
      {
        departmentId: cengDept.id,
        userName: "Prof. Dr. Şakir TAŞDEMİR",
        userEmail: "stasdemir@selcuk.edu.tr",
        action: "EBYS_SEVK_TAMAMLANDI",
        level: "SECURITY",
        details: "Resmi karar tutanağı ve üst yazı Teknoloji Fakültesi Dekanlığına sevk edildi. Evrak No: E-64134190-302.01.05-185420",
        ipAddress: "192.168.1.10",
        createdAt: new Date("2026-10-15T14:30:00Z"),
      },
      {
        departmentId: cengDept.id,
        userName: "Zeynep GÜNEŞ (Sekreter)",
        action: "HAZIRUN_YETERSIZLIK_KAYDI",
        level: "WARN",
        details: "Toplantı #2026/03 salt çoğunluk sağlanamadığı için (3/7 üye hazır) ertelendi ve resmi Erteleme Tutanağı tanzim edildi.",
        ipAddress: "192.168.1.15",
        createdAt: new Date("2026-10-05T10:10:00Z"),
      },
    ]
  });

  // =========================================================================
  // KURUL DUYURULARI (RAPOR ŞEKİL 4.17 & BÖLÜM 3.18)
  // =========================================================================
  await prisma.announcement.createMany({
    data: [
      {
        departmentId: cengDept.id,
        title: "2026-2027 Güz Yarıyılı 3. Olağan Bölüm Kurulu Toplantı Çağrısı",
        content: "Bölümümüz Bölüm Kurulu, 2026-2027 Eğitim-Öğretim Yılı Güz Yarıyılı 3. olağan toplantısını yapmak üzere yukarıda belirtilen tarihte Fakülte Başkanlık Salonunda toplanacaktır. Kurul üyelerimizin toplantıya katılımları önemle rica olunur.",
        version: 1,
        isPublished: true,
        publishedAt: new Date(),
        authorName: "Prof. Dr. Şakir TAŞDEMİR (Bölüm Başkanı)",
      },
      {
        departmentId: cengDept.id,
        title: "MÜDEK Akreditasyon Öz Değerlendirme Raporu Görüşmesi",
        content: "Bölüm Kalite ve Akreditasyon Komisyonumuzun hazırladığı MÜDEK Öz Değerlendirme Raporu kurul üyelerinin incelemesine açılmıştır. Öneri ve katkıların sekreterliğe iletilmesi rica olunur.",
        version: 2,
        isPublished: true,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        authorName: "Doç. Dr. Tahir SAĞ (Bölüm Başkan Yrd.)",
      },
    ]
  });

  console.log("✅ Tohumlama işlemi tamamlandı!");
  console.log(`- 4 Kurul tanımlandı (CENG, CENG-ABD, BTM-ABD, BCT)`);
  console.log(`- 4 Örnek Toplantı oluşturuldu (Mühürlü, Müzakerede, Ertelenmiş, Çağrı Yapılmış)`);
  console.log(`- 5 Resmi Karar Şablonu, Ek Dosyalar, İşlem Kayıtları ve Duyurular yüklendi.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed Hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
