const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getDoktorlar = async (req, res) => {
    try {
        const { bolum_id } = req.query;

        let queryStr = `
            SELECT d.id, d.kullanici_id, d.bolum_id, d.uzmanlik, d.diploma_no,
                   d.muayene_ucreti, d.biyografi, d.calisma_saatleri,
                   k.ad, k.soyad, k.email, k.aktif, b.bolum_adi
            FROM doktorlar d
            JOIN kullanicilar k ON d.kullanici_id = k.id
            JOIN bolumler b ON d.bolum_id = b.id
        `;
        const params = [];

        if (bolum_id) {
            queryStr += ' WHERE d.bolum_id = ?';
            params.push(bolum_id);
        }

        queryStr += ' ORDER BY k.ad ASC, k.soyad ASC';

        const [rows] = await db.execute(queryStr, params);

        const formattedRows = rows.map(row => {
            let calismaSaatleri = row.calisma_saatleri;
            if (typeof calismaSaatleri === 'string') {
                try {
                    calismaSaatleri = JSON.parse(calismaSaatleri);
                } catch (e) {
                    calismaSaatleri = {};
                }
            }
            return {
                ...row,
                calisma_saatleri: calismaSaatleri
            };
        });

        return res.json(formattedRows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getDoktorById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            `SELECT d.id, d.kullanici_id, d.bolum_id, d.uzmanlik, d.diploma_no,
                    d.muayene_ucreti, d.biyografi, d.calisma_saatleri,
                    k.ad, k.soyad, k.email, k.aktif, b.bolum_adi
             FROM doktorlar d
             JOIN kullanicilar k ON d.kullanici_id = k.id
             JOIN bolumler b ON d.bolum_id = b.id
             WHERE d.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const doctor = rows[0];
        if (typeof doctor.calisma_saatleri === 'string') {
            try {
                doctor.calisma_saatleri = JSON.parse(doctor.calisma_saatleri);
            } catch (e) {
                doctor.calisma_saatleri = {};
            }
        }

        return res.json(doctor);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.createDoktor = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const {
            ad, soyad, email, sifre, bolum_id,
            uzmanlik, diploma_no, muayene_ucreti,
            biyografi, calisma_saatleri
        } = req.body;

        if (!ad || !soyad || !email || !sifre || !bolum_id || !uzmanlik) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const [existingUser] = await conn.execute(
            'SELECT id FROM kullanicilar WHERE email = ?',
            [email]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        await conn.beginTransaction();

        const salt = await bcrypt.genSalt(10);
        const sifreHash = await bcrypt.hash(sifre, salt);

        const [userResult] = await conn.execute(
            'INSERT INTO kullanicilar (ad, soyad, email, sifre_hash, rol, aktif) VALUES (?, ?, ?, ?, ?, ?)',
            [ad, soyad, email, sifreHash, 'doktor', 1]
        );

        const kullaniciId = userResult.insertId;

        const calismaSaatleriJson = typeof calisma_saatleri === 'string'
            ? calisma_saatleri
            : JSON.stringify(calisma_saatleri || {});

        await conn.execute(
            `INSERT INTO doktorlar (kullanici_id, bolum_id, uzmanlik, diploma_no, muayene_ucreti, biyografi, calisma_saatleri)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [kullaniciId, bolum_id, uzmanlik, diploma_no, muayene_ucreti || 0, biyografi, calismaSaatleriJson]
        );

        await conn.commit();
        return res.status(201).json({ message: 'Doctor created successfully' });
    } catch (error) {
        await conn.rollback();
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

exports.updateDoktor = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { id } = req.params;
        const {
            ad, soyad, email, sifre, bolum_id,
            uzmanlik, diploma_no, muayene_ucreti,
            biyografi, calisma_saatleri, aktif
        } = req.body;

        const [doctorRows] = await conn.execute(
            'SELECT kullanici_id FROM doktorlar WHERE id = ?',
            [id]
        );

        if (doctorRows.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const doctor = doctorRows[0];

        if (req.user.rol === 'doktor' && req.user.id !== doctor.kullanici_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (email) {
            const [emailCheck] = await conn.execute(
                'SELECT id FROM kullanicilar WHERE email = ? AND id != ?',
                [email, doctor.kullanici_id]
            );
            if (emailCheck.length > 0) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        await conn.beginTransaction();

        let userUpdateSql = 'UPDATE kullanicilar SET ad = ?, soyad = ?, email = ?';
        let userParams = [ad, soyad, email];

        if (req.user.rol === 'admin' && aktif !== undefined) {
            userUpdateSql += ', aktif = ?';
            userParams.push(aktif);
        }

        if (sifre) {
            const salt = await bcrypt.genSalt(10);
            const sifreHash = await bcrypt.hash(sifre, salt);
            userUpdateSql += ', sifre_hash = ?';
            userParams.push(sifreHash);
        }

        userUpdateSql += ' WHERE id = ?';
        userParams.push(doctor.kullanici_id);

        await conn.execute(userUpdateSql, userParams);

        const calismaSaatleriJson = typeof calisma_saatleri === 'string'
            ? calisma_saatleri
            : JSON.stringify(calisma_saatleri || {});

        await conn.execute(
            `UPDATE doktorlar SET
                bolum_id = ?, uzmanlik = ?, diploma_no = ?,
                muayene_ucreti = ?, biyografi = ?, calisma_saatleri = ?
             WHERE id = ?`,
            [bolum_id, uzmanlik, diploma_no, muayene_ucreti || 0, biyografi, calismaSaatleriJson, id]
        );

        await conn.commit();
        return res.json({ message: 'Doctor updated successfully' });
    } catch (error) {
        await conn.rollback();
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

exports.deleteDoktor = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            'SELECT kullanici_id FROM doktorlar WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const kullaniciId = rows[0].kullanici_id;

        await db.execute('DELETE FROM kullanicilar WHERE id = ?', [kullaniciId]);

        return res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getDoktorRandevular = async (req, res) => {
    try {
        const { id } = req.params;

        const [doctorRows] = await db.execute(
            'SELECT kullanici_id FROM doktorlar WHERE id = ?',
            [id]
        );

        if (doctorRows.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const doctor = doctorRows[0];

        if (req.user.rol === 'doktor' && req.user.id !== doctor.kullanici_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const [rows] = await db.execute(
            `SELECT r.id, r.randevu_tarihi, r.randevu_saati, r.durum, r.sikayet, r.notlar,
                    h.id AS hasta_id, k.ad AS hasta_ad, k.soyad AS hasta_soyad,
                    b.bolum_adi
             FROM randevular r
             JOIN hastalar h ON r.hasta_id = h.id
             JOIN kullanicilar k ON h.kullanici_id = k.id
             JOIN bolumler b ON r.bolum_id = b.id
             WHERE r.doktor_id = ?
             ORDER BY r.randevu_tarihi DESC, r.randevu_saati DESC`,
            [id]
        );

        return res.json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getDoktorMusaitSaatler = async (req, res) => {
    try {
        const { id } = req.params;
        const { tarih } = req.query;

        if (!tarih) {
            return res.status(400).json({ message: 'tarih parameter is required' });
        }

        const [rows] = await db.execute(
            'SELECT calisma_saatleri FROM doktorlar WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        let calismaSaatleri = rows[0].calisma_saatleri;
        if (typeof calismaSaatleri === 'string') {
            try {
                calismaSaatleri = JSON.parse(calismaSaatleri);
            } catch (e) {
                calismaSaatleri = {};
            }
        }

        const daysMap = ['Pazar', 'Pazartesi', 'Sali', 'Carsamba', 'Persembe', 'Cuma', 'Cumartesi'];
        const parts = tarih.split('-');
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const dayName = daysMap[dateObj.getDay()];

        const ranges = calismaSaatleri[dayName];
        if (!ranges || !Array.isArray(ranges) || ranges.length === 0) {
            return res.json([]);
        }

        const slots = [];
        for (const range of ranges) {
            const rangeParts = range.split('-');
            if (rangeParts.length !== 2) continue;
            
            const [start, end] = rangeParts;
            const startParts = start.split(':').map(Number);
            const endParts = end.split(':').map(Number);
            if (startParts.length < 2 || endParts.length < 2) continue;

            let currentH = startParts[0];
            let currentM = startParts[1];
            const endH = endParts[0];
            const endM = endParts[1];

            while (true) {
                if (currentH > endH || (currentH === endH && currentM >= endM)) {
                    break;
                }

                const timeStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
                slots.push(timeStr);

                currentM += 30;
                if (currentM >= 60) {
                    currentH += 1;
                    currentM -= 60;
                }
            }
        }

        const [appRows] = await db.execute(
            'SELECT randevu_saati FROM randevular WHERE doktor_id = ? AND randevu_tarihi = ? AND durum != ?',
            [id, tarih, 'iptal']
        );

        const bookedSlots = appRows.map(r => {
            const t = r.randevu_saati;
            return typeof t === 'string' ? t.substring(0, 5) : String(t).substring(0, 5);
        });

        const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));

        return res.json(availableSlots);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
