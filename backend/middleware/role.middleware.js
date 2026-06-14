const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Kullanıcı doğrulanmadı."
            });
        }

        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({
                message: "Bu işlem için yetkiniz yok."
            });
        }

        next();
    };
};

module.exports = roleMiddleware;