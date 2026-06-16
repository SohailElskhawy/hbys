const query1 = `
SELECT
    b.bolum_adi,
    COUNT(r.id) AS toplam_randevu,
    SUM(CASE WHEN r.durum = 'tamamlandi' THEN 1 ELSE 0 END) AS tamamlanan,
    SUM(CASE WHEN r.durum = 'iptal' THEN 1 ELSE 0 END) AS iptal_edilen,
    SUM(CASE WHEN r.durum = 'beklemede' THEN 1 ELSE 0 END) AS beklemede,
    ROUND(
        SUM(CASE WHEN r.durum = 'tamamlandi' THEN 1 ELSE 0 END)
        / COUNT(r.id) * 100, 2
    ) AS tamamlanma_yuzdesi
FROM bolumler b
LEFT JOIN randevular r ON b.id = r.bolum_id
GROUP BY b.id, b.bolum_adi
ORDER BY toplam_randevu DESC;
`;

const query2 = `
SELECT
    d.id AS doktor_id,
    CONCAT(k.ad, ' ', k.soyad) AS doktor_adi,
    b.bolum_adi,
    DATE_FORMAT(r.randevu_tarihi, '%Y-%m') AS ay,
    COUNT(r.id) AS randevu_sayisi,
    SUM(d.muayene_ucreti) AS toplam_gelir,
    ROUND(AVG(COUNT(r.id)) OVER (
        PARTITION BY DATE_FORMAT(r.randevu_tarihi, '%Y-%m')
    ), 1) AS ay_ortalamasi
FROM doktorlar d
JOIN kullanicilar k ON d.kullanici_id = k.id
JOIN bolumler b ON d.bolum_id = b.id
LEFT JOIN randevular r ON d.id = r.doktor_id
AND r.durum = 'tamamlandi'
WHERE r.randevu_tarihi >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
GROUP BY d.id, k.ad, k.soyad, b.bolum_adi, ay
ORDER BY ay DESC, toplam_gelir DESC;
`;

const query3 = `
SELECT
    h.id AS hasta_id,
    CONCAT(k.ad, ' ', k.soyad) AS hasta_adi,
    h.kan_grubu,
    COUNT(r.id) AS toplam_randevu,
    (
        SELECT CONCAT(k2.ad, ' ', k2.soyad)
        FROM randevular r2
        JOIN doktorlar d2 ON r2.doktor_id = d2.id
        JOIN kullanicilar k2 ON d2.kullanici_id = k2.id
        WHERE r2.hasta_id = h.id
        GROUP BY r2.doktor_id
        ORDER BY COUNT(*) DESC
        LIMIT 1
    ) AS en_cok_gidilen_doktor
FROM hastalar h
JOIN kullanicilar k ON h.kullanici_id = k.id
JOIN randevular r ON h.id = r.hasta_id
WHERE r.randevu_tarihi >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
GROUP BY h.id, k.ad, k.soyad, h.kan_grubu
HAVING COUNT(r.id) >= 2
ORDER BY toplam_randevu DESC
LIMIT 20;
`;

const query4 = `
SELECT
    d.id AS doktor_id,
    CONCAT(k.ad, ' ', k.soyad) AS doktor_adi,
    b.bolum_adi,
    d.muayene_ucreti,
    (
        SELECT COUNT(*)
        FROM randevular r2
        WHERE r2.doktor_id = d.id
        AND r2.randevu_tarihi = ?
        AND r2.durum != 'iptal'
    ) AS bugunun_randevu_sayisi,
    (
        SELECT COUNT(*)
        FROM randevular r3
        WHERE r3.doktor_id = d.id
        AND r3.durum = 'tamamlandi'
    ) AS toplam_tamamlanan
FROM doktorlar d
JOIN kullanicilar k ON d.kullanici_id = k.id
JOIN bolumler b ON d.bolum_id = b.id
WHERE k.aktif = 1
AND NOT EXISTS (
    SELECT 1 FROM randevular r
    WHERE r.doktor_id = d.id
    AND r.randevu_tarihi = ?
    AND r.randevu_saati = ?
    AND r.durum != 'iptal'
)
ORDER BY b.bolum_adi, d.muayene_ucreti;
`;

module.exports = {
    query1,
    query2,
    query3,
    query4
};
