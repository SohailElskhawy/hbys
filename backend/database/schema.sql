CREATE DATABASE IF NOT EXISTS hbys_db;
USE hbys_db;

DROP TABLE IF EXISTS randevular;
DROP TABLE IF EXISTS doktorlar;
DROP TABLE IF EXISTS hastalar;
DROP TABLE IF EXISTS bolumler;
DROP TABLE IF EXISTS kullanicilar;

CREATE TABLE kullanicilar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ad VARCHAR(100) NOT NULL,
    soyad VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    sifre_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'doktor', 'hasta') NOT NULL,
    aktif TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bolumler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bolum_adi VARCHAR(100) NOT NULL UNIQUE,
    aciklama TEXT,
    kat VARCHAR(10),
    dahili VARCHAR(10),
    aktif TINYINT(1) DEFAULT 1
);

CREATE TABLE hastalar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kullanici_id INT NOT NULL,
    tc_kimlik CHAR(11) NOT NULL UNIQUE,
    dogum_tarihi DATE NOT NULL,
    cinsiyet ENUM('erkek', 'kadin', 'diger') NOT NULL,
    telefon VARCHAR(15) NOT NULL,
    adres TEXT,
    kan_grubu VARCHAR(5),
    sigorta_no VARCHAR(50),
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE
);

CREATE TABLE doktorlar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kullanici_id INT NOT NULL,
    bolum_id INT NOT NULL,
    uzmanlik VARCHAR(150) NOT NULL,
    diploma_no VARCHAR(50),
    muayene_ucreti DECIMAL(10,2) DEFAULT 0.00,
    biyografi TEXT,
    calisma_saatleri JSON,
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE,
    FOREIGN KEY (bolum_id) REFERENCES bolumler(id) ON DELETE CASCADE
);

CREATE TABLE randevular (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hasta_id INT NOT NULL,
    doktor_id INT NOT NULL,
    bolum_id INT NOT NULL,
    randevu_tarihi DATE NOT NULL,
    randevu_saati TIME NOT NULL,
    durum ENUM('beklemede', 'onaylandi', 'iptal', 'tamamlandi') NOT NULL DEFAULT 'beklemede',
    sikayet TEXT,
    notlar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hasta_id) REFERENCES hastalar(id) ON DELETE CASCADE,
    FOREIGN KEY (doktor_id) REFERENCES doktorlar(id) ON DELETE CASCADE,
    FOREIGN KEY (bolum_id) REFERENCES bolumler(id) ON DELETE CASCADE
);

INSERT INTO kullanicilar (ad, soyad, email, sifre_hash, rol, aktif) VALUES
('Sohail', 'Admin', 'admin@hbys.com', '$2a$10$wN1FvWvXvIevE4w79rB0.ehG69Wz5lF8x.r/Z38wz1p/LgeY702u.', 'admin', 1),
('Ahmet', 'Yilmaz', 'ahmet@hbys.com', '$2a$10$wN1FvWvXvIevE4w79rB0.ehG69Wz5lF8x.r/Z38wz1p/LgeY702u.', 'doktor', 1),
('Ayse', 'Ozturk', 'ayse@hbys.com', '$2a$10$wN1FvWvXvIevE4w79rB0.ehG69Wz5lF8x.r/Z38wz1p/LgeY702u.', 'doktor', 1),
('Mehmet', 'Kaya', 'mehmet@hbys.com', '$2a$10$wN1FvWvXvIevE4w79rB0.ehG69Wz5lF8x.r/Z38wz1p/LgeY702u.', 'hasta', 1),
('Fatma', 'Demir', 'fatma@hbys.com', '$2a$10$wN1FvWvXvIevE4w79rB0.ehG69Wz5lF8x.r/Z38wz1p/LgeY702u.', 'hasta', 1);

INSERT INTO bolumler (bolum_adi, aciklama, kat, dahili, aktif) VALUES
('Kardiyoloji', 'Kalp ve damar hastaliklari bolumu', '2', '201', 1),
('Noroloji', 'Beyin ve sinir sistemi hastaliklari bolumu', '3', '301', 1),
('Dis Hekimligi', 'Agiz ve dis sagligi bolumu', '1', '101', 1);

INSERT INTO hastalar (kullanici_id, tc_kimlik, dogum_tarihi, cinsiyet, telefon, adres, kan_grubu, sigorta_no) VALUES
(4, '12345678901', '1985-05-15', 'erkek', '05321112233', 'Istanbul, Kadikoy', 'A+', 'SGK12345'),
(5, '98765432109', '1990-10-20', 'kadin', '05432223344', 'Istanbul, Besiktas', 'B-', 'SGK67890');

INSERT INTO doktorlar (kullanici_id, bolum_id, uzmanlik, diploma_no, muayene_ucreti, biyografi, calisma_saatleri) VALUES
(2, 1, 'Kardiyolog', 'DIP-112233', 350.00, '10 yillik kardiyoloji deneyimi.', '{"Pazartesi": ["09:00-17:00"], "Sali": ["09:00-17:00"], "Carsamba": ["09:00-17:00"], "Persembe": ["09:00-17:00"], "Cuma": ["09:00-17:00"]}'),
(3, 2, 'Norolog', 'DIP-445566', 400.00, 'Noroloji alani uzmani.', '{"Sali": ["10:00-16:00"], "Carsamba": ["10:00-16:00"], "Persembe": ["10:00-16:00"]}');

INSERT INTO randevular (hasta_id, doktor_id, bolum_id, randevu_tarihi, randevu_saati, durum, sikayet, notlar) VALUES
(1, 1, 1, '2025-06-15', '09:00:00', 'beklemede', 'Gogus agrisi', NULL),
(2, 2, 2, '2025-06-15', '10:30:00', 'onaylandi', 'Siddetli bas agrisi', 'Norolojik muayene yapilacak');
