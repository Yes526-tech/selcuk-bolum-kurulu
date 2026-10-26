# T.C. Selçuk Üniversitesi Teknoloji Fakültesi
## Bilgisayar Mühendisliği Bölüm Kurul Karar Otomasyonu

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)

> **Bitirme Projesi:** Selçuk Üniversitesi Teknoloji Fakültesi Bilgisayar Mühendisliği Bölümü  
> **Resmi Tez Dokümanı:** [`docs/Bitirme_Projesi_Raporu.docx`](docs/Bitirme_Projesi_Raporu.docx)  
> **Tamamlama Raporu:** [`docs/PROJE_TAMAMLAMA_RAPORU.md`](docs/PROJE_TAMAMLAMA_RAPORU.md)  
> **Bölüm Başkanı / Kurul Başkanı:** Prof. Dr. Şakir TAŞDEMİR  

---

## 🏛️ 1. Mevzuat ve Hukuki Temel

Bu sistem; **2547 Sayılı Yükseköğretim Kanunu**, **Üniversitelerde Akademik Teşkilat Yönetmeliği (Madde 15)** ve **Selçuk Üniversitesi Bölüm Kurulu Süreci İş Akışı** hükümleriyle tam uyumlu olarak geliştirilmiştir.

### 1.1. Çift Modlu Kurul Yapısı (Madde 15)
Sistem, teşkilat yapısına göre oy hakkına sahip kurul üyelerini otomatik hesaplar:
* **Çok Anabilim Dallı Bölümler (Madde 15/2):**
  * *Örnek:* Bilgisayar Mühendisliği Bölüm Kurulu
  * *Üyeler:* Bölüm Başkanı, Bölüm Başkan Yardımcıları ile Anabilim Dalı Başkanları asıl üyedir ve oy hakkına sahiptir. Diğer öğretim elemanları oy hakkı bulunmayan statüde listelenir.
* **Tek Anabilim Dallı Bölümler (Madde 15/1):**
  * *Örnek:* Biyomedikal Cihaz Teknolojisi Bölüm Kurulu (Sağlık Hizmetleri MYO)
  * *Üyeler:* Bölüm Başkanı başkanlığında **tüm öğretim üyeleri ve öğretim görevlileri** asıl üyedir ve oy hakkına sahiptir.
* **Lisansüstü Anabilim Dalı Kurulları:**
  * Bilgisayar Mühendisliği ABD Kurulu ve Bilişim Teknolojileri Mühendisliği ABD Kurulu süreçleri.

---

## ⚡ 2. 6 Aşamalı Kurul Yaşam Döngüsü & Oylama Kuralları (Tablo 3.4)

1. **Toplantı Çağrısı ve Gündemin Belirlenmesi (Adım 1):**
   * Otomatik tarih/saat tebliği, toplantı yeri, Gündem Havuzu entegrasyonu ve resmi davet bildirimi.
2. **Hazirun ve Toplantı Yeter Sayısı (Salt Çoğunluk) Kontrolü (Adım 2):**
   * Kurul üye tamsayısının salt çoğunluk eşiği: $$Q = \left\lfloor \frac{N}{2} \right\rfloor + 1$$
   * İzinli/görevli üyeler ($L$) mevzuat gereği tamsayıdan düşülür ($N - L$).
   * **Başkan Zorunluluğu:** Kararda tam olarak bir Kurul Başkanı bulunmalıdır; başkan katılmadan oylama açılamaz.
   * **Erteleme Mekanizması:** Çoğunluk sağlanamazsa resmi *Toplantı Yetersizliği ve Erteleme Tutanağı* tanzim edilir.
3. **Gündem Oylaması ve Madde Çıkarma / Ekleme (Adım 3):**
   * Oturum açıldıktan sonra gündem maddelerinin müzakereye kabulü oylanır; kabul edilmeyen maddeler gerekçesiyle gündemden çıkarılır.
4. **Maddelerin Görüşülmesi ve Karara Bağlanması (Adım 4):**
   * **Eşitlikte Başkanın Üstün Oyu (Casting Vote):** Oylarda eşitlik halinde Başkanın oyu yönünde karar tesis edilir.
   * **Zorunlu Gerekçeli Muhalefet Şerhi:** Ret oyu veren üyelerden gerekçe girilmesi zorunludur.
   * **Hazirun Kilidi:** İlk karar oylandığı an katılım cetveli kilitlenir (`isAttendanceLocked`).
   * **Ek Belge Bütünlüğü:** Karara iliştirilen belgeler SHA-256 kriptografik özeti ile mühürlenir.
   * **Süreç İptal & İade:** Hukuki sakatlıkta gerekçeli iptal ve yeni taslak olarak iade (`/reconsider`).
5. **Karar Tutanağı, 2 Aşamalı E-İmza ve Mühürleme (Adım 5):**
   * İçerik özeti kilidi (`contentDigest`), hazırlık tokeni üretimi (`prepare`) ve üye onaylı e-imza (`complete`).
   * Tüm üyeler imzaladığında nihai `sha256Seal` hesaplanır ve tutanak değiştirilemez biçimde kilitlenir (`isSealed = true`).
6. **EBYS Entegrasyonu ve Üst Birime Sevk (Adım 6):**
   * EBYS Evrak Numarası, Doğrulama Kodu, Karekod ve Barkod üretimi.
   * Fakülte Dekanlığına / Yüksekokul Müdürlüğüne resmi üst yazı ve PDF dışa aktarımı.

---

## 🌐 3. Sayfalar ve Modüller

| Sayfa / Modül | URL | Açıklama |
| :--- | :--- | :--- |
| **Ana Yönetim Paneli** | `/` | Aktif toplantılar, istatistikler ve kurul bazlı filtreleme |
| **Resmi Belge Doğrulama** | `/verify` | EBYS evrak no, doğrulama kodu, barkod ve SHA-256 mühür sorgulama |
| **Denetim Günlüğü (Audit Log)** | `/logs` | Sistemdeki tüm işlem, güvenlik ve imza hareketlerinin iz kaydı |
| **Rol & Yetki Matrisi** | `/roles` | 5 kullanıcı rolünün 14 modüldeki yetki ve erişim haritası |
| **Kullanım Kılavuzu & Mevzuat** | `/guide` | Adım adım süreç rehberi, yönetmelik maddeleri ve SSS |
| **Kurul Duyuruları** | `/announcements`| Versiyon kontrollü toplantı çağrıları ve duyuru yönetimi |
| **Kurumsal Giriş** | `/login` | 6 haneli güvenlik kodu (captcha) ve birim/rol seçimi |
| **Gündem Havuzu** | `/agenda-pool` | Birimlerden gelen talepler ve hazır gündem maddeleri havuzu |
| **Karar Şablonları** | `/templates` | 5 standart parametrik şablon kütüphanesi |
| **Kurul Arşivi** | `/archive` | EBYS intikali tamamlanmış ve arşivlenmiş kararlar |

---

## 📋 4. Standart Parametrik Karar Şablonları

1. **Eğitim-Öğretim ve Ders Görevlendirme Kararı:** S.Ü. Yönetmelik Md. 8 dayanaklı + Ders Dağılım Çizelgesi Eki
2. **Muafiyet ve İntibak Kararı:** Yönetmelik Md. 10/5 & 15 + Muafiyet Karşılaştırma Çizelgesi
3. **Staj ve İşletmede Mesleki Eğitim Kararı:** S.Ü. Staj Yönergesi + Onaylı Öğrenci Staj Listesi
4. **Sınav Programı ve Mazeret Sınavları Kararı:** Sınav Takvimi / Mazeretli Öğrenci Çizelgesi
5. **Komisyon ve Koordinatörlük Seçimi Kararı:** Komisyon Üye Listesi ve Görev Dağılımı

---

## 🚀 5. Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (>= 18.x)
- PostgreSQL (veya Docker PostgreSQL)

### Adım Adım Kurulum

```bash
# 1. Proje dizinine girin
cd selcuk-bolum-kurulu

# 2. Bağımlılıkları yükleyin
npm install

# 3. Ortam değişkenlerini ayarlayın
cp .env.example .env

# 4. Veritabanı şemasını oluşturun ve güncelleyin
npm run prisma:push
npm run prisma:generate

# 5. Gerçekçi Selçuk Üniversitesi kurul verilerini yükleyin
npm run seed

# 6. Geliştirme sunucusunu başlatın (Port 3001)
npm run dev

# veya Optimize Üretim Sürümünü Derleyip Başlatın
npm run build
npm start
```

Uygulama açılış adresi: **`http://localhost:3001`**

---

## 🔐 6. Güvenlik, Mühürleme ve EBYS Doğrulama

Sistem tarafından üretilen her kurul kararı:
* **İçerik Özeti (Content Digest):** Oylanan maddelerin, hazirun bilgilerinin ve eklerin birleşik SHA-256 özeti.
* **Elektronik İmza Blokları:** Katılan her öğretim üyesinin zaman damgalı kriptografik onayı.
* **Resmi Doğrulama:** `/verify?code=ebys-su-792841-2026` adresinden veya PDF üzerindeki karekoddan anında aslına uygunluk teyidi.

---

## 📄 Lisans ve Haklar
T.C. Selçuk Üniversitesi Teknoloji Fakültesi Bilgisayar Mühendisliği Bölümü Bitirme Projesi kapsamında geliştirilmiştir.
Tüm hakları saklıdır © 2026.
