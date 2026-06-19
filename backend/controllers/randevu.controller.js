const db = require('../config/db');

exports.getRandevular = async (req, res) => {
    try {
        const { bolum_id, durum, randevu_tarihi } = req.query;
        let queryStr = `
            SELECT r.id, r.hasta_id, r.doktor_id, r.bolum_id, r.randevu_tarihi, r.randevu_saati, r.durum, r.sikayet, r.notlar, r.created_at,
                   kh.ad AS hasta_ad, kh.soyad AS hasta_soyad,
                   kd.ad AS doktor_ad, kd.soyad AS doktor_soyad,
                   b.bolum_adi
            FROM randevular r
            JOIN hastalar h ON r.hasta_id = h.id
            JOIN kullanicilar kh ON h.kullanici_id = kh.id
            JOIN doktorlar d ON r.doktor_id = d.id
            JOIN kullanicilar kd ON d.kullanici_id = kd.id
            JOIN bolumler b ON r.bolum_id = b.id
        `;
        const params = [];
        const conditions = [];

        if (bolum_id) {
            conditions.push('r.bolum_id = ?');
            params.push(bolum_id);
        }
        if (durum) {
            conditions.push('r.durum = ?');
            params.push(durum);
        }
        if (randevu_tarihi) {
            conditions.push('r.randevu_tarihi = ?');
            params.push(randevu_tarihi);
        }

        if (conditions.length > 0) {
            queryStr += ' WHERE ' + conditions.join(' AND ');
        }

        queryStr += ' ORDER BY r.randevu_tarihi DESC, r.randevu_saati DESC';

        const [rows] = await db.execute(queryStr, params);
        return res.json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getRandevuById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute(
            `SELECT r.*, 
                    kh.ad AS hasta_ad, kh.soyad AS hasta_soyad,
                    kd.ad AS doktor_ad, kd.soyad AS doktor_soyad,
                    b.bolum_adi
             FROM randevular r
             JOIN hastalar h ON r.hasta_id = h.id
             JOIN kullanicilar kh ON h.kullanici_id = kh.id
             JOIN doktorlar d ON r.doktor_id = d.id
             JOIN kullanicilar kd ON d.kullanici_id = kd.id
             JOIN bolumler b ON r.bolum_id = b.id
             WHERE r.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const appointment = rows[0];

        if (req.user.rol === 'hasta' && req.user.profile_id !== appointment.hasta_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if (req.user.rol === 'doktor' && req.user.profile_id !== appointment.doktor_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        return res.json(appointment);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.createRandevu = async (req, res) => {
    try {
        const hastaId = req.user.rol === 'hasta' ? req.user.profile_id : req.body.hasta_id;
        const { doktor_id, bolum_id, randevu_tarihi, randevu_saati, sikayet } = req.body;

        if (!hastaId || !doktor_id || !bolum_id || !randevu_tarihi || !randevu_saati || !sikayet) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const [conflict] = await db.execute(
            'SELECT id FROM randevular WHERE doktor_id = ? AND randevu_tarihi = ? AND randevu_saati = ? AND durum != ?',
            [doktor_id, randevu_tarihi, randevu_saati, 'iptal']
        );

        if (conflict.length > 0) {
            return res.status(400).json({ message: 'Doctor is not available at this time' });
        }

        const [result] = await db.execute(
            'INSERT INTO randevular (hasta_id, doktor_id, bolum_id, randevu_tarihi, randevu_saati, durum, sikayet) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [hastaId, doktor_id, bolum_id, randevu_tarihi, randevu_saati, 'beklemede', sikayet]
        );

        return res.status(201).json({ id: result.insertId, message: 'Appointment created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.updateRandevu = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute('SELECT * FROM randevular WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const appointment = rows[0];

        if (req.user.rol === 'doktor' && req.user.profile_id !== appointment.doktor_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (req.user.rol === 'doktor') {
            const { notlar, durum } = req.body;
            await db.execute(
                'UPDATE randevular SET notlar = ?, durum = ? WHERE id = ?',
                [notlar || appointment.notlar, durum || appointment.durum, id]
            );
        } else if (req.user.rol === 'admin') {
            const { hasta_id, doktor_id, bolum_id, randevu_tarihi, randevu_saati, durum, sikayet, notlar } = req.body;
            
            if (doktor_id && randevu_tarihi && randevu_saati) {
                const [conflict] = await db.execute(
                    'SELECT id FROM randevular WHERE doktor_id = ? AND randevu_tarihi = ? AND randevu_saati = ? AND id != ? AND durum != ?',
                    [doktor_id, randevu_tarihi, randevu_saati, id, 'iptal']
                );
                if (conflict.length > 0) {
                    return res.status(400).json({ message: 'Doctor is not available at this time' });
                }
            }

            await db.execute(
                `UPDATE randevular 
                 SET hasta_id = ?, doktor_id = ?, bolum_id = ?, randevu_tarihi = ?, randevu_saati = ?, durum = ?, sikayet = ?, notlar = ?
                 WHERE id = ?`,
                [
                    hasta_id || appointment.hasta_id,
                    doktor_id || appointment.doktor_id,
                    bolum_id || appointment.bolum_id,
                    randevu_tarihi || appointment.randevu_tarihi,
                    randevu_saati || appointment.randevu_saati,
                    durum || appointment.durum,
                    sikayet || appointment.sikayet,
                    notlar || appointment.notlar,
                    id
                ]
            );
        } else {
            return res.status(403).json({ message: 'Forbidden' });
        }

        return res.json({ message: 'Appointment updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.updateRandevuDurum = async (req, res) => {
    try {
        const { id } = req.params;
        const { durum } = req.body;

        if (!durum) {
            return res.status(400).json({ message: 'durum parameter is required' });
        }

        const [rows] = await db.execute('SELECT * FROM randevular WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const appointment = rows[0];

        if (req.user.rol === 'hasta') {
            if (req.user.profile_id !== appointment.hasta_id || durum !== 'iptal') {
                return res.status(403).json({ message: 'Forbidden' });
            }
        } else if (req.user.rol === 'doktor') {
            if (req.user.profile_id !== appointment.doktor_id) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            if (!['onaylandi', 'iptal', 'tamamlandi'].includes(durum)) {
                return res.status(400).json({ message: 'Invalid status update for doctor' });
            }
        } else if (req.user.rol !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await db.execute('UPDATE randevular SET durum = ? WHERE id = ?', [durum, id]);
        return res.json({ message: 'Appointment status updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteRandevu = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute('DELETE FROM randevular WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        return res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
