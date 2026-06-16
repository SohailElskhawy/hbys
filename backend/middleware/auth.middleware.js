const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [rows] = await db.execute(
            'SELECT id, ad, soyad, email, rol, aktif FROM kullanicilar WHERE id = ?',
            [decoded.id]
        );

        if (rows.length === 0 || !rows[0].aktif) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = rows[0];
        if (user.rol === 'hasta') {
            const [hRows] = await db.execute('SELECT id FROM hastalar WHERE kullanici_id = ?', [user.id]);
            if (hRows.length > 0) user.profile_id = hRows[0].id;
        } else if (user.rol === 'doktor') {
            const [dRows] = await db.execute('SELECT id FROM doktorlar WHERE kullanici_id = ?', [user.id]);
            if (dRows.length > 0) user.profile_id = dRows[0].id;
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

