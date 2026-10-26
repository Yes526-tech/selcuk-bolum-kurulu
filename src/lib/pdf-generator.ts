import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export interface PDFExportData {
  facultyName: string;
  departmentName: string;
  departmentType: string;
  ebysUnitCode: string;
  meetingNumber: number;
  academicYear: string;
  term: string;
  title: string;
  scheduledDate: Date;
  location: string;
  status: string;
  ebysDocumentNo?: string;
  ebysVerificationCode?: string;
  headTitle: string;
  headName: string;
  quorumInfo: {
    total: number;
    quorum: number;
    actual: number;
    isMet: boolean;
  };
  items: Array<{
    itemNumber: number;
    decisionNumber?: string;
    title: string;
    legalBasis: string;
    decisionText: string;
    decisionResult: string;
    votesInFavor: number;
    votesAgainst: number;
    dissentingOpinion?: string;
  }>;
  attendances: Array<{
    title: string;
    name: string;
    boardTitle: string;
    isBoardMember: boolean;
    status: string;
    excuse?: string;
  }>;
}

// Türkçe karakterleri Helvetica fontuyla uyumlu hale getirmek için ASCII/Latin1 transkripsiyon fonksiyonu
function sanitizeForPdf(text: string): string {
  if (!text) return "";
  const map: Record<string, string> = {
    "ı": "i", "İ": "I",
    "ş": "s", "Ş": "S",
    "ğ": "g", "Ğ": "G",
    "ü": "u", "Ü": "U",
    "ö": "o", "Ö": "O",
    "ç": "c", "Ç": "C"
  };
  return text.replace(/[ıİşŞğĞüÜöÖçÇ]/g, (m) => map[m] || m);
}

export async function generateMeetingMinutePdf(data: PDFExportData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 boyutları (points)
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Renk tanımları
  const colorSelcukBlue = rgb(10 / 255, 37 / 255, 64 / 255);
  const colorDark = rgb(0.1, 0.1, 0.1);
  const colorGray = rgb(0.4, 0.4, 0.4);
  const colorBorder = rgb(0.8, 0.8, 0.8);
  const colorAccent = rgb(0 / 255, 168 / 255, 150 / 255);

  let y = height - 40;

  // Üst Kenar Çizgisi (Selçuk Üniversitesi Kurumsal Şerit)
  page.drawRectangle({
    x: 35,
    y: height - 12,
    width: width - 70,
    height: 4,
    color: colorSelcukBlue,
  });

  // EBYS ve Doğrulama Karekodu Üretimi
  const verifyCode = data.ebysVerificationCode || `ebys-su-${Date.now().toString().slice(-6)}`;
  const qrUrl = `https://ebys.selcuk.edu.tr/dogrulama?kod=${verifyCode}`;
  let qrImageEmbed = null;
  try {
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 120, margin: 1 });
    const qrPngBase64 = qrDataUrl.split(",")[1];
    const qrPngBytes = Buffer.from(qrPngBase64, "base64");
    qrImageEmbed = await pdfDoc.embedPng(qrPngBytes);
  } catch (err) {
    console.error("QR kod üretilemedi:", err);
  }

  // Header / Antet
  const headerTexts = [
    "T.C.",
    "SELCUK UNIVERSITESI REKTORLUGU",
    sanitizeForPdf(data.facultyName.toUpperCase()),
    `${sanitizeForPdf(data.departmentName.toUpperCase())} BASKANLIGI`,
    "BOLUM KURULU KARAR TUTANAGI"
  ];

  for (let i = 0; i < headerTexts.length; i++) {
    const text = headerTexts[i];
    const isMainTitle = i === headerTexts.length - 1;
    const font = isMainTitle ? fontBold : (i === 1 ? fontBold : fontRegular);
    const size = isMainTitle ? 13 : 10;
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: y,
      size: size,
      font: font,
      color: isMainTitle ? colorSelcukBlue : colorDark,
    });
    y -= isMainTitle ? 20 : 13;
  }

  // Üst Sağ Bilgi Alanı: EBYS Evrak No, Tarih, QR Kod
  if (qrImageEmbed) {
    page.drawImage(qrImageEmbed, {
      x: width - 95,
      y: height - 105,
      width: 55,
      height: 55,
    });
  }

  const evrakNoText = sanitizeForPdf(`EBYS No: ${data.ebysDocumentNo || "E-64134190-302.01-185420"}`);
  page.drawText(evrakNoText, {
    x: 40,
    y: y + 5,
    size: 8.5,
    font: fontRegular,
    color: colorGray,
  });

  const dateText = sanitizeForPdf(`Tarih: ${new Intl.DateTimeFormat("tr-TR").format(data.scheduledDate)}`);
  page.drawText(dateText, {
    x: 40,
    y: y - 7,
    size: 8.5,
    font: fontRegular,
    color: colorGray,
  });

  const codeText = sanitizeForPdf(`Dogrulama Kodu: ${verifyCode}`);
  page.drawText(codeText, {
    x: width - 170,
    y: height - 115,
    size: 7.5,
    font: fontRegular,
    color: colorGray,
  });

  y -= 25;

  // Çift Çizgi Ayırıcı
  page.drawLine({
    start: { x: 35, y },
    end: { x: width - 35, y },
    thickness: 1,
    color: colorSelcukBlue,
  });
  y -= 15;

  // Toplantı Meta Bilgi Kutusu (Table)
  const metaBoxY = y;
  const metaBoxHeight = 48;
  page.drawRectangle({
    x: 35,
    y: metaBoxY - metaBoxHeight,
    width: width - 70,
    height: metaBoxHeight,
    color: rgb(0.97, 0.98, 0.99),
    borderColor: colorBorder,
    borderWidth: 0.8,
  });

  const meetingNo = `${data.academicYear}/${data.meetingNumber < 10 ? "0" + data.meetingNumber : data.meetingNumber}`;
  const metaLines = [
    [
      `Toplanti No: ${meetingNo}`,
      `Yariyil: ${sanitizeForPdf(data.term)} (${data.academicYear})`,
      `Uye Tamsayisi: ${data.quorumInfo.total}`
    ],
    [
      `Toplanti Yeri: ${sanitizeForPdf(data.location).slice(0, 35)}`,
      `Salt Cogunluk Esigi: ${data.quorumInfo.quorum}`,
      `Hazir Bulunan Uye: ${data.quorumInfo.actual} (${data.quorumInfo.isMet ? "Cogunluk Saglandi" : "Yetersiz"})`
    ]
  ];

  let currentMetaY = metaBoxY - 18;
  for (const row of metaLines) {
    page.drawText(row[0], { x: 45, y: currentMetaY, size: 8.5, font: fontBold, color: colorDark });
    page.drawText(row[1], { x: 220, y: currentMetaY, size: 8.5, font: fontRegular, color: colorDark });
    page.drawText(row[2], { x: 400, y: currentMetaY, size: 8.5, font: fontRegular, color: colorDark });
    currentMetaY -= 16;
  }

  y = metaBoxY - metaBoxHeight - 20;

  // Açıklama / Mevzuat Girişi
  const introText = sanitizeForPdf(
    `Universitelerde Akademik Teskilat Yonetmeligi'nin 15. maddesi ve Selcuk Universitesi Bolum Kurulu Sureci Is Akisi hukumleri uyarinca; Bolum Baskani ${data.headTitle} ${data.headName} baskanliginda Kurul uyelerinin salt cogunlugunun istiraki ile toplanmis ve gundem maddeleri muzakere edilerek asagidaki kararlar alinmistir:`
  );

  // Metin satır bölme
  function wrapText(text: string, maxChars: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const w of words) {
      if ((currentLine + " " + w).trim().length > maxChars) {
        if (currentLine) lines.push(currentLine.trim());
        currentLine = w;
      } else {
        currentLine = currentLine ? currentLine + " " + w : w;
      }
    }
    if (currentLine) lines.push(currentLine.trim());
    return lines;
  }

  const introLines = wrapText(introText, 85);
  for (const line of introLines) {
    page.drawText(line, { x: 40, y, size: 8.5, font: fontRegular, color: colorDark });
    y -= 12;
  }
  y -= 8;

  // Kararların Yazdırılması
  for (const item of data.items) {
    // Sayfa sınırı kontrolü
    if (y < 160) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = height - 50;
    }

    const decisionNo = item.decisionNumber || `${meetingNo}-${item.itemNumber < 10 ? "0" + item.itemNumber : item.itemNumber}`;
    const headerTitle = sanitizeForPdf(`KARAR NO: ${decisionNo} - ${item.title}`);

    // Karar Başlık Şeridi
    page.drawRectangle({
      x: 35,
      y: y - 18,
      width: width - 70,
      height: 20,
      color: rgb(0.92, 0.95, 0.98),
    });

    page.drawText(headerTitle, {
      x: 42,
      y: y - 13,
      size: 9.5,
      font: fontBold,
      color: colorSelcukBlue,
    });
    y -= 25;

    // Dayanak
    const legalText = sanitizeForPdf(`Hukuki Dayanak: ${item.legalBasis}`);
    page.drawText(legalText, {
      x: 42,
      y: y,
      size: 8,
      font: fontOblique,
      color: colorGray,
    });
    y -= 14;

    // Karar Metni
    const sanitizedDecision = sanitizeForPdf(item.decisionText);
    const bodyLines = wrapText(sanitizedDecision, 88);
    for (const line of bodyLines) {
      if (y < 120) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = height - 50;
      }
      page.drawText(line, { x: 42, y, size: 8.5, font: fontRegular, color: colorDark });
      y -= 12;
    }

    // Oylama Sonucu Rozeti
    const voteResultStr = item.decisionResult === "KABUL_OYBIRLIGI"
      ? "KABUL (OYBIRLIGIYLE)"
      : item.decisionResult === "KABUL_OYCOKLUGU"
      ? `KABUL (OYCOKLUGUYLA - ${item.votesInFavor} Kabul, ${item.votesAgainst} Ret)`
      : "REDDEDILDI";

    page.drawText(`Karar Durumu: ${voteResultStr}`, {
      x: 42,
      y: y - 2,
      size: 8,
      font: fontBold,
      color: item.decisionResult.startsWith("KABUL") ? rgb(0.05, 0.5, 0.2) : rgb(0.7, 0.1, 0.1),
    });

    if (item.dissentingOpinion) {
      y -= 12;
      const dissentLines = wrapText(sanitizeForPdf(`Muhalefet Serhi: ${item.dissentingOpinion}`), 85);
      for (const dline of dissentLines) {
        page.drawText(dline, { x: 42, y, size: 8, font: fontOblique, color: rgb(0.6, 0.2, 0.2) });
        y -= 11;
      }
    }

    y -= 18;
  }

  // İmza Blokları & Hazirun (Alt Kısım)
  if (y < 200) {
    page = pdfDoc.addPage([595.28, 841.89]);
    y = height - 60;
  }

  y -= 10;
  page.drawLine({
    start: { x: 35, y },
    end: { x: width - 35, y },
    thickness: 0.8,
    color: colorBorder,
  });
  y -= 18;

  page.drawText("KURUL UYELERI VE IMZA HAZIRUN CETVELI (Yonetmelik Madde 15)", {
    x: 40,
    y: y,
    size: 9.5,
    font: fontBold,
    color: colorSelcukBlue,
  });
  y -= 20;

  // İmza gridi (2'li kolon düzeni)
  const colWidth = (width - 80) / 2;
  const boardAttendees = data.attendances.filter(a => a.isBoardMember);

  for (let i = 0; i < boardAttendees.length; i += 2) {
    if (y < 80) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = height - 60;
    }

    const member1 = boardAttendees[i];
    const member2 = boardAttendees[i + 1];

    // Sol üye
    const m1Text = sanitizeForPdf(`${member1.title} ${member1.name}`);
    const m1Role = sanitizeForPdf(`(${member1.boardTitle})`);
    const m1Status = member1.status === "KATILDI" ? "[ E-IMZALI / KATILDI ]" : sanitizeForPdf(`[ MAZERETLI: ${member1.excuse || "Izınli"} ]`);

    page.drawText(m1Text, { x: 45, y, size: 8.5, font: fontBold, color: colorDark });
    page.drawText(m1Role, { x: 45, y: y - 11, size: 7.5, font: fontRegular, color: colorGray });
    page.drawText(m1Status, { x: 45, y: y - 22, size: 7.5, font: fontOblique, color: member1.status === "KATILDI" ? colorAccent : colorGray });

    // Sağ üye
    if (member2) {
      const m2Text = sanitizeForPdf(`${member2.title} ${member2.name}`);
      const m2Role = sanitizeForPdf(`(${member2.boardTitle})`);
      const m2Status = member2.status === "KATILDI" ? "[ E-IMZALI / KATILDI ]" : sanitizeForPdf(`[ MAZERETLI: ${member2.excuse || "Izınli"} ]`);

      page.drawText(m2Text, { x: 45 + colWidth, y, size: 8.5, font: fontBold, color: colorDark });
      page.drawText(m2Role, { x: 45 + colWidth, y: y - 11, size: 7.5, font: fontRegular, color: colorGray });
      page.drawText(m2Status, { x: 45 + colWidth, y: y - 22, size: 7.5, font: fontOblique, color: member2.status === "KATILDI" ? colorAccent : colorGray });
    }

    y -= 38;
  }

  // Alt Bilgi Notu (Footer)
  page.drawText(
    sanitizeForPdf("Bu belge Selcuk Universitesi Bolum Kurulu Sureci Otomasyonu ile EBYS mevzuatina uygun olarak elektronik tanzim edilmistir."),
    {
      x: 40,
      y: 20,
      size: 7,
      font: fontRegular,
      color: colorGray,
    }
  );

  return await pdfDoc.save();
}
