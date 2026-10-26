-- =============================================================================
-- T.C. SELÇUK ÜNİVERSİTESİ BÖLÜM KURULU SÜRECİ VE KARAR OTOMASYONU
-- GÖREV 1: SİSTEM ANALİZİ, ROL TANIMLARI VE VERİTABANI TASARIMI (SQL DDL)
-- =============================================================================

-- 1. ENUM TİPLERİ
CREATE TYPE "bolum_tipi_enum" AS ENUM ('TEK_ANABILIM_DALI', 'COK_ANABILIM_DALI');
CREATE TYPE "rol_turu_enum" AS ENUM (
    'BOLUM_BASKANI', 
    'BOLUM_BASKAN_YARDIMCISI', 
    'ABD_BASKANI', 
    'OGRETIM_ELEMANI', 
    'BOLUM_SEKRETERI'
);
CREATE TYPE "toplanti_durumu_enum" AS ENUM (
    'CAGRI_YAPILDI', 
    'ERTELENDI', 
    'OTURUM_ACILDI', 
    'MADDELER_GORUSULUYOR', 
    'TUTANAK_HAZIRLANDI', 
    'EBYS_SEVK_EDILDI', 
    'TAMAMLANDI', 
    'IPTAL'
);
CREATE TYPE "katilim_durumu_enum" AS ENUM ('KATILDI', 'MAZERETLI', 'KATILMADI');
CREATE TYPE "karar_kategorisi_enum" AS ENUM (
    'DERS_GOREVLENDIRME', 
    'MUAFIYET_INTIBAK', 
    'STAJ_ISLETME', 
    'SINAV_MAZERET', 
    'KOMISYON_SECIMI', 
    'DIGER'
);
CREATE TYPE "gundem_kabul_durumu_enum" AS ENUM ('BEKLIYOR', 'KABUL_EDILDI', 'REDDEDILDI_CIKARILDI');
CREATE TYPE "karar_sonucu_enum" AS ENUM ('BEKLIYOR', 'KABUL_OYBIRLIGI', 'KABUL_OYCOKLUGU', 'REDDEDILDI');
CREATE TYPE "oy_turu_enum" AS ENUM ('KABUL', 'RET', 'CEKIMSER');

-- =============================================================================
-- GÖREV 1.2: ORGANİZASYONEL ŞEMA TABLOLARI
-- =============================================================================

-- 1. FAKÜLTE / YÜKSEKOKUL TABLOSU
CREATE TABLE IF NOT EXISTS fakulte_yuksekokul (
    id VARCHAR(36) PRIMARY KEY,
    kod VARCHAR(20) NOT NULL UNIQUE,
    ad VARCHAR(255) NOT NULL,
    tur VARCHAR(50) DEFAULT 'FAKULTE',
    dekan_mudur_unvan_ad VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. BÖLÜM TABLOSU
CREATE TABLE IF NOT EXISTS bolum (
    id VARCHAR(36) PRIMARY KEY,
    fakulte_id VARCHAR(36) NOT NULL REFERENCES fakulte_yuksekokul(id) ON DELETE CASCADE,
    kod VARCHAR(20) NOT NULL UNIQUE,
    ad VARCHAR(255) NOT NULL,
    ebys_birim_kodu VARCHAR(50) DEFAULT '302.01.05',
    bolum_tipi "bolum_tipi_enum" DEFAULT 'COK_ANABILIM_DALI',
    has_multiple_specialties BOOLEAN DEFAULT TRUE, -- Madde 15 Ayrımı
    mevcut_akademik_yil VARCHAR(20) DEFAULT '2026-2027',
    mevcut_yariyil VARCHAR(20) DEFAULT 'Güz',
    bolum_baskani_id VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ANABİLİM DALI TABLOSU
CREATE TABLE IF NOT EXISTS anabilim_dali (
    id VARCHAR(36) PRIMARY KEY,
    bolum_id VARCHAR(36) NOT NULL REFERENCES bolum(id) ON DELETE CASCADE,
    kod VARCHAR(20),
    ad VARCHAR(255) NOT NULL,
    baskan_personel_id VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. AKADEMİK PERSONEL TABLOSU
CREATE TABLE IF NOT EXISTS akademik_personel (
    id VARCHAR(36) PRIMARY KEY,
    bolum_id VARCHAR(36) NOT NULL REFERENCES bolum(id) ON DELETE CASCADE,
    anabilim_dali_id VARCHAR(36) REFERENCES anabilim_dali(id) ON DELETE SET NULL,
    unvan VARCHAR(50) NOT NULL,
    ad VARCHAR(100) NOT NULL,
    soyad VARCHAR(100) NOT NULL,
    eposta VARCHAR(150) NOT NULL UNIQUE,
    telefon VARCHAR(50),
    sicil_no VARCHAR(50),
    rol "rol_turu_enum" DEFAULT 'OGRETIM_ELEMANI',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- GÖREV 1.3: TOPLANTI VE KARAR VERİTABANI ŞEMASI
-- =============================================================================

-- 5. TOPLANTI TABLOSU
CREATE TABLE IF NOT EXISTS toplanti (
    id VARCHAR(36) PRIMARY KEY,
    bolum_id VARCHAR(36) NOT NULL REFERENCES bolum(id) ON DELETE CASCADE,
    toplanti_no INTEGER NOT NULL,
    akademik_yil VARCHAR(20) NOT NULL,
    yariyil VARCHAR(20) NOT NULL,
    baslik VARCHAR(255) NOT NULL,
    tarih TIMESTAMP WITH TIME ZONE NOT NULL,
    saat VARCHAR(10) DEFAULT '10:00',
    yer VARCHAR(255) DEFAULT 'Bölüm Başkanlığı Toplantı Salonu',
    durum "toplanti_durumu_enum" DEFAULT 'CAGRI_YAPILDI',
    mevcut_adim INTEGER DEFAULT 1,
    toplam_kurul_uye_sayisi INTEGER DEFAULT 0,
    gereken_salt_cogunluk INTEGER DEFAULT 0,
    hazir_bulunan_uye_sayisi INTEGER DEFAULT 0,
    cogunluk_durumu BOOLEAN DEFAULT FALSE,
    erteleme_tarihi TIMESTAMP WITH TIME ZONE,
    erteleme_gerekcesi TEXT,
    erteleme_tutanak_metni TEXT,
    ebys_cagri_no VARCHAR(100),
    ebys_cagri_metni TEXT,
    cagri_teblig_tarihi TIMESTAMP WITH TIME ZONE,
    ebys_evrak_no VARCHAR(100),
    ebys_evrak_tarihi TIMESTAMP WITH TIME ZONE,
    ebys_dogrulama_kodu VARCHAR(100),
    ebys_barkod VARCHAR(100),
    nihai_tutanak_metni TEXT,
    ust_yazi_metni TEXT,
    imzalandigi_tarih TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. GÜNDEM MADDESİ TABLOSU
CREATE TABLE IF NOT EXISTS gundem_maddesi (
    id VARCHAR(36) PRIMARY KEY,
    toplanti_id VARCHAR(36) NOT NULL REFERENCES toplanti(id) ON DELETE CASCADE,
    sira_no INTEGER NOT NULL,
    kategori "karar_kategorisi_enum" DEFAULT 'DERS_GOREVLENDIRME',
    baslik VARCHAR(255) NOT NULL,
    talep_kaynagi VARCHAR(150) DEFAULT 'Bölüm Başkanlığı',
    kabul_durumu "gundem_kabul_durumu_enum" DEFAULT 'KABUL_EDILDI',
    oylama_notu TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. KATILIM TUTANAĞI (HAZİRUN) TABLOSU
CREATE TABLE IF NOT EXISTS katilim_tutanagi (
    id VARCHAR(36) PRIMARY KEY,
    toplanti_id VARCHAR(36) NOT NULL REFERENCES toplanti(id) ON DELETE CASCADE,
    personel_id VARCHAR(36) NOT NULL REFERENCES akademik_personel(id) ON DELETE CASCADE,
    is_board_member BOOLEAN DEFAULT TRUE,
    kurul_sifati VARCHAR(100) DEFAULT 'Kurul Üyesi',
    katilim_durumu "katilim_durumu_enum" DEFAULT 'KATILDI',
    mazeret_izin_aciklamasi TEXT,
    imza_durumu BOOLEAN DEFAULT FALSE,
    imzalanma_zamani TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_toplanti_personel UNIQUE (toplanti_id, personel_id)
);

-- 8. KARAR TABLOSU (2026/01-01 Formatında)
CREATE TABLE IF NOT EXISTS karar (
    id VARCHAR(36) PRIMARY KEY,
    toplanti_id VARCHAR(36) NOT NULL REFERENCES toplanti(id) ON DELETE CASCADE,
    gundem_maddesi_id VARCHAR(36) UNIQUE REFERENCES gundem_maddesi(id) ON DELETE SET NULL,
    karar_no VARCHAR(50) NOT NULL, -- Örn: 2026/01-01
    kategori "karar_kategorisi_enum" DEFAULT 'DERS_GOREVLENDIRME',
    baslik VARCHAR(255) NOT NULL,
    mevzuat_dayanagi TEXT NOT NULL,
    karar_metni TEXT NOT NULL,
    oy_birligi_coklugu "karar_sonucu_enum" DEFAULT 'KABUL_OYBIRLIGI',
    kabul_oy_sayisi INTEGER DEFAULT 0,
    ret_oy_sayisi INTEGER DEFAULT 0,
    cekimser_oy_sayisi INTEGER DEFAULT 0,
    muhalefet_serhi_genel TEXT,
    sablon_parametreleri JSONB,
    ek_tablo_verisi JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. OYLAMA DETAY TABLOSU
CREATE TABLE IF NOT EXISTS oylama_detay (
    id VARCHAR(36) PRIMARY KEY,
    karar_id VARCHAR(36) NOT NULL REFERENCES karar(id) ON DELETE CASCADE,
    personel_id VARCHAR(36) NOT NULL REFERENCES akademik_personel(id) ON DELETE CASCADE,
    oy "oy_turu_enum" DEFAULT 'KABUL',
    muhalefet_serhi TEXT,
    oy_zamani TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_karar_personel UNIQUE (karar_id, personel_id)
);

-- =============================================================================
-- GÖREV 1.2 DİNAMİK KURUL ÜYESİ FİLTRELEME SORGUSU (SQL)
-- =============================================================================
-- Üniversitelerde Akademik Teşkilat Yönetmeliği Madde 15:
-- Tek Anabilim Dalı: Bşk + Tüm Öğretim Elemanları
-- Çok Anabilim Dalı: Bşk + Bşk Yrd + ABD Başkanları
-- =============================================================================

CREATE OR REPLACE VIEW view_aktif_kurul_uyeleri AS
SELECT 
    p.id AS personel_id,
    p.unvan,
    p.ad,
    p.soyad,
    p.eposta,
    p.sicil_no,
    p.rol,
    b.id AS bolum_id,
    b.ad AS bolum_adi,
    b.has_multiple_specialties AS cok_anabilim_dallimi,
    ad.ad AS anabilim_dali_adi,
    CASE
        WHEN p.rol = 'BOLUM_BASKANI' THEN 'Kurul Başkanı'
        WHEN p.rol = 'BOLUM_BASKAN_YARDIMCISI' THEN 'Bölüm Başkan Yardımcısı'
        WHEN p.rol = 'ABD_BASKANI' THEN 'Anabilim Dalı Başkanı'
        WHEN p.rol = 'OGRETIM_ELEMANI' AND b.has_multiple_specialties = FALSE THEN 'Öğretim Elemanı (Kurul Üyesi)'
        WHEN p.rol = 'OGRETIM_ELEMANI' AND b.has_multiple_specialties = TRUE THEN 'Öğretim Elemanı (Kurul Dışı)'
        ELSE 'Bölüm Sekreteri / Raportör'
    END AS kurul_sifati,
    CASE 
        WHEN b.has_multiple_specialties = TRUE 
             AND p.rol IN ('BOLUM_BASKANI', 'BOLUM_BASKAN_YARDIMCISI', 'ABD_BASKANI') 
             THEN TRUE
        WHEN b.has_multiple_specialties = FALSE 
             AND p.rol IN ('BOLUM_BASKANI', 'BOLUM_BASKAN_YARDIMCISI', 'ABD_BASKANI', 'OGRETIM_ELEMANI') 
             THEN TRUE
        ELSE FALSE
    END AS kurul_uyesi_mi
FROM akademik_personel p
JOIN bolum b ON p.bolum_id = b.id
LEFT JOIN anabilim_dali ad ON p.anabilim_dali_id = ad.id
WHERE p.is_active = TRUE;
