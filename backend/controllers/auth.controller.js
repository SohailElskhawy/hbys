const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, sifre } = req.body;

        if (!email || !sifre) {
            return res.status(400).json({
                message: "Email ve şifre zorunludur."
            });
        }

        const [users] = await db.execute(
            "SELECT * FROM kullanicilar WHERE email = ? AND aktif = 1",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Email veya şifre hatalı."
            });
        }

        const user = users[0];

        const isPasswordCorrect = await bcrypt.compare(sifre, user.sifre_hash);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Email veya şifre hatalı."
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                rol: user.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
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
        console.error("Login error:", error);
        res.status(500).json({
            message: "Sunucu hatası."
        });
    }
};

// GET /api/auth/me
const me = async (req, res) => {
    try {
        const [users] = await db.execute(
            "SELECT id, ad, soyad, email, rol FROM kullanicilar WHERE id = ? AND aktif = 1",
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "Kullanıcı bulunamadı."
            });
        }

        res.json({
            user: users[0]
        });

    } catch (error) {
        console.error("Me error:", error);
        res.status(500).json({
            message: "Sunucu hatası."
        });
    }
};

// POST /api/auth/logout
const logout = (req, res) => {
    res.json({
        message: "Çıkış başarılı."
    });
};

module.exports = {
    login,
    me,
    logout
};