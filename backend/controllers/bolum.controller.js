const db = require('../config/db');

exports.getBolumler = async (req, res) => {
    try {
        const queryStr = `
            SELECT b.*, COUNT(d.id) AS doktor_sayisi
            FROM bolumler b
            LEFT JOIN doktorlar d ON b.id = d.bolum_id
            GROUP BY b.id
        `;
        const [rows] = await db.execute(queryStr);
        return res.json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getBolumById = async (req, res) => {
    try {
        const { id } = req.params;
        const [bolumRows] = await db.execute('SELECT * FROM bolumler WHERE id = ?', [id]);
        if (bolumRows.length === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }
        
        const [doctorRows] = await db.execute(
            `SELECT d.id, d.uzmanlik, d.muayene_ucreti, d.biyografi, d.calisma_saatleri,
                    k.ad, k.soyad, k.email
             FROM doktorlar d
             JOIN kullanicilar k ON d.kullanici_id = k.id
             WHERE d.bolum_id = ? AND k.aktif = 1`,
            [id]
        );

        return res.json({
            ...bolumRows[0],
            doktorlar: doctorRows
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.createBolum = async (req, res) => {
    try {
        const { bolum_adi, aciklama, kat, dahili, aktif } = req.body;
        if (!bolum_adi) {
            return res.status(400).json({ message: 'Department name is required' });
        }

        const [existing] = await db.execute('SELECT id FROM bolumler WHERE bolum_adi = ?', [bolum_adi]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Department name already exists' });
        }

        const isAktif = aktif !== undefined ? aktif : 1;
        const [result] = await db.execute(
            'INSERT INTO bolumler (bolum_adi, aciklama, kat, dahili, aktif) VALUES (?, ?, ?, ?, ?)',
            [bolum_adi, aciklama, kat, dahili, isAktif]
        );

        return res.status(201).json({ id: result.insertId, message: 'Department created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.updateBolum = async (req, res) => {
    try {
        const { id } = req.params;
        const { bolum_adi, aciklama, kat, dahili, aktif } = req.body;

        const [rows] = await db.execute('SELECT * FROM bolumler WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }

        const bolum = rows[0];

        if (bolum_adi && bolum_adi !== bolum.bolum_adi) {
            const [existing] = await db.execute('SELECT id FROM bolumler WHERE bolum_adi = ? AND id != ?', [bolum_adi, id]);
            if (existing.length > 0) {
                return res.status(400).json({ message: 'Department name already exists' });
            }
        }

        const isAktif = aktif !== undefined ? aktif : bolum.aktif;

        await db.execute(
            'UPDATE bolumler SET bolum_adi = ?, aciklama = ?, kat = ?, dahili = ?, aktif = ? WHERE id = ?',
            [bolum_adi || bolum.bolum_adi, aciklama || bolum.aciklama, kat || bolum.kat, dahili || bolum.dahili, isAktif, id]
        );

        return res.json({ message: 'Department updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteBolum = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute('DELETE FROM bolumler WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }
        return res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
