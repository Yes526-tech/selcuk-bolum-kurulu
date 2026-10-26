import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  HeadingLevel,
  Packer,
  Header,
  Footer,
  PageNumber
} from "docx";

export interface DocxMeetingData {
  facultyName: string;
  departmentName: string;
  academicYear: string;
  term: string;
  meetingNumber: number;
  scheduledDate: Date;
  location: string;
  ebysDocumentNo?: string;
  ebysUnitCode?: string;
  items: Array<{
    itemNumber: number;
    decisionNumber?: string;
    title: string;
    legalBasis: string;
    decisionText: string;
    decisionResult?: string;
    votesInFavor?: number;
    votesAgainst?: number;
    dissentingOpinion?: string;
    attachmentsData?: any;
  }>;
  attendances: Array<{
    isBoardMember: boolean;
    boardTitle: string;
    status: string;
    excuseReason?: string;
    member: {
      title: string;
      firstName: string;
      lastName: string;
      role: string;
      onLeave?: boolean;
    };
  }>;
  headTitle: string;
  headName: string;
}

const RANK_WEIGHTS: Record<string, number> = {
  "Prof. Dr.": 1,
  "Doç. Dr.": 2,
  "Dr. Öğr. Üyesi": 3,
  "Öğr. Gör. Dr.": 4,
  "Öğr. Gör.": 5,
  "Arş. Gör.": 6,
  "Sekreter": 7,
};

function sortByAcademicRank(a: any, b: any) {
  const rankA = RANK_WEIGHTS[a.member.title] || 10;
  const rankB = RANK_WEIGHTS[b.member.title] || 10;
  if (rankA !== rankB) return rankA - rankB;
  return a.member.lastName.localeCompare(b.member.lastName, "tr");
}

function boldPara(text: string, options: { alignment?: any; spacing?: any; size?: number; color?: string } = {}) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: options.size, color: options.color })],
    alignment: options.alignment,
    spacing: options.spacing
  });
}

/**
 * Resmi Bölüm Kurulu Karar Tutanağı (DOCX) Üretir
 */
export async function generateMinuteDocx(data: DocxMeetingData): Promise<Buffer> {
  const meetingNoStr = `${data.academicYear}/${String(data.meetingNumber).padStart(2, "0")}`;
  const dateStr = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date(data.scheduledDate));

  const boardAttendees = data.attendances.filter((a) => a.isBoardMember).sort(sortByAcademicRank);

  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                text: "T.C. SELÇUK ÜNİVERSİTESİ • BÖLÜM KURULU KARAR TUTANAĞI",
                alignment: AlignmentType.RIGHT,
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `Toplantı No: ${meetingNoStr}  |  Sayfa `, size: 18 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                  new TextRun({ text: " / ", size: 18 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
                ],
                alignment: AlignmentType.CENTER
              })
            ]
          })
        },
        children: [
          // Başlık
          new Paragraph({ text: "T.C.", alignment: AlignmentType.CENTER }),
          boldPara("SELÇUK ÜNİVERSİTESİ REKTÖRLÜĞÜ", { alignment: AlignmentType.CENTER }),
          boldPara(data.facultyName.toUpperCase(), { alignment: AlignmentType.CENTER }),
          boldPara(`${data.departmentName.toUpperCase()} BAŞKANLIĞI`, { alignment: AlignmentType.CENTER }),
          boldPara("BÖLÜM KURULU KARAR TUTANAĞI", { alignment: AlignmentType.CENTER, spacing: { before: 200, after: 300 } }),

          // Metadata Tablosu
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [boldPara("Toplantı Sayısı (No)")] }),
                  new TableCell({ children: [new Paragraph(meetingNoStr)] }),
                  new TableCell({ children: [boldPara("Toplantı Tarihi")] }),
                  new TableCell({ children: [new Paragraph(dateStr)] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [boldPara("Akademik Yıl / Dönem")] }),
                  new TableCell({ children: [new Paragraph(`${data.academicYear} / ${data.term}`)] }),
                  new TableCell({ children: [boldPara("Toplantı Yeri")] }),
                  new TableCell({ children: [new Paragraph(data.location)] }),
                ]
              })
            ]
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // Gündem Başlığı
          new Paragraph({
            text: "TOPLANTI GÜNDEMİ",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),

          // Gündem Maddeleri
          ...data.items.map((item, idx) =>
            new Paragraph({
              children: [
                new TextRun({ text: `${idx + 1}. `, bold: true }),
                new TextRun({ text: `${item.title} ` }),
                new TextRun({ text: `(${item.legalBasis})`, italics: true, color: "666666" })
              ],
              spacing: { after: 80 }
            })
          ),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // Kararlar Başlığı
          new Paragraph({
            text: "ALINAN KARARLAR",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),

          // Her bir Karar Paragrafı
          ...data.items.flatMap((item, idx) => {
            const paragraphs: (Paragraph | Table)[] = [
              new Paragraph({
                children: [
                  new TextRun({ text: `KARAR NO: ${item.decisionNumber || `${meetingNoStr}-${idx + 1}`} `, bold: true, size: 22, color: "0A2540" }),
                  new TextRun({ text: `[${item.title}]`, bold: true, size: 22 })
                ],
                spacing: { before: 250, after: 80 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Hukuki Dayanak: ", bold: true }),
                  new TextRun({ text: item.legalBasis, italics: true })
                ],
                spacing: { after: 80 }
              }),
              new Paragraph({
                text: item.decisionText,
                spacing: { after: 120 }
              })
            ];

            // Varsa Ek Tablosu
            if (item.attachmentsData && Array.isArray(item.attachmentsData.rows) && item.attachmentsData.rows.length > 0) {
              const columns: string[] = item.attachmentsData.columns || Object.keys(item.attachmentsData.rows[0]);
              paragraphs.push(
                new Paragraph({
                  children: [new TextRun({ text: `Ek-${idx + 1}: ${item.title} Çizelgesi`, bold: true, italics: true })],
                  spacing: { before: 100, after: 80 }
                }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: columns.map((col) =>
                        new TableCell({
                          children: [boldPara(col)]
                        })
                      )
                    }),
                    ...item.attachmentsData.rows.map((row: any) =>
                      new TableRow({
                        children: columns.map((col) =>
                          new TableCell({
                            children: [new Paragraph(String(row[col] ?? ""))]
                          })
                        )
                      })
                    )
                  ]
                })
              );
            }

            // Varsa Muhalefet Şerhi
            if (item.dissentingOpinion) {
              paragraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: "Muhalefet Şerhi: ", bold: true, color: "A00000" }),
                    new TextRun({ text: item.dissentingOpinion, italics: true, color: "A00000" })
                  ],
                  spacing: { before: 80, after: 80 }
                })
              );
            }

            return paragraphs;
          }),

          new Paragraph({ text: "", spacing: { after: 300 } }),

          // İmza Bloğu Başlığı
          new Paragraph({
            text: "TOPLANTIYA KATILAN ASIL KURUL ÜYELERİ (YÖNETMELİK MADDE 15)",
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 150 }
          }),

          // Unvan Sırasına Göre İmza Tablosu (2 Sütunlu)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: createSignatureRows(boardAttendees)
          })
        ]
      }
    ]
  });

  return await Packer.toBuffer(doc);
}

/**
 * Resmi EBYS Üst Yazısı (DOCX) Üretir
 */
export async function generateLetterDocx(data: DocxMeetingData): Promise<Buffer> {
  const meetingNoStr = `${data.academicYear}/${String(data.meetingNumber).padStart(2, "0")}`;
  const dateStr = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date(data.scheduledDate));
  const docNo = data.ebysDocumentNo || `E-64134190-${data.ebysUnitCode || "302.01.05"}-185420`;

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: "T.C.", alignment: AlignmentType.CENTER }),
          boldPara("SELÇUK ÜNİVERSİTESİ REKTÖRLÜĞÜ", { alignment: AlignmentType.CENTER }),
          boldPara(data.facultyName.toUpperCase(), { alignment: AlignmentType.CENTER }),
          boldPara(`${data.departmentName.toUpperCase()} BAŞKANLIĞI`, { alignment: AlignmentType.CENTER }),
          new Paragraph({ text: "", spacing: { after: 250 } }),

          new Paragraph({ text: `Sayı   : ${docNo}` }),
          new Paragraph({ text: `Konu   : Bölüm Kurulu Kararları (Toplantı No: ${meetingNoStr})` }),
          new Paragraph({ text: `Tarih  : ${dateStr}`, spacing: { after: 200 } }),

          boldPara(`${data.facultyName.toUpperCase()} DEKANLIĞINA / MÜDÜRLÜĞÜNE`, {
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 250 }
          }),

          new Paragraph({
            text: `Bölümümüz Bölüm Kurulu'nun ${dateStr} tarihinde gerçekleştirdiği ${meetingNoStr} sayılı olağan toplantısında görüşülerek karara bağlanan ${data.items.length} (adet) karar metni ve ekli cetvelleri ekte sunulmuştur.`,
            spacing: { after: 150 }
          }),

          new Paragraph({
            text: "Alınan kararların Fakülte/Yüksekokul Yönetim Kurulu'nda görüşülerek onaylanması hususunu tensiplerinize saygılarımla arz ederim.",
            spacing: { after: 350 }
          }),

          boldPara(`${data.headTitle} ${data.headName}`, { alignment: AlignmentType.RIGHT }),
          new Paragraph({
            text: "Bölüm Başkanı",
            alignment: AlignmentType.RIGHT,
            spacing: { after: 300 }
          }),

          boldPara("EKLER:", { spacing: { before: 200, after: 80 } }),
          new Paragraph({ text: `1- Bölüm Kurulu Karar Tutanağı (${meetingNoStr} Sayılı, ${data.items.length} Karar)` }),
          new Paragraph({ text: "2- Hazirun ve Toplantı Katılım Tutanağı" }),
          new Paragraph({ text: "3- Karar Ek Çizelgeleri (Ders Dağılımı, İntibak ve Staj Listeleri)" })
        ]
      }
    ]
  });

  return await Packer.toBuffer(doc);
}

/**
 * Resmi Toplantı Katılım Tutanağı (Hazirun Cetveli) DOCX Üretir
 */
export async function generateAttendanceDocx(data: DocxMeetingData): Promise<Buffer> {
  const meetingNoStr = `${data.academicYear}/${String(data.meetingNumber).padStart(2, "0")}`;
  const dateStr = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date(data.scheduledDate));

  const sortedAttendances = [...data.attendances].sort(sortByAcademicRank);

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: "T.C.", alignment: AlignmentType.CENTER }),
          boldPara("SELÇUK ÜNİVERSİTESİ REKTÖRLÜĞÜ", { alignment: AlignmentType.CENTER }),
          boldPara(data.facultyName.toUpperCase(), { alignment: AlignmentType.CENTER }),
          boldPara(`${data.departmentName.toUpperCase()} BAŞKANLIĞI`, { alignment: AlignmentType.CENTER }),
          boldPara("BÖLÜM KURULU TOPLANTI KATILIM VE İMZA CETVELİ (HAZİRUN)", {
            alignment: AlignmentType.CENTER,
            spacing: { before: 150, after: 200 }
          }),

          new Paragraph({ text: `Toplantı No: ${meetingNoStr}  |  Tarih: ${dateStr}  |  Yer: ${data.location}`, spacing: { after: 150 } }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [boldPara("Sıra")] }),
                  new TableCell({ children: [boldPara("Unvanı, Adı Soyadı")] }),
                  new TableCell({ children: [boldPara("Kurul Sıfatı (Md. 15)")] }),
                  new TableCell({ children: [boldPara("Katılım Durumu")] }),
                  new TableCell({ children: [boldPara("İmza / Mazeret")] }),
                ]
              }),
              ...sortedAttendances.map((att, idx) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(String(idx + 1))] }),
                    new TableCell({ children: [new Paragraph(`${att.member.title} ${att.member.firstName} ${att.member.lastName}`)] }),
                    new TableCell({ children: [new Paragraph(att.boardTitle)] }),
                    new TableCell({ children: [new Paragraph(att.status)] }),
                    new TableCell({ children: [new Paragraph(att.status === "KATILDI" ? "İmzalandı (e-imza)" : att.excuseReason || "-")] }),
                  ]
                })
              )
            ]
          })
        ]
      }
    ]
  });

  return await Packer.toBuffer(doc);
}

function createSignatureRows(boardAttendees: any[]): TableRow[] {
  const rows: TableRow[] = [];
  for (let i = 0; i < boardAttendees.length; i += 2) {
    const left = boardAttendees[i];
    const right = boardAttendees[i + 1];

    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              boldPara(`${left.member.title} ${left.member.firstName} ${left.member.lastName}`, { alignment: AlignmentType.CENTER }),
              new Paragraph({
                children: [new TextRun({ text: left.boardTitle, italics: true })],
                alignment: AlignmentType.CENTER
              }),
              new Paragraph({
                text: left.status === "KATILDI" ? "[Elektronik İmzalı]" : `(${left.status})`,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
              })
            ]
          }),
          new TableCell({
            children: right
              ? [
                  boldPara(`${right.member.title} ${right.member.firstName} ${right.member.lastName}`, { alignment: AlignmentType.CENTER }),
                  new Paragraph({
                    children: [new TextRun({ text: right.boardTitle, italics: true })],
                    alignment: AlignmentType.CENTER
                  }),
                  new Paragraph({
                    text: right.status === "KATILDI" ? "[Elektronik İmzalı]" : `(${right.status})`,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                  })
                ]
              : [new Paragraph({ text: "" })]
          })
        ]
      })
    );
  }
  return rows;
}
