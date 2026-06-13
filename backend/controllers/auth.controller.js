const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.login = async (req, res) => {
    try {
        const { email, sifre } = req.body;
        if (!email || !sifre) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const [rows] = await db.execute(
            'SELECT id, ad, soyad, email, sifre_hash, rol, aktif FROM kullanicilar WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];
        if (!user.aktif) {
            return res.status(403).json({ message: 'Account is suspended' });
        }

        const isMatch = await bcrypt.compare(sifre, user.sifre_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.json({
            token,
            user: {
                id: user.id,
                ad: user.ad,
                soyad: user.soyad,
                email: user.email,
                rol: user.rol
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.logout = async (req, res) => {
    return res.json({ message: 'Logged out successfully' });
};

exports.me = async (req, res) => {
    return res.json({ user: req.user });
};

exports.changePassword = async (req, res) => {
    try {
        const { mevcutSifre, yeniSifre } = req.body;
        if (!mevcutSifre || !yeniSifre) {
            return res.status(400).json({ message: 'Current and new passwords are required' });
        }

        const [rows] = await db.execute(
            'SELECT sifre_hash FROM kullanicilar WHERE id = ?',
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(mevcutSifre, rows[0].sifre_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(yeniSifre, salt);

        await db.execute(
            'UPDATE kullanicilar SET sifre_hash = ? WHERE id = ?',
            [newHash, req.user.id]
        );

        return res.json({ message: 'Password updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};
