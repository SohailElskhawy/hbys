const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getHastalar = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let queryStr = `
            SELECT h.id, h.kullanici_id, k.ad, k.soyad, k.email, k.aktif,
                   h.tc_kimlik, h.dogum_tarihi, h.cinsiyet, h.telefon,
                   h.adres, h.kan_grubu, h.sigorta_no
            FROM hastalar h
            JOIN kullanicilar k ON h.kullanici_id = k.id
        `;
        let countStr = `
            SELECT COUNT(*) AS total
            FROM hastalar h
            JOIN kullanicilar k ON h.kullanici_id = k.id
        `;
        let params = [];

        if (search) {
            const searchParam = `%${search}%`;
            const whereClause = ' WHERE k.ad LIKE ? OR k.soyad LIKE ? OR h.tc_kimlik LIKE ? OR k.email LIKE ?';
            queryStr += whereClause;
            countStr += whereClause;
            params = [searchParam, searchParam, searchParam, searchParam];
        }

        queryStr += ' ORDER BY k.ad ASC, k.soyad ASC LIMIT ? OFFSET ?';
        const queryParams = [...params, limit, offset];

        const [countResult] = await db.execute(countStr, params);
        const total = countResult[0].total;

        const [rows] = await db.query(queryStr, queryParams);

        return res.json({
            data: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getHastaById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            `SELECT h.id, h.kullanici_id, k.ad, k.soyad, k.email, k.aktif,
                    h.tc_kimlik, h.dogum_tarihi, h.cinsiyet, h.telefon,
                    h.adres, h.kan_grubu, h.sigorta_no
             FROM hastalar h
             JOIN kullanicilar k ON h.kullanici_id = k.id
             WHERE h.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const patient = rows[0];

        if (req.user.rol === 'hasta' && req.user.id !== patient.kullanici_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        return res.json(patient);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.createHasta = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const {
            ad, soyad, email, sifre, tc_kimlik,
            dogum_tarihi, cinsiyet, telefon, adres,
            kan_grubu, sigorta_no
        } = req.body;

        if (!ad || !soyad || !email || !sifre || !tc_kimlik || !dogum_tarihi || !cinsiyet || !telefon) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const [existingUser] = await conn.execute(
            'SELECT id FROM kullanicilar WHERE email = ?',
            [email]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const [existingHasta] = await conn.execute(
            'SELECT id FROM hastalar WHERE tc_kimlik = ?',
            [tc_kimlik]
        );
        if (existingHasta.length > 0) {
            return res.status(400).json({ message: 'TC number already exists' });
        }

        await conn.beginTransaction();

        const salt = await bcrypt.genSalt(10);
        const sifreHash = await bcrypt.hash(sifre, salt);

        const [userResult] = await conn.execute(
            'INSERT INTO kullanicilar (ad, soyad, email, sifre_hash, rol, aktif) VALUES (?, ?, ?, ?, ?, ?)',
            [ad, soyad, email, sifreHash, 'hasta', 1]
        );

        const kullaniciId = userResult.insertId;

        await conn.execute(
            `INSERT INTO hastalar (kullanici_id, tc_kimlik, dogum_tarihi, cinsiyet, telefon, adres, kan_grubu, sigorta_no)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [kullaniciId, tc_kimlik, dogum_tarihi, cinsiyet, telefon, adres, kan_grubu, sigorta_no]
        );

        await conn.commit();
        return res.status(201).json({ message: 'Patient created successfully' });
    } catch (error) {
        await conn.rollback();
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

exports.updateHasta = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { id } = req.params;
        const {
            ad, soyad, email, sifre, tc_kimlik,
            dogum_tarihi, cinsiyet, telefon, adres,
            kan_grubu, sigorta_no, aktif
        } = req.body;

        const [patientRows] = await conn.execute(
            'SELECT kullanici_id FROM hastalar WHERE id = ?',
            [id]
        );

        if (patientRows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const patient = patientRows[0];

        if (req.user.rol === 'hasta' && req.user.id !== patient.kullanici_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (email) {
            const [emailCheck] = await conn.execute(
                'SELECT id FROM kullanicilar WHERE email = ? AND id != ?',
                [email, patient.kullanici_id]
            );
            if (emailCheck.length > 0) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        if (tc_kimlik) {
            const [tcCheck] = await conn.execute(
                'SELECT id FROM hastalar WHERE tc_kimlik = ? AND id != ?',
                [tc_kimlik, id]
            );
            if (tcCheck.length > 0) {
                return res.status(400).json({ message: 'TC number already exists' });
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
        userParams.push(patient.kullanici_id);

        await conn.execute(userUpdateSql, userParams);

        await conn.execute(
            `UPDATE hastalar SET
                tc_kimlik = ?, dogum_tarihi = ?, cinsiyet = ?,
                telefon = ?, adres = ?, kan_grubu = ?, sigorta_no = ?
             WHERE id = ?`,
            [tc_kimlik, dogum_tarihi, cinsiyet, telefon, adres, kan_grubu, sigorta_no, id]
        );

        await conn.commit();
        return res.json({ message: 'Patient updated successfully' });
    } catch (error) {
        await conn.rollback();
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

exports.deleteHasta = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            'SELECT kullanici_id FROM hastalar WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const kullaniciId = rows[0].kullanici_id;

        await db.execute('DELETE FROM kullanicilar WHERE id = ?', [kullaniciId]);

        return res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getHastaRandevular = async (req, res) => {
    try {
        const { id } = req.params;

        const [patientRows] = await db.execute(
            'SELECT kullanici_id FROM hastalar WHERE id = ?',
            [id]
        );

        if (patientRows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const patient = patientRows[0];

        if (req.user.rol === 'hasta' && req.user.id !== patient.kullanici_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const [rows] = await db.execute(
            `SELECT r.id, r.randevu_tarihi, r.randevu_saati, r.durum, r.sikayet, r.notlar,
                    d.id AS doktor_id, k.ad AS doktor_ad, k.soyad AS doktor_soyad,
                    b.bolum_adi
             FROM randevular r
             JOIN doktorlar d ON r.doktor_id = d.id
             JOIN kullanicilar k ON d.kullanici_id = k.id
             JOIN bolumler b ON r.bolum_id = b.id
             WHERE r.hasta_id = ?
             ORDER BY r.randevu_tarihi DESC, r.randevu_saati DESC`,
            [id]
        );

        return res.json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
