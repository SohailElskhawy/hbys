DROP DATABASE IF EXISTS hbys_db;
CREATE DATABASE hbys_db;
USE hbys_db;

-- =====================================================
-- KULLANICILAR
-- =====================================================

CREATE TABLE kullanicilar (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ad VARCHAR(100) NOT NULL,
    soyad VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    sifre_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'doktor', 'hasta') NOT NULL,
    aktif TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- BOLUMLER
-- =====================================================

CREATE TABLE bolumler (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bolum_adi VARCHAR(100) NOT NULL UNIQUE,
    aciklama TEXT,
    kat VARCHAR(10),
    dahili VARCHAR(10),
    aktif TINYINT(1) DEFAULT 1
);

-- =====================================================
-- HASTALAR
-- =====================================================

CREATE TABLE hastalar (
    id INT PRIMARY KEY AUTO_INCREMENT,

    kullanici_id INT NOT NULL,

    tc_kimlik CHAR(11) UNIQUE,
    dogum_tarihi DATE NOT NULL,

    cinsiyet ENUM(
        'erkek',
        'kadin',
        'diger'
    ) NOT NULL,

    telefon VARCHAR(15) NOT NULL,
    adres TEXT,
    kan_grubu VARCHAR(5),
    sigorta_no VARCHAR(50),

    CONSTRAINT fk_hasta_kullanici
        FOREIGN KEY (kullanici_id)
        REFERENCES kullanicilar(id)
        ON DELETE CASCADE
);

-- =====================================================
-- DOKTORLAR
-- =====================================================

CREATE TABLE doktorlar (
    id INT PRIMARY KEY AUTO_INCREMENT,

    kullanici_id INT NOT NULL,
    bolum_id INT NOT NULL,

    uzmanlik VARCHAR(150) NOT NULL,
    diploma_no VARCHAR(50),
    muayene_ucreti DECIMAL(10,2) DEFAULT 0,
    biyografi TEXT,
    calisma_saatleri JSON,

    CONSTRAINT fk_doktor_kullanici
        FOREIGN KEY (kullanici_id)
        REFERENCES kullanicilar(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_doktor_bolum
        FOREIGN KEY (bolum_id)
        REFERENCES bolumler(id)
        ON DELETE CASCADE
);

-- =====================================================
-- RANDEVULAR
-- =====================================================

CREATE TABLE randevular (
    id INT PRIMARY KEY AUTO_INCREMENT,

    hasta_id INT NOT NULL,
    doktor_id INT NOT NULL,
    bolum_id INT NOT NULL,

    randevu_tarihi DATE NOT NULL,
    randevu_saati TIME NOT NULL,

    durum ENUM(
        'beklemede',
        'onaylandi',
        'iptal',
        'tamamlandi'
    ) DEFAULT 'beklemede',

    sikayet TEXT,
    notlar TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_randevu_hasta
        FOREIGN KEY (hasta_id)
        REFERENCES hastalar(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_randevu_doktor
        FOREIGN KEY (doktor_id)
        REFERENCES doktorlar(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_randevu_bolum
        FOREIGN KEY (bolum_id)
        REFERENCES bolumler(id)
        ON DELETE CASCADE
);